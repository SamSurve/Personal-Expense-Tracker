import { Transaction } from "./types"

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "TX-948210",
    timestamp: "2026-09-11 09:42:18",
    type: "EXPENSE",
    merchant: "Whole Foods Market",
    category: "Groceries",
    amount: -86.42,
    account: "Chase Sapphire ···4819",
    status: "SETTLED",
    notes: "Organic produce, pantry staples & bakery items",
    refHash: "0x8f19a02c89f14b21"
  },
  {
    id: "TX-948209",
    timestamp: "2026-09-11 08:15:03",
    type: "TRANSFER",
    merchant: "Vanguard Brokerage",
    category: "Investments",
    amount: -2500.00,
    account: "Fidelity Checking ···9102",
    status: "SETTLED",
    notes: "Automated monthly index fund allocation (VTSAX)",
    refHash: "0x7a22bc39014431ec"
  },
  {
    id: "TX-948208",
    timestamp: "2026-09-10 17:30:45",
    type: "INCOME",
    merchant: "Fidelity · VTI Dividend",
    category: "Investments",
    amount: 842.16,
    account: "Fidelity Brokerage ···4410",
    status: "SETTLED",
    notes: "Q3 ETF dividend distribution payout",
    refHash: "0x91dae387002b66ea"
  },
  {
    id: "TX-948207",
    timestamp: "2026-09-10 16:24:12",
    type: "EXPENSE",
    merchant: "Cedar & Pine",
    category: "Dining",
    amount: -64.80,
    account: "Amex Gold ···1024",
    status: "SETTLED",
    notes: "Dinner with design team",
    refHash: "0x2e81bb0139ef554a"
  },
  {
    id: "TX-948206",
    timestamp: "2026-09-10 12:08:55",
    type: "EXPENSE",
    merchant: "Metro Transit",
    category: "Transport",
    amount: -32.00,
    account: "Apple Pay ···3391",
    status: "SETTLED",
    notes: "Monthly subway & light rail transit pass refill",
    refHash: "0x19ca4472f88b90fe"
  },
  {
    id: "TX-948205",
    timestamp: "2026-09-09 09:00:00",
    type: "INCOME",
    merchant: "Acme Corp · Payroll",
    category: "Income",
    amount: 6240.00,
    account: "Chase Checking ···1882",
    status: "SETTLED",
    notes: "Bi-weekly direct payroll deposit",
    refHash: "0x44aa1192ccaa1010"
  },
  {
    id: "TX-948204",
    timestamp: "2026-09-08 18:41:30",
    type: "EXPENSE",
    merchant: "Northstar Utilities",
    category: "Utilities",
    amount: -118.37,
    account: "Chase Checking ···1882",
    status: "SETTLED",
    notes: "Residential electric, water & municipal gas",
    refHash: "0x61bb9381ea557892"
  },
  {
    id: "TX-948203",
    timestamp: "2026-09-07 14:18:22",
    type: "EXPENSE",
    merchant: "Arcade Coffee",
    category: "Dining",
    amount: -5.75,
    account: "Amex Gold ···1024",
    status: "SETTLED",
    notes: "Cortado & morning beans",
    refHash: "0x33aa084792ec4920"
  },
  {
    id: "TX-948202",
    timestamp: "2026-09-05 11:20:00",
    type: "EXPENSE",
    merchant: "Equinox Fitness",
    category: "Subscriptions",
    amount: -260.00,
    account: "Chase Sapphire ···4819",
    status: "SETTLED",
    notes: "Monthly club membership dues",
    refHash: "0x88bb7102ad993120"
  },
  {
    id: "TX-948201",
    timestamp: "2026-09-03 08:30:15",
    type: "EXPENSE",
    merchant: "Avalon Communities",
    category: "Housing",
    amount: -2450.00,
    account: "Chase Checking ···1882",
    status: "SETTLED",
    notes: "September residential lease payment",
    refHash: "0x99cc4019aebb2041"
  }
]

export const CATEGORY_COLORS: Record<string, string> = {
  Housing: "#818cf8", // Indigo
  Groceries: "#34d399", // Emerald
  Dining: "#fbbf24", // Amber
  Utilities: "#38bdf8", // Sky blue
  Transport: "#f472b6", // Rose
  Subscriptions: "#a78bfa", // Violet
  Investments: "#60a5fa", // Blue
  Income: "#39e58c", // Neon green
  Healthcare: "#fb7185", // Coral
  Other: "#94a3b8" // Slate
}

export const KNOWN_ACCOUNTS = [
  "Chase Sapphire ···4819",
  "Amex Gold ···1024",
  "Chase Checking ···1882",
  "Fidelity Checking ···9102",
  "Fidelity Brokerage ···4410",
  "Apple Pay ···3391",
  "Cash / Cold Wallet"
]

export const KNOWN_CATEGORIES = [
  "Groceries",
  "Dining",
  "Housing",
  "Utilities",
  "Transport",
  "Subscriptions",
  "Investments",
  "Income",
  "Healthcare",
  "Other"
]

/**
 * Recalculates exact running balances chronologically.
 * If baseLiquidity represents the current latest liquidity (e.g. $18,420.18 at TX-948210),
 * previous transactions calculate strictly:
 * row[i].balance = row[i-1].balance - row[i-1].amount
 */
export function calculateBalances(txs: Transaction[], currentLiquidity: number = 18420.18): Transaction[] {
  // Sort descending by timestamp (newest first)
  const sorted = [...txs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  let running = currentLiquidity
  return sorted.map((tx, idx) => {
    if (idx === 0) {
      return { ...tx, balance: running }
    }
    // For previous row: previous running balance was (current balance - this row's amount)
    const prevTx = sorted[idx - 1]
    running = running - prevTx.amount
    return { ...tx, balance: Math.round(running * 100) / 100 }
  })
}
