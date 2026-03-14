import { simulate } from "./simulate";
import { simulateSocial } from "./social";
import type { SocialInput, SocialResult } from "./social";
import type { FamilyStatus, DeductionMode, TaxResult } from "./types";

export interface MemberSocialInput extends SocialInput {
  deductionMode: DeductionMode;
  realExpenses: number;
}

export interface CombinedInput {
  declarant: MemberSocialInput;
  conjoint: MemberSocialInput | null;
  familyStatus: FamilyStatus;
  isJointDeclaration: boolean;
  childrenCount: number;
  isLoneParent: boolean;
}

export interface CombinedResult {
  social: SocialResult;
  socialConjoint: SocialResult | null;
  tax: TaxResult;
  grossSalaryTotal: number;
  totalContributions: number;
  totalMutuelle: number;
  netBeforeIR: number;
  netAfterAll: number;
  monthlyNetBeforeIR: number;
  monthlyNetAfterAll: number;
}

export function simulateCombined(input: CombinedInput): CombinedResult {
  // Step 1: Social contributions for declarant
  const social = simulateSocial(input.declarant);

  // Step 2: Social contributions for conjoint (if separate incomes)
  const socialConjoint = input.conjoint ? simulateSocial(input.conjoint) : null;

  // Step 3: Feed netTaxable into IR engine as grossIncome
  const tax = simulate({
    declarant: {
      grossIncome: social.netTaxable,
      deductionMode: input.declarant.deductionMode,
      realExpenses: input.declarant.realExpenses,
    },
    conjoint: socialConjoint
      ? {
          grossIncome: socialConjoint.netTaxable,
          deductionMode: input.conjoint!.deductionMode,
          realExpenses: input.conjoint!.realExpenses,
        }
      : null,
    familyStatus: input.familyStatus,
    isJointDeclaration: input.isJointDeclaration,
    childrenCount: input.childrenCount,
    isLoneParent: input.isLoneParent,
  });

  // Step 4: Aggregate results
  const grossSalaryTotal = social.grossSalary + (socialConjoint?.grossSalary ?? 0);
  const totalContributions = social.totalContributions
    - social.overtimeRelief
    + (socialConjoint ? socialConjoint.totalContributions - socialConjoint.overtimeRelief : 0);
  const totalMutuelle = social.mutuelleAnnual + (socialConjoint?.mutuelleAnnual ?? 0);
  const netBeforeIR = social.netBeforeIR + (socialConjoint?.netBeforeIR ?? 0);
  const netAfterAll = netBeforeIR - tax.finalTax;

  return {
    social,
    socialConjoint,
    tax,
    grossSalaryTotal,
    totalContributions,
    totalMutuelle,
    netBeforeIR,
    netAfterAll,
    monthlyNetBeforeIR: Math.round((netBeforeIR / 12) * 100) / 100,
    monthlyNetAfterAll: Math.round((netAfterAll / 12) * 100) / 100,
  };
}
