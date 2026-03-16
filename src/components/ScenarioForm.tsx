import type { DeductionMode } from "../engine";

export interface ScenarioData {
  grossIncome: number;
  deductionMode: DeductionMode;
  realExpenses: number;
  // Separate income mode
  grossIncomeConjoint: number;
  deductionModeConjoint: DeductionMode;
  realExpensesConjoint: number;
}

interface ScenarioFormProps {
  label: string;
  data: ScenarioData;
  isSeparateIncome: boolean;
  onChange: (data: ScenarioData) => void;
}

function IncomeBlock({
  label,
  grossIncome,
  deductionMode,
  realExpenses,
  onChange,
}: {
  label: string;
  grossIncome: number;
  deductionMode: DeductionMode;
  realExpenses: number;
  onChange: (values: {
    grossIncome: number;
    deductionMode: DeductionMode;
    realExpenses: number;
  }) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} (€/an)
        </label>
        <input
          type="number"
          min={0}
          step={100}
          value={grossIncome || ""}
          placeholder="0"
          onChange={(e) =>
            onChange({
              grossIncome: Math.max(0, Number(e.target.value) || 0),
              deductionMode,
              realExpenses,
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Abattement
        </label>
        <select
          value={deductionMode}
          onChange={(e) =>
            onChange({
              grossIncome,
              deductionMode: e.target.value as DeductionMode,
              realExpenses,
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="forfait_10">Forfait 10 %</option>
          <option value="frais_reels">Frais réels</option>
        </select>
      </div>

      {deductionMode === "frais_reels" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frais réels (€)
          </label>
          <input
            type="number"
            min={0}
            step={100}
            value={realExpenses || ""}
            placeholder="0"
            onChange={(e) =>
              onChange({
                grossIncome,
                deductionMode,
                realExpenses: Math.max(0, Number(e.target.value) || 0),
              })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}

export function ScenarioForm({
  label,
  data,
  isSeparateIncome,
  onChange,
}: ScenarioFormProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-gray-800">{label}</legend>

      {isSeparateIncome ? (
        <div className="space-y-4">
          <IncomeBlock
            label="Salaire brut — Déclarant"
            grossIncome={data.grossIncome}
            deductionMode={data.deductionMode}
            realExpenses={data.realExpenses}
            onChange={(v) =>
              onChange({
                ...data,
                grossIncome: v.grossIncome,
                deductionMode: v.deductionMode,
                realExpenses: v.realExpenses,
              })
            }
          />
          <hr className="border-gray-200" />
          <IncomeBlock
            label="Salaire brut — Conjoint"
            grossIncome={data.grossIncomeConjoint}
            deductionMode={data.deductionModeConjoint}
            realExpenses={data.realExpensesConjoint}
            onChange={(v) =>
              onChange({
                ...data,
                grossIncomeConjoint: v.grossIncome,
                deductionModeConjoint: v.deductionMode,
                realExpensesConjoint: v.realExpenses,
              })
            }
          />
        </div>
      ) : (
        <IncomeBlock
          label="Salaire brut annuel"
          grossIncome={data.grossIncome}
          deductionMode={data.deductionMode}
          realExpenses={data.realExpenses}
          onChange={(v) =>
            onChange({
              ...data,
              grossIncome: v.grossIncome,
              deductionMode: v.deductionMode,
              realExpenses: v.realExpenses,
            })
          }
        />
      )}
    </fieldset>
  );
}
