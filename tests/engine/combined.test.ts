import { describe, it, expect } from "vitest";
import { simulateCombined } from "../../src/engine/combined";
import type { CombinedInput } from "../../src/engine/combined";

const defaultMember = {
  grossSalary: 30_000,
  isCadre: false,
  overtimeGross: 0,
  hasMutuelle: false,
  mutuelleMonthly: 0,
  deductionMode: "forfait_10" as const,
  realExpenses: 0,
  companySize: "50_plus" as const,
  atmpRate: 0.0208,
  hasTransportLevy: false,
  transportLevyRate: 0.0295,
  prevoyanceRate: 0.015,
};

function basicCombined(overrides: Partial<CombinedInput> = {}): CombinedInput {
  return {
    declarant: { ...defaultMember },
    conjoint: null,
    familyStatus: "celibataire",
    isJointDeclaration: false,
    childrenCount: 0,
    isLoneParent: false,
    ...overrides,
  };
}

describe("simulateCombined — spec test cases (full chain)", () => {
  it("Case 1: non-cadre 30k, single — IR = 781, net after all = 22,924.92", () => {
    const result = simulateCombined(basicCombined());

    expect(result.social.netBeforeIR).toBe(23_705.92);
    expect(result.social.netTaxable).toBe(24_560.70);
    expect(result.tax.finalTax).toBe(781);
    expect(result.netAfterAll).toBe(22_924.92);
  });

  it("Case 2: cadre 60k, married 2 children — IR = 0, net after all = 47,539.53", () => {
    const result = simulateCombined(basicCombined({
      declarant: { ...defaultMember, grossSalary: 60_000, isCadre: true },
      familyStatus: "marie_pacse",
      isJointDeclaration: true,
      childrenCount: 2,
    }));

    expect(result.social.netBeforeIR).toBe(47_539.53);
    expect(result.tax.finalTax).toBe(0);
    expect(result.netAfterAll).toBe(47_539.53);
  });

  it("Case 3: non-cadre SMIC + mutuelle 30€ — IR = 0, net after all = 16,725.64", () => {
    const result = simulateCombined(basicCombined({
      declarant: { ...defaultMember, grossSalary: 21_622, hasMutuelle: true, mutuelleMonthly: 30 },
    }));

    expect(result.social.netBeforeIR).toBe(16_725.64);
    expect(result.tax.finalTax).toBe(0);
    expect(result.netAfterAll).toBe(16_725.64);
  });

  it("Case 4: cadre 40k + 4k overtime — IR = 1,448, net after all = 30,602.70", () => {
    const result = simulateCombined(basicCombined({
      declarant: { ...defaultMember, grossSalary: 40_000, isCadre: true, overtimeGross: 4_000 },
    }));

    expect(result.social.netBeforeIR).toBe(32_050.70);
    expect(result.tax.finalTax).toBe(1_448);
    expect(result.netAfterAll).toBe(30_602.70);
  });
});
