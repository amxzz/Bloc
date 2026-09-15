# BLOC. Gelato Enterprise ERP System

BLOC. Gelato Enterprise ERP is a production-grade point-of-sale (POS), kitchen production, showcase freezer management, and executive analytics management system engineered specifically for artisanal gelato operations.

The application implements a strict 4-role access control system (Owner, Manager, Kitchen, Cashier), real-time inventory tracking down to raw ingredient grams, 54-slot showcase freezer tub shelf-life tracking, and 69 master gelato formulations with bill-of-materials (BOM) calculation engine.

---

## Core Operational Modules

### 1. Master Gelato Catalog & Formulation Engine
- Pre-configured dataset covering 69 master gelato formulations across 9 distinct series (Milk, Chocolate, Peanut & Nuts, Fruit, Dairy-Free / Sorbetto, Dessert, Tea, Coffee, and Seasonal).
- Master base formulation analytics including fat percentage, MSNF (Milk Solids-Not-Fat), total solids, POD (sweetness index), PAC (freezing point depression), and target overrun percentages.
- Gram-level Bill of Materials (BOM) breakdown for 3kg batch production and 1kg base scaling.

### 2. Showcase Display Slot Management
- Real-time slot control across 54 showcase display positions divided into Freezers A, B, and C (18 slots each).
- Automated shelf-life tracker monitoring tub open days with alert indicators when approaching the maximum 8-day freshness threshold.
- One-touch status transitions (Active, Empty, Discarded) and batch ID traceability.

### 3. POS Cashier & Member Loyalty Terminal
- Fast-touch order processing supporting multiple serving sizes (Piccolo 120ml, Medio 200ml, Grande 350ml, Takeaway Tubs 500g, and Artisanal Waffle Cones).
- Integrated member loyalty system supporting tier progression (Silver, Gold, Platinum) and point accrual logic.
- Cashier shift lifecycle management with opening float balance and closing register reconciliation.

### 4. Kitchen Production & Inventory Control
- Automated raw material deductions matched against production batch yields.
- Reorder threshold monitoring for raw ingredients, packaging, toppings, and flavor swirls.
- Production batch logging, quality control recording, and waste audit tracking.

### 5. Executive Governance & Financial Analytics
- Role-based access control (RBAC) supporting four distinct roles: Owner, Manager, Kitchen, and Cashier.
- Comprehensive sales reporting, estimated COGS per scoop/tub, profit margin calculations, and immutable audit logs.

---

## Technical Architecture

- Frontend Framework: Next.js 15 (App Router, Turbopack, React 19)
- Interface & Styling: Tailwind CSS, Vanilla CSS, Responsive Glassmorphism UI
- State Management: Zustand Global State Store
- Database Layer: Supabase PostgreSQL (14 Relational Tables with Row Level Security Policies)
- Type Safety: TypeScript 5 (Strict Mode)

---

## Repository Structure

```
system-bloc-gelato/
├── public/                           # Public Static Assets and Brand Logos
├── src/
│   ├── app/                          # Next.js App Router Layouts and Pages
│   ├── components/                   # Modular Role-Based UI Components
│   ├── lib/
│   │   ├── constants/                # Gelato Master Formulations Dataset
│   │   └── supabase/                 # Supabase Client and Service Synchronization
│   ├── store/                        # Zustand Global Stores
│   └── types/                        # TypeScript Type Definitions
├── supabase/
│   └── migrations/                   # Supabase SQL Schema and Seed Migrations
│       └── 01_initial_schema.sql     # Unified Single SQL Script (DDL + DML)
├── .env.example                      # Environment Variable Template
├── .gitignore                        # Version Control Exclusion Configuration
├── package.json                      # Project Manifest and Scripts
└── README.md                         # Technical Project Documentation
```

---

## Setup and Installation

### Prerequisites
- Node.js v18.17.0 or higher
- npm v9.0.0 or higher
- Supabase Project Instance

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/amxzz/Bloc.git
cd system-bloc-gelato
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the project root based on `.env.example`:
```bash
cp .env.example .env.local
```

Set your Supabase credentials in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_key_here
```

### 3. Database Initialization
1. Log in to your Supabase Dashboard and navigate to your project.
2. Open the SQL Editor and click New Query.
3. Copy the entire contents of `supabase/migrations/01_initial_schema.sql` and paste it into the editor.
4. Execute the query to initialize all 14 tables, RLS policies, 69 flavor formulations, 146 inventory items, and 612 recipe ingredients.

### 4. Running Locally
Start the development server:
```bash
npm run dev
```
Navigate to `http://localhost:3000` in your browser.

---

## Pre-Configured Access Profiles

For demonstration and testing purposes, use the following pre-seeded credentials:

| Role | Username | PIN Code | Primary System Scope |
| :--- | :--- | :--- | :--- |
| Owner | `own_aldo` | `999999` | Executive Dashboard, Financials, Audit Logs, Security |
| Manager | `mngr_budi` | `888888` | Inventory, Suppliers, Staff Roles, Menu Governance |
| Kitchen | `ktch_chef` | `123456` | Production Batches, Showcase Freezers, BOM & Waste |
| Cashier | `cshr_siti` | `111111` | POS Terminal, Orders, Shifts, Member Loyalty |

---

## License

Distributed under the MIT License. See `LICENSE` for details.
