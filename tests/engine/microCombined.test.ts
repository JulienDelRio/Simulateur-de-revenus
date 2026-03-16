import { describe, it, expect } from "vitest";
import { simulateMicroCombined } from "../../src/engine/microCombined";
import type { MicroCombinedInput } from "../../src/engine/microCombined";

describe("simulateMicroCombined", () => {
  // Cas 1: BIC vente 80k, barème progressif, célibataire
  it("case 1: BIC vente 80k barème progressif", () => {
    const input: MicroCombinedInput = {
      micro: {
        turnover: 80_000,
        activityType: "bic_vente",
        isVersementLiberatoire: false,
        isAcre: false,
        acreRegime: "50_pourcent",
      },
      familyStatus: "celibataire",
      isJointDeclaration: false,
      childrenCount: 0,
      isLoneParent: false,
    };
    const r = simulateMicroCombined(input);
    expect(r.micro.totalSocialCharges).toBe(9_932);
    expect(r.tax).not.toBeNull();
    expect(r.irAmount).toBe(956);
    expect(r.netAfterAll).toBe(69_112);
    expect(r.vlAmount).toBe(0);
  });

  // Cas 2: BNC général 60k, versement libératoire, célibataire
  it("case 2: BNC general 60k versement libératoire", () => {
    const input: MicroCombinedInput = {
      micro: {
        turnover: 60_000,
        activityType: "bnc_general",
        isVersementLiberatoire: true,
        isAcre: false,
        acreRegime: "50_pourcent",
      },
      familyStatus: "celibataire",
      isJointDeclaration: false,
      childrenCount: 0,
      isLoneParent: false,
    };
    const r = simulateMicroCombined(input);
    expect(r.micro.totalSocialCharges).toBe(15_480);
    expect(r.tax).toBeNull();
    expect(r.vlAmount).toBe(1_320);
    expect(r.irAmount).toBe(1_320);
    expect(r.netAfterAll).toBe(43_200);
  });

  // Cas 3: BIC prestation 45k, ACRE 50%, marié 2 enfants
  it("case 3: BIC prestation 45k ACRE 50% marié 2 enfants", () => {
    const input: MicroCombinedInput = {
      micro: {
        turnover: 45_000,
        activityType: "bic_prestation",
        isVersementLiberatoire: false,
        isAcre: true,
        acreRegime: "50_pourcent",
      },
      familyStatus: "marie_pacse",
      isJointDeclaration: true,
      childrenCount: 2,
      isLoneParent: false,
    };
    const r = simulateMicroCombined(input);
    expect(r.micro.totalSocialCharges).toBe(4_924.8);
    expect(r.tax).not.toBeNull();
    expect(r.irAmount).toBe(0); // 22500 / 3 parts = 7500 => tranche 0%
    expect(r.netAfterAll).toBe(40_075.2);
  });

  // Cas 4: BNC CIPAV 70k, ACRE 25%, célibataire
  it("case 4: BNC CIPAV 70k ACRE 25% célibataire", () => {
    const input: MicroCombinedInput = {
      micro: {
        turnover: 70_000,
        activityType: "bnc_cipav",
        isVersementLiberatoire: false,
        isAcre: true,
        acreRegime: "25_pourcent",
      },
      familyStatus: "celibataire",
      isJointDeclaration: false,
      childrenCount: 0,
      isLoneParent: false,
    };
    const r = simulateMicroCombined(input);
    expect(r.micro.totalSocialCharges).toBe(12_320);
    expect(r.tax).not.toBeNull();
    expect(r.irAmount).toBe(6_963);
    expect(r.netAfterAll).toBe(50_717);
  });
});
