export type TransactionType = "EXPENSE" | "INCOME" | "TRANSFER"

export type Transaction = {
  id: string
  timestamp: string // Strict ISO format: YYYY-MM-DD HH:mm:ss
  type: TransactionType
  merchant: string
  category: string
  amount: number // Negative for EXPENSE, positive for INCOME/TRANSFER
  account: string
  status: "SETTLED" | "PENDING"
  notes?: string
  refHash: string
  balance?: number
}

export type CategoryAllocation = {
  category: string
  amount: number
  percentage: number
  color: string
}
