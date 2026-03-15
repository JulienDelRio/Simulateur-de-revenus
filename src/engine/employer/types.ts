export type CompanySize = "moins_11" | "11_49" | "50_plus";

export interface EmployerInput {
  grossSalary: number;
  isCadre: boolean;
  companySize: CompanySize;
  atmpRate: number;           // e.g. 0.0208
  hasTransportLevy: boolean;
  transportLevyRate: number;  // e.g. 0.0295
  prevoyanceRate: number;     // e.g. 0.015, cadres only
}

export interface EmployerContributionLine {
  label: string;
  base: number;
  rate: number;
  amount: number;
}

export interface RGDUResult {
  isEligible: boolean;
  coefficient: number;
  amount: number;
  eligibleContributions: number;
}

export interface EmployerResult {
  grossSalary: number;
  contributions: EmployerContributionLine[];
  totalContributions: number;
  rgdu: RGDUResult;
  superBrut: number;
  contributionRate: number;   // before RGDU (%)
  effectiveRate: number;      // after RGDU (%)
}
