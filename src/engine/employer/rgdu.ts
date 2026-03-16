import {
  SMIC_ANNUAL, SMIC_3X,
  RGDU_T_MIN, RGDU_P,
  RGDU_T_DELTA_SMALL, RGDU_T_DELTA_LARGE,
  RGDU_ATMP_MUTUALIZED_RATE,
} from "./constants";
import type { CompanySize } from "./types";
import type { RGDUResult, EmployerContributionLine } from "./types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function round4(value: number): number {
  return Math.round(value * 10_000) / 10_000;
}

interface RGDUContributions {
  maladie: number;
  vieillessePlafonnee: number;
  vieillesseDeplafonnee: number;
  allocationsFamiliales: number;
  atmpAmount: number;
  atmpBase: number;
  csa: number;
  fnal: number;
  chomage: number;
  agircArrcoT1: number;
  cegT1: number;
  cet: number;
}

export function computeRGDU(
  grossSalary: number,
  companySize: CompanySize,
  contributions: RGDUContributions,
): RGDUResult {
  if (grossSalary <= 0 || grossSalary >= SMIC_3X) {
    return { isEligible: false, coefficient: 0, amount: 0, eligibleContributions: 0 };
  }

  const tDelta = companySize === "50_plus" ? RGDU_T_DELTA_LARGE : RGDU_T_DELTA_SMALL;
  const tMax = RGDU_T_MIN + tDelta;

  const ratio = 0.5 * (3 * SMIC_ANNUAL / grossSalary - 1);

  let coefficient: number;
  if (ratio <= 0) {
    coefficient = 0;
  } else {
    coefficient = RGDU_T_MIN + tDelta * Math.pow(ratio, RGDU_P);
    coefficient = round4(coefficient);
    coefficient = Math.min(coefficient, tMax);
  }

  let amount = round2(grossSalary * coefficient);

  // Eligible contributions (RM-223): only mutualized portion of AT/MP
  const atmpMutualized = round2(contributions.atmpBase * RGDU_ATMP_MUTUALIZED_RATE);

  const eligibleContributions = round2(
    contributions.maladie
    + contributions.vieillessePlafonnee
    + contributions.vieillesseDeplafonnee
    + contributions.allocationsFamiliales
    + atmpMutualized
    + contributions.csa
    + contributions.fnal
    + contributions.chomage
    + contributions.agircArrcoT1
    + contributions.cegT1
    + contributions.cet,
  );

  // Cap RGDU to eligible contributions
  amount = Math.min(amount, eligibleContributions);

  return {
    isEligible: true,
    coefficient,
    amount,
    eligibleContributions,
  };
}
