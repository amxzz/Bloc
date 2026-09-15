-- ====================================================================
-- BLOC. GELATO ERP - PART 1: DATABASE SCHEMA STRUCTURE (DDL)
-- Target Architecture: 4 Roles (cashier, kitchen, manager, owner)
-- Date: 2026-09-14
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES & ROLES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('cashier', 'kitchen', 'manager', 'owner')),
    phone_number TEXT,
    pin_code TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    joined_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GELATO FLAVORS & MASTER BOM RECIPES
CREATE TABLE IF NOT EXISTS public.gelato_flavors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    series TEXT NOT NULL,
    description TEXT,
    allergens TEXT[] DEFAULT '{}',
    base_type TEXT NOT NULL CHECK (base_type IN ('milk', 'dairy-free')),
    max_capacity_gram NUMERIC DEFAULT 3000,
    is_best_seller BOOLEAN DEFAULT false,
    is_seasonal BOOLEAN DEFAULT false,
    active_from DATE,
    active_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipes (
    id TEXT PRIMARY KEY,
    flavor_id TEXT REFERENCES public.gelato_flavors(id) ON DELETE CASCADE,
    flavor_name TEXT NOT NULL,
    series TEXT NOT NULL,
    base_yield_liter NUMERIC DEFAULT 5.0,
    churning_time_minutes NUMERIC DEFAULT 15,
    target_overrun_percent NUMERIC DEFAULT 35.0,
    instructions TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id TEXT REFERENCES public.recipes(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    unit TEXT NOT NULL
);

-- 3. INVENTORY ITEMS & SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    category TEXT CHECK (category IN ('Packaging', 'Dairy', 'Flavor & Puree', 'Equipment')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id TEXT PRIMARY KEY,
    item_code TEXT UNIQUE NOT NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('packaging', 'raw_material', 'topping', 'sauce')),
    current_stock NUMERIC DEFAULT 0,
    unit TEXT NOT NULL CHECK (unit IN ('pcs', 'gram', 'liter', 'box', 'pack')),
    min_restock_threshold NUMERIC DEFAULT 0,
    cost_per_unit NUMERIC DEFAULT 0,
    supplier_name TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. KITCHEN PRODUCTION & 54 DISPLAY TUB SHOWCASE
CREATE TABLE IF NOT EXISTS public.showcase_slots (
    id TEXT PRIMARY KEY,
    freezer_group TEXT NOT NULL CHECK (freezer_group IN ('A', 'B', 'C')),
    slot_number INTEGER NOT NULL CHECK (slot_number BETWEEN 1 AND 18),
    flavor_id TEXT REFERENCES public.gelato_flavors(id) ON DELETE SET NULL,
    flavor_name TEXT,
    series TEXT,
    base_type TEXT CHECK (base_type IN ('milk', 'dairy-free')),
    max_capacity_gram NUMERIC DEFAULT 3000,
    current_grams NUMERIC DEFAULT 3000,
    days_open INTEGER DEFAULT 0,
    max_days_allowed INTEGER DEFAULT 8,
    batch_id TEXT,
    produced_date TIMESTAMPTZ,
    opened_date TIMESTAMPTZ,
    status TEXT DEFAULT 'NORMAL' CHECK (status IN ('NORMAL', 'LOW', 'CRITICAL', 'EMPTY', 'EXPIRED')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.production_batches (
    id TEXT PRIMARY KEY,
    flavor_id TEXT REFERENCES public.gelato_flavors(id) ON DELETE SET NULL,
    flavor_name TEXT NOT NULL,
    series TEXT NOT NULL,
    base_type TEXT NOT NULL,
    target_output_liter NUMERIC DEFAULT 5.0,
    actual_output_liter NUMERIC DEFAULT 5.0,
    variance_overrun_percent NUMERIC DEFAULT 35.0,
    total_tubs_produced INTEGER DEFAULT 1,
    stage TEXT DEFAULT 'completed',
    target_slot_id TEXT,
    fat_content_percent NUMERIC DEFAULT 6.0,
    temperature_celsius NUMERIC DEFAULT -12.0,
    stage_duration_minutes NUMERIC DEFAULT 45,
    produced_by TEXT NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.waste_logs (
    id TEXT PRIMARY KEY,
    tub_batch_id TEXT,
    slot_id TEXT,
    flavor_name TEXT NOT NULL,
    estimated_weight_gram NUMERIC DEFAULT 0,
    reason TEXT NOT NULL,
    reported_by TEXT NOT NULL,
    approved_by_manager TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    photo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PURCHASE ORDERS & STOCK MOVEMENTS
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id TEXT PRIMARY KEY,
    supplier_name TEXT NOT NULL,
    total_cost NUMERIC NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'draft',
    created_by TEXT NOT NULL,
    requires_owner_approval BOOLEAN DEFAULT false,
    approved_by_manager TEXT,
    approved_by_owner TEXT,
    rejected_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.po_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id TEXT REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit_cost NUMERIC NOT NULL,
    subtotal NUMERIC NOT NULL
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    item_id TEXT REFERENCES public.inventory_items(id) ON DELETE CASCADE,
    item_code TEXT NOT NULL,
    item_name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT NOT NULL,
    source_location TEXT,
    destination_location TEXT,
    reason TEXT,
    recorded_by TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CASHIER POS, MEMBERS, SHIFTS & TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.members (
    id TEXT PRIMARY KEY,
    member_code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    tier TEXT DEFAULT 'Silver' CHECK (tier IN ('Silver', 'Gold')),
    loyalty_points INTEGER DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    points_expiry_date TIMESTAMPTZ,
    birthday_month INTEGER,
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cashier_shifts (
    id TEXT PRIMARY KEY,
    shift_number INTEGER NOT NULL CHECK (shift_number IN (1, 2)),
    shift_name TEXT,
    shift_date DATE NOT NULL,
    cashier_username TEXT NOT NULL,
    cashier_name TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    initial_cash_float NUMERIC DEFAULT 300000,
    expected_closing_cash NUMERIC,
    actual_closing_cash NUMERIC,
    discrepancy_amount NUMERIC,
    total_sales_cash NUMERIC DEFAULT 0,
    total_sales_digital NUMERIC DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    receipt_number TEXT UNIQUE NOT NULL,
    cashier_username TEXT NOT NULL,
    shift_id TEXT REFERENCES public.cashier_shifts(id) ON DELETE SET NULL,
    subtotal_amount NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0,
    taxable_base NUMERIC NOT NULL,
    tax_amount NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris', 'edc')),
    cash_tendered NUMERIC,
    change_due NUMERIC,
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('paid', 'void', 'refunded')),
    member_id TEXT REFERENCES public.members(id) ON DELETE SET NULL,
    points_earned INTEGER DEFAULT 0,
    points_redeemed INTEGER DEFAULT 0,
    void_refund_reason TEXT,
    approved_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id TEXT REFERENCES public.transactions(id) ON DELETE CASCADE,
    packaging_id TEXT NOT NULL,
    packaging_name TEXT NOT NULL,
    packaging_category TEXT NOT NULL,
    selected_flavors JSONB DEFAULT '[]'::jsonb,
    selected_toppings JSONB DEFAULT '[]'::jsonb,
    selected_sauces JSONB DEFAULT '[]'::jsonb,
    quantity INTEGER DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action_type TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gelato_flavors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.showcase_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.po_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cashier_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles access" ON public.profiles;
CREATE POLICY "Profiles access" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Gelato flavors access" ON public.gelato_flavors;
CREATE POLICY "Gelato flavors access" ON public.gelato_flavors FOR ALL USING (true);

DROP POLICY IF EXISTS "Recipes access" ON public.recipes;
CREATE POLICY "Recipes access" ON public.recipes FOR ALL USING (true);

DROP POLICY IF EXISTS "Recipe ingredients access" ON public.recipe_ingredients;
CREATE POLICY "Recipe ingredients access" ON public.recipe_ingredients FOR ALL USING (true);

DROP POLICY IF EXISTS "Suppliers access" ON public.suppliers;
CREATE POLICY "Suppliers access" ON public.suppliers FOR ALL USING (true);

DROP POLICY IF EXISTS "Inventory items access" ON public.inventory_items;
CREATE POLICY "Inventory items access" ON public.inventory_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Showcase slots access" ON public.showcase_slots;
CREATE POLICY "Showcase slots access" ON public.showcase_slots FOR ALL USING (true);

DROP POLICY IF EXISTS "Production batches access" ON public.production_batches;
CREATE POLICY "Production batches access" ON public.production_batches FOR ALL USING (true);

DROP POLICY IF EXISTS "Waste logs access" ON public.waste_logs;
CREATE POLICY "Waste logs access" ON public.waste_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Purchase orders access" ON public.purchase_orders;
CREATE POLICY "Purchase orders access" ON public.purchase_orders FOR ALL USING (true);

DROP POLICY IF EXISTS "PO line items access" ON public.po_line_items;
CREATE POLICY "PO line items access" ON public.po_line_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Stock movements access" ON public.stock_movements;
CREATE POLICY "Stock movements access" ON public.stock_movements FOR ALL USING (true);

DROP POLICY IF EXISTS "Members access" ON public.members;
CREATE POLICY "Members access" ON public.members FOR ALL USING (true);

DROP POLICY IF EXISTS "Cashier shifts access" ON public.cashier_shifts;
CREATE POLICY "Cashier shifts access" ON public.cashier_shifts FOR ALL USING (true);

DROP POLICY IF EXISTS "Transactions access" ON public.transactions;
CREATE POLICY "Transactions access" ON public.transactions FOR ALL USING (true);

DROP POLICY IF EXISTS "Transaction items access" ON public.transaction_items;
CREATE POLICY "Transaction items access" ON public.transaction_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Audit logs access" ON public.audit_logs;
CREATE POLICY "Audit logs access" ON public.audit_logs FOR ALL USING (true);
