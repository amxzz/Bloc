export type ItemCategory = "packaging" | "raw_material" | "topping" | "sauce";

export interface InventoryItem {
  id: string;
  itemCode: string; // e.g. "PKG-CUP-MED", "RAW-MILK-01"
  itemName: string;
  category: ItemCategory;
  currentStock: number;
  unit: "pcs" | "gram" | "liter" | "box" | "pack";
  minRestockThreshold: number;
  costPerUnit: number;
  supplierName?: string;
  updatedAt: string;
}

export type POStatus = 
  | "draft" 
  | "pending_manager_approval"
  | "pending_owner_approval"
  | "approved" 
  | "ordered"
  | "received" 
  | "rejected" 
  | "cancelled";

export interface POLineItem {
  itemId: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface PurchaseOrder {
  id: string; // e.g. "PO-260907-0001"
  supplierName: string;
  items: POLineItem[];
  totalCost: number;
  status: POStatus;
  createdBy: string;
  requiresOwnerApproval: boolean; // True if totalCost > 10,000,000 IDR
  approvedByManager?: string;
  approvedByOwner?: string;
  rejectedReason?: string;
  notes?: string;
  createdAt: string;
  receivedAt?: string;
}

export type MovementType = 
  | "transfer_to_kitchen" 
  | "stock_opname_adjustment" 
  | "waste_damage"
  | "incoming_po";

export interface StockMovement {
  id: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  type: MovementType;
  quantity: number;
  unit: string;
  sourceLocation: string;
  destinationLocation: string;
  reason: string;
  recordedBy: string;
  timestamp: string;
}
