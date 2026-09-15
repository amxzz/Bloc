/**
 * Currency formatter for Indonesian Rupiah (e.g. IDR 35.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace("Rp", "IDR ");
}

/**
 * Format gram weights (e.g. 2350 -> "2.350 g")
 */
export function formatGrams(grams: number): string {
  return `${new Intl.NumberFormat("id-ID").format(grams)} g`;
}

/**
 * Calculate how many of the 6 segmented bars should be filled
 */
export function getSegmentedBarCount(currentGrams: number, maxCapacityGram: number): number {
  if (currentGrams <= 0 || maxCapacityGram <= 0) return 0;
  const ratio = currentGrams / maxCapacityGram;
  const filled = Math.round(ratio * 6);
  return Math.min(Math.max(filled, 0), 6);
}

/**
 * Date formatter helper
 */
export function formatFullDate(date: Date = new Date()): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Helper to get full YYYYMMDD date string (e.g., 20260903)
 */
export function getYYYYMMDD(date: Date = new Date()): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

const d = new Date();

/**
 * Generate standardized IDs:
 * - Receipt: RCP-20260903-001 (Sequential queue counter)
 * - Batch: BCH-20260903-001
 * - Purchase Order: PO-20260903-001
 */
export function generateStandardId(
  type: "RCP" | "BCH" | "PO" | "INV" | "DSP" | "HLD",
  sequence: number = Math.floor(1 + Math.random() * 99)
): string {
  const yyyymmdd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seqStr = String(sequence).padStart(3, "0");
  return `${type}-${yyyymmdd}-${seqStr}`;
}
