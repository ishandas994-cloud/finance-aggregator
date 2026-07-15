// Generates realistic-looking transactions so the dashboard has live data
// to show without needing real bank credentials (Plaid-style APIs require
// KYC/business approval that isn't practical for a student project).

const MERCHANTS: Record<string, string[]> = {
  groceries: ["BigBasket", "Whole Foods Market", "Local Kirana Store", "Reliance Mart"],
  dining: ["Starbucks", "Zomato - Biryani House", "Swiggy - Pizza Corner", "Cafe Coffee Day"],
  transport: ["Uber", "Ola Cabs", "IndianOil Petrol Pump", "Delhi Metro"],
  entertainment: ["Netflix", "Spotify Premium", "BookMyShow", "Amazon Prime Video"],
  utilities: ["BSES Electricity", "Jio Fiber Broadband", "Airtel Recharge"],
  shopping: ["Amazon.in", "Flipkart", "Myntra", "Local Mall Store"],
  healthcare: ["Apollo Pharmacy", "MedPlus", "City Hospital"],
};

const CATEGORIES = Object.keys(MERCHANTS);

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmount(category: string): number {
  // Rough, believable ranges per category (in rupees).
  const ranges: Record<string, [number, number]> = {
    groceries: [200, 3000],
    dining: [100, 1500],
    transport: [50, 800],
    entertainment: [150, 1000],
    utilities: [300, 2500],
    shopping: [500, 8000],
    healthcare: [100, 5000],
  };
  const [min, max] = ranges[category] ?? [50, 1000];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export type SimulatedTransaction = {
  merchant: string;
  amount: number;
  category: string;
  occurredAt: string;
};

// Occasionally injects a deliberately anomalous transaction (very large
// amount) so the demo actually has something for the anomaly engine to
// catch, instead of a dashboard that always shows zero alerts.
export function generateTransaction(injectAnomaly = Math.random() < 0.08): SimulatedTransaction {
  const category = randomFrom(CATEGORIES);
  const merchant = randomFrom(MERCHANTS[category]);
  let amount = randomAmount(category);

  if (injectAnomaly) {
    amount = amount * (6 + Math.random() * 4); // 6x-10x normal spend
  }

  return {
    merchant,
    amount,
    category,
    occurredAt: new Date().toISOString(),
  };
}

export function generateBatch(count: number): SimulatedTransaction[] {
  return Array.from({ length: count }, () => generateTransaction());
}