import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }
  const uid = Number(userId);

  const transactions = await sql`
    SELECT id, merchant, amount, category, status, occurred_at
    FROM transactions
    WHERE user_id = ${uid}
    ORDER BY occurred_at DESC
    LIMIT 100
  `;

  const categorySummary = await sql`
    SELECT category, SUM(amount)::float AS total, COUNT(*)::int AS count
    FROM transactions
    WHERE user_id = ${uid}
    GROUP BY category
    ORDER BY total DESC
  `;

  return NextResponse.json({ transactions, categorySummary });
}