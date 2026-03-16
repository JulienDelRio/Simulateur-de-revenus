import { useState, useEffect, useCallback, useRef } from "react";
import type { FamilyStatus, DeductionMode, CompanySize, ActivityType, AcreRegime } from "../engine";

export type IncomeType = "salarie" | "micro";

export interface ScenarioState {
  familyStatus: FamilyStatus;
  isJointDeclaration: boolean;
  childrenCount: number;
  isLoneParent: boolean;
  isSeparateIncome: boolean;
  grossIncome: number;
  deductionMode: DeductionMode;
  realExpenses: number;
  grossIncomeConjoint: number;
  deductionModeConjoint: DeductionMode;
  realExpensesConjoint: number;
  // v0.2 salary fields
  isCadre: boolean;
  overtimeGross: number;
  hasMutuelle: boolean;
  mutuelleMonthly: number;
  isCadreConjoint: boolean;
  overtimeGrossConjoint: number;
  hasMutuelleConjoint: boolean;
  mutuelleMonthlyConjoint: number;
  // v0.3 employer fields
  companySize: CompanySize;
  atmpRate: number;
  hasTransportLevy: boolean;
  transportLevyRate: number;
  prevoyanceRate: number;
  companySizeConjoint: CompanySize;
  atmpRateConjoint: number;
  hasTransportLevyConjoint: boolean;
  transportLevyRateConjoint: number;
  prevoyanceRateConjoint: number;
  // v0.4 income type
  incomeType: IncomeType;
  // v0.4 micro-entrepreneur fields
  microTurnover: number;
  microActivityType: ActivityType;
  isVersementLiberatoire: boolean;
  isAcre: boolean;
  acreRegime: AcreRegime;
}

export interface UrlState {
  isCompareMode: boolean;
  current: ScenarioState;
  future: ScenarioState;
}

const FAMILY_STATUSES: FamilyStatus[] = ["celibataire", "marie_pacse", "veuf"];
const DEDUCTION_MODES: DeductionMode[] = ["forfait_10", "frais_reels"];
const COMPANY_SIZES: CompanySize[] = ["moins_11", "11_49", "50_plus"];
const INCOME_TYPES: IncomeType[] = ["salarie", "micro"];
const ACTIVITY_TYPES: ActivityType[] = ["bic_vente", "bic_prestation", "bnc_general", "bnc_cipav"];
const ACRE_REGIMES: AcreRegime[] = ["50_pourcent", "25_pourcent"];

function parseNum(params: URLSearchParams, key: string, fallback: number): number {
  const val = params.get(key);
  if (val === null) return fallback;
  const n = Number(val);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function parseBool(params: URLSearchParams, key: string, fallback: boolean): boolean {
  const val = params.get(key);
  if (val === null) return fallback;
  return val === "1";
}

function parseEnum<T extends string>(
  params: URLSearchParams,
  key: string,
  allowed: T[],
  fallback: T,
): T {
  const val = params.get(key) as T | null;
  if (val && allowed.includes(val)) return val;
  return fallback;
}

const defaultScenario: ScenarioState = {
  familyStatus: "celibataire",
  isJointDeclaration: false,
  childrenCount: 0,
  isLoneParent: false,
  isSeparateIncome: false,
  grossIncome: 30_000,
  deductionMode: "forfait_10",
  realExpenses: 0,
  grossIncomeConjoint: 0,
  deductionModeConjoint: "forfait_10",
  realExpensesConjoint: 0,
  isCadre: false,
  overtimeGross: 0,
  hasMutuelle: false,
  mutuelleMonthly: 0,
  isCadreConjoint: false,
  overtimeGrossConjoint: 0,
  hasMutuelleConjoint: false,
  mutuelleMonthlyConjoint: 0,
  companySize: "50_plus",
  atmpRate: 2.08,
  hasTransportLevy: false,
  transportLevyRate: 2.95,
  prevoyanceRate: 1.50,
  companySizeConjoint: "50_plus",
  atmpRateConjoint: 2.08,
  hasTransportLevyConjoint: false,
  transportLevyRateConjoint: 2.95,
  prevoyanceRateConjoint: 1.50,
  // v0.4
  incomeType: "salarie",
  microTurnover: 50_000,
  microActivityType: "bnc_general",
  isVersementLiberatoire: false,
  isAcre: false,
  acreRegime: "50_pourcent",
};

function readScenario(p: URLSearchParams, prefix: string, defaults: ScenarioState): ScenarioState {
  return {
    familyStatus: parseEnum(p, `${prefix}fs`, FAMILY_STATUSES, defaults.familyStatus),
    isJointDeclaration: parseBool(p, `${prefix}jd`, defaults.isJointDeclaration),
    childrenCount: parseNum(p, `${prefix}ch`, defaults.childrenCount),
    isLoneParent: parseBool(p, `${prefix}lp`, defaults.isLoneParent),
    isSeparateIncome: parseBool(p, `${prefix}si`, defaults.isSeparateIncome),
    grossIncome: parseNum(p, `${prefix}g`, defaults.grossIncome),
    deductionMode: parseEnum(p, `${prefix}d`, DEDUCTION_MODES, defaults.deductionMode),
    realExpenses: parseNum(p, `${prefix}r`, defaults.realExpenses),
    grossIncomeConjoint: parseNum(p, `${prefix}gc`, defaults.grossIncomeConjoint),
    deductionModeConjoint: parseEnum(p, `${prefix}dc`, DEDUCTION_MODES, defaults.deductionModeConjoint),
    realExpensesConjoint: parseNum(p, `${prefix}rc`, defaults.realExpensesConjoint),
    isCadre: parseBool(p, `${prefix}ca`, defaults.isCadre),
    overtimeGross: parseNum(p, `${prefix}ot`, defaults.overtimeGross),
    hasMutuelle: parseBool(p, `${prefix}mu`, defaults.hasMutuelle),
    mutuelleMonthly: parseNum(p, `${prefix}mm`, defaults.mutuelleMonthly),
    isCadreConjoint: parseBool(p, `${prefix}cca`, defaults.isCadreConjoint),
    overtimeGrossConjoint: parseNum(p, `${prefix}cot`, defaults.overtimeGrossConjoint),
    hasMutuelleConjoint: parseBool(p, `${prefix}cmu`, defaults.hasMutuelleConjoint),
    mutuelleMonthlyConjoint: parseNum(p, `${prefix}cmm`, defaults.mutuelleMonthlyConjoint),
    companySize: parseEnum(p, `${prefix}cs`, COMPANY_SIZES, defaults.companySize),
    atmpRate: parseNum(p, `${prefix}at`, defaults.atmpRate),
    hasTransportLevy: parseBool(p, `${prefix}tl`, defaults.hasTransportLevy),
    transportLevyRate: parseNum(p, `${prefix}tr`, defaults.transportLevyRate),
    prevoyanceRate: parseNum(p, `${prefix}pv`, defaults.prevoyanceRate),
    companySizeConjoint: parseEnum(p, `${prefix}ccs`, COMPANY_SIZES, defaults.companySizeConjoint),
    atmpRateConjoint: parseNum(p, `${prefix}cat`, defaults.atmpRateConjoint),
    hasTransportLevyConjoint: parseBool(p, `${prefix}ctl`, defaults.hasTransportLevyConjoint),
    transportLevyRateConjoint: parseNum(p, `${prefix}ctr`, defaults.transportLevyRateConjoint),
    prevoyanceRateConjoint: parseNum(p, `${prefix}cpv`, defaults.prevoyanceRateConjoint),
    // v0.4
    incomeType: parseEnum(p, `${prefix}it`, INCOME_TYPES, defaults.incomeType),
    microTurnover: parseNum(p, `${prefix}mt`, defaults.microTurnover),
    microActivityType: parseEnum(p, `${prefix}ma`, ACTIVITY_TYPES, defaults.microActivityType),
    isVersementLiberatoire: parseBool(p, `${prefix}vl`, defaults.isVersementLiberatoire),
    isAcre: parseBool(p, `${prefix}ac`, defaults.isAcre),
    acreRegime: parseEnum(p, `${prefix}ar`, ACRE_REGIMES, defaults.acreRegime),
  };
}

function writeScenario(p: URLSearchParams, prefix: string, s: ScenarioState): void {
  p.set(`${prefix}fs`, s.familyStatus);
  if (s.isJointDeclaration) p.set(`${prefix}jd`, "1");
  if (s.childrenCount > 0) p.set(`${prefix}ch`, String(s.childrenCount));
  if (s.isLoneParent) p.set(`${prefix}lp`, "1");
  if (s.isSeparateIncome) p.set(`${prefix}si`, "1");
  p.set(`${prefix}g`, String(s.grossIncome));
  if (s.deductionMode !== "forfait_10") p.set(`${prefix}d`, s.deductionMode);
  if (s.realExpenses > 0) p.set(`${prefix}r`, String(s.realExpenses));
  if (s.isSeparateIncome) {
    p.set(`${prefix}gc`, String(s.grossIncomeConjoint));
    if (s.deductionModeConjoint !== "forfait_10") p.set(`${prefix}dc`, s.deductionModeConjoint);
    if (s.realExpensesConjoint > 0) p.set(`${prefix}rc`, String(s.realExpensesConjoint));
    if (s.isCadreConjoint) p.set(`${prefix}cca`, "1");
    if (s.overtimeGrossConjoint > 0) p.set(`${prefix}cot`, String(s.overtimeGrossConjoint));
    if (s.hasMutuelleConjoint) p.set(`${prefix}cmu`, "1");
    if (s.mutuelleMonthlyConjoint > 0) p.set(`${prefix}cmm`, String(s.mutuelleMonthlyConjoint));
  }
  // v0.2 salary fields
  if (s.isCadre) p.set(`${prefix}ca`, "1");
  if (s.overtimeGross > 0) p.set(`${prefix}ot`, String(s.overtimeGross));
  if (s.hasMutuelle) p.set(`${prefix}mu`, "1");
  if (s.mutuelleMonthly > 0) p.set(`${prefix}mm`, String(s.mutuelleMonthly));
  // v0.3 employer fields (only write non-defaults)
  if (s.companySize !== "50_plus") p.set(`${prefix}cs`, s.companySize);
  if (s.atmpRate !== 2.08) p.set(`${prefix}at`, String(s.atmpRate));
  if (s.hasTransportLevy) p.set(`${prefix}tl`, "1");
  if (s.transportLevyRate !== 2.95) p.set(`${prefix}tr`, String(s.transportLevyRate));
  if (s.prevoyanceRate !== 1.50) p.set(`${prefix}pv`, String(s.prevoyanceRate));
  if (s.isSeparateIncome) {
    if (s.companySizeConjoint !== "50_plus") p.set(`${prefix}ccs`, s.companySizeConjoint);
    if (s.atmpRateConjoint !== 2.08) p.set(`${prefix}cat`, String(s.atmpRateConjoint));
    if (s.hasTransportLevyConjoint) p.set(`${prefix}ctl`, "1");
    if (s.transportLevyRateConjoint !== 2.95) p.set(`${prefix}ctr`, String(s.transportLevyRateConjoint));
    if (s.prevoyanceRateConjoint !== 1.50) p.set(`${prefix}cpv`, String(s.prevoyanceRateConjoint));
  }
  // v0.4 micro fields (only write non-defaults)
  if (s.incomeType !== "salarie") p.set(`${prefix}it`, s.incomeType);
  if (s.incomeType === "micro") {
    p.set(`${prefix}mt`, String(s.microTurnover));
    if (s.microActivityType !== "bnc_general") p.set(`${prefix}ma`, s.microActivityType);
    if (s.isVersementLiberatoire) p.set(`${prefix}vl`, "1");
    if (s.isAcre) p.set(`${prefix}ac`, "1");
    if (s.isAcre && s.acreRegime !== "50_pourcent") p.set(`${prefix}ar`, s.acreRegime);
  }
}

function readFromUrl(): UrlState {
  const p = new URLSearchParams(window.location.search);
  const current = readScenario(p, "", defaultScenario);
  return {
    isCompareMode: parseBool(p, "cmp", false),
    current,
    future: readScenario(p, "f_", current),
  };
}

function writeToUrl(state: UrlState): void {
  const p = new URLSearchParams();
  if (state.isCompareMode) p.set("cmp", "1");
  writeScenario(p, "", state.current);
  if (state.isCompareMode) {
    writeScenario(p, "f_", state.future);
  }
  const newUrl = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", newUrl);
}

const defaultState: UrlState = {
  isCompareMode: false,
  current: defaultScenario,
  future: defaultScenario,
};

export function useUrlState() {
  const [state, setState] = useState<UrlState>(defaultState);
  const isInitialized = useRef(false);

  useEffect(() => {
    setState(readFromUrl());
    isInitialized.current = true;
  }, []);

  useEffect(() => {
    if (isInitialized.current) {
      writeToUrl(state);
    }
  }, [state]);

  const update = useCallback((partial: Partial<UrlState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  return { state, update };
}
