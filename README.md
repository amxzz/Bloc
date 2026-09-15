# 🍨 BLOC. Gelato System — Enterprise Resource Planning (ERP)

[![Next.js](https://img.shields.io/badge/Next.js-15.0%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4%2B-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

An enterprise-grade, real-time Gelato Shop ERP system engineered for multi-role operations, precision Bill of Materials (BOM) inventory tracking, 54-slot freezer showcase management, point-of-sale (POS) cashier transactions, and real-time financial reporting.

---

## 🌟 Key Features

### 🍦 1. Master Gelato Catalog & BOM Recipe Engine
* **69 Master Flavor Formulations** across 9 series:
  * **Milk Series**: 10 variants (`flv-milk-01` to `flv-milk-10`)
  * **Chocolate Series**: 10 variants (`flv-choco-01` to `flv-choco-10`)
  * **Peanut & Nuts Series**: 8 variants (`flv-nuts-01` to `flv-nuts-08`)
  * **Fruit Series**: 9 variants (`flv-fruit-01` to `flv-fruit-09`)
  * **Dairy-Free / Sorbetto Series**: 9 variants (`flv-dairyfree-01` to `flv-dairyfree-09`)
  * **Dessert Series**: 7 variants (`flv-dessert-01` to `flv-dessert-07`)
  * **Tea Series**: 4 variants (`flv-tea-01` to `flv-tea-04`)
  * **Coffee Series**: 4 variants (`flv-coffee-01` to `flv-coffee-04`)
  * **Seasonal Series**: 8 variants (`flv-seasonal-01` to `flv-seasonal-08`)
* **Precision Recipe Breakdown**: 612 detailed ingredient specifications (`gramsBatch`, `grams1kg`, fat percentage, POD, PAC, target overrun, and estimated COGS).

### ❄️ 2. 54 Showcase Display Slot Freezer Management
* Real-time slot management across **Freezers A, B, and C** (18 slots each).
* Tub freshness tracking with open days counter and automated alert warnings for tubs approaching 8 days maximum shelf life.
* One-click batch assignment and tub status updates (Active, Empty, Discarded).

### 💳 3. Smart POS Cashier Terminal
* Quick scoop & tub ordering (Piccolo, Medio, Grande, Takeaway Tubs, Cones).
* Member loyalty system with tier calculation and point accrual.
* Cashier shift opening/closing reconciliation with cash register balance tracking.

### 🏭 4. Kitchen Production & Inventory Control
* Automated raw material deduction based on production batch yield.
* Restock threshold alerts for raw materials, packaging, toppings, and sauces.
* Batch waste logging and quality assurance recording.

### 📊 5. Executive Analytics & Multi-Role Governance
* **Strict 4-Role Architecture**: `owner`, `manager`, `kitchen`, and `cashier`.
* Real-time sales reporting, profit margins, inventory valuation, and audit logs.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 15 (App Router, Turbopack, React 19)
* **Styling**: Tailwind CSS, Lucide Icons, Glassmorphism UI
* **State Management**: Zustand
* **Database & BaaS**: Supabase PostgreSQL (14 Relational Tables with RLS Security Policies)
* **Type Safety**: TypeScript 5 (Strict Mode Enabled)

---

## 📂 Project Structure

```
system-bloc-gelato/
├── docs/                             # Database Schemas & Initial Seed SQL Files
│   ├── 01_schema_structure.sql       # DDL: 14 Tables, RLS Policies, Triggers
│   ├── 02_seed_initial_data.sql       # DML: User Profiles, 69 Flavors, Inventory, Showcase
│   ├── 03_seed_bom_recipes.sql       # DML: 69 Master Recipes & 612 BOM Ingredients
│   └── database_schema.sql           # Unified Single SQL File for Supabase SQL Editor
├── src/
│   ├── app/                          # Next.js App Router Page Layouts & Routes
│   ├── components/                   # Modular UI Components (Cashier, Kitchen, Manager, Owner)
│   ├── lib/
│   │   ├── constants/                # Gelato Master Formulations & Recipes Dataset
│   │   └── supabase/                 # Supabase Client & Data Synchronization Service
│   ├── store/                        # Zustand Global State Stores
│   └── types/                        # TypeScript Interfaces & Data Models
├── supabase/
│   └── migrations/                   # Supabase CLI Migration Files
├── .env.example                      # Environment Variable Template
├── .gitignore                        # Git Exclusion Configuration
├── package.json                      # Project Dependencies & Build Scripts
└── README.md                         # Project Documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.17.0 or later
* **npm**: v9.0.0 or later
* **Supabase Account**: Free tier at [supabase.com](https://supabase.com)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/amxzz/Bloc..git
cd system-bloc-gelato
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
cp .env.example .env.local
```
Fill in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

### 3. Database Setup (Supabase)
1. Log in to [Supabase](https://supabase.com) and navigate to your project.
2. Go to **SQL Editor** -> Click **New Query**.
3. Copy the entire contents of `docs/database_schema.sql` and paste it into the editor.
4. Click **Run**. All 14 tables, RLS policies, 69 flavor formulations, and 612 recipe ingredients will be initialized.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Access Credentials

For testing and demonstration, use the pre-configured accounts:

| Role | Username | PIN Code | Primary Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `own_aldo` | `999999` | Executive Dashboard, Financials, Audit Logs, Settings |
| **Manager** | `mngr_budi` | `888888` | Inventory, Suppliers, Staff Roles, Menu Management |
| **Kitchen** | `ktch_chef` | `123456` | Production Batches, Showcase Freezers, BOM & Waste |
| **Cashier** | `cshr_siti` | `111111` | POS Terminal, Orders, Shifts, Member Loyalty |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
