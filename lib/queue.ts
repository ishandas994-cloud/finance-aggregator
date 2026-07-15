import { Client } from "@upstash/qstash";

// QStash is the serverless-friendly stand-in for Kafka/RabbitMQ in this
// architecture. A traditional broker needs a long-running consumer process
// to sit and listen for messages, which Vercel functions can't do (they
// spin up, run, and shut down per request). QStash instead accepts a
// message and makes an HTTP call to your endpoint on your behalf --
// turning "consume from a queue" into "receive a webhook", which fits the
// serverless request/response model.
export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Enqueue a raw transaction for async processing. `ingest` calls this
// instead of writing to the DB directly, so a burst of incoming
// transactions doesn't block the caller or overload the DB connection pool.
export async function enqueueTransaction(payload: {
  userId: number;
  accountId: number;
  merchant: string;
  amount: number;
  occurredAt: string;
}) {
  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL is not set");

  return qstash.publishJSON({
    url: `${appUrl}/api/process`,
    body: payload,
    retries: 3, // QStash retries with backoff if /api/process errors out
  });
}