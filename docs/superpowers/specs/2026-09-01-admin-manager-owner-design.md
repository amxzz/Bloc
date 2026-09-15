# System Design Specification: Admin, Manager, and Owner ERP Roles (Bloc. Gelato)

**Date**: 2026-09-01  
**Project**: Bloc. Gelato ERP & POS System  
**Framework**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand, Firebase  
**Design System**: Epilogue Font, Cream (`#FCF1E1`), Navy (`#2D3D6E`), Blue (`#7F85D1`), Red (`#A4231E`)

---

## 1. Executive Summary & Core Rules

System expansion introducing dedicated role-specific sub-systems for **Admin**, **Manager**, and **Owner** alongside existing operational roles (**Cashier**, **Kitchen**, **Inventory**).

### Core Architectural Rules
1. **Role-Dedicated Unified Sub-Systems**: Separate directories (`/admin/*`, `/manager/*`, `/owner/*`) with dedicated Zustand state handlers and clean RSC boundaries.
2. **54 Showcase Display Slots**: 3 Freezers $\times$ 18 slots each (Freezer A 18 slots, Freezer B 18 slots, Freezer C 18 slots, layout grid 9 rows $\times$ 2 columns).
3. **63 Gelato Flavors in Catalog**: Full 63 recipes dataset. Seasonal series flavors (`Rosso Bianco`, `Spiced Pumpkin Chai`, `Winter Honey Fig & Walnut`) default to **Not Available (Seasonal Event Inactive)** until activated via Admin Toggle.
4. **Tax 10% (PPN) Rule**: Financial calculation across POS, Cart, Checkout, and Digital Receipt includes Tax 10% (PPN):
   $$\text{Subtotal} = \sum (\text{Unit Price} \times \text{Quantity})$$
   $$\text{Tax 10\% (PPN)} = \text{Subtotal} \times 0.10$$
   $$\text{Total Bill} = \text{Subtotal} + \text{Tax 10\% (PPN)}$$
5. **Pricing Management**: Admin & Manager can update packaging, topping, and sauce prices. All price modifications are logged to `audit_logs`.
6. **User Account Governance**:
   - **Owner**: Registers & manages Manager accounts (`mgr_`).
   - **Manager**: Registers & manages Staff accounts (`csh_`, `ktc_`, `inv_`).
   - **Admin**: System root maintenance & credential overrides.

---

## 2. Role ADMIN (`/admin/*`) — 6 Pages

### 2.1 `/admin/overview` — System & Data Health
- **Header**: Title `"Admin System Hub"`, Subtitle `"ERP Master Data Management & System Performance"`.
- **Metrics**: Total 63 Flavor Recipes, Active Ingredients (42), Active Suppliers (8), System Audit Logs (128 Today).
- **Features**: System connectivity status, Seasonal Event Toggle indicator, Recent System Logs feed.

### 2.2 `/admin/flavors-catalog` — Master 63 Gelato Recipes
- **Features**: Full CRUD for 63 flavors, base type capacity setting (`Milk 3000g` vs `Sorbetto 2500g`), allergen chips, best seller flags, and **Seasonal Event Active/Inactive Toggle**.

### 2.3 `/admin/master-inventory` — Unified Inventory, Add-ons & Packaging Master
- **Sub-Tab 1: Raw Materials**: Milk, cream, pastes, fruit purees, cost per unit, min restock thresholds.
- **Sub-Tab 2: Add-ons & Pricing**: Topping & sauce master data with **Price Update Control**.
- **Sub-Tab 3: Packaging & Pricing**: Cup, Cono, Vaschetta specifications, max scoops, and **Price Update Control**.

### 2.4 `/admin/vendors-suppliers` — Supplier Directory
- **Features**: Vendor name, contact person, phone, address, supplied item categories, payment terms.

### 2.5 `/admin/showcase-layout` — Showcase 54 Slots Grid Mapping
- **Features**: Physical layout configuration for 54 display slots (Freezer A A01-A18, Freezer B B01-B18, Freezer C C01-C18). Slot flavor assignment.

### 2.6 `/admin/system-config` — Parameters & Audit Logs
- **Sub-Tab 1: System Parameters**: Tax Rate (10% PPN), store operating hours, PIN policy.
- **Sub-Tab 2: Technical Audit Logs**: Complete system audit log table tracking user actions and price modifications.

---

## 3. Role MANAGER (`/manager/*`) — 5 Pages

### 3.1 `/manager/overview` — Supervisory Action Center
- **Features**: Operational KPI cards (Today Sales, Cash Float status, Pending PO value, Active Staff), **Needs Attention Alert Banner** (Pending POs, Void/Refund requests, Tub Disposal logs).

### 3.2 `/manager/approvals` — Approval Gateway & Manager PIN
- **Sub-Tab 1: Purchase Orders**: Approval of POs created by Inventory staff.
- **Sub-Tab 2: Void & Refund**: Review and PIN authorization for cashier voided/refunded transactions.
- **Sub-Tab 3: Tub Disposal**: Inspection of expired/damaged gelato tub disposal requests from Kitchen.
- **PIN Verification**: Action buttons open `PinModal` requiring Manager 4-digit PIN code.

### 3.3 `/manager/staff-management` — Staff Accounts & Credentials
- **Features**: Register & manage Cashier (`csh_`), Kitchen (`ktc_`), and Inventory (`inv_`) accounts. Initial PIN assignment, reset PIN, activate/suspend account.

### 3.4 `/manager/shift-audit` — Shift Reconciliation & Cash Audit
- **Features**: Daily cashier shift audit, Opening Float (`IDR 500.000`), Cash Sales vs Non-Cash Sales, Expected Closing Cash vs Actual Cash Tendered, Variance (+/- IDR) calculation.

### 3.5 `/manager/stock-audit` — Stock Opname & Waste Inspection
- **Features**: Physical warehouse stock opname verification, variance review, and kitchen gelato waste log inspection.

---

## 4. Role OWNER (`/owner/*`) — 4 Pages

### 4.1 `/owner/overview` — Executive Business Dashboard
- **Features**: Gross Revenue, Net Profit Margin, Gelato COGS/HPP Ratio, Total Scoops Served, Monthly Revenue Trend Chart.

### 4.2 `/owner/product-analytics` — Sales Insights & Flavor Performance
- **Features**: Top 5 Best Seller Flavors vs Bottom 5 Slow Movers, packaging popularity distribution (Cup vs Cono vs Vaschetta), profit margin per scoop.

### 4.3 `/owner/manager-accounts` — Manager Accounts Control
- **Features**: Register & manage Manager accounts (`mgr_doni`, `mgr_rizky`), branch assignment, Manager PIN reset.

### 4.4 `/owner/financial-reports` — Executive Financial Statements
- **Features**: Profit & Loss Statement, Operating Expenses (OPEX) breakdown, Export PDF/Excel reporting buttons.

---

## 5. Tax 10% (PPN) & Pricing Integration

1. **Cart & POS Calculation (`useCartStore.ts`)**:
   - `subtotal = sum(item.unitPrice * item.quantity)`
   - `taxAmount = Math.round(subtotal * 0.10)`
   - `totalAmount = subtotal + taxAmount`
2. **Drawer & Receipt Components**:
   - `OrdersDrawerSection.tsx`: Displays Subtotal, Tax 10% (PPN), and Total.
   - `DigitalReceiptModal.tsx`: Includes Tax 10% (PPN) line in thermal paper preview.
3. **Price Management Audit (`useInventoryStore.ts` & `useCartStore.ts`)**:
   - Any price change records an audit log entry: `{ actor: "adm_anton", action: "UPDATE_PRICE", target: "Cup Medio", oldPrice: 30000, newPrice: 35000, timestamp: "2026-09-01 21:30" }`.

---

## 6. Verification & Validation Criteria

- **TypeScript Compilation**: `npx tsc --noEmit` must pass with 0 errors.
- **ESLint**: `npm run lint` must pass with 0 errors and 0 warnings.
- **Typography**: 100% Epilogue font family across body, headings, buttons, and badges.
- **Layout Overflow**: All side drawers must strictly use `h-[calc(100vh-10rem)] max-h-[780px] min-h-[560px] flex flex-col justify-between overflow-hidden`.
