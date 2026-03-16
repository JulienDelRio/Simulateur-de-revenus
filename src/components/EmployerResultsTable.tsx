import type { EmployerResult } from "../engine";
import { groupByFamily } from "./contributionFamilies";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCurrencyInt(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

interface EmployerResultsTableProps {
  employer: EmployerResult;
  label: string;
  isDetailView: boolean;
}

export function EmployerResultsTable({ employer, label, isDetailView }: EmployerResultsTableProps) {
  const families = groupByFamily(employer.contributions);

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr className="font-semibold bg-purple-50">
            <td className="py-1.5 px-2">Super brut (coût employeur)</td>
            <td className="py-1.5 px-2 text-right tabular-nums">
              {formatCurrencyInt(employer.superBrut)}
            </td>
          </tr>

          {isDetailView
            ? employer.contributions.map((c, i) => (
                <tr key={i} className="text-gray-400">
                  <td className="py-0.5 px-2 pl-4 text-xs">
                    {c.label}
                    <span className="ml-1 text-gray-300">
                      ({(c.rate * 100).toFixed(2)} % sur {formatCurrencyInt(c.base)})
                    </span>
                  </td>
                  <td className="py-0.5 px-2 text-right tabular-nums text-xs">
                    - {formatCurrency(c.amount)}
                  </td>
                </tr>
              ))
            : families.map((f) => (
                <tr key={f.name} className="text-gray-400">
                  <td className="py-0.5 px-2 pl-4 text-xs">{f.name}</td>
                  <td className="py-0.5 px-2 text-right tabular-nums text-xs">
                    - {formatCurrency(f.amount)}
                  </td>
                </tr>
              ))}

          <tr className="border-t border-gray-100">
            <td className="py-1 px-2 text-gray-600 text-sm">
              Total cotisations patronales ({employer.contributionRate.toFixed(1)} %)
            </td>
            <td className="py-1 px-2 text-right tabular-nums text-sm">
              - {formatCurrency(employer.totalContributions)}
            </td>
          </tr>

          {employer.rgdu.isEligible && employer.rgdu.amount > 0 && (
            <tr className="text-green-600">
              <td className="py-0.5 px-2 text-sm">
                RGDU
                {isDetailView && (
                  <span className="text-xs ml-1">
                    (coeff. {employer.rgdu.coefficient.toFixed(4)})
                  </span>
                )}
              </td>
              <td className="py-0.5 px-2 text-right tabular-nums text-sm">
                + {formatCurrency(employer.rgdu.amount)}
              </td>
            </tr>
          )}

          <tr className="font-semibold bg-gray-50 border-t border-gray-200">
            <td className="py-1.5 px-2">Salaire brut</td>
            <td className="py-1.5 px-2 text-right tabular-nums">
              {formatCurrencyInt(employer.grossSalary)}
            </td>
          </tr>

          {isDetailView && (
            <>
              <tr className="border-t border-gray-100">
                <td className="py-1 px-2 text-gray-500 text-xs">Taux cotisations patronales</td>
                <td className="py-1 px-2 text-right tabular-nums text-xs text-gray-500">
                  {employer.contributionRate.toFixed(1)} %
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-gray-500 text-xs">Taux effectif (après RGDU)</td>
                <td className="py-1 px-2 text-right tabular-nums text-xs text-gray-500">
                  {employer.effectiveRate.toFixed(1)} %
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface EmployerComparisonProps {
  employer1: EmployerResult;
  employer2: EmployerResult;
}

export function EmployerComparisonTable({ employer1, employer2 }: EmployerComparisonProps) {
  const rows = [
    { label: "Super brut", v1: employer1.superBrut, v2: employer2.superBrut, highlight: true },
    { label: "Cotisations patronales", v1: employer1.totalContributions, v2: employer2.totalContributions },
    { label: "RGDU", v1: employer1.rgdu.amount, v2: employer2.rgdu.amount },
    { label: "Salaire brut", v1: employer1.grossSalary, v2: employer2.grossSalary, highlight: true },
    { label: "Taux effectif", v1: employer1.effectiveRate, v2: employer2.effectiveRate, isPercent: true },
  ] as const;

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">Comparaison coût employeur</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[360px]">
          <thead>
            <tr className="text-gray-500 text-xs">
              <th className="text-left py-1 px-2"></th>
              <th className="text-right py-1 px-2">Situation 1</th>
              <th className="text-right py-1 px-2">Situation 2</th>
              <th className="text-right py-1 px-2">Delta</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const delta = row.v2 - row.v1;
              const deltaClass =
                delta > 0 ? "text-red-600" : delta < 0 ? "text-green-600" : "text-gray-400";

              const isPct = "isPercent" in row && row.isPercent;
              const fmt = (v: number) => isPct ? `${v.toFixed(1)} %` : formatCurrencyInt(v);

              return (
                <tr key={row.label} className={row.highlight ? "font-semibold bg-purple-50" : ""}>
                  <td className="py-1.5 px-2 text-gray-600">{row.label}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(row.v1)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmt(row.v2)}</td>
                  <td className={`py-1.5 px-2 text-right tabular-nums ${isPct ? "text-gray-500" : deltaClass}`}>
                    {isPct ? "—" : `${delta > 0 ? "+" : ""}${formatCurrencyInt(delta)}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
