import { ShowcaseSlot, TubStatus } from "@/types/kitchen";
import { GELATO_FLAVORS } from "./gelatoData";

function calculateStatus(currentGrams: number, maxCapacity: number, daysOpen: number): TubStatus {
  if (currentGrams <= 0) return "EMPTY";
  if (daysOpen >= 8) return "EXPIRED";
  const percentage = (currentGrams / maxCapacity) * 100;
  if (percentage < 20) return "CRITICAL";
  if (percentage <= 50) return "LOW";
  return "NORMAL";
}

export const INITIAL_FREEZER_SLOTS: ShowcaseSlot[] = [];

// Freezer A (18 Slots: A01 to A18)
for (let i = 1; i <= 18; i++) {
  const slotId = `A${i.toString().padStart(2, "0")}`;
  const flavor = GELATO_FLAVORS[i - 1]; // First 18 flavors
  
  if (flavor) {
    let currentGrams = flavor.maxCapacityGram;
    let daysOpen = (i % 6) + 1;
    
    if (i === 1) { currentGrams = 2350; daysOpen = 2; }
    if (i === 2) { currentGrams = 200; daysOpen = 8; } // Expired & Low
    if (i === 3) { currentGrams = 2800; daysOpen = 1; }
    if (i === 4) { currentGrams = 0; daysOpen = 0; } // Empty
    if (i === 5) { currentGrams = 400; daysOpen = 4; } // Critical
    if (i === 6) { currentGrams = 1200; daysOpen = 3; } // Low

    const status = calculateStatus(currentGrams, flavor.maxCapacityGram, daysOpen);

    INITIAL_FREEZER_SLOTS.push({
      id: slotId,
      freezerGroup: "A",
      slotNumber: i,
      flavorId: currentGrams > 0 ? flavor.id : undefined,
      flavorName: currentGrams > 0 ? flavor.name : undefined,
      series: currentGrams > 0 ? flavor.series : undefined,
      baseType: flavor.baseType,
      maxCapacityGram: flavor.maxCapacityGram,
      currentGrams: currentGrams,
      daysOpen: daysOpen,
      maxDaysAllowed: 8,
      batchId: currentGrams > 0 ? `BCH-20260901-A${i.toString().padStart(2, "0")}` : undefined,
      producedDate: "2026-09-01",
      openedDate: "2026-09-01",
      status: status,
    });
  }
}

// Freezer B (18 Slots: B01 to B18)
for (let i = 1; i <= 18; i++) {
  const slotId = `B${i.toString().padStart(2, "0")}`;
  const flavor = GELATO_FLAVORS[18 + (i - 1)]; // Next 18 flavors
  
  if (flavor) {
    let currentGrams = flavor.maxCapacityGram;
    let daysOpen = (i % 6) + 1;
    if (i === 2) { currentGrams = 350; daysOpen = 5; } // Critical
    if (i === 8) { currentGrams = 0; daysOpen = 0; } // Empty

    const status = calculateStatus(currentGrams, flavor.maxCapacityGram, daysOpen);

    INITIAL_FREEZER_SLOTS.push({
      id: slotId,
      freezerGroup: "B",
      slotNumber: i,
      flavorId: currentGrams > 0 ? flavor.id : undefined,
      flavorName: currentGrams > 0 ? flavor.name : undefined,
      series: currentGrams > 0 ? flavor.series : undefined,
      baseType: flavor.baseType,
      maxCapacityGram: flavor.maxCapacityGram,
      currentGrams: currentGrams,
      daysOpen: daysOpen,
      maxDaysAllowed: 8,
      batchId: currentGrams > 0 ? `BCH-20260902-B${i.toString().padStart(2, "0")}` : undefined,
      producedDate: "2026-09-02",
      openedDate: "2026-09-02",
      status: status,
    });
  }
}

// Freezer C (18 Slots: C01 to C18)
for (let i = 1; i <= 18; i++) {
  const slotId = `C${i.toString().padStart(2, "0")}`;
  const flavor = GELATO_FLAVORS[36 + (i - 1)]; // Next 18 flavors
  
  if (flavor) {
    let currentGrams = flavor.maxCapacityGram;
    let daysOpen = (i % 5) + 1;
    if (i === 1) { currentGrams = 1850; daysOpen = 2; }
    if (i === 7) { currentGrams = 300; daysOpen = 4; } // Critical
    if (i === 12) { currentGrams = 0; daysOpen = 0; } // Empty

    const status = calculateStatus(currentGrams, flavor.maxCapacityGram, daysOpen);

    INITIAL_FREEZER_SLOTS.push({
      id: slotId,
      freezerGroup: "C",
      slotNumber: i,
      flavorId: currentGrams > 0 ? flavor.id : undefined,
      flavorName: currentGrams > 0 ? flavor.name : undefined,
      series: currentGrams > 0 ? flavor.series : undefined,
      baseType: flavor.baseType,
      maxCapacityGram: flavor.maxCapacityGram,
      currentGrams: currentGrams,
      daysOpen: daysOpen,
      maxDaysAllowed: 8,
      batchId: currentGrams > 0 ? `BCH-20260903-C${i.toString().padStart(2, "0")}` : undefined,
      producedDate: "2026-09-03",
      openedDate: "2026-09-03",
      status: status,
    });
  }
}
