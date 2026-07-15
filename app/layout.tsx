import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Ledger — Finance Aggregator",
  description: "Aggregate accounts, watch spending, catch anomalies before they cost you.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}