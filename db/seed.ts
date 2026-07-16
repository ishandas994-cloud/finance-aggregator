import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { config } from "dotenv";

// dotenv defaults to loading ".env", but Next.js convention (and our
// .env.example) uses ".env.local" -- point it there explicitly.
config({ path: ".env.local" });

// Run with: npm run db:seed
// Creates one demo user with a few connected "accounts" so there's
// something to log into and simulate transactions against immediately,
// instead of staring at an empty dashboard after your first deploy.

const DEMO_EMAIL = "demo@ledger.app";
const DEMO_PASSWORD = "demo1234";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local before seeding.");
  }
  const sql = neon(process.env.DATABASE_URL);

  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // Upsert-style: delete existing demo user first so the script is safe
  // to re-run without creating duplicates.
  await sql`DELETE FROM users WHERE email = ${DEMO_EMAIL}`;

  const [user] = await sql`
    INSERT INTO users (email, password_hash)
    VALUES (${DEMO_EMAIL}, ${passwordHash})
    RETURNING id
  `;

  console.log(`Created user ${DEMO_EMAIL} (id: ${user.id})`);

  const accounts = [
    { bank_name: "HDFC Bank", account_type: "checking", last_four: "4821" },
    { bank_name: "ICICI Bank", account_type: "savings", last_four: "7734" },
    { bank_name: "Axis Credit Card", account_type: "credit_card", last_four: "9012" },
  ];

  for (const acc of accounts) {
    const [inserted] = await sql`
      INSERT INTO accounts (user_id, bank_name, account_type, last_four)
      VALUES (${user.id}, ${acc.bank_name}, ${acc.account_type}, ${acc.last_four})
      RETURNING id
    `;
    console.log(`  + ${acc.bank_name} (${acc.account_type}) -> account id ${inserted.id}`);
  }

  console.log("\nDone. Log in with:");
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log(`\nUser id ${user.id} -- use this if you need to manually hit /api/anomalies?userId=${user.id} or /api/transactions?userId=${user.id}`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});