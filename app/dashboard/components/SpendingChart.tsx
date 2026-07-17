"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type CategorySummary = { category: string; total: number; count: number };

export default function SpendingChart({ data }: { data: CategorySummary[] }) {
  if (data.length === 0) {
    return (
      <div style={emptyStateStyle}>
        No transactions yet. They'll appear here once the simulator runs.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `₹${v}`} />
          <YAxis
            type="category"
            dataKey="category"
            stroke="var(--text-muted)"
            fontSize={12}
            width={90}
            tickFormatter={(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}
          />
          <Tooltip
            contentStyle={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value: number) => [`₹${value.toFixed(2)}`, "Total spent"]}
          />
          <Bar dataKey="total" fill="var(--accent)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const emptyStateStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "14px",
  padding: "40px 0",
  textAlign: "center",
};