import { sql } from "./db";
import { getCategoryStats, stdDev } from "./redis";

export type AnomalyResult = {
  isAnomaly: boolean;
  reason: string | null;
  severity: "low" | "medium" | "high" | null;
};

const DUPLICATE_WINDOW_MINUTES = 10;
const LARGE_TXN_MULTIPLIER = 5; // flag if amount > 5x category mean, even with few data points
const Z_SCORE_THRESHOLD = 3; // flag if more than 3 standard deviations from the mean

/**
 * Runs three independent checks, cheapest/most-certain first, and returns
 * on the first hit. In interviews this is worth explaining as a pipeline:
 * each check is O(1) or a single indexed query, so a transaction is scored
 * in milliseconds without needing to scan full transaction history.
 */
export async function detectAnomaly(params: {
  userId: number;
  accountId: number;
  merchant: string;
  amount: number;
  category: string;
  occurredAt: Date;
}): Promise<AnomalyResult> {
  const { userId, accountId, merchant, amount, category, occurredAt } = params;

  // 1. Duplicate charge check: same merchant + amount + account within a
  //    short window. Classic double-charge / retry-bug pattern.
  const windowStart = new Date(occurredAt.getTime() - DUPLICATE_WINDOW_MINUTES * 60_000);
  const duplicates = await sql`
    SELECT id FROM transactions
    WHERE account_id = ${accountId}
      AND merchant = ${merchant}
      AND amount = ${amount}
      AND occurred_at BETWEEN ${windowStart.toISOString()} AND ${occurredAt.toISOString()}
  `;
  if (duplicates.length > 0) {
    return {
      isAnomaly: true,
      reason: `Possible duplicate charge: same merchant and amount seen within ${DUPLICATE_WINDOW_MINUTES} minutes`,
      severity: "high",
    };
  }

  // 2. Rolling statistics check (Welford's algorithm via Redis) -- flags a
  //    transaction that's a statistical outlier for this user's spending
  //    pattern in this category.
  const stats = await getCategoryStats(userId, category);
  const sd = stdDev(stats);

  if (stats.count >= 5 && sd > 0) {
    const zScore = (amount - stats.mean) / sd;
    if (zScore > Z_SCORE_THRESHOLD) {
      return {
        isAnomaly: true,
        reason: `Transaction is ${zScore.toFixed(1)} standard deviations above your average ${category} spend (avg: ₹${stats.mean.toFixed(0)})`,
        severity: zScore > 5 ? "high" : "medium",
      };
    }
  } else if (stats.count > 0 && amount > stats.mean * LARGE_TXN_MULTIPLIER) {
    // Not enough history for a reliable z-score yet, so fall back to a
    // simple multiplier check rather than staying silent.
    return {
      isAnomaly: true,
      reason: `Transaction is over ${LARGE_TXN_MULTIPLIER}x your average ${category} spend so far`,
      severity: "medium",
    };
  }

  // 3. New/unusual merchant check: first time this merchant has appeared
  //    for this user at all, combined with an above-average amount.
  const priorMerchant = await sql`
    SELECT id FROM transactions
    WHERE user_id = ${userId} AND merchant = ${merchant}
    LIMIT 1
  `;
  if (priorMerchant.length === 0 && stats.count >= 3 && amount > stats.mean) {
    return {
      isAnomaly: true,
      reason: `First transaction from "${merchant}", and it's above your typical ${category} spend`,
      severity: "low",
    };
  }

  return { isAnomaly: false, reason: null, severity: null };
}