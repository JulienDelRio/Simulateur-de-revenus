// PASS 2026 (Plafond Annuel de la Sécurité Sociale)
export const PASS = 48_060;
export const PASS_4 = PASS * 4;  // 192,240
export const PASS_8 = PASS * 8;  // 384,480

// Sécurité sociale — part salariale (RM-101, RM-102)
export const VIEILLESSE_PLAFONNEE_RATE = 0.069;   // sur min(brut, PASS)
export const VIEILLESSE_DEPLAFONNEE_RATE = 0.004;  // sur totalité

// Retraite complémentaire Agirc-Arrco — part salariale (RM-103 to RM-108)
export const RETRAITE_T1_RATE = 0.0315;  // sur min(brut, PASS)
export const RETRAITE_T2_RATE = 0.0864;  // sur max(0, min(brut, 8 PASS) - PASS)
export const CEG_T1_RATE = 0.0086;
export const CEG_T2_RATE = 0.0108;
export const CET_RATE = 0.0014;          // sur min(brut, 8 PASS)
export const APEC_RATE = 0.00024;        // cadres uniquement, sur min(brut, 4 PASS)

// CSG / CRDS (RM-109 to RM-112)
export const CSG_ABATTEMENT_RATE = 0.9825;  // 98.25% du brut (abattement 1.75%)
export const CSG_DEDUCTIBLE_RATE = 0.068;
export const CSG_NON_DEDUCTIBLE_RATE = 0.024;
export const CRDS_RATE = 0.005;

// Heures supplémentaires (RM-115, RM-116)
export const OVERTIME_RELIEF_RATE = 0.1131;     // réduction cotisations salariales
export const OVERTIME_IR_EXEMPTION_CAP = 7_500;  // plafond exonération IR (net)
