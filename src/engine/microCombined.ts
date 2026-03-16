import type { FamilyStatus } from "./types";
import type { TaxResult } from "./types";
import type { MicroInput, MicroResult } from "./micro";
import { simulateMicro } from "./micro";
import { VL_RATES } from "./micro/constants";
import { simulate } from "./simulate";

export interface MicroCombinedInput {
  micro: MicroInput;
  familyStatus: FamilyStatus;
  isJointDeclaration: boolean;
  childrenCount: number;
  isLoneParent: boolean;
}

export interface MicroCombinedResult {
  micro: MicroResult;
  tax: TaxResult | null;
  vlAmount: number;
  irAmount: number;
  totalCharges: number;
  netAfterAll: number;
  globalRate: number;
  monthlyNetAfterAll: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function simulateMicroCombined(
  input: MicroCombinedInput,
): MicroCombinedResult {
  const micro = simulateMicro(input.micro);

  let tax: TaxResult | null = null;
  let vlAmount = 0;
  let irAmount = 0;

  if (input.micro.isVersementLiberatoire) {
    vlAmount = round2(
      micro.turnover * VL_RATES[input.micro.activityType],
    );
    irAmount = vlAmount;
  } else {
    tax = simulate({
      declarant: {
        grossIncome: micro.taxableIncome,
        deductionMode: "none",
        realExpenses: 0,
      },
      conjoint: null,
      familyStatus: input.familyStatus,
      isJointDeclaration: input.isJointDeclaration,
      childrenCount: input.childrenCount,
      isLoneParent: input.isLoneParent,
    });
    irAmount = tax.finalTax;
  }

  const totalCharges = round2(micro.totalSocialCharges + irAmount);
  const netAfterAll = round2(micro.turnover - totalCharges);
  const globalRate =
    micro.turnover > 0
      ? round2((totalCharges / micro.turnover) * 100)
      : 0;

  return {
    micro,
    tax,
    vlAmount,
    irAmount,
    totalCharges,
    netAfterAll,
    globalRate,
    monthlyNetAfterAll: round2(netAfterAll / 12),
  };
}
