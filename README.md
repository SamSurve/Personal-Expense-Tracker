# Personal Expense Tracker

A high-density, Bloomberg terminal-inspired personal finance tracker built for precision and clarity.

## 📖 Problem Statement

Traditional expense trackers often rely on overly simplistic interfaces with excessive whitespace, making it difficult to analyze complex financial data at a glance. This project addresses the need for a **high-density financial tracking tool** that provides a comprehensive view of cash flow, liquidity, and spending allocations in a single, unified interface—designed for users who want a professional, "trade-desk" aesthetic.

## ✨ Key Features

- **Trade-Desk UI**: A sleek, dark-themed dashboard inspired by professional trading terminals, featuring monospace typography and dynamic neon accents.
- **Robust Transaction Ledger**: Comprehensive transaction tracking with dynamic running balances.
- **Record Transaction Modal**: Manual entry interface with real-time liquidity projections before committing to an expense.
- **Spend Allocation Analytics**: Interactive heat bars and categorical breakdowns for deep spending analysis.
- **Advanced Filtering & Export**: Search, filter by transaction type or category, and export data directly to CSV.
- **Cryptographic Audit Trail**: Each transaction generates a unique cryptographic hash for data integrity verification, accessible via the Transaction Details Drawer.

## 🚀 Getting Started

To run this project locally for demonstration or development purposes:

### Prerequisites
- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YuvrajsinghAIML/Personal-Expense-Tracker.git
   cd Personal-Expense-Tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🎬 Demo Script

When presenting this project, follow this script to highlight key functionality:

1. **Overview**: Introduce the dashboard, highlighting the dark Bloomberg-terminal aesthetic, high data density, and live liquidity metrics at the top.
2. **Add a Transaction**: Click the "+ NEW RECORD" button. Enter a new expense (e.g., $45 for "Coffee Shop"). Point out how the "Projected Liquidity" updates in real-time before you even submit the form. Submit the transaction.
3. **Verify Ledger**: Show that the new transaction has appeared in the ledger and the running balance has automatically recalculated.
4. **Inspect Details**: Click on any transaction row to open the details drawer. Highlight the cryptographic hash, which ensures the transaction's integrity.
5. **Analyze Spending**: Direct attention to the Spend Allocation widget to show how expenses are categorized with visual heat bars.
6. **Filtering**: Use the search bar or type filters to quickly find specific transactions (e.g., filter by "EXPENSE").
7. **Export**: Click the "CSV Export" button to demonstrate how easily the data can be extracted for external analysis.

## 🛠️ Technology Stack

- **Framework**: Next.js (App Router), React
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
