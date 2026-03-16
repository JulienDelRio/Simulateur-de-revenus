import type { MicroCombinedResult } from "../engine";
import { CA_THRESHOLDS } from "../engine/micro/constants";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrencyInt(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatRate(rate: number): string {
  return (rate * 100).toFixed(2).replace(".", ",") + " %";
}

interface MicroResultsTableProps {
  result: MicroCombinedResult;
  label: string;
}

export function MicroResultsTable({ result, label }: MicroResultsTableProps) {
  const { micro, irAmount, totalCharges, netAfterAll, globalRate, monthlyNetAfterAll } = result;
  const isVL = result.tax === null;

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>

      {micro.isAboveThreshold && (
        <div className="rounded-md bg-amber-50 border border-amber-300 p-3 mb-3">
          <p className="text-sm text-amber-800">
            Le CA saisi ({formatCurrencyInt(micro.turnover)} €) dépasse le seuil du régime micro-entrepreneur ({formatCurrencyInt(micro.threshold)} €).
            En cas de dépassement 2 années consécutives, le régime micro n'est plus applicable.
          </p>
        </div>
      )}

      <table className="w-full text-sm">
        <tbody>
          {/* CA */}
          <tr className="border-b border-gray-200 bg-gray-50">
            <td className="py-2 px-2 font-semibold text-gray-800">Chiffre d'affaires HT</td>
            <td className="py-2 px-2 text-right font-semibold">{formatCurrencyInt(micro.turnover)} €</td>
          </tr>

          {/* Cotisations sociales */}
          <tr className="border-b border-gray-100">
            <td className="py-1.5 px-2 text-gray-500 pl-4">
              {micro.socialContributions.label} ({formatRate(micro.socialContributions.rate)})
              {result.micro.socialContributions.rate !== (micro.socialContributions.base > 0 ? micro.socialContributions.amount / micro.socialContributions.base : 0) ? "" : ""}
            </td>
            <td className="py-1.5 px-2 text-right text-red-600">- {formatCurrency(micro.socialContributions.amount)} €</td>
          </tr>

          {/* CFP */}
          <tr className="border-b border-gray-100">
            <td className="py-1.5 px-2 text-gray-500 pl-4">
              {micro.cfp.label} ({formatRate(micro.cfp.rate)})
            </td>
            <td className="py-1.5 px-2 text-right text-red-600">- {formatCurrency(micro.cfp.amount)} €</td>
          </tr>

          {/* Taxe consulaire */}
          {micro.taxeConsulaire.amount > 0 && (
            <tr className="border-b border-gray-100">
              <td className="py-1.5 px-2 text-gray-500 pl-4">
                {micro.taxeConsulaire.label} ({formatRate(micro.taxeConsulaire.rate)})
              </td>
              <td className="py-1.5 px-2 text-right text-red-600">- {formatCurrency(micro.taxeConsulaire.amount)} €</td>
            </tr>
          )}

          {/* Total prélèvements sociaux */}
          <tr className="border-b border-gray-200">
            <td className="py-2 px-2 font-medium text-gray-700">Total prélèvements sociaux</td>
            <td className="py-2 px-2 text-right font-medium text-red-600">- {formatCurrency(micro.totalSocialCharges)} €</td>
          </tr>

          {/* Net avant IR */}
          <tr className="border-b border-gray-200 bg-blue-50">
            <td className="py-2 px-2 font-semibold text-gray-800">Revenu net avant impôt</td>
            <td className="py-2 px-2 text-right font-semibold">{formatCurrencyInt(micro.netBeforeTax)} €</td>
          </tr>

          {/* IR */}
          <tr className="border-b border-gray-100">
            <td className="py-1.5 px-2 text-gray-500 pl-4">
              Impôt sur le revenu ({isVL ? "versement libératoire" : "barème progressif"})
            </td>
            <td className="py-1.5 px-2 text-right text-red-600">- {formatCurrency(irAmount)} €</td>
          </tr>

          {/* Net après IR */}
          <tr className="bg-green-50">
            <td className="py-2 px-2 font-bold text-gray-900">Revenu net après impôt</td>
            <td className="py-2 px-2 text-right font-bold text-green-700">{formatCurrencyInt(netAfterAll)} €</td>
          </tr>

          {/* Mensuel */}
          <tr className="border-t border-gray-200">
            <td className="py-1.5 px-2 text-gray-400 text-xs">Soit par mois</td>
            <td className="py-1.5 px-2 text-right text-gray-400 text-xs">{formatCurrencyInt(monthlyNetAfterAll)} €</td>
          </tr>

          {/* Taux global */}
          <tr>
            <td className="py-1.5 px-2 text-gray-400 text-xs">Taux de prélèvement global</td>
            <td className="py-1.5 px-2 text-right text-gray-400 text-xs">{globalRate.toFixed(2).replace(".", ",")} %</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
