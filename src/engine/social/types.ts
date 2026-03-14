export interface SocialInput {
  grossSalary: number;
  isCadre: boolean;
  overtimeGross: number;    // annual overtime gross (included in grossSalary), 0 if none
  hasMutuelle: boolean;
  mutuelleMonthly: number;  // monthly employee contribution, 0 if none
}

export interface ContributionLine {
  label: string;
  base: number;
  rate: number;
  amount: number;
  isDeductible: boolean;
}

export interface SocialResult {
  grossSalary: number;
  contributions: ContributionLine[];
  totalContributions: number;
  overtimeRelief: number;
  mutuelleAnnual: number;
  netBeforeIR: number;
  netTaxable: number;
  overtimeIRExemption: number;
  contributionRate: number;
}
