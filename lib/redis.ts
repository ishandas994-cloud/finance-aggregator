import { Redis } from "@upstash/redis";

// Upstash Redis talks over plain HTTPS requests, which is what makes it
// usable inside a serverless function (a normal Redis client needs a
// persistent TCP socket that Vercel functions can't hold open).
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Rolling per-user, per-category spend stats are stored as a small JSON
// blob so the anomaly engine doesn't have to recompute an average from the
// full transaction history on every single incoming transaction.
export type CategoryStats = {
  count: number;
  mean: number;
  m2: number; // sum of squares of differences from the mean (Welford's algorithm)
};

const statsKey = (userId: number, category: string) => `stats:${userId}:${category}`;

export async function getCategoryStats(userId: number, category: string): Promise<CategoryStats> {
  const existing = await redis.get<CategoryStats>(statsKey(userId, category));
  return existing ?? { count: 0, mean: 0, m2: 0 };
}

// Welford's online algorithm: updates running mean/variance in O(1) without
// storing every past transaction amount in memory.
export async function updateCategoryStats(
  userId: number,
  category: string,
  amount: number
): Promise<CategoryStats> {
  const prev = await getCategoryStats(userId, category);
  const count = prev.count + 1;
  const delta = amount - prev.mean;
  const mean = prev.mean + delta / count;
  const delta2 = amount - mean;
  const m2 = prev.m2 + delta * delta2;

  const next: CategoryStats = { count, mean, m2 };
  await redis.set(statsKey(userId, category), next);
  return next;
}

export function stdDev(stats: CategoryStats): number {
  if (stats.count < 2) return 0;
  return Math.sqrt(stats.m2 / (stats.count - 1));
}