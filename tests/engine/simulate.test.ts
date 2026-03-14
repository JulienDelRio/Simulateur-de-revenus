import { describe, it, expect } from "vitest";
import { simulate } from "../../src/engine";
import type { TaxInput } from "../../src/engine";

function singleIncome(
  grossIncome: number,
  overrides: Partial<TaxInput> = {},
): TaxInput {
  return {
    declarant: { grossIncome, deductionMode: "forfait_10", realExpenses: 0 },
    conjoint: null,
    familyStatus: "celibataire",
    isJointDeclaration: false,
    childrenCount: 0,
    isLoneParent: false,
    ...overrides,
  };
}

describe("simulate — spec test cases", () => {
  it("Case 1: single, no children, 30k gross", () => {
    const result = simulate(singleIncome(30_000));

    expect(result.netTaxableIncome).toBe(27_000);
    expect(result.parts).toBe(1);
    expect(result.finalTax).toBe(1_563);
    expect(result.marginalRate).toBe(0.11);
    expect(result.netAfterTax).toBe(28_437);
    expect(result.effectiveRate).toBeCloseTo(5.79, 1);
  });

  it("Case 2: married couple, 2 children, 80k gross (QF capping)", () => {
    const result = simulate({
      declarant: { grossIncome: 80_000, deductionMode: "forfait_10", realExpenses: 0 },
      conjoint: null,
      familyStatus: "marie_pacse",
      isJointDeclaration: true,
      childrenCount: 2,
      isLoneParent: false,
    });

    expect(result.netTaxableIncome).toBe(72_000);
    expect(result.parts).toBe(3);
    expect(result.isCapped).toBe(true);
    expect(result.finalTax).toBe(4_193);
    expect(result.marginalRate).toBe(0.30);
    expect(result.netAfterTax).toBe(75_807);
    expect(result.effectiveRate).toBeCloseTo(5.82, 1);
  });

  it("Case 3: single, low income, tax below 61€ threshold", () => {
    const result = simulate(singleIncome(13_000));

    expect(result.netTaxableIncome).toBe(11_700);
    expect(result.finalTax).toBe(0);
    expect(result.netAfterTax).toBe(13_000);
  });

  it("Case 4: lone parent, 1 child, 60k gross", () => {
    const result = simulate(
      singleIncome(60_000, {
        familyStatus: "celibataire",
        childrenCount: 1,
        isLoneParent: true,
      }),
    );

    expect(result.netTaxableIncome).toBe(54_000);
    expect(result.parts).toBe(2);
    expect(result.isCapped).toBe(false);
    expect(result.finalTax).toBe(3_388);
    expect(result.marginalRate).toBe(0.11);
    expect(result.netAfterTax).toBe(56_612);
    expect(result.effectiveRate).toBeCloseTo(6.27, 1);
  });
});

describe("simulate — deduction edge cases", () => {
  it("applies deduction floor of 509€", () => {
    const result = simulate(singleIncome(4_000));
    expect(result.deduction).toBe(509);
    expect(result.netTaxableIncome).toBe(3_491);
  });

  it("caps deduction at gross income when gross < 509", () => {
    const result = simulate(singleIncome(300));
    expect(result.deduction).toBe(300);
    expect(result.netTaxableIncome).toBe(0);
  });

  it("applies deduction ceiling of 14,555€", () => {
    const result = simulate(singleIncome(200_000));
    expect(result.deduction).toBe(14_555);
  });

  it("uses real expenses when selected", () => {
    const result = simulate({
      declarant: { grossIncome: 30_000, deductionMode: "frais_reels", realExpenses: 5_000 },
      conjoint: null,
      familyStatus: "celibataire",
      isJointDeclaration: false,
      childrenCount: 0,
      isLoneParent: false,
    });

    expect(result.deduction).toBe(5_000);
    expect(result.netTaxableIncome).toBe(25_000);
  });

  it("caps real expenses at gross income (net >= 0)", () => {
    const result = simulate({
      declarant: { grossIncome: 10_000, deductionMode: "frais_reels", realExpenses: 15_000 },
      conjoint: null,
      familyStatus: "celibataire",
      isJointDeclaration: false,
      childrenCount: 0,
      isLoneParent: false,
    });

    expect(result.netTaxableIncome).toBe(0);
  });
});

describe("simulate — separate incomes", () => {
  it("sums net taxable income from both members", () => {
    const result = simulate({
      declarant: { grossIncome: 40_000, deductionMode: "forfait_10", realExpenses: 0 },
      conjoint: { grossIncome: 40_000, deductionMode: "forfait_10", realExpenses: 0 },
      familyStatus: "marie_pacse",
      isJointDeclaration: true,
      childrenCount: 0,
      isLoneParent: false,
    });

    expect(result.grossIncome).toBe(80_000);
    expect(result.netTaxableIncome).toBe(72_000);
  });

  it("allows different deduction modes per member", () => {
    const result = simulate({
      declarant: { grossIncome: 40_000, deductionMode: "forfait_10", realExpenses: 0 },
      conjoint: { grossIncome: 40_000, deductionMode: "frais_reels", realExpenses: 8_000 },
      familyStatus: "marie_pacse",
      isJointDeclaration: true,
      childrenCount: 0,
      isLoneParent: false,
    });

    expect(result.deduction).toBe(4_000 + 8_000);
    expect(result.netTaxableIncome).toBe(36_000 + 32_000);
  });
});

describe("simulate — RM-008: widowed with children", () => {
  it("should have same parts as married couple", () => {
    const result = simulate({
      declarant: { grossIncome: 60_000, deductionMode: "forfait_10", realExpenses: 0 },
      conjoint: null,
      familyStatus: "veuf",
      isJointDeclaration: false,
      childrenCount: 2,
      isLoneParent: false,
    });

    // Widowed with 2 children = 2 + 0.5 + 0.5 = 3 parts (same as married)
    expect(result.parts).toBe(3);
  });

  it("should have 1 part when widowed without children", () => {
    const result = simulate(singleIncome(40_000, { familyStatus: "veuf" }));
    expect(result.parts).toBe(1);
  });
});

describe("simulate — RM-009: separate declaration", () => {
  it("should use 1 part per declarant in separate declaration", () => {
    const result = simulate({
      declarant: { grossIncome: 50_000, deductionMode: "forfait_10", realExpenses: 0 },
      conjoint: null,
      familyStatus: "marie_pacse",
      isJointDeclaration: false,
      childrenCount: 2,
      isLoneParent: false,
    });

    // Separate declaration = single = 1 part (children allocated separately)
    expect(result.parts).toBe(1);
  });
});
