import { useState, useEffect, useCallback, useRef } from "react";
import type { FamilyStatus, DeductionMode } from "../engine";
import type { ScenarioData } from "./ScenarioForm";

interface UrlState {
  familyStatus: FamilyStatus;
  isJointDeclaration: boolean;
  childrenCount: number;
  isLoneParent: boolean;
  isSeparateIncome: boolean;
  isCompareMode: boolean;
  currentScenario: ScenarioData;
  futureScenario: ScenarioData;
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

const defaultCurrent: ScenarioData = {
  grossIncome: 30_000,
  deductionMode: "forfait_10",
  realExpenses: 0,
  grossIncomeConjoint: 0,
  deductionModeConjoint: "forfait_10",
  realExpensesConjoint: 0,
};

const defaultFuture: ScenarioData = {
  ...defaultCurrent,
  grossIncome: 35_000,
};

function readFromUrl(): UrlState {
  const p = new URLSearchParams(window.location.search);

  return {
    familyStatus: parseEnum(p, "fs", FAMILY_STATUSES, "celibataire"),
    isJointDeclaration: parseBool(p, "jd", false),
    childrenCount: parseNum(p, "ch", 0),
    isLoneParent: parseBool(p, "lp", false),
    isSeparateIncome: parseBool(p, "si", false),
    isCompareMode: parseBool(p, "cmp", false),
    currentScenario: {
      grossIncome: parseNum(p, "g1", defaultCurrent.grossIncome),
      deductionMode: parseEnum(p, "d1", DEDUCTION_MODES, "forfait_10"),
      realExpenses: parseNum(p, "r1", 0),
      grossIncomeConjoint: parseNum(p, "gc1", 0),
      deductionModeConjoint: parseEnum(p, "dc1", DEDUCTION_MODES, "forfait_10"),
      realExpensesConjoint: parseNum(p, "rc1", 0),
    },
    futureScenario: {
      grossIncome: parseNum(p, "g2", defaultFuture.grossIncome),
      deductionMode: parseEnum(p, "d2", DEDUCTION_MODES, "forfait_10"),
      realExpenses: parseNum(p, "r2", 0),
      grossIncomeConjoint: parseNum(p, "gc2", 0),
      deductionModeConjoint: parseEnum(p, "dc2", DEDUCTION_MODES, "forfait_10"),
      realExpensesConjoint: parseNum(p, "rc2", 0),
    },
  };
}

function writeToUrl(state: UrlState): void {
  const p = new URLSearchParams();

  p.set("fs", state.familyStatus);
  if (state.isJointDeclaration) p.set("jd", "1");
  if (state.childrenCount > 0) p.set("ch", String(state.childrenCount));
  if (state.isLoneParent) p.set("lp", "1");
  if (state.isSeparateIncome) p.set("si", "1");
  if (state.isCompareMode) p.set("cmp", "1");

  // Current scenario
  p.set("g1", String(state.currentScenario.grossIncome));
  if (state.currentScenario.deductionMode !== "forfait_10")
    p.set("d1", state.currentScenario.deductionMode);
  if (state.currentScenario.realExpenses > 0)
    p.set("r1", String(state.currentScenario.realExpenses));
  if (state.isSeparateIncome) {
    p.set("gc1", String(state.currentScenario.grossIncomeConjoint));
    if (state.currentScenario.deductionModeConjoint !== "forfait_10")
      p.set("dc1", state.currentScenario.deductionModeConjoint);
    if (state.currentScenario.realExpensesConjoint > 0)
      p.set("rc1", String(state.currentScenario.realExpensesConjoint));
  }

  // Future scenario (only if compare mode)
  if (state.isCompareMode) {
    p.set("g2", String(state.futureScenario.grossIncome));
    if (state.futureScenario.deductionMode !== "forfait_10")
      p.set("d2", state.futureScenario.deductionMode);
    if (state.futureScenario.realExpenses > 0)
      p.set("r2", String(state.futureScenario.realExpenses));
    if (state.isSeparateIncome) {
      p.set("gc2", String(state.futureScenario.grossIncomeConjoint));
      if (state.futureScenario.deductionModeConjoint !== "forfait_10")
        p.set("dc2", state.futureScenario.deductionModeConjoint);
      if (state.futureScenario.realExpensesConjoint > 0)
        p.set("rc2", String(state.futureScenario.realExpensesConjoint));
    }
  }

  const newUrl = `${window.location.pathname}?${p.toString()}`;
  window.history.replaceState(null, "", newUrl);
}

const defaultState: UrlState = {
  familyStatus: "celibataire",
  isJointDeclaration: false,
  childrenCount: 0,
  isLoneParent: false,
  isSeparateIncome: false,
  isCompareMode: false,
  currentScenario: defaultCurrent,
  futureScenario: defaultFuture,
};

export function useUrlState() {
  const [state, setState] = useState<UrlState>(defaultState);
  const isInitialized = useRef(false);

  // Read URL params on client mount
  useEffect(() => {
    setState(readFromUrl());
    isInitialized.current = true;
  }, []);

  // Sync state changes to URL (skip initial mount)
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
