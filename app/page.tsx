import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "24px",
        gap: "24px",
      }}
    >
      <span
        className="mono"
        style={{ color: "var(--accent)", letterSpacing: "0.08em", fontSize: "13px" }}
      >
        LEDGER · FINANCE AGGREGATOR
      </span>

      <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", maxWidth: "720px", lineHeight: 1.1 }}>
        Every account, one ledger. Every anomaly, caught early.
      </h1>

      <p style={{ color: "var(--text-muted)", maxWidth: "540px", fontSize: "17px", lineHeight: 1.6 }}>
        Aggregates transactions across connected accounts, categorizes spend automatically,
        and flags anything statistically unusual before it costs you.
      </p>

      <Link
        href="/dashboard"
        style={{
          background: "var(--accent)",
          color: "var(--bg)",
          padding: "12px 28px",
          borderRadius: "8px",
          fontWeight: 600,
          textDecoration: "none",
          fontFamily: "var(--font-display)",
        }}
      >
        Open dashboard
      </Link>
    </main>
  );
}