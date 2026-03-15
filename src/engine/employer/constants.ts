import { PASS, PASS_4, PASS_8 } from "../social/constants";

// Re-export shared constants
export { PASS, PASS_4, PASS_8 };

// SMIC 2026 (RM-200)
export const SMIC_ANNUAL = 21_876.40; // 12.02 € × 1820 h
export const SMIC_3X = SMIC_ANNUAL * 3; // 65,629.20 €

// Employer URSSAF rates (RM-201 to RM-209)
export const MALADIE_PATRONAL_RATE = 0.13;
export const VIEILLESSE_PLAFONNEE_PATRONAL_RATE = 0.0855;
export const VIEILLESSE_DEPLAFONNEE_PATRONAL_RATE = 0.0211;
export const ALLOCATIONS_FAMILIALES_RATE = 0.0525;
export const CSA_RATE = 0.003;
export const CHOMAGE_RATE = 0.04;
export const AGS_RATE = 0.0025;

// FNAL rates by company size (RM-207)
export const FNAL_RATE_SMALL = 0.001;  // < 50 employees, on tranche A
export const FNAL_RATE_LARGE = 0.005;  // >= 50 employees, on total

// Employer Agirc-Arrco rates (RM-210)
export const RETRAITE_T1_PATRONAL_RATE = 0.0472;
export const RETRAITE_T2_PATRONAL_RATE = 0.1295;
export const CEG_T1_PATRONAL_RATE = 0.0129;
export const CEG_T2_PATRONAL_RATE = 0.0162;
export const CET_PATRONAL_RATE = 0.0021;
export const APEC_PATRONAL_RATE = 0.00036;

// Complementary (RM-212 to RM-214)
export const TAXE_APPRENTISSAGE_RATE = 0.0068;
export const CFP_RATE_SMALL = 0.0055;  // < 11 employees
export const CFP_RATE_LARGE = 0.01;    // >= 11 employees

// Default adjustable rates
export const DEFAULT_ATMP_RATE = 0.0208;
export const DEFAULT_TRANSPORT_LEVY_RATE = 0.0295;
export const DEFAULT_PREVOYANCE_RATE = 0.015;

// RGDU parameters (RM-218 to RM-224)
export const RGDU_T_MIN = 0.02;
export const RGDU_P = 1.75;
export const RGDU_T_DELTA_SMALL = 0.3781;  // < 50 employees
export const RGDU_T_DELTA_LARGE = 0.3821;  // >= 50 employees
// RM-224: IRC portion of RGDU coefficient capped at 6.01%.
// Not computed in the simulator (only affects payroll reporting, not total RGDU amount).
export const RGDU_IRC_CAP = 0.0601;
export const RGDU_ATMP_MUTUALIZED_RATE = 0.0049; // fraction mutualisée AT/MP
