import {
  TAX_BRACKETS,
  QF_CAP_PER_HALF_PART,
  QF_CAP_LONE_PARENT_FIRST,
  DECOTE_SINGLE_THRESHOLD,
  DECOTE_SINGLE_FIXED,
  DECOTE_COUPLE_THRESHOLD,
  DECOTE_COUPLE_FIXED,
  DECOTE_RATE,
  COLLECTION_THRESHOLD,
} from "./constants";
import type { BracketDetail } from "./types";

export function computeBracketTax(incomePerPart: number): {
  tax: number;
  details: BracketDetail[];
  marginalRate: number;
} {
  let tax = 0;
  let marginalRate = 0;
  const details: BracketDetail[] = [];

  for (const bracket of TAX_BRACKETS) {
    if (incomePerPart <= bracket.floor) {
      details.push({
        floor: bracket.floor,
        ceiling: bracket.ceiling,
        rate: bracket.rate,
        taxInBracket: 0,
      });
      continue;
    }

    const taxableInBracket =
      Math.min(incomePerPart, bracket.ceiling) - bracket.floor;
    const taxInBracket = taxableInBracket * bracket.rate;
    tax += taxInBracket;

    if (taxableInBracket > 0) {
      marginalRate = bracket.rate;
    }

    details.push({
      floor: bracket.floor,
      ceiling: bracket.ceiling,
      rate: bracket.rate,
      taxInBracket,
    });
  }

  return { tax, details, marginalRate };
}

export function applyQFCapping(
  taxWithQF: number,
  netTaxableIncome: number,
  parts: number,
  baseParts: number,
  isLoneParent: boolean,
): { cappedTax: number; isCapped: boolean } {
  const extraHalfParts = (parts - baseParts) * 2;

  if (extraHalfParts <= 0) {
    return { cappedTax: taxWithQF, isCapped: false };
  }

  const incomePerBasePart = netTaxableIncome / baseParts;
  const { tax: taxPerBasePart } = computeBracketTax(incomePerBasePart);
  const taxWithoutQF = taxPerBasePart * baseParts;

  const advantage = taxWithoutQF - taxWithQF;

  let cap: number;
  if (isLoneParent) {
    cap =
      QF_CAP_LONE_PARENT_FIRST +
      Math.max(0, extraHalfParts - 1) * QF_CAP_PER_HALF_PART;
  } else {
    cap = extraHalfParts * QF_CAP_PER_HALF_PART;
  }

  if (advantage > cap) {
    return { cappedTax: taxWithoutQF - cap, isCapped: true };
  }

  return { cappedTax: taxWithQF, isCapped: false };
}

export function computeDecote(
  grossTax: number,
  isCouple: boolean,
): number {
  const threshold = isCouple ? DECOTE_COUPLE_THRESHOLD : DECOTE_SINGLE_THRESHOLD;
  const fixed = isCouple ? DECOTE_COUPLE_FIXED : DECOTE_SINGLE_FIXED;

  if (grossTax > threshold) return 0;

  return Math.max(fixed - grossTax * DECOTE_RATE, 0);
}

export function applyThresholdAndRound(tax: number): number {
  const rounded = Math.floor(tax);
  return rounded < COLLECTION_THRESHOLD ? 0 : rounded;
}
