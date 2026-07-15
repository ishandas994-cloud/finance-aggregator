import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateTransaction } from "@/lib/simulator";
import { enqueueTransaction } from "@/lib/queue";

// Vercel Cron calls this on the schedule defined in vercel.json
// ("*/5 * * * *"). It picks a random existing account and generates one
// fake transaction for it, then pushes it through the SAME ingest path
// real transactions use (the queue) -- so the demo data exercises the
// whole pipeline, not a shortcut that writes straight to the DB.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await sql`SELECT id, user_id FROM accounts ORDER BY random() LIMIT 1`;
  if (accounts.length === 0) {
    return NextResponse.json({ status: "no accounts to simulate for" }, { status: 200 });
  }

  const account = accounts[0];
  const txn = generateTransaction();

  await enqueueTransaction({
    userId: account.user_id,
    accountId: account.id,
    merchant: txn.merchant,
    amount: txn.amount,
    occurredAt: txn.occurredAt,
  });

  return NextResponse.json({ status: "queued", transaction: txn });
}