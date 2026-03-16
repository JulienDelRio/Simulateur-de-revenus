import { useId } from "react";
import type { FamilyStatus } from "../engine";

interface FamilyFormProps {
  familyStatus: FamilyStatus;
  isJointDeclaration: boolean;
  childrenCount: number;
  isLoneParent: boolean;
  isSeparateIncome: boolean;
  hideSeparateIncome?: boolean;
  onChange: (values: {
    familyStatus: FamilyStatus;
    isJointDeclaration: boolean;
    childrenCount: number;
    isLoneParent: boolean;
    isSeparateIncome: boolean;
  }) => void;
}

export function FamilyForm({
  familyStatus,
  isJointDeclaration,
  childrenCount,
  isLoneParent,
  isSeparateIncome,
  hideSeparateIncome,
  onChange,
}: FamilyFormProps) {
  const uid = useId();
  const isCouple = familyStatus === "marie_pacse";
  const isSingleWithChildren =
    (familyStatus === "celibataire" || familyStatus === "veuf") &&
    childrenCount > 0;

  function update(partial: Partial<Parameters<typeof onChange>[0]>) {
    const next = {
      familyStatus,
      isJointDeclaration,
      childrenCount,
      isLoneParent,
      isSeparateIncome,
      ...partial,
    };

    // Reset dependent fields
    if (partial.familyStatus) {
      if (partial.familyStatus !== "marie_pacse") {
        next.isJointDeclaration = false;
        next.isSeparateIncome = false;
      } else {
        next.isJointDeclaration = true;
      }
      next.isLoneParent = false;
    }

    if (partial.childrenCount === 0) {
      next.isLoneParent = false;
    }

    onChange(next);
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-gray-800">
        Situation familiale
      </legend>

      {/* Family status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Statut
        </label>
        <select
          value={familyStatus}
          onChange={(e) =>
            update({ familyStatus: e.target.value as FamilyStatus })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="celibataire">Célibataire</option>
          <option value="marie_pacse">Marié(e) / Pacsé(e)</option>
          <option value="veuf">Veuf/Veuve</option>
        </select>
      </div>

      {/* Joint vs separate declaration */}
      {isCouple && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${uid}-joint-declaration`}
            checked={isJointDeclaration}
            onChange={(e) =>
              update({ isJointDeclaration: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`${uid}-joint-declaration`} className="text-sm text-gray-700">
            Déclaration commune
          </label>
        </div>
      )}

      {/* Children count */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre d'enfants à charge
        </label>
        <input
          type="number"
          min={0}
          max={10}
          value={childrenCount}
          onChange={(e) =>
            update({ childrenCount: Math.max(0, Math.min(10, Number(e.target.value) || 0)) })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Lone parent */}
      {isSingleWithChildren && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${uid}-lone-parent`}
            checked={isLoneParent}
            onChange={(e) => update({ isLoneParent: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`${uid}-lone-parent`} className="text-sm text-gray-700">
            Parent isolé (garde exclusive)
          </label>
        </div>
      )}

      {/* Separate income */}
      {isCouple && isJointDeclaration && !hideSeparateIncome && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${uid}-separate-income`}
            checked={isSeparateIncome}
            onChange={(e) => update({ isSeparateIncome: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor={`${uid}-separate-income`} className="text-sm text-gray-700">
            Saisir les revenus séparément (déclarant / conjoint)
          </label>
        </div>
      )}
      {isCouple && isJointDeclaration && hideSeparateIncome && (
        <p className="text-xs text-gray-400">
          La saisie séparée des revenus du conjoint sera disponible en v0.5.
        </p>
      )}
    </fieldset>
  );
}
