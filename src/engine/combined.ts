import { simulate } from "./simulate";
import { simulateSocial } from "./social";
import { simulateEmployer } from "./employer";
import type { SocialInput, SocialResult } from "./social";
import type { EmployerResult, CompanySize } from "./employer";
import type { FamilyStatus, DeductionMode, TaxResult } from "./types";

export interface MemberSocialInput extends SocialInput {
  deductionMode: DeductionMode;
  realExpenses: number;
  // v0.3 employer fields
  companySize: CompanySize;
  atmpRate: number;
  hasTransportLevy: boolean;
  transportLevyRate: number;
  prevoyanceRate: number;
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
  employer: EmployerResult;
  employerConjoint: EmployerResult | null;
  tax: TaxResult;
  grossSalaryTotal: number;
  totalContributions: number;
  totalMutuelle: number;
  netBeforeIR: number;
  netAfterAll: number;
  superBrutTotal: number;
  monthlyNetBeforeIR: number;
  monthlyNetAfterAll: number;
}

export function simulateCombined(input: CombinedInput): CombinedResult {
  // Step 1: Social contributions for declarant
  const social = simulateSocial(input.declarant);

  // Step 2: Social contributions for conjoint (if separate incomes)
  const socialConjoint = input.conjoint ? simulateSocial(input.conjoint) : null;

  // Step 3: Employer contributions for declarant
  const employer = simulateEmployer({
    grossSalary: input.declarant.grossSalary,
    isCadre: input.declarant.isCadre,
    companySize: input.declarant.companySize,
    atmpRate: input.declarant.atmpRate,
    hasTransportLevy: input.declarant.hasTransportLevy,
    transportLevyRate: input.declarant.transportLevyRate,
    prevoyanceRate: input.declarant.prevoyanceRate,
  });

  // Step 4: Employer contributions for conjoint
  const employerConjoint = input.conjoint
    ? simulateEmployer({
        grossSalary: input.conjoint.grossSalary,
        isCadre: input.conjoint.isCadre,
        companySize: input.conjoint.companySize,
        atmpRate: input.conjoint.atmpRate,
        hasTransportLevy: input.conjoint.hasTransportLevy,
        transportLevyRate: input.conjoint.transportLevyRate,
        prevoyanceRate: input.conjoint.prevoyanceRate,
      })
    : null;

  // Step 5: Feed netTaxable into IR engine as grossIncome
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

  // Step 6: Aggregate results
  const grossSalaryTotal = social.grossSalary + (socialConjoint?.grossSalary ?? 0);
  const totalContributions = social.totalContributions
    - social.overtimeRelief
    + (socialConjoint ? socialConjoint.totalContributions - socialConjoint.overtimeRelief : 0);
  const totalMutuelle = social.mutuelleAnnual + (socialConjoint?.mutuelleAnnual ?? 0);
  const netBeforeIR = social.netBeforeIR + (socialConjoint?.netBeforeIR ?? 0);
  const netAfterAll = netBeforeIR - tax.finalTax;
  const superBrutTotal = employer.superBrut + (employerConjoint?.superBrut ?? 0);

  return {
    social,
    socialConjoint,
    employer,
    employerConjoint,
    tax,
    grossSalaryTotal,
    totalContributions,
    totalMutuelle,
    netBeforeIR,
    netAfterAll,
    superBrutTotal,
    monthlyNetBeforeIR: Math.round((netBeforeIR / 12) * 100) / 100,
    monthlyNetAfterAll: Math.round((netAfterAll / 12) * 100) / 100,
  };
}
