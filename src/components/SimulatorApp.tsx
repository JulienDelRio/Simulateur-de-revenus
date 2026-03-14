import { useState, useMemo } from "react";
import { simulateCombined } from "../engine";
import type { CombinedInput, CombinedResult } from "../engine";
import { FamilyForm } from "./FamilyForm";
import { ScenarioForm } from "./ScenarioForm";
import { SalaryForm } from "./SalaryForm";
import { ResultsTable, ComparisonTable } from "./ResultsTable";
import { SalaryResultsTable, SalaryComparisonTable } from "./SalaryResultsTable";
import { BreakdownChart } from "./BreakdownChart";
import { EffectiveRateChart } from "./EffectiveRateChart";
import { TaxBracketsTable } from "./TaxBracketsTable";
import { WaterfallChart } from "./ContributionsChart";
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
      </div>
    </div>
  );
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
  if (isCompareMode && result2) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <SalaryResultsTable
            social={result1.social}
            irAmount={result1.tax.finalTax}
            netAfterAll={result1.netAfterAll}
            label="Situation 1"
          />
          <SalaryResultsTable
            social={result2.social}
            irAmount={result2.tax.finalTax}
            netAfterAll={result2.netAfterAll}
            label="Situation 2"
          />
        </div>
        <SalaryComparisonTable
          social1={result1.social}
          social2={result2.social}
          ir1={result1.tax.finalTax}
          ir2={result2.tax.finalTax}
          netAfterAll1={result1.netAfterAll}
          netAfterAll2={result2.netAfterAll}
        />
        <div className="grid md:grid-cols-2 gap-6">
          <WaterfallChart
            social={result1.social}
            irAmount={result1.tax.finalTax}
            netAfterAll={result1.netAfterAll}
            label="Du brut au net — Situation 1"
          />
          <WaterfallChart
            social={result2.social}
            irAmount={result2.tax.finalTax}
            netAfterAll={result2.netAfterAll}
            label="Du brut au net — Situation 2"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SalaryResultsTable
        social={result1.social}
        irAmount={result1.tax.finalTax}
        netAfterAll={result1.netAfterAll}
        label="Décomposition du salaire"
      />
      <WaterfallChart
        social={result1.social}
        irAmount={result1.tax.finalTax}
        netAfterAll={result1.netAfterAll}
        label="Du brut au net"
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
