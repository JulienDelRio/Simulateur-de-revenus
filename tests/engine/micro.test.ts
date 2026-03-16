import { describe, it, expect } from "vitest";
import { simulateMicro } from "../../src/engine/micro";
import type { MicroInput } from "../../src/engine/micro";

function round2(v: number) {
  return Math.round(v * 100) / 100;
}

describe("simulateMicro", () => {
  // Cas 1: BIC vente, 80 000 €, sans ACRE
  it("case 1: BIC vente 80k without ACRE", () => {
    const input: MicroInput = {
      turnover: 80_000,
      activityType: "bic_vente",
      isVersementLiberatoire: false,
      isAcre: false,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.socialContributions.amount).toBe(9_840);
    expect(r.cfp.amount).toBe(80);
    expect(r.taxeConsulaire.amount).toBe(12);
    expect(r.totalSocialCharges).toBe(9_932);
    expect(r.netBeforeTax).toBe(70_068);
    expect(r.microAbatement).toBe(56_800);
    expect(r.taxableIncome).toBe(23_200);
    expect(r.isAboveThreshold).toBe(false);
  });

  // Cas 2: BNC général, 60 000 €, versement libératoire
  it("case 2: BNC general 60k with VL", () => {
    const input: MicroInput = {
      turnover: 60_000,
      activityType: "bnc_general",
      isVersementLiberatoire: true,
      isAcre: false,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.socialContributions.amount).toBe(15_360);
    expect(r.cfp.amount).toBe(120);
    expect(r.taxeConsulaire.amount).toBe(0);
    expect(r.totalSocialCharges).toBe(15_480);
    expect(r.netBeforeTax).toBe(44_520);
  });

  // Cas 3: BIC prestation, 45 000 €, ACRE 50%
  it("case 3: BIC prestation 45k with ACRE 50%", () => {
    const input: MicroInput = {
      turnover: 45_000,
      activityType: "bic_prestation",
      isVersementLiberatoire: false,
      isAcre: true,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.socialContributions.rate).toBe(0.106);
    expect(r.socialContributions.amount).toBe(4_770);
    expect(r.cfp.amount).toBe(135);
    expect(r.taxeConsulaire.amount).toBe(19.8);
    expect(r.totalSocialCharges).toBe(4_924.8);
    expect(r.netBeforeTax).toBe(40_075.2);
    expect(r.taxableIncome).toBe(22_500);
  });

  // Cas 4: BNC CIPAV, 70 000 €, ACRE 25%
  it("case 4: BNC CIPAV 70k with ACRE 25%", () => {
    const input: MicroInput = {
      turnover: 70_000,
      activityType: "bnc_cipav",
      isVersementLiberatoire: false,
      isAcre: true,
      acreRegime: "25_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.socialContributions.rate).toBeCloseTo(0.174, 4);
    expect(r.socialContributions.amount).toBe(12_180);
    expect(r.cfp.amount).toBe(140);
    expect(r.taxeConsulaire.amount).toBe(0);
    expect(r.totalSocialCharges).toBe(12_320);
    expect(r.netBeforeTax).toBe(57_680);
    expect(r.taxableIncome).toBe(46_200);
  });

  // Cas 5: BIC vente, 500 € (petit CA, abattement > minimum)
  it("case 5: BIC vente 500 (small CA)", () => {
    const input: MicroInput = {
      turnover: 500,
      activityType: "bic_vente",
      isVersementLiberatoire: false,
      isAcre: false,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.socialContributions.amount).toBe(61.5);
    expect(r.cfp.amount).toBe(0.5);
    expect(r.taxeConsulaire.amount).toBe(0); // CA <= 5000
    expect(r.totalSocialCharges).toBe(62);
    expect(r.microAbatement).toBe(355); // 500 * 71% = 355 > 305
    expect(r.taxableIncome).toBe(145);
  });

  // Cas 6: BNC général, 1 000 € (abattement > minimum)
  it("case 6: BNC general 1000 (abatement > minimum)", () => {
    const input: MicroInput = {
      turnover: 1_000,
      activityType: "bnc_general",
      isVersementLiberatoire: false,
      isAcre: false,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.socialContributions.amount).toBe(256);
    expect(r.cfp.amount).toBe(2);
    expect(r.totalSocialCharges).toBe(258);
    expect(r.microAbatement).toBe(340); // 1000 * 34% = 340 > 305
    expect(r.taxableIncome).toBe(660);
  });

  // Cas 7: BNC général, 200 € (CA < abattement minimum)
  it("case 7: BNC general 200 (CA < abatement minimum)", () => {
    const input: MicroInput = {
      turnover: 200,
      activityType: "bnc_general",
      isVersementLiberatoire: false,
      isAcre: false,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.microAbatement).toBe(200); // CA < 305, abatement = CA
    expect(r.taxableIncome).toBe(0);
  });

  // Threshold warning
  it("warns when CA exceeds threshold", () => {
    const input: MicroInput = {
      turnover: 210_000,
      activityType: "bic_vente",
      isVersementLiberatoire: false,
      isAcre: false,
      acreRegime: "50_pourcent",
    };
    const r = simulateMicro(input);
    expect(r.isAboveThreshold).toBe(true);
    expect(r.threshold).toBe(203_100);
  });
});
