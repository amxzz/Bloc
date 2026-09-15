import { UserRole } from "./auth";

export type AuditActionType =
  | "TRANSACTION_CREATED"
  | "TRANSACTION_VOIDED"
  | "TRANSACTION_REFUNDED"
  | "SHIFT_OPENED"
  | "SHIFT_CLOSED"
  | "HOLD_ORDER_CREATED"
  | "HOLD_ORDER_RESUMED"
  | "HOLD_ORDER_DELETED"
  | "SHOWCASE_REFILL"
  | "SHOWCASE_REPLACE"
  | "SHOWCASE_DISPOSE"
  | "BATCH_STAGE_ADVANCED"
  | "BATCH_COMPLETED"
  | "BATCH_CANCELLED"
  | "PO_CREATED"
  | "PO_APPROVED_MANAGER"
  | "PO_APPROVED_OWNER"
  | "PO_REJECTED"
  | "PO_RECEIVED"
  | "STOCK_ADJUSTMENT"
  | "WASTE_REPORTED"
  | "WASTE_APPROVED"
  | "RECIPE_UPDATED"
  | "SUPPLIER_UPDATED"
  | "STAFF_UPDATED"
  | "SETTINGS_UPDATED";

export interface AuditLogEntry {
  id: string;
  actionType: AuditActionType;
  performedBy: string; // username or name
  role: UserRole;
  targetEntity: string; // e.g. "Receipt #RCP-001", "PO-260907-0001", "Slot A01"
  details: string;
  metadata?: Record<string, unknown>;
  timestamp: string; // formatted string or ISO
}
