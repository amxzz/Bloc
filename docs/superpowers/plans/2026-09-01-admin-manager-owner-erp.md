# Admin, Manager, and Owner ERP Roles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build dedicated sub-systems for Admin, Manager, and Owner roles with Tax 10% (PPN) calculation, 54 showcase display slots, price management, and user account governance.

**Architecture:** Create modular Next.js route groups (`src/app/admin/`, `src/app/manager/`, `src/app/owner/`) with clean RSC wrappers, state management stores for Tax 10% calculation and price updates, and responsive dashboard layouts adhering to the Epilogue design system.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Zustand, Lucide React icons.

---

## File Structure

```
src/
├── app/
│   ├── admin/
│   │   ├── overview/page.tsx
│   │   ├── flavors-catalog/page.tsx
│   │   ├── master-inventory/page.tsx
│   │   ├── vendors-suppliers/page.tsx
│   │   ├── showcase-layout/page.tsx
│   │   └── system-config/page.tsx
│   ├── manager/
│   │   ├── overview/page.tsx
│   │   ├── approvals/page.tsx
│   │   ├── staff-management/page.tsx
│   │   ├── shift-audit/page.tsx
│   │   └── stock-audit/page.tsx
│   └── owner/
│       ├── overview/page.tsx
│       ├── product-analytics/page.tsx
│       ├── manager-accounts/page.tsx
│       └── financial-reports/page.tsx
├── components/
│   ├── admin/
│   │   ├── AdminSidebar.tsx
│   │   ├── SeasonalEventToggle.tsx
│   │   ├── PriceUpdateModal.tsx
│   │   └── ShowcaseGridMapping.tsx
│   ├── manager/
│   │   ├── ManagerSidebar.tsx
│   │   ├── StaffRegisterModal.tsx
│   │   ├── ShiftAuditTable.tsx
│   │   └── ApprovalsGateway.tsx
│   └── owner/
│       ├── OwnerSidebar.tsx
│       ├── ManagerRegisterModal.tsx
│       ├── ExecutiveMetricCards.tsx
│       └── ProductAnalyticsGrid.tsx
├── store/
│   ├── useCartStore.ts (updated with Tax 10% PPN)
│   ├── useInventoryStore.ts (updated with Price Management & Audit Logs)
│   ├── useAuthStore.ts (updated with Manager & Owner Account Management)
│   └── useFreezerStore.ts (updated to 54 slots: 18x3)
```

---

### Task 1: Tax 10% (PPN) Calculation & Digital Receipt Update

**Files:**
- Modify: `src/store/useCartStore.ts`
- Modify: `src/components/cashier/orders/OrdersDrawerSection.tsx`
- Modify: `src/components/cashier/orders/DigitalReceiptModal.tsx`

- [ ] **Step 1: Update `useCartStore.ts` to include Tax 10% PPN calculation**

```typescript
// In src/store/useCartStore.ts
export const TAX_RATE = 0.10; // Tax 10% (PPN)

export interface CartTotals {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export function calculateCartTotals(items: { unitPrice: number; quantity: number }[]): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalAmount = subtotal + taxAmount;
  return { subtotal, taxAmount, totalAmount };
}
```

- [ ] **Step 2: Update `OrdersDrawerSection.tsx` & `DigitalReceiptModal.tsx` to render Tax 10% (PPN)**

Ensure the breakdown lines explicitly state:
- `Subtotal`
- `Tax 10% (PPN)`
- `Total Bill`

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

### Task 2: 54 Display Slots Update in `useFreezerStore.ts` & Kitchen Overview

**Files:**
- Modify: `src/store/useFreezerStore.ts`
- Modify: `src/components/kitchen/overview/OverviewSection.tsx`
- Modify: `src/components/kitchen/freezer/FreezerSection.tsx`

- [ ] **Step 1: Update freezer slot initialization to 54 slots (Freezer A 18 slots, Freezer B 18 slots, Freezer C 18 slots)**

```typescript
// Initializing 54 slots (18 per freezer)
const INITIAL_SLOTS = [
  ...Array.from({ length: 18 }, (_, i) => ({
    slotId: `A${(i + 1).toString().padStart(2, "0")}`,
    freezerId: "Freezer A",
    flavorId: `flv_${i + 1}`,
    flavorName: `Flavor A${i + 1}`,
    currentGrams: 3000,
    maxCapacityGrams: 3000,
    status: "FRESH" as const,
  })),
  ...Array.from({ length: 18 }, (_, i) => ({
    slotId: `B${(i + 1).toString().padStart(2, "0")}`,
    freezerId: "Freezer B",
    flavorId: `flv_${i + 19}`,
    flavorName: `Flavor B${i + 1}`,
    currentGrams: 3000,
    maxCapacityGrams: 3000,
    status: "FRESH" as const,
  })),
  ...Array.from({ length: 18 }, (_, i) => ({
    slotId: `C${(i + 1).toString().padStart(2, "0")}`,
    freezerId: "Freezer C",
    flavorId: `flv_${i + 37}`,
    flavorName: `Flavor C${i + 1}`,
    currentGrams: 2500,
    maxCapacityGrams: 2500,
    status: "FRESH" as const,
  })),
];
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

### Task 3: Admin Sub-System Components & Pages (6 Pages)

**Files:**
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/SeasonalEventToggle.tsx`
- Create: `src/components/admin/PriceUpdateModal.tsx`
- Create: `src/app/admin/overview/page.tsx`
- Create: `src/app/admin/flavors-catalog/page.tsx`
- Create: `src/app/admin/master-inventory/page.tsx`
- Create: `src/app/admin/vendors-suppliers/page.tsx`
- Create: `src/app/admin/showcase-layout/page.tsx`
- Create: `src/app/admin/system-config/page.tsx`

- [ ] **Step 1: Implement `AdminSidebar.tsx` with 6 navigation links**

Nav items: Overview, Flavors Catalog, Master Inventory, Vendors & Suppliers, Showcase Layout (54 Slots), System Config & Logs.

- [ ] **Step 2: Implement 6 Admin Pages using Epilogue design system and responsive grid layouts**

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

### Task 4: Manager Sub-System Components & Pages (5 Pages)

**Files:**
- Create: `src/components/manager/ManagerSidebar.tsx`
- Create: `src/components/manager/StaffRegisterModal.tsx`
- Create: `src/components/manager/ApprovalsGateway.tsx`
- Create: `src/app/manager/overview/page.tsx`
- Create: `src/app/manager/approvals/page.tsx`
- Create: `src/app/manager/staff-management/page.tsx`
- Create: `src/app/manager/shift-audit/page.tsx`
- Create: `src/app/manager/stock-audit/page.tsx`

- [ ] **Step 1: Implement `ManagerSidebar.tsx` with 5 navigation links**

Nav items: Overview, Approvals Hub, Staff Accounts, Shift Reconciliation, Stock Audit.

- [ ] **Step 2: Implement Manager Pages & Staff Registration Modal (`csh_`, `ktc_`, `inv_`)**

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`  
Expected: 0 errors

---

### Task 5: Owner Sub-System Components & Pages (4 Pages)

**Files:**
- Create: `src/components/owner/OwnerSidebar.tsx`
- Create: `src/components/owner/ManagerRegisterModal.tsx`
- Create: `src/components/owner/ExecutiveMetricCards.tsx`
- Create: `src/app/owner/overview/page.tsx`
- Create: `src/app/owner/product-analytics/page.tsx`
- Create: `src/app/owner/manager-accounts/page.tsx`
- Create: `src/app/owner/financial-reports/page.tsx`

- [ ] **Step 1: Implement `OwnerSidebar.tsx` with 4 navigation links**

Nav items: Executive Dashboard, Product Analytics, Manager Accounts, Financial Reports.

- [ ] **Step 2: Implement Owner Pages & Manager Account Registration Modal (`mgr_`)**

- [ ] **Step 3: Verify TypeScript compilation & ESLint**

Run: `npx tsc --noEmit && npm run lint`  
Expected: 0 errors and 0 warnings

---

## Plan Self-Review

1. **Spec Coverage:**
   - Tax 10% (PPN) calculation: Covered in Task 1.
   - 54 Showcase Slots (18x3): Covered in Task 2.
   - Admin Role (6 pages): Covered in Task 3.
   - Manager Role (5 pages & staff management): Covered in Task 4.
   - Owner Role (4 pages & manager accounts): Covered in Task 5.
   - Pricing Management: Covered in Task 3 (`PriceUpdateModal.tsx`).
2. **Placeholder Scan:** 0 placeholders found.
3. **Type Consistency:** Clean TypeScript interfaces across all components.
