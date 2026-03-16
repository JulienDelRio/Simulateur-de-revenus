import { describe, it, expect } from "vitest";
import { simulateSocial } from "../../src/engine/social";
import type { SocialInput } from "../../src/engine/social";

function basicInput(overrides: Partial<SocialInput> = {}): SocialInput {
  return {
    grossSalary: 30_000,
    isCadre: false,
    overtimeGross: 0,
    hasMutuelle: false,
    mutuelleMonthly: 0,
    ...overrides,
  };
}

describe("simulateSocial — spec test cases", () => {
  it("Case 1: non-cadre, 30k, no options", () => {
    const result = simulateSocial(basicInput());

    expect(result.totalContributions).toBe(6_294.08);
    expect(result.netBeforeIR).toBe(23_705.92);
    expect(result.netTaxable).toBe(24_560.70);
    expect(result.overtimeRelief).toBe(0);
    expect(result.mutuelleAnnual).toBe(0);
  });

  it("Case 2: cadre, 60k (above PASS), no options", () => {
    const result = simulateSocial(basicInput({
      grossSalary: 60_000,
      isCadre: true,
    }));

    expect(result.totalContributions).toBe(12_460.47);
    expect(result.netBeforeIR).toBe(47_539.53);
    expect(result.netTaxable).toBe(49_249.08);
  });

  it("Case 3: non-cadre, SMIC, with mutuelle 30€/month", () => {
    const result = simulateSocial(basicInput({
      grossSalary: 21_622,
      hasMutuelle: true,
      mutuelleMonthly: 30,
    }));

    expect(result.totalContributions).toBe(4_536.36);
    expect(result.mutuelleAnnual).toBe(360);
    expect(result.netBeforeIR).toBe(16_725.64);
    expect(result.netTaxable).toBe(17_341.71);
  });

  it("Case 4: cadre, 40k with 4k overtime", () => {
    const result = simulateSocial(basicInput({
      grossSalary: 40_000,
      isCadre: true,
      overtimeGross: 4_000,
    }));

    expect(result.totalContributions).toBe(8_401.70);
    expect(result.overtimeRelief).toBe(452.40);
    expect(result.netBeforeIR).toBe(32_050.70);
    expect(result.overtimeIRExemption).toBe(3_993.44);
    expect(result.netTaxable).toBe(29_196.96);
  });
});

describe("simulateSocial — contribution details", () => {
  it("should include APEC for cadres only", () => {
    const cadre = simulateSocial(basicInput({ isCadre: true }));
    const nonCadre = simulateSocial(basicInput({ isCadre: false }));

    expect(cadre.contributions.some((c) => c.label === "APEC")).toBe(true);
    expect(nonCadre.contributions.some((c) => c.label === "APEC")).toBe(false);
  });

  it("should not include T2 contributions below PASS", () => {
    const result = simulateSocial(basicInput({ grossSalary: 40_000 }));
    expect(result.contributions.some((c) => c.label.includes("T2"))).toBe(false);
  });

  it("should include T2 contributions above PASS", () => {
    const result = simulateSocial(basicInput({ grossSalary: 60_000 }));
    expect(result.contributions.some((c) => c.label.includes("T2"))).toBe(true);
  });
});
