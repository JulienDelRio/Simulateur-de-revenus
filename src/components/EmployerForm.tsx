import { useState, useId } from "react";
import type { CompanySize } from "../engine";

interface EmployerFormData {
  companySize: CompanySize;
  atmpRate: number;
  hasTransportLevy: boolean;
  transportLevyRate: number;
  prevoyanceRate: number;
  isCadre: boolean;
}

interface EmployerFormProps {
  data: EmployerFormData;
  onChange: (data: Omit<EmployerFormData, "isCadre">) => void;
}

export function EmployerForm({ data, onChange }: EmployerFormProps) {
  const uid = useId();
  const [isOpen, setIsOpen] = useState(false);

  function update(partial: Partial<Omit<EmployerFormData, "isCadre">>) {
    const next = {
      companySize: data.companySize,
      atmpRate: data.atmpRate,
      hasTransportLevy: data.hasTransportLevy,
      transportLevyRate: data.transportLevyRate,
      prevoyanceRate: data.prevoyanceRate,
      ...partial,
    };
    if (partial.hasTransportLevy === false) next.transportLevyRate = 2.95;
    onChange(next);
  }

  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className="text-sm"
    >
      <summary className="cursor-pointer text-gray-500 hover:text-gray-700 select-none">
        Paramètres employeur
      </summary>

      <div className="mt-2 space-y-3 pl-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Effectif entreprise
          </label>
          <select
            value={data.companySize}
            onChange={(e) => update({ companySize: e.target.value as CompanySize })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="moins_11">Moins de 11 salariés</option>
            <option value="11_49">11 à 49 salariés</option>
            <option value="50_plus">50 salariés et plus</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taux AT/MP (%)
          </label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.01}
            value={data.atmpRate}
            onChange={(e) => update({ atmpRate: Math.max(0, Number(e.target.value) || 0) })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-0.5">
            Taux moyen national : 2,08 %. Variable par entreprise.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${uid}-transport`}
            checked={data.hasTransportLevy}
            onChange={(e) => update({ hasTransportLevy: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`${uid}-transport`} className="text-sm text-gray-700">
            Versement mobilité
          </label>
        </div>

        {data.hasTransportLevy && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux versement mobilité (%)
            </label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.05}
              value={data.transportLevyRate}
              onChange={(e) => update({ transportLevyRate: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-0.5">
              Paris : 2,95 %. Variable par commune.
            </p>
          </div>
        )}

        {data.isCadre && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux prévoyance cadres (%)
            </label>
            <input
              type="number"
              min={1.5}
              max={10}
              step={0.1}
              value={data.prevoyanceRate}
              onChange={(e) => update({ prevoyanceRate: Math.max(0, Number(e.target.value) || 0) })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-0.5">
              Minimum conventionnel : 1,50 %.
            </p>
          </div>
        )}
      </div>
    </details>
  );
}
