import { useId } from "react";

interface SalaryFormData {
  isCadre: boolean;
  overtimeGross: number;
  hasMutuelle: boolean;
  mutuelleMonthly: number;
}

interface SalaryFormProps {
  data: SalaryFormData;
  onChange: (data: SalaryFormData) => void;
}

export function SalaryForm({ data, onChange }: SalaryFormProps) {
  const uid = useId();
  function update(partial: Partial<SalaryFormData>) {
    const next = { ...data, ...partial };
    if (partial.hasMutuelle === false) next.mutuelleMonthly = 0;
    onChange(next);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-gray-800">
        Statut salarié
      </legend>

      {/* Cadre / Non-cadre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Statut professionnel
        </label>
        <select
          value={data.isCadre ? "cadre" : "non_cadre"}
          onChange={(e) => update({ isCadre: e.target.value === "cadre" })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="non_cadre">Non-cadre</option>
          <option value="cadre">Cadre</option>
        </select>
      </div>

      {/* Heures supplémentaires */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Heures supplémentaires brutes annuelles (€)
        </label>
        <input
          type="number"
          min={0}
          step={100}
          value={data.overtimeGross || ""}
          placeholder="0"
          onChange={(e) =>
            update({ overtimeGross: Math.max(0, Number(e.target.value) || 0) })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-0.5">
          Incluses dans le salaire brut. Exonérées d'IR jusqu'à 7 500 € net/an.
        </p>
      </div>

      {/* Mutuelle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${uid}-has-mutuelle`}
          checked={data.hasMutuelle}
          onChange={(e) => update({ hasMutuelle: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={`${uid}-has-mutuelle`} className="text-sm text-gray-700">
          Mutuelle obligatoire
        </label>
      </div>

      {data.hasMutuelle && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Part salariale mutuelle (€/mois)
          </label>
          <input
            type="number"
            min={0}
            step={5}
            value={data.mutuelleMonthly || ""}
            placeholder="0"
            onChange={(e) =>
              update({ mutuelleMonthly: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </fieldset>
  );
}
