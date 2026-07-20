"use client";

type Transaction = {
  id: number;
  merchant: string;
  amount: number;
  category: string;
  status: "queued" | "processed" | "flagged";
  occurred_at: string;
};

export default function TransactionFeed({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "24px 0", textAlign: "center" }}>
        No transactions yet. Trigger the simulator or wait for the next cron run.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {transactions.map((t, i) => (
        <div
          key={t.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
          }}
        >
          <div>
            <div style={{ fontSize: "14px" }}>{t.merchant}</div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "capitalize" }}>
              {t.category} - {new Date(t.occurred_at).toLocaleDateString()}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {t.status === "flagged" && (
              <span
                className="mono"
                style={{
                  fontSize: "10px",
                  color: "var(--danger)",
                  border: "1px solid var(--danger)",
                  borderRadius: "4px",
                  padding: "1px 5px",
                }}
              >
                FLAGGED
              </span>
            )}
            <span className="mono" style={{ fontSize: "14px" }}>
              Rs {Number(t.amount).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
