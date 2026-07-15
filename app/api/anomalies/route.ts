import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId query param is required" }, { status: 400 });
  }

  const anomalies = await sql`
    SELECT a.id, a.reason, a.severity, a.detected_at, a.resolved,
           t.merchant, t.amount, t.category, t.occurred_at
    FROM anomalies a
    JOIN transactions t ON t.id = a.transaction_id
    WHERE a.user_id = ${Number(userId)}
    ORDER BY a.detected_at DESC
    LIMIT 50
  `;

  return NextResponse.json({ anomalies });
}