// Tax brackets 2026 (income year 2025)
export const TAX_BRACKETS = [
  { floor: 0, ceiling: 11_600, rate: 0 },
  { floor: 11_600, ceiling: 29_579, rate: 0.11 },
  { floor: 29_579, ceiling: 84_577, rate: 0.30 },
  { floor: 84_577, ceiling: 181_917, rate: 0.41 },
  { floor: 181_917, ceiling: Infinity, rate: 0.45 },
] as const;

// Deduction constants (RM-001 to RM-003)
export const DEDUCTION_RATE = 0.10;
export const DEDUCTION_FLOOR = 509;
export const DEDUCTION_CEILING = 14_555;

// Family quotient capping (RM-012, RM-013)
export const QF_CAP_PER_HALF_PART = 1_807;
export const QF_CAP_LONE_PARENT_FIRST = 4_262;

// Decote thresholds (RM-014, RM-015)
export const DECOTE_SINGLE_THRESHOLD = 1_982;
export const DECOTE_SINGLE_FIXED = 897;
export const DECOTE_COUPLE_THRESHOLD = 3_277;
export const DECOTE_COUPLE_FIXED = 1_483;
export const DECOTE_RATE = 0.4525;

// Collection threshold (RM-017)
export const COLLECTION_THRESHOLD = 61;
