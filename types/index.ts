export type Account = {
  id: number;
  user_id: number;
  bank_name: string;
  account_type: "checking" | "savings" | "credit_card";
  last_four: string;
};

export type Transaction = {
  id: number;
  account_id: number;
  user_id: number;
  merchant: string;
  amount: number;
  category: string;
  status: "queued" | "processed" | "flagged";
  occurred_at: string;
};

export type Anomaly = {
  id: number;
  transaction_id: number;
  user_id: number;
  reason: string;
  severity: "low" | "medium" | "high";
  detected_at: string;
  resolved: boolean;
};

export type QueuedTransactionPayload = {
  userId: number;
  accountId: number;
  merchant: string;
  amount: number;
  occurredAt: string;
};