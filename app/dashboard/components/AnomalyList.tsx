"use client";

type Anomaly = {
  id: number;
  reason: string;
  severity: "low" | "medium" | "high";
  detected_at: string;
  merchant: string;
  amount: number;
  category: string;
};

const SEVERITY_COLOR: Record<Anomaly["severity"], string> = {
  low: "var(--text-muted)",
  medium: "var(--warn)",
  high: "var(--danger)",
};

export default function AnomalyList({ anomalies }: { anomalies: Anomaly[] }) {
  if (anomalies.length === 0) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "14px", padding: "24px 0", textAlign: "center" }}>
        No anomalies detected. Your spending looks consistent with your history.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {anomalies.map((a) => (
        <div
          key={a.id}
          style={{
            background: "var(--surface-raised)",
            border: `1px solid ${SEVERITY_COLOR[a.severity]}33`,
            borderLeft: `3px solid ${SEVERITY_COLOR[a.severity]}`,
            borderRadius: "8px",
            padding: "12px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ fontSize: "14px", marginBottom: "4px" }}>{a.reason}</div>
            <div className="mono" style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {a.merchant} - Rs {Number(a.amount).toFixed(2)} - {new Date(a.detected_at).toLocaleString()}
            </div>
          </div>
          <span
            className="mono"
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              color: SEVERITY_COLOR[a.severity],
              border: `1px solid ${SEVERITY_COLOR[a.severity]}`,
              borderRadius: "4px",
              padding: "2px 6px",
              whiteSpace: "nowrap",
            }}
          >
            {a.severity}
          </span>
        </div>
      ))}
    </div>
  );
}
