export type FamilyStatus = "celibataire" | "marie_pacse" | "veuf";

export type DeductionMode = "forfait_10" | "frais_reels";

export interface MemberIncome {
  grossIncome: number;
  deductionMode: DeductionMode;
  realExpenses: number; // used only when deductionMode === "frais_reels"
}

export interface TaxInput {
  declarant: MemberIncome;
  conjoint: MemberIncome | null; // null if single income mode
  familyStatus: FamilyStatus;
  isJointDeclaration: boolean;
  childrenCount: number;
  isLoneParent: boolean;
}

export interface BracketDetail {
  floor: number;
  ceiling: number;
  rate: number;
  taxInBracket: number;
}

export interface TaxResult {
  grossIncome: number;
  deduction: number;
  netTaxableIncome: number;
  parts: number;
  incomePerPart: number;
  grossTax: number;
  isCapped: boolean;
  cappedTax: number;
  decote: number;
  finalTax: number;
  netAfterTax: number;
  marginalRate: number;
  effectiveRate: number;
  bracketDetails: BracketDetail[];
}
