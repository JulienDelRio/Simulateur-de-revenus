import { useId } from "react";
import type { ActivityType, AcreRegime } from "../engine";

interface MicroFormData {
  microTurnover: number;
  microActivityType: ActivityType;
  isVersementLiberatoire: boolean;
  isAcre: boolean;
  acreRegime: AcreRegime;
}

interface MicroFormProps {
  data: MicroFormData;
  onChange: (data: MicroFormData) => void;
}

export function MicroForm({ data, onChange }: MicroFormProps) {
  const uid = useId();

  function update(partial: Partial<MicroFormData>) {
    onChange({ ...data, ...partial });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-lg font-semibold text-gray-800">
        Micro-entrepreneur
      </legend>

      {/* CA annuel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Chiffre d'affaires annuel HT (€)
        </label>
        <input
          type="number"
          min={0}
          step={1000}
          value={data.microTurnover || ""}
          placeholder="50000"
          onChange={(e) =>
            update({ microTurnover: Math.max(0, Number(e.target.value) || 0) })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Type d'activité */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type d'activité
        </label>
        <select
          value={data.microActivityType}
          onChange={(e) =>
            update({ microActivityType: e.target.value as ActivityType })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="bic_vente">BIC — Vente de marchandises</option>
          <option value="bic_prestation">BIC — Prestation de services</option>
          <option value="bnc_general">BNC — Régime général</option>
          <option value="bnc_cipav">BNC — CIPAV</option>
        </select>
      </div>

      {/* Versement libératoire */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${uid}-vl`}
          checked={data.isVersementLiberatoire}
          onChange={(e) =>
            update({ isVersementLiberatoire: e.target.checked })
          }
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={`${uid}-vl`} className="text-sm text-gray-700">
          Versement libératoire de l'IR
        </label>
      </div>

      {/* ACRE */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`${uid}-acre`}
          checked={data.isAcre}
          onChange={(e) => update({ isAcre: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={`${uid}-acre`} className="text-sm text-gray-700">
          ACRE (aide à la création)
        </label>
      </div>

      {data.isAcre && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Régime ACRE
          </label>
          <select
            value={data.acreRegime}
            onChange={(e) =>
              update({ acreRegime: e.target.value as AcreRegime })
            }
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="50_pourcent">
              50 % (création avant 01/07/2026)
            </option>
            <option value="25_pourcent">
              25 % (création à partir du 01/07/2026)
            </option>
          </select>
        </div>
      )}
    </fieldset>
  );
}
