# BLOC. Gelato ERP & POS System

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

An enterprise-grade Enterprise Resource Planning (ERP) and Point of Sale (POS) management system purpose-built for artisanal gelato laboratory operations, showcase display management, inventory tracking, and multi-role staff workflow.

---

## Key Features

### 1. Role-Based Access Control (RBAC)
Dedicated operational portals for 4 distinct organizational roles with PIN-based quick authentication:
* **Owner**: High-level financial reporting, profit margins, sales breakdown, and store performance analytics.
* **Manager**: Master recipe formulations, supplier management, purchase order approvals, and staff oversight.
* **Kitchen Staff**: Batch production scheduling, 69 master gelato formulations (BOM recipes), and freezer display updates.
* **Cashier**: High-speed POS terminal, shift opening/closing reconciliation, member loyalty program, and order processing.

### 2. Gelato Formulation & BOM Engine
* **69 Authentic Formulations**: Complete Bill of Materials (BOM) for 9 flavor series (Milk, Chocolate, Peanut & Nuts, Fruit, Dairy-Free Sorbetto, Dessert, Tea, Coffee, Seasonal).
* **Physico-Chemical Balancing**: Tracks fat percentage, MSNF, total solids, POD (sweetness index), and PAC (freezing point depression) per formulation.
* **Batch COGS Calculator**: Real-time batch cost estimation and per-scoop unit margin analysis.

### 3. Freezer Showcase Management
* **54 Display Tub Showcase**: Real-time monitoring across 3 freezer display groups (Freezer A, B, C x 18 slots).
* **Shelf-Life & Expiration Alert**: Tracks tub opening dates, remaining capacity (grams), and shelf-life thresholds (8 days max).

### 4. Inventory & Raw Materials Management
* **Real-time Stock Tracking**: Automatic stock deduction upon production batch extraction.
* **Supplier & Purchase Order Management**: Low-stock threshold alerts and purchase order generation.

---

## Tech Stack

* **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/) & Lucide Icons
* **Database**: [Supabase PostgreSQL](https://supabase.com/)
* **State Management**: [Zustand](https://github.com/pmndrs/zustand)
* **UI Components**: Modern dark-mode editorial layout with glassmorphism aesthetics.

---

## Database Architecture

The database schema and master seed data are organized under the `docs/` directory:

```
docs/
├── database_schema.sql      # Single unified DDL & DML file (Recommended)
├── 01_schema_structure.sql  # DDL schema structure & RLS policies
├── 02_seed_initial_data.sql # Initial user profiles, flavors, suppliers & showcase slots
└── 03_seed_bom_recipes.sql  # 69 Master BOM recipes & 612 recipe ingredients
```

---

## Getting Started

### Prerequisites
* Node.js 18.x or higher
* npm or yarn
* Supabase account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/amxzz/Bloc.git
   cd Bloc
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase project credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_key_here
   ```

4. **Setup Database**:
   Copy the contents of `docs/database_schema.sql` and execute it in your Supabase SQL Editor.

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## Default Access Credentials

For local testing, the following pre-configured accounts are available in the initial database seed:

| Role | Name | Username | PIN Code |
| :--- | :--- | :--- | :--- |
| **Owner** | Aldo Wijaya | `own_aldo` | `999999` |
| **Manager** | Budi Santoso | `mngr_budi` | `888888` |
| **Kitchen** | Chef Gelato | `ktch_chef` | `123456` |
| **Cashier** | Siti Kasir | `cshr_siti` | `111111` |

---

## License

Proprietary Software. All rights reserved. Developed for **BLOC. Gelato Laboratory**.
