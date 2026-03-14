import type { TaxResult } from "../engine";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number): string {
  return value.toFixed(2) + " %";
}

function formatRate(rate: number): string {
  return (rate * 100).toFixed(0) + " %";
}

interface ResultsTableProps {
  result: TaxResult;
  label: string;
}

export function ResultsTable({ result, label }: ResultsTableProps) {
  const rows = [
    { label: "Revenu brut", value: formatCurrency(result.grossIncome) },
    { label: "Abattement", value: "- " + formatCurrency(result.deduction) },
    { label: "Revenu net imposable", value: formatCurrency(result.netTaxableIncome) },
    { label: "Nombre de parts", value: result.parts.toString() },
    { label: "Revenu par part", value: formatCurrency(result.incomePerPart) },
    { label: "Impôt sur le revenu", value: formatCurrency(result.finalTax), highlight: true },
    { label: "Revenu net après IR", value: formatCurrency(result.netAfterTax), highlight: true },
    { label: "TMI", value: formatRate(result.marginalRate) },
    { label: "Taux effectif", value: formatPercent(result.effectiveRate) },
  ];

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>
      <table className="w-full text-sm">
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={row.highlight ? "font-semibold bg-blue-50" : ""}
            >
              <td className="py-1.5 px-2 text-gray-600">{row.label}</td>
              <td className="py-1.5 px-2 text-right tabular-nums">
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bracket breakdown */}
      <details className="mt-2">
        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
          Décomposition par tranche
        </summary>
        <table className="w-full text-xs mt-1">
          <thead>
            <tr className="text-gray-500">
              <th className="text-left py-1 px-2">Tranche</th>
              <th className="text-right py-1 px-2">Taux</th>
              <th className="text-right py-1 px-2">Impôt</th>
            </tr>
          </thead>
          <tbody>
            {result.bracketDetails.map((b) => (
              <tr key={b.floor}>
                <td className="py-0.5 px-2 text-gray-600">
                  {b.ceiling === Infinity
                    ? `> ${b.floor.toLocaleString("fr-FR")} €`
                    : `${b.floor.toLocaleString("fr-FR")} — ${b.ceiling.toLocaleString("fr-FR")} €`}
                </td>
                <td className="text-right py-0.5 px-2">
                  {(b.rate * 100).toFixed(0)} %
                </td>
                <td className="text-right py-0.5 px-2 tabular-nums">
                  {formatCurrency(b.taxInBracket)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}

interface ComparisonTableProps {
  current: TaxResult;
  future: TaxResult;
}

export function ComparisonTable({ current, future }: ComparisonTableProps) {
  const rows = [
    { label: "Revenu brut", cur: current.grossIncome, fut: future.grossIncome },
    { label: "Revenu net imposable", cur: current.netTaxableIncome, fut: future.netTaxableIncome },
    { label: "Impôt sur le revenu", cur: current.finalTax, fut: future.finalTax, highlight: true },
    { label: "Revenu net après IR", cur: current.netAfterTax, fut: future.netAfterTax, highlight: true },
  ];

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">Comparaison</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 text-xs">
            <th className="text-left py-1 px-2"></th>
            <th className="text-right py-1 px-2">Actuel</th>
            <th className="text-right py-1 px-2">Futur</th>
            <th className="text-right py-1 px-2">Delta</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const delta = row.fut - row.cur;
            const deltaClass =
              delta > 0
                ? "text-red-600"
                : delta < 0
                  ? "text-green-600"
                  : "text-gray-400";

            return (
              <tr
                key={row.label}
                className={row.highlight ? "font-semibold bg-blue-50" : ""}
              >
                <td className="py-1.5 px-2 text-gray-600">{row.label}</td>
                <td className="py-1.5 px-2 text-right tabular-nums">
                  {formatCurrency(row.cur)}
                </td>
                <td className="py-1.5 px-2 text-right tabular-nums">
                  {formatCurrency(row.fut)}
                </td>
                <td className={`py-1.5 px-2 text-right tabular-nums ${deltaClass}`}>
                  {delta > 0 ? "+" : ""}
                  {formatCurrency(delta)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
