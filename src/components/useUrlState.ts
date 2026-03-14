import { useState, useEffect, useCallback, useRef } from "react";
import type { FamilyStatus, DeductionMode } from "../engine";

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
}

export interface UrlState {
  isCompareMode: boolean;
  current: ScenarioState;
  future: ScenarioState;
}

const FAMILY_STATUSES: FamilyStatus[] = ["celibataire", "marie_pacse", "veuf"];
const DEDUCTION_MODES: DeductionMode[] = ["forfait_10", "frais_reels"];

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
