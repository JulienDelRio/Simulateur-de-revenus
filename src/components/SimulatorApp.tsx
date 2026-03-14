import { useMemo } from "react";
import { simulate } from "../engine";
import type { TaxInput } from "../engine";
import { FamilyForm } from "./FamilyForm";
import { ScenarioForm } from "./ScenarioForm";
import { ResultsTable, ComparisonTable } from "./ResultsTable";
import { BreakdownChart } from "./BreakdownChart";
import { EffectiveRateChart } from "./EffectiveRateChart";
import { useUrlState } from "./useUrlState";
import type { ScenarioState } from "./useUrlState";

function buildInput(s: ScenarioState): TaxInput {
  return {
    declarant: {
      grossIncome: s.grossIncome,
      deductionMode: s.deductionMode,
      realExpenses: s.realExpenses,
    },
    conjoint: s.isSeparateIncome
      ? {
          grossIncome: s.grossIncomeConjoint,
          deductionMode: s.deductionModeConjoint,
          realExpenses: s.realExpensesConjoint,
        }
      : null,
    familyStatus: s.familyStatus,
    isJointDeclaration: s.isJointDeclaration,
    childrenCount: s.childrenCount,
    isLoneParent: s.isLoneParent,
  };
}

function ScenarioBlock({
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
      <div className="grid md:grid-cols-2 gap-6">
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
      </div>
    </div>
  );
}

export function SimulatorApp() {
  const { state, update } = useUrlState();
  const { isCompareMode, current, future } = state;

  const currentInput = useMemo(() => buildInput(current), [current]);
  const futureInput = useMemo(() => buildInput(future), [future]);

  const currentResult = useMemo(() => simulate(currentInput), [currentInput]);
  const futureResult = useMemo(
    () => (isCompareMode ? simulate(futureInput) : null),
    [isCompareMode, futureInput],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Simulateur d'impôt sur le revenu
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Barème 2026 (revenus 2025) — Estimation indicative
        </p>
      </header>

      {/* Compare toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="compare-mode"
          checked={isCompareMode}
          onChange={(e) => {
            const checked = e.target.checked;
            if (checked) {
              // Clone current scenario into future
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

      {/* Forms */}
      <ScenarioBlock
        label={isCompareMode ? "Situation 1" : "Ma situation"}
        scenario={current}
        onChange={(s) => update({ current: s })}
      />

      {isCompareMode && (
        <ScenarioBlock
          label="Situation 2"
          scenario={future}
          onChange={(s) => update({ future: s })}
        />
      )}

      {/* Results */}
      <section className="space-y-6 pt-4 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Résultats</h2>

        {isCompareMode && futureResult ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <ResultsTable result={currentResult} label="Situation 1" />
              <ResultsTable result={futureResult} label="Situation 2" />
            </div>
            <ComparisonTable current={currentResult} future={futureResult} />
          </>
        ) : (
          <ResultsTable result={currentResult} label="Résultat" />
        )}
      </section>

      {/* Charts */}
      <section className="space-y-6 pt-4 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Graphiques</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <BreakdownChart current={currentResult} future={futureResult} />
          <EffectiveRateChart
            baseInput={currentInput}
            currentResult={currentResult}
            futureInput={isCompareMode ? futureInput : null}
            futureResult={futureResult}
          />
        </div>
      </section>

      {/* Disclaimer */}
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
