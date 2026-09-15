import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from "@/types/settings";
import { useAuditStore } from "./useAuditStore";

interface SettingsState {
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>, updatedBy: string) => void;
  resetToDefaults: (updatedBy: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SYSTEM_SETTINGS,

      updateSettings: (newSettings, updatedBy) => {
        const current = get().settings;
        const updated = { ...current, ...newSettings };
        set({ settings: updated });

        useAuditStore.getState().logAction(
          "SETTINGS_UPDATED",
          updatedBy,
          "manager",
          "System Settings",
          `Updated system parameters: Scoop Weight=${updated.defaultScoopWeightGrams}g, Tax=${updated.taxPercentage}%, PO Threshold=IDR ${updated.poOwnerApprovalThreshold.toLocaleString()}`
        );
      },

      resetToDefaults: (updatedBy) => {
        set({ settings: DEFAULT_SYSTEM_SETTINGS });
        useAuditStore.getState().logAction(
          "SETTINGS_UPDATED",
          updatedBy,
          "manager",
          "System Settings",
          "Reset system configuration to factory defaults."
        );
      },
    }),
    {
      name: "bloc-gelato-settings",
    }
  )
);
