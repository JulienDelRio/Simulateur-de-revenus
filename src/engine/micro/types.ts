export type ActivityType =
  | "bic_vente"
  | "bic_prestation"
  | "bnc_general"
  | "bnc_cipav";

export type AcreRegime = "50_pourcent" | "25_pourcent";

export interface MicroInput {
  turnover: number;
  activityType: ActivityType;
  isVersementLiberatoire: boolean;
  isAcre: boolean;
  acreRegime: AcreRegime;
}

export interface MicroContributionLine {
  label: string;
  base: number;
  rate: number;
  amount: number;
}

export interface MicroResult {
  turnover: number;
  activityType: ActivityType;
  socialContributions: MicroContributionLine;
  cfp: MicroContributionLine;
  taxeConsulaire: MicroContributionLine;
  totalSocialCharges: number;
  netBeforeTax: number;
  isAboveThreshold: boolean;
  threshold: number;
  microAbatement: number;
  taxableIncome: number;
}
