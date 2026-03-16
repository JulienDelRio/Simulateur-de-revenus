import type { MicroInput, MicroResult } from "./types";
import {
  CONTRIBUTION_RATES,
  CFP_RATES,
  CONSULAR_TAX_RATES,
  CA_THRESHOLDS,
  CCI_EXEMPTION_THRESHOLD,
  ABATEMENT_RATES,
  ABATEMENT_MINIMUM,
} from "./constants";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function simulateMicro(input: MicroInput): MicroResult {
  const { turnover, activityType, isAcre, acreRegime } = input;

  // Step 1: Threshold warning
  const threshold = CA_THRESHOLDS[activityType];
  const isAboveThreshold = turnover > threshold;

  // Step 2: Social contributions
  let socialRate = CONTRIBUTION_RATES[activityType];
  if (isAcre) {
    socialRate = acreRegime === "50_pourcent" ? socialRate * 0.5 : socialRate * 0.75;
  }
  const socialAmount = round2(turnover * socialRate);

  // Step 3: CFP
  const cfpRate = CFP_RATES[activityType];
  const cfpAmount = round2(turnover * cfpRate);

  // Step 4: Consular tax
  const consularRate = CONSULAR_TAX_RATES[activityType];
  let consularAmount = 0;
  if (consularRate > 0 && turnover > CCI_EXEMPTION_THRESHOLD) {
    consularAmount = round2(turnover * consularRate);
  }

  // Step 5: Totals
  const totalSocialCharges = round2(socialAmount + cfpAmount + consularAmount);
  const netBeforeTax = round2(turnover - totalSocialCharges);

  // Micro abatement for barème progressif
  const abatementRate = ABATEMENT_RATES[activityType];
  const rawAbatement = turnover * abatementRate;
  let microAbatement: number;
  if (rawAbatement < ABATEMENT_MINIMUM) {
    microAbatement = turnover < ABATEMENT_MINIMUM ? turnover : ABATEMENT_MINIMUM;
  } else {
    microAbatement = rawAbatement;
  }
  microAbatement = round2(microAbatement);
  const taxableIncome = round2(turnover - microAbatement);

  return {
    turnover,
    activityType,
    socialContributions: {
      label: "Cotisations sociales",
      base: turnover,
      rate: socialRate,
      amount: socialAmount,
    },
    cfp: {
      label: "CFP",
      base: turnover,
      rate: cfpRate,
      amount: cfpAmount,
    },
    taxeConsulaire: {
      label: "Taxe CCI",
      base: turnover,
      rate: consularRate,
      amount: consularAmount,
    },
    totalSocialCharges,
    netBeforeTax,
    isAboveThreshold,
    threshold,
    microAbatement,
    taxableIncome,
  };
}
