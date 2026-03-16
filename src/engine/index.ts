export { simulate } from "./simulate";
export { TAX_BRACKETS } from "./constants";
export type {
  TaxInput,
  TaxResult,
  BracketDetail,
  FamilyStatus,
  DeductionMode,
  MemberIncome,
} from "./types";

export { simulateSocial } from "./social";
export type { SocialInput, SocialResult, ContributionLine } from "./social";

export { simulateCombined } from "./combined";
export type { CombinedInput, CombinedResult, MemberSocialInput } from "./combined";

export { simulateEmployer } from "./employer";
export type {
  CompanySize,
  EmployerInput,
  EmployerResult,
  EmployerContributionLine,
  RGDUResult,
} from "./employer";
