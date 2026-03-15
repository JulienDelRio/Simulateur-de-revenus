import { describe, it, expect } from "vitest";
import { simulateEmployer } from "../../src/engine/employer";
import type { EmployerInput } from "../../src/engine/employer";

function basicInput(overrides: Partial<EmployerInput> = {}): EmployerInput {
  return {
    grossSalary: 30_000,
    isCadre: false,
    companySize: "50_plus",
    atmpRate: 0.0208,
    hasTransportLevy: false,
    transportLevyRate: 0.0295,
    prevoyanceRate: 0.015,
    ...overrides,
  };
}

describe("simulateEmployer — spec test cases", () => {
  it("Case 1: SMIC non-cadre, >= 50 employees, no transport", () => {
    const result = simulateEmployer(basicInput({
      grossSalary: 21_876.40,
    }));

    expect(result.totalContributions).toBe(9_612.49);
    expect(result.rgdu.isEligible).toBe(true);
    expect(result.rgdu.coefficient).toBe(0.4021);
    expect(result.rgdu.amount).toBe(8_796.50);
    expect(result.superBrut).toBe(22_692.39);
  });

  it("Case 2: cadre 45k, >= 50 employees, with transport", () => {
    const result = simulateEmployer(basicInput({
      grossSalary: 45_000,
      isCadre: true,
      hasTransportLevy: true,
    }));

    expect(result.totalContributions).toBe(21_791.70);
    expect(result.rgdu.isEligible).toBe(true);
    expect(result.rgdu.coefficient).toBe(0.049);
    expect(result.rgdu.amount).toBe(2_205);
    expect(result.superBrut).toBe(64_586.70);
  });

  it("Case 3: cadre 80k (above PASS), >= 50 employees, with transport", () => {
    const result = simulateEmployer(basicInput({
      grossSalary: 80_000,
      isCadre: true,
      hasTransportLevy: true,
    }));

    expect(result.totalContributions).toBe(38_264.89);
    expect(result.rgdu.isEligible).toBe(false);
    expect(result.rgdu.amount).toBe(0);
    expect(result.superBrut).toBe(118_264.89);
  });

  it("Case 4: non-cadre 30k, < 11 employees, no transport", () => {
    const result = simulateEmployer(basicInput({
      grossSalary: 30_000,
      companySize: "moins_11",
    }));

    expect(result.totalContributions).toBe(12_927.00);
    expect(result.rgdu.isEligible).toBe(true);
    expect(result.rgdu.coefficient).toBe(0.1719);
    expect(result.rgdu.amount).toBe(5_157.00);
    expect(result.superBrut).toBe(37_770.00);
  });
});

describe("simulateEmployer — edge cases", () => {
  it("returns zero for zero salary", () => {
    const result = simulateEmployer(basicInput({ grossSalary: 0 }));
    expect(result.totalContributions).toBe(0);
    expect(result.rgdu.isEligible).toBe(false);
    expect(result.superBrut).toBe(0);
  });

  it("transport levy disabled for < 11 employees", () => {
    const result = simulateEmployer(basicInput({
      grossSalary: 30_000,
      companySize: "moins_11",
      hasTransportLevy: true,
    }));

    const hasTransport = result.contributions.some(c => c.label === "Versement mobilité");
    expect(hasTransport).toBe(false);
  });

  it("prevoyance only for cadres", () => {
    const nonCadre = simulateEmployer(basicInput({ isCadre: false }));
    const cadre = simulateEmployer(basicInput({ isCadre: true }));

    const nonCadrePrev = nonCadre.contributions.some(c => c.label === "Prévoyance cadres");
    const cadrePrev = cadre.contributions.some(c => c.label === "Prévoyance cadres");

    expect(nonCadrePrev).toBe(false);
    expect(cadrePrev).toBe(true);
  });
});
