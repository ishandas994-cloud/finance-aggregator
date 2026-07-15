import { neon, neonConfig } from "@neondatabase/serverless";

// Vercel's edge/serverless functions benefit from fetch-based connections
// instead of a persistent TCP pool, which is why Neon's HTTP driver is used
// here instead of a normal `pg` Pool.
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env.local or Vercel project settings.");
}

// `sql` is a tagged-template query function: sql`select * from users where id = ${id}`
export const sql = neon(process.env.DATABASE_URL);