import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { sql } from "@/lib/db";
import { categorizeTransaction } from "@/lib/categorize";
import { detectAnomaly } from "@/lib/anomaly-detection";
import { updateCategoryStats } from "@/lib/redis";
import type { QueuedTransactionPayload } from "@/types";

// This is the "consumer" in the pipeline -- but instead of a persistent
// process that sits and polls a queue, QStash calls this endpoint over
// HTTP whenever a message is ready. The `Receiver` below verifies the
// request actually came from QStash (using signing keys) so this endpoint
// can't be spoofed by someone POSTing directly to it.
const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("upstash-signature");

  if (process.env.NODE_ENV === "production") {
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const valid = await receiver.verify({ signature, body: rawBody });
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const payload: QueuedTransactionPayload = JSON.parse(rawBody);
  const { userId, accountId, merchant, amount, occurredAt } = payload;

  const category = categorizeTransaction(merchant);

  // Run anomaly detection BEFORE writing the transaction and BEFORE
  // updating rolling stats, so the transaction being checked doesn't skew
  // the baseline it's being compared against.
  const anomaly = await detectAnomaly({
    userId,
    accountId,
    merchant,
    amount,
    category,
    occurredAt: new Date(occurredAt),
  });

  const status = anomaly.isAnomaly ? "flagged" : "processed";

  const [transaction] = await sql`
    INSERT INTO transactions (account_id, user_id, merchant, amount, category, status, occurred_at)
    VALUES (${accountId}, ${userId}, ${merchant}, ${amount}, ${category}, ${status}, ${occurredAt})
    RETURNING id
  `;

  if (anomaly.isAnomaly) {
    await sql`
      INSERT INTO anomalies (transaction_id, user_id, reason, severity)
      VALUES (${transaction.id}, ${userId}, ${anomaly.reason}, ${anomaly.severity})
    `;
  }

  // Update the rolling mean/variance AFTER scoring, using the real
  // transaction amount -- this is what lets next transaction's z-score
  // reflect this one.
  await updateCategoryStats(userId, category, amount);

  return NextResponse.json({
    status: "processed",
    transactionId: transaction.id,
    flagged: anomaly.isAnomaly,
  });
}