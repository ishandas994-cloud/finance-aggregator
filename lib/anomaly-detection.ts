// Simple, explainable rule-based categorization. Real fintech products
// (Plaid, Yodlee) use much larger, ML-trained merchant taxonomies -- this
// keyword-matching version is intentionally transparent so every category
// decision can be explained in one sentence, which matters more for a demo
// project than marginal accuracy gains from a black-box classifier.
const CATEGORY_RULES: Record<string, string[]> = {
  groceries: ["mart", "grocery", "supermarket", "whole foods", "kirana", "bigbasket"],
  dining: ["restaurant", "cafe", "coffee", "swiggy", "zomato", "starbucks", "mcdonald"],
  transport: ["uber", "ola", "lyft", "petrol", "fuel", "metro", "irctc"],
  entertainment: ["netflix", "spotify", "prime video", "hotstar", "cinema", "bookmyshow"],
  utilities: ["electricity", "water bill", "internet", "broadband", "recharge", "gas bill"],
  shopping: ["amazon", "flipkart", "myntra", "mall", "store"],
  healthcare: ["pharmacy", "hospital", "clinic", "medplus", "apollo"],
  rent: ["rent", "landlord", "housing"],
  income: ["salary", "payroll", "deposit"],
};

export function categorizeTransaction(merchant: string): string {
  const normalized = merchant.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_RULES)) {
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return category;
    }
  }
  return "uncategorized";
}