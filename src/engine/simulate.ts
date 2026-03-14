import type { TaxInput, TaxResult } from "./types";
import { computeDeduction, computeNetTaxableIncome } from "./deduction";
import { computeParts, getBaseParts } from "./parts";
import {
  computeBracketTax,
  applyQFCapping,
  computeDecote,
  applyThresholdAndRound,
} from "./tax";

export function simulate(input: TaxInput): TaxResult {
  // Step 1: Net taxable income
  const deductionDeclarant = computeDeduction(input.declarant);
  const netDeclarant = computeNetTaxableIncome(input.declarant);

  let deductionConjoint = 0;
  let netConjoint = 0;
  if (input.conjoint) {
    deductionConjoint = computeDeduction(input.conjoint);
    netConjoint = computeNetTaxableIncome(input.conjoint);
  }

  const totalDeduction = deductionDeclarant + deductionConjoint;
  const netTaxableIncome = netDeclarant + netConjoint;
  const grossIncome =
    input.declarant.grossIncome + (input.conjoint?.grossIncome ?? 0);

  // Step 2: Parts
  const parts = computeParts(
    input.familyStatus,
    input.isJointDeclaration,
    input.childrenCount,
    input.isLoneParent,
  );

  // Step 3: Bracket tax with QF
  const incomePerPart = netTaxableIncome / parts;
  const { tax: taxPerPart, details } = computeBracketTax(incomePerPart);
  const taxWithQF = taxPerPart * parts;

  // Step 4: QF capping
  const baseParts = getBaseParts(
    input.familyStatus,
    input.isJointDeclaration,
    input.childrenCount,
  );

  const { cappedTax, isCapped } = applyQFCapping(
    taxWithQF,
    netTaxableIncome,
    parts,
    baseParts,
    input.isLoneParent,
  );

  // Step 5: Decote
  const isCouple =
    input.familyStatus === "marie_pacse" && input.isJointDeclaration;
  const decote = computeDecote(cappedTax, isCouple);
  const taxAfterDecote = Math.max(cappedTax - decote, 0);

  // Step 6: Threshold and rounding
  const finalTax = applyThresholdAndRound(taxAfterDecote);

  // Step 7: Results
  // TMI: if capped, use base parts income; otherwise use actual income per part
  let marginalRate: number;
  if (isCapped) {
    const incomePerBasePart = netTaxableIncome / baseParts;
    ({ marginalRate } = computeBracketTax(incomePerBasePart));
  } else {
    ({ marginalRate } = computeBracketTax(incomePerPart));
  }

  const effectiveRate =
    netTaxableIncome > 0 ? (finalTax / netTaxableIncome) * 100 : 0;

  // Scale bracket details by parts for display
  const bracketDetails = details.map((d) => ({
    ...d,
    taxInBracket: d.taxInBracket * parts,
  }));

  return {
    grossIncome,
    deduction: totalDeduction,
    netTaxableIncome,
    parts,
    incomePerPart,
    grossTax: taxWithQF,
    isCapped,
    cappedTax,
    decote,
    finalTax,
    netAfterTax: grossIncome - finalTax,
    marginalRate,
    effectiveRate,
    bracketDetails,
  };
}
