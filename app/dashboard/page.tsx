"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import SpendingChart from "./components/SpendingChart";
import AnomalyList from "./components/AnomalyList";
import TransactionFeed from "./components/TransactionFeed";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [categorySummary, setCategorySummary] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as any)?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!userId) return;

    async function loadData() {
      setLoading(true);
      const [txRes, anomalyRes] = await Promise.all([
        fetch(`/api/transactions?userId=${userId}`),
        fetch(`/api/anomalies?userId=${userId}`),
      ]);
      const txData = await txRes.json();
      const anomalyData = await anomalyRes.json();

      setTransactions(txData.transactions ?? []);
      setCategorySummary(txData.categorySummary ?? []);
      setAnomalies(anomalyData.anomalies ?? []);
      setLoading(false);
    }

    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [userId]);

  if (status === "loading" || loading) {
    return (
      <main style={centeredStyle}>
        <p style={{ color: "var(--text-muted)" }}>Loading your ledger...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <main style={{ maxWidth: "960px", margin: "0 auto", padding: "40px 24px" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "32px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px" }}>Ledger</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0 0" }}>
            {session?.user?.email}
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "13px",
          }}
        >
          Sign out
        </button>
      </header>

      <section style={cardStyle}>
        <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Spending by category</h3>
        <SpendingChart data={categorySummary} />
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        <section style={cardStyle}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Anomalies</h3>
          <AnomalyList anomalies={anomalies} />
        </section>

        <section style={cardStyle}>
          <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>Recent transactions</h3>
          <TransactionFeed transactions={transactions} />
        </section>
      </div>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  padding: "20px",
};

const centeredStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};