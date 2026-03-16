import type { ActivityType } from "./types";

export const CONTRIBUTION_RATES: Record<ActivityType, number> = {
  bic_vente: 0.123,
  bic_prestation: 0.212,
  bnc_general: 0.256,
  bnc_cipav: 0.232,
};

export const VL_RATES: Record<ActivityType, number> = {
  bic_vente: 0.01,
  bic_prestation: 0.017,
  bnc_general: 0.022,
  bnc_cipav: 0.022,
};

export const ABATEMENT_RATES: Record<ActivityType, number> = {
  bic_vente: 0.71,
  bic_prestation: 0.5,
  bnc_general: 0.34,
  bnc_cipav: 0.34,
};

export const CFP_RATES: Record<ActivityType, number> = {
  bic_vente: 0.001,
  bic_prestation: 0.003,
  bnc_general: 0.002,
  bnc_cipav: 0.002,
};

export const CONSULAR_TAX_RATES: Record<ActivityType, number> = {
  bic_vente: 0.00015,
  bic_prestation: 0.00044,
  bnc_general: 0,
  bnc_cipav: 0,
};

export const CA_THRESHOLDS: Record<ActivityType, number> = {
  bic_vente: 203_100,
  bic_prestation: 83_600,
  bnc_general: 83_600,
  bnc_cipav: 83_600,
};

export const CCI_EXEMPTION_THRESHOLD = 5_000;
export const ABATEMENT_MINIMUM = 305;
