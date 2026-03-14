import { useMemo } from "react";
import { simulate } from "../engine";
import type { TaxInput } from "../engine";
import { FamilyForm } from "./FamilyForm";
import { ScenarioForm } from "./ScenarioForm";
import type { ScenarioData } from "./ScenarioForm";
import { ResultsTable, ComparisonTable } from "./ResultsTable";
import { BreakdownChart } from "./BreakdownChart";
import { EffectiveRateChart } from "./EffectiveRateChart";
import { useUrlState } from "./useUrlState";

function buildInput(
  scenario: ScenarioData,
  familyStatus: string,
  isJointDeclaration: boolean,
  childrenCount: number,
  isLoneParent: boolean,
  isSeparateIncome: boolean,
): TaxInput {
  return {
    declarant: {
      grossIncome: scenario.grossIncome,
      deductionMode: scenario.deductionMode,
      realExpenses: scenario.realExpenses,
    },
    conjoint:
      isSeparateIncome
        ? {
            grossIncome: scenario.grossIncomeConjoint,
            deductionMode: scenario.deductionModeConjoint,
            realExpenses: scenario.realExpensesConjoint,
          }
        : null,
    familyStatus: familyStatus as TaxInput["familyStatus"],
    isJointDeclaration,
    childrenCount,
    isLoneParent,
  };
}

export function SimulatorApp() {
  const { state, update } = useUrlState();

  const {
    familyStatus,
    isJointDeclaration,
    childrenCount,
    isLoneParent,
    isSeparateIncome,
    isCompareMode,
    currentScenario,
    futureScenario,
  } = state;

  // Compute results
  const currentInput = useMemo(
    () =>
      buildInput(
        currentScenario,
        familyStatus,
        isJointDeclaration,
        childrenCount,
        isLoneParent,
        isSeparateIncome,
      ),
    [currentScenario, familyStatus, isJointDeclaration, childrenCount, isLoneParent, isSeparateIncome],
  );

  const futureInput = useMemo(
    () =>
      buildInput(
        futureScenario,
        familyStatus,
        isJointDeclaration,
        childrenCount,
        isLoneParent,
        isSeparateIncome,
      ),
    [futureScenario, familyStatus, isJointDeclaration, childrenCount, isLoneParent, isSeparateIncome],
  );

  const currentResult = useMemo(() => simulate(currentInput), [currentInput]);
  const futureResult = useMemo(
    () => (isCompareMode ? simulate(futureInput) : null),
    [isCompareMode, futureInput],
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Simulateur d'impôt sur le revenu
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Barème 2026 (revenus 2025) — Estimation indicative
        </p>
      </header>

      {/* Forms */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <FamilyForm
            familyStatus={familyStatus}
            isJointDeclaration={isJointDeclaration}
            childrenCount={childrenCount}
            isLoneParent={isLoneParent}
            isSeparateIncome={isSeparateIncome}
            onChange={(v) =>
              update({
                familyStatus: v.familyStatus,
                isJointDeclaration: v.isJointDeclaration,
                childrenCount: v.childrenCount,
                isLoneParent: v.isLoneParent,
                isSeparateIncome: v.isSeparateIncome,
              })
            }
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="compare-mode"
              checked={isCompareMode}
              onChange={(e) => update({ isCompareMode: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="compare-mode" className="text-sm font-medium text-gray-700">
              Comparer deux scénarios
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <ScenarioForm
            label={isCompareMode ? "Scénario actuel" : "Revenus"}
            data={currentScenario}
            isSeparateIncome={isSeparateIncome}
            onChange={(data) => update({ currentScenario: data })}
          />

          {isCompareMode && (
            <ScenarioForm
              label="Scénario futur"
              data={futureScenario}
              isSeparateIncome={isSeparateIncome}
              onChange={(data) => update({ futureScenario: data })}
            />
          )}
        </div>
      </div>

      {/* Results */}
      <section className="space-y-6 pt-4 border-t border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Résultats</h2>

        {isCompareMode && futureResult ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <ResultsTable result={currentResult} label="Actuel" />
              <ResultsTable result={futureResult} label="Futur" />
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
