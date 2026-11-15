<div align="center">

# 📟 Personal Expense Tracker

### A Bloomberg-terminal-style dashboard for your money.
**High density. Zero fluff. Every rupee, dollar and cent in one view.**

![Next.js](https://img.shields.io/badge/Next.js-App_Router-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Node](https://img.shields.io/badge/Node-%E2%89%A518-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

[**Quick Start**](#-quick-start) · [**How It Works**](#-how-it-works) · [**Features**](#-features) · [**Demo Script**](#-demo-script) · [**Tech Stack**](#%EF%B8%8F-tech-stack)

<!-- 📸 Add a screenshot or GIF here:
<img src="docs/dashboard.png" alt="Dashboard preview" width="900" />
-->

</div>

---

## 🎯 Why This Exists

Most expense trackers waste screen space on padding and pastel cards. **This one doesn't.**
It's built for people who want cash flow, liquidity and spending allocation in **one unified, trade-desk interface**.

---

## ⚡ How It Works

> 👇 The whole app in one flow.

```mermaid
flowchart LR
    A([🧑 User]) --> B[➕ NEW RECORD]
    B --> C{{"📊 Projected Liquidity<br/>(live preview)"}}
    C -->|Looks good| D[✅ Submit]
    C -->|Too risky| B
    D --> E[🔐 Hash generated]
    E --> F[(📒 Ledger)]
    F --> G[🔄 Running balance recalculated]
    F --> H[🔥 Spend Allocation heat bars]
    F --> I[🔎 Search / Filter]
    I --> J[📤 CSV Export]

    style A fill:#0b0f14,stroke:#00ff9c,color:#00ff9c
    style C fill:#0b0f14,stroke:#ffb000,color:#ffb000
    style E fill:#0b0f14,stroke:#00d1ff,color:#00d1ff
    style F fill:#0b0f14,stroke:#00ff9c,color:#00ff9c
```

### 🔐 Audit Trail in 3 Steps

```mermaid
flowchart LR
    T[Transaction data] --> H[Generate unique hash]
    H --> S[Stored with record]
    S --> V{Open Details Drawer}
    V --> OK[✔ Verify integrity]
```

---

## ✨ Features

| | Feature | What you get |
|---|---|---|
| 🖥️ | **Trade-Desk UI** | Dark theme, monospace type, neon accents |
| 📒 | **Transaction Ledger** | Every entry with a dynamic running balance |
| 🔮 | **Record Modal** | See *projected liquidity* before you commit |
| 🔥 | **Spend Allocation** | Interactive heat bars + category breakdown |
| 🔎 | **Filter & Search** | By text, type (e.g. `EXPENSE`) or category |
| 📤 | **CSV Export** | One click, straight to your analysis tools |
| 🔐 | **Audit Trail** | Unique cryptographic hash per transaction |

---

## 🚀 Quick Start

**Requires:** Node.js 18+ and npm / yarn / pnpm

```bash
git clone https://github.com/YuvrajsinghAIML/Personal-Expense-Tracker.git
cd Personal-Expense-Tracker
npm install
npm run dev
```

Open 👉 **http://localhost:3000**

---

## 🎬 Demo Script

<details>
<summary><b>▶ Click to expand the 7-step walkthrough</b></summary>

<br/>

```mermaid
flowchart TD
    S1["1️⃣ Overview<br/>Dark UI + live liquidity metrics"] --> S2["2️⃣ Add transaction<br/>e.g. $45 · Coffee Shop"]
    S2 --> S3["3️⃣ Verify ledger<br/>Row added, balance updated"]
    S3 --> S4["4️⃣ Inspect details<br/>Open drawer, show hash"]
    S4 --> S5["5️⃣ Analyze spending<br/>Spend Allocation heat bars"]
    S5 --> S6["6️⃣ Filter<br/>Search or type = EXPENSE"]
    S6 --> S7["7️⃣ Export<br/>CSV Export button"]
```

| Step | Action | Point to highlight |
|---|---|---|
| 1 | Show the dashboard | Terminal aesthetic, high data density |
| 2 | Click **+ NEW RECORD**, enter `$45 – Coffee Shop` | *Projected Liquidity* updates **before** submit |
| 3 | Submit, check the ledger | New row + auto-recalculated running balance |
| 4 | Click any row | Cryptographic hash in the details drawer |
| 5 | Look at Spend Allocation | Category heat bars |
| 6 | Use search / type filter | Instant narrowing, e.g. `EXPENSE` |
| 7 | Click **CSV Export** | Data out in one click |

</details>

---

## 🛠️ Tech Stack

```mermaid
flowchart LR
    UI[Next.js App Router + React] --> TS[TypeScript]
    UI --> TW[Tailwind CSS]
    UI --> IC[Lucide React icons]
```

| Layer | Tool |
|---|---|
| Framework | Next.js (App Router), React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Icons | Lucide React |

---

## 🤝 Contributing

<details>
<summary><b>Want to help?</b></summary>

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

</details>

---

<div align="center">

**Built by [SamSurve](https://github.com/SamSurve) & [Yuvraj Singh](https://github.com/YuvrajsinghAIML)**

⭐ If this project helped you, drop a star!

</div>
