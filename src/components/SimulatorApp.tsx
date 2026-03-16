import { useState, useMemo, useId } from "react";
import { simulate, simulateCombined } from "../engine";
import type { CombinedInput, CombinedResult } from "../engine";
import { FamilyForm } from "./FamilyForm";
import { ScenarioForm } from "./ScenarioForm";
import { SalaryForm } from "./SalaryForm";
import { ResultsTable, ComparisonTable } from "./ResultsTable";
import { SalaryResultsTable, SalaryComparisonTable } from "./SalaryResultsTable";
import { BreakdownChart } from "./BreakdownChart";
import { EffectiveRateChart } from "./EffectiveRateChart";
import { TaxBracketsTable } from "./TaxBracketsTable";
import { StackedCostChart } from "./StackedCostChart";
import { EmployerForm } from "./EmployerForm";
import { EmployerResultsTable, EmployerComparisonTable } from "./EmployerResultsTable";
import { TabNav } from "./TabNav";
import { useUrlState } from "./useUrlState";
import type { ScenarioState } from "./useUrlState";

const TABS = [
  { id: "situation", label: "Situation" },
  { id: "salaire", label: "Salaire" },
  { id: "ir", label: "Impôt sur le revenu" },
];

function buildCombinedInput(s: ScenarioState): CombinedInput {
  return {
    declarant: {
      grossSalary: s.grossIncome,
      isCadre: s.isCadre,
      overtimeGross: s.overtimeGross,
      hasMutuelle: s.hasMutuelle,
      mutuelleMonthly: s.mutuelleMonthly,
      deductionMode: s.deductionMode,
      realExpenses: s.realExpenses,
      companySize: s.companySize,
      atmpRate: s.atmpRate / 100,
      hasTransportLevy: s.hasTransportLevy,
      transportLevyRate: s.transportLevyRate / 100,
      prevoyanceRate: s.prevoyanceRate / 100,
    },
    conjoint: s.isSeparateIncome
      ? {
          grossSalary: s.grossIncomeConjoint,
          isCadre: s.isCadreConjoint,
          overtimeGross: s.overtimeGrossConjoint,
          hasMutuelle: s.hasMutuelleConjoint,
          mutuelleMonthly: s.mutuelleMonthlyConjoint,
          deductionMode: s.deductionModeConjoint,
          realExpenses: s.realExpensesConjoint,
          companySize: s.companySizeConjoint,
          atmpRate: s.atmpRateConjoint / 100,
          hasTransportLevy: s.hasTransportLevyConjoint,
          transportLevyRate: s.transportLevyRateConjoint / 100,
          prevoyanceRate: s.prevoyanceRateConjoint / 100,
        }
      : null,
    familyStatus: s.familyStatus,
    isJointDeclaration: s.isJointDeclaration,
    childrenCount: s.childrenCount,
    isLoneParent: s.isLoneParent,
  };
}

function SituationBlock({
  label,
  scenario,
  onChange,
}: {
  label: string;
  scenario: ScenarioState;
  onChange: (s: ScenarioState) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-bold text-gray-800 mb-4">{label}</h2>
      <div className="grid md:grid-cols-3 gap-6">
        <FamilyForm
          familyStatus={scenario.familyStatus}
          isJointDeclaration={scenario.isJointDeclaration}
          childrenCount={scenario.childrenCount}
          isLoneParent={scenario.isLoneParent}
          isSeparateIncome={scenario.isSeparateIncome}
          onChange={(v) =>
            onChange({
              ...scenario,
              familyStatus: v.familyStatus,
              isJointDeclaration: v.isJointDeclaration,
              childrenCount: v.childrenCount,
              isLoneParent: v.isLoneParent,
              isSeparateIncome: v.isSeparateIncome,
            })
          }
        />
        <ScenarioForm
          label="Revenus"
          data={{
            grossIncome: scenario.grossIncome,
            deductionMode: scenario.deductionMode,
            realExpenses: scenario.realExpenses,
            grossIncomeConjoint: scenario.grossIncomeConjoint,
            deductionModeConjoint: scenario.deductionModeConjoint,
            realExpensesConjoint: scenario.realExpensesConjoint,
          }}
          isSeparateIncome={scenario.isSeparateIncome}
          onChange={(data) =>
            onChange({
              ...scenario,
              grossIncome: data.grossIncome,
              deductionMode: data.deductionMode,
              realExpenses: data.realExpenses,
              grossIncomeConjoint: data.grossIncomeConjoint,
              deductionModeConjoint: data.deductionModeConjoint,
              realExpensesConjoint: data.realExpensesConjoint,
            })
          }
        />
        <div className="space-y-4">
          <SalaryForm
            data={{
              isCadre: scenario.isCadre,
              overtimeGross: scenario.overtimeGross,
              hasMutuelle: scenario.hasMutuelle,
              mutuelleMonthly: scenario.mutuelleMonthly,
            }}
            onChange={(data) =>
              onChange({
                ...scenario,
                isCadre: data.isCadre,
                overtimeGross: data.overtimeGross,
                hasMutuelle: data.hasMutuelle,
                mutuelleMonthly: data.mutuelleMonthly,
              })
            }
          />
          <EmployerForm
            data={{
              companySize: scenario.companySize,
              atmpRate: scenario.atmpRate,
              hasTransportLevy: scenario.hasTransportLevy,
              transportLevyRate: scenario.transportLevyRate,
              prevoyanceRate: scenario.prevoyanceRate,
              isCadre: scenario.isCadre,
            }}
            onChange={(data) =>
              onChange({
                ...scenario,
                companySize: data.companySize,
                atmpRate: data.atmpRate,
                hasTransportLevy: data.hasTransportLevy,
                transportLevyRate: data.transportLevyRate,
                prevoyanceRate: data.prevoyanceRate,
              })
            }
          />
          {scenario.isSeparateIncome && (
            <>
              <hr className="border-gray-200" />
              <p className="text-sm font-medium text-gray-500">Conjoint</p>
              <SalaryForm
                data={{
                  isCadre: scenario.isCadreConjoint,
                  overtimeGross: scenario.overtimeGrossConjoint,
                  hasMutuelle: scenario.hasMutuelleConjoint,
                  mutuelleMonthly: scenario.mutuelleMonthlyConjoint,
                }}
                onChange={(data) =>
                  onChange({
                    ...scenario,
                    isCadreConjoint: data.isCadre,
                    overtimeGrossConjoint: data.overtimeGross,
                    hasMutuelleConjoint: data.hasMutuelle,
                    mutuelleMonthlyConjoint: data.mutuelleMonthly,
                  })
                }
              />
              <EmployerForm
                data={{
                  companySize: scenario.companySizeConjoint,
                  atmpRate: scenario.atmpRateConjoint,
                  hasTransportLevy: scenario.hasTransportLevyConjoint,
                  transportLevyRate: scenario.transportLevyRateConjoint,
                  prevoyanceRate: scenario.prevoyanceRateConjoint,
                  isCadre: scenario.isCadreConjoint,
                }}
                onChange={(data) =>
                  onChange({
                    ...scenario,
                    companySizeConjoint: data.companySize,
                    atmpRateConjoint: data.atmpRate,
                    hasTransportLevyConjoint: data.hasTransportLevy,
                    transportLevyRateConjoint: data.transportLevyRate,
                    prevoyanceRateConjoint: data.prevoyanceRate,
                  })
                }
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

type IRMode = "none" | "foyer" | "individualized";

function computeIndividualizedIR(
  result: CombinedResult,
  member: "declarant" | "conjoint",
): number {
  if (!result.socialConjoint) return result.tax.finalTax;

  const rev1 = result.social.netTaxable;
  const rev2 = result.socialConjoint.netTaxable;
  const irFoyer = result.tax.finalTax;
  const parts = result.tax.parts;

  // Determine who has the lowest income
  const isDeclarantLower = rev1 <= rev2;
  const revLow = isDeclarantLower ? rev1 : rev2;
  const revHigh = isDeclarantLower ? rev2 : rev1;

  // Taux 1: IR on the lower income with half the foyer's parts
  // Half the parts = base 1 + half of children's parts
  // For 3 parts (couple + 2 children): half = 1.5 parts → celibataire + 1 child
  const halfChildrenParts = (parts - 2) / 2; // children's half-parts
  const halfChildren = Math.round(halfChildrenParts * 2); // convert to children count for celibataire

  const irLowResult = simulate({
    declarant: { grossIncome: revLow, deductionMode: "forfait_10", realExpenses: 0 },
    conjoint: null,
    familyStatus: "celibataire",
    isJointDeclaration: false,
    childrenCount: halfChildren,
    isLoneParent: halfChildren > 0,
  });
  const taux1 = revLow > 0 ? irLowResult.finalTax / revLow : 0;

  // Taux 2: residual = (IR_foyer - taux1 * revLow) / revHigh
  const taux2 = revHigh > 0 ? Math.max(0, (irFoyer - taux1 * revLow) / revHigh) : 0;

  if (member === "declarant") {
    return Math.round((isDeclarantLower ? taux1 : taux2) * rev1);
  }
  return Math.round((isDeclarantLower ? taux2 : taux1) * rev2);
}

function SalaryTab({
  result1,
  result2,
  isCompareMode,
}: {
  result1: CombinedResult;
  result2: CombinedResult | null;
  isCompareMode: boolean;
}) {
  const [isDetailView, setIsDetailView] = useState(false);
  const [irMode, setIRMode] = useState<IRMode>("none");
  const irToggleId = useId();

  const viewToggle = (
    <div className="flex items-center gap-2 justify-end">
      <span className={`text-xs ${!isDetailView ? "font-semibold text-gray-700" : "text-gray-400"}`}>
        Synthèse
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isDetailView}
        onClick={() => setIsDetailView(!isDetailView)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          isDetailView ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
            isDetailView ? "translate-x-4.5" : "translate-x-0.5"
          }`}
        />
      </button>
      <span className={`text-xs ${isDetailView ? "font-semibold text-gray-700" : "text-gray-400"}`}>
        Détails
      </span>
    </div>
  );

  function getIRAmount(result: CombinedResult, member: "declarant" | "conjoint"): number | null {
    if (irMode === "none") return null;

    // Single income: full IR goes to declarant
    if (!result.socialConjoint) return result.tax.finalTax;

    if (irMode === "foyer") {
      // Proportional split based on net taxable income
      const rev1 = result.social.netTaxable;
      const rev2 = result.socialConjoint.netTaxable;
      const total = rev1 + rev2;
      if (total === 0) return 0;
      const ratio = member === "declarant" ? rev1 / total : rev2 / total;
      return Math.round(result.tax.finalTax * ratio);
    }

    return computeIndividualizedIR(result, member);
  }

  const irControls = (
    <div className="flex items-center gap-3 text-xs">
      <div className="flex items-center gap-1.5">
        <input
          type="checkbox"
          id={`${irToggleId}-show-ir`}
          checked={irMode !== "none"}
          onChange={(e) => setIRMode(e.target.checked ? "foyer" : "none")}
          className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={`${irToggleId}-show-ir`} className="text-gray-600">
          Inclure l'IR
        </label>
      </div>
      {irMode !== "none" && (
        <select
          value={irMode}
          onChange={(e) => setIRMode(e.target.value as IRMode)}
          className="rounded border border-gray-300 px-2 py-0.5 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="foyer">Taux du foyer</option>
          <option value="individualized">Taux individualisé</option>
        </select>
      )}
    </div>
  );

  if (isCompareMode && result2) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          {irControls}
          {viewToggle}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <EmployerResultsTable
            employer={result1.employer}
            label="Coût employeur — Situation 1"
            isDetailView={isDetailView}
          />
          <EmployerResultsTable
            employer={result2.employer}
            label="Coût employeur — Situation 2"
            isDetailView={isDetailView}
          />
        </div>
        <EmployerComparisonTable
          employer1={result1.employer}
          employer2={result2.employer}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <SalaryResultsTable
            social={result1.social}
            irAmount={getIRAmount(result1, "declarant")}
            label="Salaire — Situation 1"
            isDetailView={isDetailView}
          />
          <SalaryResultsTable
            social={result2.social}
            irAmount={getIRAmount(result2, "declarant")}
            label="Salaire — Situation 2"
            isDetailView={isDetailView}
          />
        </div>
        <SalaryComparisonTable
          social1={result1.social}
          social2={result2.social}
          ir1={result1.tax.finalTax}
          ir2={result2.tax.finalTax}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <StackedCostChart
            social={result1.social}
            employer={result1.employer}
            irAmount={getIRAmount(result1, "declarant") ?? 0}
            label="Répartition — Situation 1"
          />
          <StackedCostChart
            social={result2.social}
            employer={result2.employer}
            irAmount={getIRAmount(result2, "declarant") ?? 0}
            label="Répartition — Situation 2"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {irControls}
        {viewToggle}
      </div>
      <EmployerResultsTable
        employer={result1.employer}
        label="Coût employeur"
        isDetailView={isDetailView}
      />
      <SalaryResultsTable
        social={result1.social}
        irAmount={getIRAmount(result1, "declarant")}
        label="Décomposition du salaire"
        isDetailView={isDetailView}
      />
      <StackedCostChart
        social={result1.social}
        employer={result1.employer}
        irAmount={getIRAmount(result1, "declarant") ?? 0}
        label="Répartition du coût"
      />
    </div>
  );
}

function IRTab({
  result1,
  result2,
  input1,
  input2,
  isCompareMode,
}: {
  result1: CombinedResult;
  result2: CombinedResult | null;
  input1: CombinedInput;
  input2: CombinedInput | null;
  isCompareMode: boolean;
}) {
  const taxInput1 = {
    declarant: {
      grossIncome: result1.social.netTaxable,
      deductionMode: input1.declarant.deductionMode,
      realExpenses: input1.declarant.realExpenses,
    },
    conjoint: result1.socialConjoint
      ? {
          grossIncome: result1.socialConjoint.netTaxable,
          deductionMode: input1.conjoint!.deductionMode,
          realExpenses: input1.conjoint!.realExpenses,
        }
      : null,
    familyStatus: input1.familyStatus,
    isJointDeclaration: input1.isJointDeclaration,
    childrenCount: input1.childrenCount,
    isLoneParent: input1.isLoneParent,
  };

  const taxInput2 = result2 && input2
    ? {
        declarant: {
          grossIncome: result2.social.netTaxable,
          deductionMode: input2.declarant.deductionMode,
          realExpenses: input2.declarant.realExpenses,
        },
        conjoint: result2.socialConjoint
          ? {
              grossIncome: result2.socialConjoint.netTaxable,
              deductionMode: input2.conjoint!.deductionMode,
              realExpenses: input2.conjoint!.realExpenses,
            }
          : null,
        familyStatus: input2.familyStatus,
        isJointDeclaration: input2.isJointDeclaration,
        childrenCount: input2.childrenCount,
        isLoneParent: input2.isLoneParent,
      }
    : null;

  return (
    <div className="space-y-6">
      {isCompareMode && result2 ? (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <ResultsTable result={result1.tax} label="Situation 1" />
            <ResultsTable result={result2.tax} label="Situation 2" />
          </div>
          <ComparisonTable current={result1.tax} future={result2.tax} />
        </>
      ) : (
        <ResultsTable result={result1.tax} label="Résultat IR" />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <BreakdownChart current={result1.tax} future={result2?.tax ?? null} />
        <EffectiveRateChart
          baseInput={taxInput1}
          currentResult={result1.tax}
          futureInput={taxInput2}
          futureResult={result2?.tax ?? null}
        />
      </div>

      <TaxBracketsTable />
    </div>
  );
}

export function SimulatorApp() {
  const { state, update } = useUrlState();
  const { isCompareMode, current, future } = state;
  const [activeTab, setActiveTab] = useState("situation");

  const input1 = useMemo(() => buildCombinedInput(current), [current]);
  const input2 = useMemo(() => buildCombinedInput(future), [future]);

  const result1 = useMemo(() => simulateCombined(input1), [input1]);
  const result2 = useMemo(
    () => (isCompareMode ? simulateCombined(input2) : null),
    [isCompareMode, input2],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Simulateur de revenus
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Barème 2026 (revenus 2025) — Estimation indicative
        </p>
      </header>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="compare-mode"
          checked={isCompareMode}
          onChange={(e) => {
            if (e.target.checked) {
              update({ isCompareMode: true, future: { ...current } });
            } else {
              update({ isCompareMode: false });
            }
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="compare-mode" className="text-sm font-medium text-gray-700">
          Comparer deux situations
        </label>
      </div>

      <TabNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div role="tabpanel">
        {activeTab === "situation" && (
          <div className="space-y-6">
            <SituationBlock
              label={isCompareMode ? "Situation 1" : "Ma situation"}
              scenario={current}
              onChange={(s) => update({ current: s })}
            />
            {isCompareMode && (
              <SituationBlock
                label="Situation 2"
                scenario={future}
                onChange={(s) => update({ future: s })}
              />
            )}
          </div>
        )}

        {activeTab === "salaire" && (
          <SalaryTab result1={result1} result2={result2} isCompareMode={isCompareMode} />
        )}

        {activeTab === "ir" && (
          <IRTab
            result1={result1}
            result2={result2}
            input1={input1}
            input2={isCompareMode ? input2 : null}
            isCompareMode={isCompareMode}
          />
        )}
      </div>

      <footer className="text-xs text-gray-400 pt-4 border-t border-gray-100">
        <p>
          Ce simulateur fournit une estimation indicative. Les résultats ne
          constituent pas un avis fiscal. Consultez le{" "}
          <a
            href="https://www.impots.gouv.fr/simulateur"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-600"
          >
            simulateur officiel impots.gouv.fr
          </a>{" "}
          pour une validation.
        </p>
      </footer>
    </div>
  );
}
