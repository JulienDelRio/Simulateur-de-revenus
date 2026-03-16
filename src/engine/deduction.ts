import { DEDUCTION_RATE, DEDUCTION_FLOOR, DEDUCTION_CEILING } from "./constants";
import type { MemberIncome } from "./types";

export function computeDeduction(member: MemberIncome): number {
  if (member.deductionMode === "none") return 0;

  if (member.deductionMode === "frais_reels") {
    return Math.min(member.realExpenses, member.grossIncome);
  }

  const raw = member.grossIncome * DEDUCTION_RATE;
  const floored = Math.max(raw, Math.min(DEDUCTION_FLOOR, member.grossIncome));
  return Math.min(floored, DEDUCTION_CEILING);
}

export function computeNetTaxableIncome(member: MemberIncome): number {
  return Math.max(member.grossIncome - computeDeduction(member), 0);
}
