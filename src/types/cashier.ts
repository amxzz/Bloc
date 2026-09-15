export type PackagingCategory = "Cup" | "Cono" | "Vaschetta";

export interface PackagingOption {
  id: string;
  category: PackagingCategory;
  name: string; // "Piccolo", "Medio", "Grande", "Bambino", "Classico", "Maestro", "Solo", "Coppia"
  maxScoops: number; // 1, 2, 3
  volumeMl?: number; // 350, 700 for Vaschetta
  price: number; // In IDR
  description: string;
}

export interface ToppingOption {
  id: string;
  name: string;
  price: number;
}

export interface SauceOption {
  id: string;
  name: string;
  price: number;
}

export interface CartItemFlavor {
  flavorId: string;
  flavorName: string;
  series: string;
  scoops?: number;
}

export interface CartItem {
  id: string;
  packaging: PackagingOption;
  selectedFlavors: CartItemFlavor[];
  selectedToppings: ToppingOption[];
  selectedSauces: SauceOption[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface HoldOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  member?: Member | null;
  createdAt: string;
}

export type PaymentMethod = "cash" | "qris" | "edc";

export type MemberTier = "Silver" | "Gold";

export interface Member {
  id: string;
  memberCode: string; // e.g. "MBR-8821"
  fullName: string;
  phoneNumber: string;
  tier: MemberTier; // "Silver" (5% off) | "Gold" (10% off)
  loyaltyPoints: number;
  totalSpent: number;
  pointsExpiryDate?: string; // 1-year expiration date
  birthdayMonth?: number; // 1-12
  registeredAt: string;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  cashierUsername: string;
  shiftId: string;
  items: CartItem[];
  subtotalAmount: number;
  discountAmount: number; // Member or voucher discount
  taxableBase: number; // Subtotal - Discount
  taxAmount: number; // taxableBase * 10%
  totalAmount: number; // taxableBase + taxAmount
  paymentMethod: PaymentMethod;
  cashTendered?: number;
  changeDue?: number;
  paymentStatus: "paid" | "void" | "refunded";
  memberId?: string;
  pointsEarned?: number;
  pointsRedeemed?: number;
  voidRefundReason?: string;
  approvedBy?: string;
  createdAt: string;
}

export type ShiftNumber = 1 | 2;

export interface CashierShift {
  id: string;
  shiftNumber: ShiftNumber;
  shiftName?: string;
  shiftDate: string;
  cashierUsername: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  initialCashFloat: number; // Modal Awal
  expectedClosingCash?: number;
  actualClosingCash?: number;
  discrepancyAmount?: number;
  totalSalesCash: number;
  totalSalesDigital: number;
  totalTransactions: number;
  status: "open" | "closed";
  notes?: string;
}
