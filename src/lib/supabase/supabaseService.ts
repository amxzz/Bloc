import { supabase } from "./client";
import { UserProfile, UserRole } from "@/types/auth";
import { InventoryItem, StockMovement, PurchaseOrder } from "@/types/inventory";
import { GelatoFlavor, ShowcaseSlot, ProductionBatch, WasteLogEntry } from "@/types/kitchen";
import { Transaction, CashierShift, Member } from "@/types/cashier";
import { Supplier, RecipeItem } from "@/types/manager";

// Helper for data fetching with fallback to local mock state if Supabase credentials are missing
export const isSupabaseConfigured = (): boolean => {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://your-supabase-project.supabase.co"
  );
};

// --------------------------------------------------------------------
// PROFILES / AUTH
// --------------------------------------------------------------------
export async function fetchProfiles(): Promise<UserProfile[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }
  return data.map((p) => ({
    id: p.id,
    username: p.username,
    fullName: p.full_name,
    role: p.role as UserRole,
    pinCode: p.pin_code,
    isActive: p.is_active,
  }));
}

// --------------------------------------------------------------------
// FLAVORS & SHOWCASE
// --------------------------------------------------------------------
export async function fetchFlavors(): Promise<GelatoFlavor[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("gelato_flavors").select("*");
  if (error) {
    console.error("Error fetching flavors:", error);
    return [];
  }
  return data.map((f) => ({
    id: f.id,
    name: f.name,
    series: f.series,
    description: f.description || "",
    allergens: f.allergens || [],
    baseType: f.base_type,
    maxCapacityGram: f.max_capacity_gram,
    isBestSeller: f.is_best_seller,
    isSeasonal: f.is_seasonal,
    activeFrom: f.active_from,
    activeUntil: f.active_until,
  }));
}

export async function fetchShowcaseSlots(): Promise<ShowcaseSlot[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("showcase_slots")
    .select("*")
    .order("slot_number", { ascending: true });
  if (error) {
    console.error("Error fetching showcase slots:", error);
    return [];
  }
  return data.map((s) => ({
    id: s.id,
    freezerGroup: s.freezer_group,
    slotNumber: s.slot_number,
    flavorId: s.flavor_id,
    flavorName: s.flavor_name,
    series: s.series,
    baseType: s.base_type,
    maxCapacityGram: s.max_capacity_gram,
    currentGrams: s.current_grams,
    daysOpen: s.days_open,
    maxDaysAllowed: s.max_days_allowed,
    batchId: s.batch_id,
    producedDate: s.produced_date,
    openedDate: s.opened_date,
    status: s.status,
  }));
}

export async function updateShowcaseSlotInSupabase(slot: ShowcaseSlot): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase
    .from("showcase_slots")
    .update({
      flavor_id: slot.flavorId,
      flavor_name: slot.flavorName,
      series: slot.series,
      base_type: slot.baseType,
      current_grams: slot.currentGrams,
      days_open: slot.daysOpen,
      batch_id: slot.batchId,
      status: slot.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", slot.id);

  if (error) {
    console.error(`Error updating showcase slot ${slot.id}:`, error);
    return false;
  }
  return true;
}

// --------------------------------------------------------------------
// INVENTORY
// --------------------------------------------------------------------
export async function fetchInventoryItems(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from("inventory_items").select("*");
  if (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
  return data.map((item) => ({
    id: item.id,
    itemCode: item.item_code,
    itemName: item.item_name,
    category: item.category,
    currentStock: item.current_stock,
    unit: item.unit,
    minRestockThreshold: item.min_restock_threshold,
    costPerUnit: item.cost_per_unit,
    supplierName: item.supplier_name,
    updatedAt: item.updated_at,
  }));
}

// --------------------------------------------------------------------
// TRANSACTIONS / POS
// --------------------------------------------------------------------
export async function saveTransactionToSupabase(tx: Transaction): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const { error: txError } = await supabase.from("transactions").insert({
    id: tx.id,
    receipt_number: tx.receiptNumber,
    cashier_username: tx.cashierUsername,
    shift_id: tx.shiftId,
    subtotal_amount: tx.subtotalAmount,
    discount_amount: tx.discountAmount,
    taxable_base: tx.taxableBase,
    tax_amount: tx.taxAmount,
    total_amount: tx.totalAmount,
    payment_method: tx.paymentMethod,
    cash_tendered: tx.cashTendered,
    change_due: tx.changeDue,
    payment_status: tx.paymentStatus,
    member_id: tx.memberId,
    points_earned: tx.pointsEarned,
    points_redeemed: tx.pointsRedeemed,
    created_at: tx.createdAt,
  });

  if (txError) {
    console.error("Error saving transaction:", txError);
    return false;
  }

  // Insert line items
  if (tx.items && tx.items.length > 0) {
    const lineItems = tx.items.map((item) => ({
      transaction_id: tx.id,
      packaging_id: item.packaging.id,
      packaging_name: item.packaging.name,
      packaging_category: item.packaging.category,
      selected_flavors: item.selectedFlavors,
      selected_toppings: item.selectedToppings,
      selected_sauces: item.selectedSauces,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));

    const { error: itemsError } = await supabase.from("transaction_items").insert(lineItems);
    if (itemsError) console.error("Error saving transaction line items:", itemsError);
  }

  return true;
}
