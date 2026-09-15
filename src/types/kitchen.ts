export type FreezerGroup = "A" | "B" | "C";

export type TubStatus = "NORMAL" | "LOW" | "CRITICAL" | "EMPTY" | "EXPIRED";

export type BaseType = "milk" | "dairy-free";

export interface GelatoFlavor {
  id: string;
  name: string;
  series: string; // "Milk", "Chocolate", "Peanut & Nuts", "Fruit", "Dairy-Free", "Dessert", "Tea", "Coffee", "Seasonal"
  description: string;
  allergens: string[];
  baseType: BaseType;
  maxCapacityGram: number; // 3000 for milk, 2500 for dairy-free
  isBestSeller?: boolean;
  isSeasonal?: boolean;
  activeFrom?: string; // e.g. "2026-06-01"
  activeUntil?: string; // e.g. "2026-09-30"
}

export interface ShowcaseSlot {
  id: string; // e.g. "A01", "A02", ..., "C18"
  freezerGroup: FreezerGroup;
  slotNumber: number; // 1 to 18
  flavorId?: string;
  flavorName?: string;
  series?: string;
  baseType: BaseType;
  maxCapacityGram: number; // 3000 or 2500
  currentGrams: number;
  daysOpen: number; // 0 to 8
  maxDaysAllowed: number; // 8 days strict shelf life
  batchId?: string;
  producedDate?: string;
  openedDate?: string;
  status: TubStatus;
}

export type ProductionStage = 
  | "balancing"
  | "pasteurizing"
  | "aging"
  | "churning"
  | "blast_freezer"
  | "tempering_ready"
  | "completed"
  | "cancelled";

export interface ProductionBatch {
  id: string; // e.g. "BATCH-20260907-001"
  flavorId: string;
  flavorName: string;
  series: string;
  baseType: BaseType;
  targetOutputLiter: number;
  actualOutputLiter: number;
  varianceOverrunPercent: number;
  totalTubsProduced: number;
  stage: ProductionStage;
  targetSlotId?: string; // e.g. "A04"
  fatContentPercent?: number; // Standard: 6%
  temperatureCelsius?: number; // Standard: 85, 4, -7, -35, -12
  stageDurationMinutes?: number; // Standard: 30, 240, 15, 45
  producedBy: string;
  expiryDate: string;
  createdAt: string;
  notes?: string;
}

export type WasteReason = 
  | "Expired" 
  | "Freezer Thawed" 
  | "Contaminated" 
  | "Texture Defect"
  | "Accidental Spill";

export interface WasteLogEntry {
  id: string;
  tubBatchId: string;
  slotId?: string;
  flavorName: string;
  estimatedWeightGram: number;
  reason: WasteReason;
  reportedBy: string;
  approvedByManager?: string; // Manager PIN authorization required
  status: "pending" | "approved" | "rejected";
  notes?: string;
  photoUrl?: string;
  createdAt: string;
}
