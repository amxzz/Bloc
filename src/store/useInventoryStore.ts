import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InventoryItem, PurchaseOrder, StockMovement, POLineItem, MovementType } from "@/types/inventory";
import { Supplier } from "@/types/manager";
import { generateStandardId } from "@/lib/utils/formatters";
import { useSettingsStore } from "./useSettingsStore";
import { useAuditStore } from "./useAuditStore";

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-01",
    code: "SUP-PKG-01",
    name: "PT Kemasan Prima Nusantara",
    contactPerson: "Bpk. Rahmat Santoso",
    phone: "081122334455",
    email: "sales@kemasanprima.co.id",
    address: "Kawasan Industri Pulo Gadung, Jakarta Timur",
    category: "Packaging",
    isActive: true,
  },
  {
    id: "sup-02",
    code: "SUP-DRY-01",
    name: "Greenfields Indonesia",
    contactPerson: "Ibu Maya Devina",
    phone: "081299887766",
    email: "order@greenfields.co.id",
    address: "Malang, Jawa Timur",
    category: "Dairy",
    isActive: true,
  },
  {
    id: "sup-03",
    code: "SUP-FLV-01",
    name: "CV Bahan Baku Utama & Puree",
    contactPerson: "Bpk. Edwin Hartono",
    phone: "081377665544",
    email: "edwin@bahanbaku.com",
    address: "Surabaya, Jawa Timur",
    category: "Flavor & Puree",
    isActive: true,
  },
];

interface InventoryState {
  items: InventoryItem[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  movements: StockMovement[];

  addSupplier: (supplier: Supplier) => void;
  adjustStock: (itemId: string, newQuantity: number, reason: string, staffName: string) => void;
  createPurchaseOrder: (supplierName: string, items: POLineItem[], notes?: string, staffName?: string) => PurchaseOrder;
  approvePurchaseOrderByManager: (poId: string, managerName: string) => { success: boolean; message: string };
  approvePurchaseOrderByOwner: (poId: string, ownerName: string) => { success: boolean; message: string };
  rejectPurchaseOrder: (poId: string, reason: string, rejectedBy: string) => void;
  receivePurchaseOrder: (poId: string, receivedBy: string) => void;
  transferToKitchen: (itemId: string, quantity: number, staffName: string, notes?: string) => void;
  recordMovement: (itemId: string, quantity: number, type: MovementType, from: string, to: string, reason: string, staffName: string) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      suppliers: INITIAL_SUPPLIERS,
      items: [
        {
          id: "item-01",
          itemCode: "PKG-CUP-MED",
          itemName: "Cup Medio (Double Scoop)",
          category: "packaging",
          currentStock: 450,
          unit: "pcs",
          minRestockThreshold: 100,
          costPerUnit: 1200,
          supplierName: "PT Kemasan Prima Nusantara",
          updatedAt: "2026-09-07 10:00",
        },
        {
          id: "item-02",
          itemCode: "PKG-CUP-PIC",
          itemName: "Cup Piccolo (Single Scoop)",
          category: "packaging",
          currentStock: 80,
          unit: "pcs",
          minRestockThreshold: 100,
          costPerUnit: 900,
          supplierName: "PT Kemasan Prima Nusantara",
          updatedAt: "2026-09-07 10:00",
        },
        {
          id: "item-03",
          itemCode: "RAW-MILK-01",
          itemName: "Fresh Pasteurized Whole Milk",
          category: "raw_material",
          currentStock: 120,
          unit: "liter",
          minRestockThreshold: 30,
          costPerUnit: 18000,
          supplierName: "Greenfields Indonesia",
          updatedAt: "2026-09-07 11:30",
        },
        {
          id: "item-04",
          itemCode: "TOP-ALMOND-01",
          itemName: "Roasted Almond Flakes",
          category: "topping",
          currentStock: 5000,
          unit: "gram",
          minRestockThreshold: 1000,
          costPerUnit: 35,
          supplierName: "CV Bahan Baku Utama",
          updatedAt: "2026-09-07 14:00",
        },
      ],
      purchaseOrders: [
        {
          id: "PO-260907-0001",
          supplierName: "PT Kemasan Prima Nusantara",
          items: [
            {
              itemId: "item-02",
              itemCode: "PKG-CUP-PIC",
              itemName: "Cup Piccolo (Single Scoop)",
              quantity: 1000,
              unitCost: 900,
              subtotal: 900000,
            },
          ],
          totalCost: 900000,
          status: "pending_manager_approval",
          requiresOwnerApproval: false,
          createdBy: "ktc_budi",
          notes: "Restock single scoop cup packaging.",
          createdAt: "2026-09-07 09:15",
        },
        {
          id: "PO-260907-0002",
          supplierName: "Greenfields Indonesia & Puree Global",
          items: [
            {
              itemId: "item-03",
              itemCode: "RAW-MILK-01",
              itemName: "Fresh Pasteurized Whole Milk (Bulk)",
              quantity: 500,
              unitCost: 18000,
              subtotal: 9000000,
            },
            {
              itemId: "item-04",
              itemCode: "TOP-ALMOND-01",
              itemName: "Roasted Almond Flakes & Pistachio Paste",
              quantity: 80000,
              unitCost: 45,
              subtotal: 3600000,
            },
          ],
          totalCost: 12600000,
          status: "pending_owner_approval",
          requiresOwnerApproval: true,
          createdBy: "ktc_budi",
          notes: "Monthly bulk raw material supply. Exceeds IDR 10,000,000 limit.",
          createdAt: "2026-09-07 10:30",
        },
      ],
      movements: [
        {
          id: "mov-01",
          itemId: "item-03",
          itemCode: "RAW-MILK-01",
          itemName: "Fresh Pasteurized Whole Milk",
          type: "transfer_to_kitchen",
          quantity: 25,
          unit: "liter",
          sourceLocation: "Main Warehouse",
          destinationLocation: "Kitchen Lab",
          reason: "Batch production morning requirement.",
          recordedBy: "ktc_budi",
          timestamp: "2026-09-07 08:30",
        },
      ],

      adjustStock: (itemId, newQuantity, reason, staffName) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        const diff = newQuantity - item.currentStock;
        get().recordMovement(
          item.id,
          Math.abs(diff),
          "stock_opname_adjustment",
          "Warehouse",
          "Warehouse",
          `${reason} (By: ${staffName})`,
          staffName
        );

        set((state) => ({
          items: state.items.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  currentStock: newQuantity,
                  updatedAt: new Date().toLocaleString("id-ID"),
                }
              : it
          ),
        }));

        useAuditStore.getState().logAction(
          "STOCK_ADJUSTMENT",
          staffName,
          "kitchen",
          item.itemName,
          `Stock adjusted from ${item.currentStock} to ${newQuantity} ${item.unit}. Reason: ${reason}`
        );
      },

      createPurchaseOrder: (supplierName, items, notes, staffName = "ktc_budi") => {
        const total = items.reduce((sum, item) => sum + item.subtotal, 0);
        const { poOwnerApprovalThreshold } = useSettingsStore.getState().settings;
        const threshold = poOwnerApprovalThreshold || 10000000;
        const requiresOwner = total > threshold;

        const newPO: PurchaseOrder = {
          id: generateStandardId("PO"),
          supplierName,
          items,
          totalCost: total,
          status: requiresOwner ? "pending_owner_approval" : "pending_manager_approval",
          requiresOwnerApproval: requiresOwner,
          createdBy: staffName,
          notes,
          createdAt: new Date().toLocaleString("id-ID"),
        };

        set((state) => ({ purchaseOrders: [newPO, ...state.purchaseOrders] }));

        useAuditStore.getState().logAction(
          "PO_CREATED",
          staffName,
          "kitchen",
          newPO.id,
          `Created PO ${newPO.id} to ${supplierName} (IDR ${total.toLocaleString()}). Requires: ${requiresOwner ? "Owner Approval (>10M)" : "Manager Approval"}.`
        );

        return newPO;
      },

      approvePurchaseOrderByManager: (poId, managerName) => {
        const po = get().purchaseOrders.find((p) => p.id === poId);
        if (!po) return { success: false, message: "Purchase Order not found." };

        if (po.requiresOwnerApproval) {
          return {
            success: false,
            message: `PO ${poId} bernilai di atas IDR 10.000.000 (Total: IDR ${po.totalCost.toLocaleString()}) dan wajib disetujui langsung oleh Owner.`,
          };
        }

        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((p) =>
            p.id === poId
              ? { ...p, status: "approved", approvedByManager: managerName }
              : p
          ),
        }));

        useAuditStore.getState().logAction(
          "PO_APPROVED_MANAGER",
          managerName,
          "manager",
          poId,
          `Manager @${managerName} approved PO ${poId} (IDR ${po.totalCost.toLocaleString()}).`
        );

        return { success: true, message: `PO ${poId} berhasil disetujui oleh Manager.` };
      },

      approvePurchaseOrderByOwner: (poId, ownerName) => {
        const po = get().purchaseOrders.find((p) => p.id === poId);
        if (!po) return { success: false, message: "Purchase Order not found." };

        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((p) =>
            p.id === poId
              ? { ...p, status: "approved", approvedByOwner: ownerName }
              : p
          ),
        }));

        useAuditStore.getState().logAction(
          "PO_APPROVED_OWNER",
          ownerName,
          "owner",
          poId,
          `Owner @${ownerName} authorized and approved high-value PO ${poId} (IDR ${po.totalCost.toLocaleString()}).`
        );

        return { success: true, message: `PO ${poId} berhasil disetujui dan disahkan oleh Owner.` };
      },

      rejectPurchaseOrder: (poId, reason, rejectedBy) => {
        const po = get().purchaseOrders.find((p) => p.id === poId);
        if (!po) return;

        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((p) =>
            p.id === poId
              ? { ...p, status: "rejected", rejectedReason: reason }
              : p
          ),
        }));

        useAuditStore.getState().logAction(
          "PO_REJECTED",
          rejectedBy,
          "manager",
          poId,
          `Rejected PO ${poId}. Reason: ${reason}`
        );
      },

      addSupplier: (supplier) => {
        set((state) => ({
          suppliers: [supplier, ...state.suppliers],
        }));
      },

      receivePurchaseOrder: (poId, receivedBy) => {
        const po = get().purchaseOrders.find((p) => p.id === poId);
        if (!po) return;

        set((state) => ({
          purchaseOrders: state.purchaseOrders.map((p) =>
            p.id === poId
              ? {
                  ...p,
                  status: "received",
                  receivedAt: new Date().toLocaleString("id-ID"),
                  notes: `${p.notes || ""} (Received by: ${receivedBy})`,
                }
              : p
          ),
          items: state.items.map((item) => {
            const matchedPOLine = po.items.find((line) => line.itemId === item.id);
            if (matchedPOLine) {
              return {
                ...item,
                currentStock: item.currentStock + matchedPOLine.quantity,
                updatedAt: new Date().toLocaleString("id-ID"),
              };
            }
            return item;
          }),
        }));

        // Record stock movements for incoming delivery
        po.items.forEach((line) => {
          get().recordMovement(
            line.itemId,
            line.quantity,
            "incoming_po",
            po.supplierName,
            "Main Warehouse",
            `PO Delivery ${po.id}`,
            receivedBy
          );
        });

        useAuditStore.getState().logAction(
          "PO_RECEIVED",
          receivedBy,
          "kitchen",
          poId,
          `Received delivery for PO ${poId}. Stock levels and stock movements updated automatically.`
        );
      },

      transferToKitchen: (itemId, quantity, staffName, notes) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item || item.currentStock < quantity) return;

        get().recordMovement(
          itemId,
          quantity,
          "transfer_to_kitchen",
          "Main Warehouse",
          "Kitchen Lab",
          notes || "Raw material transfer for kitchen batch production.",
          staffName
        );

        set((state) => ({
          items: state.items.map((it) =>
            it.id === itemId
              ? {
                  ...it,
                  currentStock: it.currentStock - quantity,
                  updatedAt: new Date().toLocaleString("id-ID"),
                }
              : it
          ),
        }));
      },

      recordMovement: (itemId, quantity, type, from, to, reason, staffName) => {
        const item = get().items.find((i) => i.id === itemId);
        if (!item) return;

        const newMov: StockMovement = {
          id: `mov-${Date.now()}`,
          itemId,
          itemCode: item.itemCode,
          itemName: item.itemName,
          type,
          quantity,
          unit: item.unit,
          sourceLocation: from,
          destinationLocation: to,
          reason,
          recordedBy: staffName,
          timestamp: new Date().toLocaleString("id-ID"),
        };

        set((state) => ({
          movements: [newMov, ...state.movements],
        }));
      },
    }),
    {
      name: "bloc-gelato-inventory",
    }
  )
);
