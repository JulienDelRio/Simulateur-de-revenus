import {
  PASS, PASS_4, PASS_8,
  MALADIE_PATRONAL_RATE,
  VIEILLESSE_PLAFONNEE_PATRONAL_RATE,
  VIEILLESSE_DEPLAFONNEE_PATRONAL_RATE,
  ALLOCATIONS_FAMILIALES_RATE,
  CSA_RATE,
  CHOMAGE_RATE, AGS_RATE,
  FNAL_RATE_SMALL, FNAL_RATE_LARGE,
  RETRAITE_T1_PATRONAL_RATE, RETRAITE_T2_PATRONAL_RATE,
  CEG_T1_PATRONAL_RATE, CEG_T2_PATRONAL_RATE,
  CET_PATRONAL_RATE, APEC_PATRONAL_RATE,
  TAXE_APPRENTISSAGE_RATE,
  CFP_RATE_SMALL, CFP_RATE_LARGE,
} from "./constants";
import { computeRGDU } from "./rgdu";
import type { EmployerInput, EmployerResult, EmployerContributionLine } from "./types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function line(label: string, base: number, rate: number): EmployerContributionLine {
  return { label, base: round2(base), rate, amount: round2(base * rate) };
}

export function simulateEmployer(input: EmployerInput): EmployerResult {
  const { grossSalary, isCadre, companySize, atmpRate, hasTransportLevy, transportLevyRate, prevoyanceRate } = input;

  // --- Step 1: Contribution bases ---
  const baseTotal = grossSalary;
  const baseTA = Math.min(grossSalary, PASS);
  const baseT2 = Math.max(0, Math.min(grossSalary, PASS_8) - PASS);
  const base4PASS = Math.min(grossSalary, PASS_4);
  const base8PASS = Math.min(grossSalary, PASS_8);

  // --- Step 2: URSSAF contributions ---
  const contributions: EmployerContributionLine[] = [];

  const maladie = line("Maladie", baseTotal, MALADIE_PATRONAL_RATE);
  contributions.push(maladie);

  const vieillessePlaf = line("Vieillesse plafonnée", baseTA, VIEILLESSE_PLAFONNEE_PATRONAL_RATE);
  contributions.push(vieillessePlaf);

  const vieillesseDeplaf = line("Vieillesse déplafonnée", baseTotal, VIEILLESSE_DEPLAFONNEE_PATRONAL_RATE);
  contributions.push(vieillesseDeplaf);

  const af = line("Allocations familiales", baseTotal, ALLOCATIONS_FAMILIALES_RATE);
  contributions.push(af);

  const atmp = line("AT/MP", baseTotal, atmpRate);
  contributions.push(atmp);

  const csa = line("CSA", baseTotal, CSA_RATE);
  contributions.push(csa);

  const fnalRate = companySize === "50_plus" ? FNAL_RATE_LARGE : FNAL_RATE_SMALL;
  const fnalBase = companySize === "50_plus" ? baseTotal : baseTA;
  const fnal = line("FNAL", fnalBase, fnalRate);
  contributions.push(fnal);

  // --- Step 3: Unemployment ---
  const chomage = line("Chômage", base4PASS, CHOMAGE_RATE);
  contributions.push(chomage);

  const ags = line("AGS", base4PASS, AGS_RATE);
  contributions.push(ags);

  // --- Step 4: Agirc-Arrco ---
  const agircT1 = line("Agirc-Arrco T1", baseTA, RETRAITE_T1_PATRONAL_RATE);
  contributions.push(agircT1);

  if (baseT2 > 0) {
    contributions.push(line("Agirc-Arrco T2", baseT2, RETRAITE_T2_PATRONAL_RATE));
  }

  const cegT1 = line("CEG T1", baseTA, CEG_T1_PATRONAL_RATE);
  contributions.push(cegT1);

  if (baseT2 > 0) {
    contributions.push(line("CEG T2", baseT2, CEG_T2_PATRONAL_RATE));
  }

  const cet = line("CET", base8PASS, CET_PATRONAL_RATE);
  contributions.push(cet);

  if (isCadre) {
    contributions.push(line("APEC", base8PASS, APEC_PATRONAL_RATE));
  }

  // --- Step 5: Complementary ---
  if (isCadre) {
    contributions.push(line("Prévoyance cadres", baseTA, prevoyanceRate));
  }

  if (hasTransportLevy && companySize !== "moins_11") {
    contributions.push(line("Versement mobilité", baseTotal, transportLevyRate));
  }

  contributions.push(line("Taxe d'apprentissage", baseTotal, TAXE_APPRENTISSAGE_RATE));

  const cfpRate = companySize === "moins_11" ? CFP_RATE_SMALL : CFP_RATE_LARGE;
  contributions.push(line("CFP", baseTotal, cfpRate));

  // --- Step 6: Total ---
  const totalContributions = round2(
    contributions.reduce((sum, c) => sum + c.amount, 0),
  );

  // --- Step 7: RGDU ---
  const rgdu = computeRGDU(grossSalary, companySize, {
    maladie: maladie.amount,
    vieillessePlafonnee: vieillessePlaf.amount,
    vieillesseDeplafonnee: vieillesseDeplaf.amount,
    allocationsFamiliales: af.amount,
    atmpAmount: atmp.amount,
    atmpBase: baseTotal,
    csa: csa.amount,
    fnal: fnal.amount,
    chomage: chomage.amount,
    agircArrcoT1: agircT1.amount,
    cegT1: cegT1.amount,
    cet: cet.amount,
  });

  // --- Step 8: Super brut ---
  const superBrut = round2(grossSalary + totalContributions - rgdu.amount);

  const contributionRate = grossSalary > 0
    ? round2(totalContributions / grossSalary * 100)
    : 0;
  const effectiveRate = grossSalary > 0
    ? round2((totalContributions - rgdu.amount) / grossSalary * 100)
    : 0;

  return {
    grossSalary,
    contributions,
    totalContributions,
    rgdu,
    superBrut,
    contributionRate,
    effectiveRate,
  };
}
