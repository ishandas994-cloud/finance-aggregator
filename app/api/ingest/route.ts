import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enqueueTransaction } from "@/lib/queue";

// This route is intentionally "dumb" -- it validates the shape of the
// incoming transaction and immediately hands it off to the queue. It never
// touches the database directly. That decoupling is the point: a burst of
// incoming transactions (e.g. all the "banks" syncing at once) can't
// overload the DB connection pool, because ingestion and processing scale
// independently.

const payloadSchema = z.object({
  userId: z.number(),
  accountId: z.number(),
  merchant: z.string().min(1),
  amount: z.number().positive(),
  occurredAt: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = payloadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid transaction payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const payload = {
    ...parsed.data,
    occurredAt: parsed.data.occurredAt ?? new Date().toISOString(),
  };

  try {
    await enqueueTransaction(payload);
    // 202 Accepted, not 200/201 -- the transaction has been queued, not
    // yet processed. The caller shouldn't assume it's in the DB yet.
    return NextResponse.json({ status: "queued" }, { status: 202 });
  } catch (err) {
    console.error("Failed to enqueue transaction:", err);
    return NextResponse.json({ error: "Failed to queue transaction" }, { status: 500 });
  }
}