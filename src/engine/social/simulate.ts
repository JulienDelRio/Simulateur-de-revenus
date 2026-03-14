import {
  PASS, PASS_4, PASS_8,
  VIEILLESSE_PLAFONNEE_RATE, VIEILLESSE_DEPLAFONNEE_RATE,
  RETRAITE_T1_RATE, RETRAITE_T2_RATE,
  CEG_T1_RATE, CEG_T2_RATE,
  CET_RATE, APEC_RATE,
  CSG_ABATTEMENT_RATE,
  CSG_DEDUCTIBLE_RATE, CSG_NON_DEDUCTIBLE_RATE, CRDS_RATE,
  OVERTIME_RELIEF_RATE, OVERTIME_IR_EXEMPTION_CAP,
} from "./constants";
import type { SocialInput, SocialResult, ContributionLine } from "./types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function line(
  label: string,
  base: number,
  rate: number,
  isDeductible: boolean,
): ContributionLine {
  return { label, base: round2(base), rate, amount: round2(base * rate), isDeductible };
}

export function simulateSocial(input: SocialInput): SocialResult {
  const { grossSalary, isCadre, overtimeGross, hasMutuelle, mutuelleMonthly } = input;

  // --- Step 1: Contribution bases ---
  const baseT1 = Math.min(grossSalary, PASS);
  const baseT2 = Math.max(0, Math.min(grossSalary, PASS_8) - PASS);
  const baseTotal = grossSalary;
  const base8PASS = Math.min(grossSalary, PASS_8);
  const base4PASS = Math.min(grossSalary, PASS_4);

  // --- Step 2: Sécurité sociale (RM-101, RM-102) ---
  const contributions: ContributionLine[] = [];

  contributions.push(line("Vieillesse plafonnée", baseT1, VIEILLESSE_PLAFONNEE_RATE, true));
  contributions.push(line("Vieillesse déplafonnée", baseTotal, VIEILLESSE_DEPLAFONNEE_RATE, true));

  // --- Step 3: Retraite complémentaire (RM-103 to RM-108) ---
  contributions.push(line("Retraite Agirc-Arrco T1", baseT1, RETRAITE_T1_RATE, true));
  if (baseT2 > 0) {
    contributions.push(line("Retraite Agirc-Arrco T2", baseT2, RETRAITE_T2_RATE, true));
  }
  contributions.push(line("CEG T1", baseT1, CEG_T1_RATE, true));
  if (baseT2 > 0) {
    contributions.push(line("CEG T2", baseT2, CEG_T2_RATE, true));
  }
  contributions.push(line("CET", base8PASS, CET_RATE, true));

  if (isCadre) {
    contributions.push(line("APEC", base4PASS, APEC_RATE, true));
  }

  // --- Step 4: CSG / CRDS (RM-109 to RM-112) ---
  let csgBase: number;
  if (grossSalary <= PASS_4) {
    csgBase = grossSalary * CSG_ABATTEMENT_RATE;
  } else {
    csgBase = PASS_4 * CSG_ABATTEMENT_RATE + (grossSalary - PASS_4);
  }
  csgBase = round2(csgBase);

  contributions.push(line("CSG déductible", csgBase, CSG_DEDUCTIBLE_RATE, true));
  contributions.push(line("CSG non déductible", csgBase, CSG_NON_DEDUCTIBLE_RATE, false));
  contributions.push(line("CRDS", csgBase, CRDS_RATE, false));

  // --- Step 5: Totals ---
  const totalContributions = round2(
    contributions.reduce((sum, c) => sum + c.amount, 0),
  );

  // --- Step 6: Overtime relief (RM-115) ---
  const overtimeRelief = round2(overtimeGross * OVERTIME_RELIEF_RATE);

  // --- Step 7: Mutuelle (RM-117, RM-118) ---
  const mutuelleAnnual = hasMutuelle ? round2(mutuelleMonthly * 12) : 0;

  // --- Step 8: Net before IR (RM-113) ---
  const netBeforeIR = round2(grossSalary - totalContributions + overtimeRelief - mutuelleAnnual);

  // --- Step 9: Net taxable (RM-114) ---
  const deductibleContributions = round2(
    contributions.filter((c) => c.isDeductible).reduce((sum, c) => sum + c.amount, 0),
  );

  // Overtime IR exemption (RM-116):
  // Net HS = HS_brut - (HS_brut * taux_secu_retraite) + relief_HS
  // where taux_secu_retraite = total_secu_retraite / grossSalary
  const secuRetraiteContributions = round2(
    contributions
      .filter((c) => c.isDeductible && !c.label.startsWith("CSG"))
      .reduce((sum, c) => sum + c.amount, 0),
  );
  const secuRetraiteRate = grossSalary > 0 ? secuRetraiteContributions / grossSalary : 0;
  const overtimeCotisations = round2(overtimeGross * secuRetraiteRate);
  const overtimeNet = round2(overtimeGross - overtimeCotisations + overtimeRelief);
  const overtimeIRExemption = overtimeGross > 0
    ? round2(Math.min(overtimeNet, OVERTIME_IR_EXEMPTION_CAP))
    : 0;

  const netTaxable = round2(
    grossSalary - deductibleContributions + overtimeRelief - mutuelleAnnual - overtimeIRExemption,
  );

  // --- Step 10: Contribution rate ---
  const contributionRate = grossSalary > 0
    ? round2((totalContributions - overtimeRelief) / grossSalary * 100)
    : 0;

  return {
    grossSalary,
    contributions,
    totalContributions,
    overtimeRelief,
    mutuelleAnnual,
    netBeforeIR,
    netTaxable,
    overtimeIRExemption,
    contributionRate,
  };
}
