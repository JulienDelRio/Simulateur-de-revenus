import type { SocialResult } from "../engine";

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

interface SalaryResultsTableProps {
  social: SocialResult;
  irAmount: number;
  label: string;
}

export function SalaryResultsTable({
  social,
  irAmount,
  label,
}: SalaryResultsTableProps) {
  const netAfterIR = social.netBeforeIR - irAmount;
  const monthlyNet = Math.round((netAfterIR / 12) * 100) / 100;

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>
      <table className="w-full text-sm">
        <tbody>
          <tr>
            <td className="py-1.5 px-2 text-gray-600">Salaire brut</td>
            <td className="py-1.5 px-2 text-right tabular-nums">
              {formatCurrencyInt(social.grossSalary)}
            </td>
          </tr>

          {/* Contribution lines */}
          {social.contributions.map((c, i) => (
            <tr key={i} className="text-gray-400">
              <td className="py-0.5 px-2 pl-4 text-xs">
                {c.label}
                <span className="ml-1 text-gray-300">
                  ({(c.rate * 100).toFixed(2)} %)
                </span>
              </td>
              <td className="py-0.5 px-2 text-right tabular-nums text-xs">
                - {formatCurrency(c.amount)}
              </td>
            </tr>
          ))}

          <tr className="border-t border-gray-100">
            <td className="py-1 px-2 text-gray-600 text-sm">
              Total cotisations ({social.contributionRate.toFixed(1)} %)
            </td>
            <td className="py-1 px-2 text-right tabular-nums text-sm">
              - {formatCurrency(social.totalContributions)}
            </td>
          </tr>

          {social.overtimeRelief > 0 && (
            <tr className="text-green-600">
              <td className="py-0.5 px-2 text-sm">
                Réduction HS
                {social.overtimeIRExemption > 0 && (
                  <span className="text-xs text-green-500 ml-1">
                    (économie IR : {formatCurrency(social.overtimeIRExemption)})
                  </span>
                )}
              </td>
              <td className="py-0.5 px-2 text-right tabular-nums text-sm">
                + {formatCurrency(social.overtimeRelief)}
              </td>
            </tr>
          )}

          {social.mutuelleAnnual > 0 && (
            <tr>
              <td className="py-0.5 px-2 text-gray-600 text-sm">Mutuelle</td>
              <td className="py-0.5 px-2 text-right tabular-nums text-sm">
                - {formatCurrency(social.mutuelleAnnual)}
              </td>
            </tr>
          )}

          <tr className="font-semibold bg-gray-50 border-t border-gray-200">
            <td className="py-1.5 px-2">Net avant impôt</td>
            <td className="py-1.5 px-2 text-right tabular-nums">
              {formatCurrencyInt(social.netBeforeIR)}
            </td>
          </tr>

          <tr>
            <td className="py-1 px-2 text-gray-600">
              Net imposable
              {social.overtimeIRExemption > 0 && (
                <span className="text-xs text-gray-400 ml-1">
                  (exo HS : {formatCurrency(social.overtimeIRExemption)})
                </span>
              )}
            </td>
            <td className="py-1 px-2 text-right tabular-nums">
              {formatCurrencyInt(social.netTaxable)}
            </td>
          </tr>

          <tr>
            <td className="py-1 px-2 text-gray-600">Impôt sur le revenu</td>
            <td className="py-1 px-2 text-right tabular-nums">
              - {formatCurrencyInt(irAmount)}
            </td>
          </tr>

          <tr className="font-semibold bg-blue-50 border-t border-gray-200">
            <td className="py-1.5 px-2">Net après impôt</td>
            <td className="py-1.5 px-2 text-right tabular-nums">
              {formatCurrencyInt(netAfterIR)}
            </td>
          </tr>

          <tr className="bg-blue-50">
            <td className="py-1.5 px-2 text-sm">Net mensuel</td>
            <td className="py-1.5 px-2 text-right tabular-nums text-sm">
              {formatCurrency(monthlyNet)} /mois
            </td>
          </tr>

          {/* Rates summary */}
          <tr className="border-t border-gray-100">
            <td className="py-1 px-2 text-gray-500 text-xs">Taux de cotisations</td>
            <td className="py-1 px-2 text-right tabular-nums text-xs text-gray-500">
              {social.contributionRate.toFixed(1)} %
            </td>
          </tr>
          {social.grossSalary > 0 && (
            <tr>
              <td className="py-1 px-2 text-gray-500 text-xs">Taux effectif IR</td>
              <td className="py-1 px-2 text-right tabular-nums text-xs text-gray-500">
                {(irAmount / social.grossSalary * 100).toFixed(1)} %
              </td>
            </tr>
          )}
          <tr>
            <td className="py-1 px-2 text-gray-500 text-xs">Taux global de prélèvement</td>
            <td className="py-1 px-2 text-right tabular-nums text-xs text-gray-500">
              {social.grossSalary > 0
                ? ((social.grossSalary - netAfterIR) / social.grossSalary * 100).toFixed(1)
                : "0.0"} %
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2 px-2">
        PASS 2026 : 48 060 € — Barème cotisations 2026
      </p>
    </div>
  );
}

interface SalaryComparisonProps {
  social1: SocialResult;
  social2: SocialResult;
  ir1: number;
  ir2: number;
}

export function SalaryComparisonTable({
  social1, social2, ir1, ir2,
}: SalaryComparisonProps) {
  const net1 = social1.netBeforeIR - ir1;
  const net2 = social2.netBeforeIR - ir2;
  const rate1 = social1.grossSalary > 0 ? (social1.grossSalary - net1) / social1.grossSalary * 100 : 0;
  const rate2 = social2.grossSalary > 0 ? (social2.grossSalary - net2) / social2.grossSalary * 100 : 0;
  const rows = [
    { label: "Salaire brut", v1: social1.grossSalary, v2: social2.grossSalary },
    { label: "Cotisations", v1: social1.totalContributions, v2: social2.totalContributions },
    { label: "Net avant IR", v1: social1.netBeforeIR, v2: social2.netBeforeIR },
    { label: "Impôt IR", v1: ir1, v2: ir2, highlight: true },
    { label: "Net après IR", v1: net1, v2: net2, highlight: true },
    { label: "Net mensuel", v1: Math.round((net1 / 12) * 100) / 100, v2: Math.round((net2 / 12) * 100) / 100, highlight: true },
    { label: "Taux prélèvement", v1: Math.round(rate1 * 10) / 10, v2: Math.round(rate2 * 10) / 10, isPercent: true },
  ] as const;

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">Comparaison salaire</h3>
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
                delta > 0 ? "text-green-600" : delta < 0 ? "text-red-600" : "text-gray-400";

              const isPct = "isPercent" in row && row.isPercent;
              const fmt = (v: number) => isPct ? `${v.toFixed(1)} %` : formatCurrencyInt(v);

              return (
                <tr key={row.label} className={row.highlight ? "font-semibold bg-blue-50" : ""}>
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
