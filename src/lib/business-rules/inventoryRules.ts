import { ShowcaseSlot, GelatoFlavor } from "@/types/kitchen";
import { CartItem } from "@/types/cashier";
import { RecipeItem } from "@/types/manager";
import { InventoryItem } from "@/types/inventory";

export interface FlavorValidationResult {
  isValid: boolean;
  errorCode?: "EMPTY_TUB" | "EXPIRED_TUB" | "INACTIVE_SEASONAL" | "INSUFFICIENT_STOCK" | "UNAVAILABLE";
  errorMessage?: string;
  availableGrams: number;
}

export interface TubDeductionEntry {
  slotId: string;
  flavorId: string;
  flavorName: string;
  currentGrams: number;
  deductedGrams: number;
  newGrams: number;
}

export interface IngredientRequirement {
  itemId: string;
  itemName: string;
  requiredQuantity: number;
  currentStock: number;
  unit: string;
  isSufficient: boolean;
}

/**
 * Centralized business logic for inventory checks, tub shelf life (8 days),
 * seasonal availability dates, atomic multi-flavor deduction calculations,
 * and kitchen batch production ingredient validation.
 */
export class InventoryRules {
  public static readonly MAX_SHELF_LIFE_DAYS = 8;

  /**
   * Validates if a showcase slot can fulfill the requested scoops.
   */
  public static validateFlavorAvailability(
    slot: ShowcaseSlot,
    requiredScoops: number,
    scoopWeightGrams: number,
    flavorMeta?: GelatoFlavor,
    currentDateStr: string = new Date().toISOString().split("T")[0]
  ): FlavorValidationResult {
    // 1. Check if tub is marked empty or 0g
    if (slot.status === "EMPTY" || slot.currentGrams <= 0) {
      return {
        isValid: false,
        errorCode: "EMPTY_TUB",
        errorMessage: `Tub for ${slot.flavorName || slot.id} is completely empty.`,
        availableGrams: slot.currentGrams,
      };
    }

    // 2. Check 8-day shelf life expiry
    if (slot.daysOpen >= this.MAX_SHELF_LIFE_DAYS || slot.status === "EXPIRED") {
      return {
        isValid: false,
        errorCode: "EXPIRED_TUB",
        errorMessage: `Tub ${slot.id} has exceeded the 8-day shelf life (${slot.daysOpen} days open). Must be wasted.`,
        availableGrams: slot.currentGrams,
      };
    }

    // 3. Check seasonal date range if flavor is marked seasonal
    if (flavorMeta?.isSeasonal) {
      if (flavorMeta.activeFrom && currentDateStr < flavorMeta.activeFrom) {
        return {
          isValid: false,
          errorCode: "INACTIVE_SEASONAL",
          errorMessage: `Seasonal flavor ${flavorMeta.name} is not active yet (Starts ${flavorMeta.activeFrom}).`,
          availableGrams: slot.currentGrams,
        };
      }
      if (flavorMeta.activeUntil && currentDateStr > flavorMeta.activeUntil) {
        return {
          isValid: false,
          errorCode: "INACTIVE_SEASONAL",
          errorMessage: `Seasonal flavor ${flavorMeta.name} has ended its season (Ended ${flavorMeta.activeUntil}).`,
          availableGrams: slot.currentGrams,
        };
      }
    }

    // 4. Check sufficient grams for requested scoops
    const requiredGrams = requiredScoops * scoopWeightGrams;
    if (slot.currentGrams < requiredGrams) {
      return {
        isValid: false,
        errorCode: "INSUFFICIENT_STOCK",
        errorMessage: `Insufficient stock in ${slot.flavorName} (${slot.currentGrams}g remaining vs ${requiredGrams}g needed).`,
        availableGrams: slot.currentGrams,
      };
    }

    return {
      isValid: true,
      availableGrams: slot.currentGrams,
    };
  }

  /**
   * Calculates independent stock deductions per flavor tub across all cart items.
   * Multiple flavors in one cup (e.g. 1 Chocolate scoop + 1 Pistachio scoop)
   * deduct independent scoop weight from their respective showcase slots.
   */
  public static calculateMultiFlavorDeductions(
    items: CartItem[],
    slots: ShowcaseSlot[],
    scoopWeightGrams: number
  ): {
    deductions: TubDeductionEntry[];
    isValid: boolean;
    errorSlotId?: string;
    errorMessage?: string;
  } {
    const deductionsMap = new Map<string, number>();

    // Accumulate required grams per slot
    for (const item of items) {
      for (const flavor of item.selectedFlavors) {
        const matchingSlot = slots.find(
          (s) =>
            (s.flavorId === flavor.flavorId ||
              s.id === flavor.flavorId ||
              (s.flavorName &&
                flavor.flavorName &&
                s.flavorName.trim().toLowerCase() === flavor.flavorName.trim().toLowerCase())) &&
            s.status !== "EMPTY" &&
            s.currentGrams > 0
        );
        if (!matchingSlot) {
          return {
            deductions: [],
            isValid: false,
            errorMessage: `Active showcase tub for flavor "${flavor.flavorName}" could not be found or is empty.`,
          };
        }

        const scoops = (flavor.scoops || 1) * item.quantity;
        const totalGramsNeeded = scoops * scoopWeightGrams;
        const currentSum = deductionsMap.get(matchingSlot.id) || 0;
        deductionsMap.set(matchingSlot.id, currentSum + totalGramsNeeded);
      }
    }

    // Validate that no tub goes below 0g
    const deductionEntries: TubDeductionEntry[] = [];
    for (const [slotId, deductedGrams] of deductionsMap.entries()) {
      const slot = slots.find((s) => s.id === slotId);
      if (!slot) continue;

      if (slot.currentGrams < deductedGrams) {
        return {
          deductions: [],
          isValid: false,
          errorSlotId: slot.id,
          errorMessage: `Stock in Slot ${slot.id} (${slot.flavorName}) is insufficient: ${slot.currentGrams}g available vs ${deductedGrams}g requested.`,
        };
      }

      deductionEntries.push({
        slotId: slot.id,
        flavorId: slot.flavorId || "",
        flavorName: slot.flavorName || "",
        currentGrams: slot.currentGrams,
        deductedGrams,
        newGrams: Math.max(0, slot.currentGrams - deductedGrams),
      });
    }

    return {
      deductions: deductionEntries,
      isValid: true,
    };
  }

  /**
   * Validates raw material ingredient availability for Kitchen Batch Production.
   */
  public static validateProductionIngredients(
    recipe: RecipeItem,
    batchQuantity: number,
    inventoryItems: InventoryItem[]
  ): {
    requirements: IngredientRequirement[];
    canProduce: boolean;
    missingIngredients: string[];
  } {
    const requirements: IngredientRequirement[] = [];
    const missingIngredients: string[] = [];

    for (const ing of recipe.ingredients) {
      const item = inventoryItems.find((inv) => inv.id === ing.itemId || inv.itemCode === ing.itemId);
      const requiredQty = ing.amount * batchQuantity;
      const currentStock = item ? item.currentStock : 0;
      const isSufficient = currentStock >= requiredQty;

      if (!isSufficient) {
        missingIngredients.push(`${ing.itemName} (Need: ${requiredQty} ${ing.unit}, Stock: ${currentStock} ${ing.unit})`);
      }

      requirements.push({
        itemId: ing.itemId,
        itemName: ing.itemName,
        requiredQuantity: requiredQty,
        currentStock,
        unit: ing.unit,
        isSufficient,
      });
    }

    return {
      requirements,
      canProduce: missingIngredients.length === 0,
      missingIngredients,
    };
  }
}
