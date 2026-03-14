import { TAX_BRACKETS } from "../engine";

export function TaxBracketsTable() {
  return (
    <div className="text-xs text-gray-500">
      <p className="font-medium text-gray-600 mb-1">
        Barème IR 2026 (revenus 2025)
      </p>
      <table className="w-full">
        <thead>
          <tr className="text-gray-400">
            <th className="text-left py-0.5">Tranche (par part)</th>
            <th className="text-right py-0.5">Taux</th>
          </tr>
        </thead>
        <tbody>
          {TAX_BRACKETS.map((b) => (
            <tr key={b.floor}>
              <td className="py-0.5">
                {b.ceiling === Infinity
                  ? `Au-delà de ${b.floor.toLocaleString("fr-FR")} €`
                  : `${b.floor.toLocaleString("fr-FR")} — ${b.ceiling.toLocaleString("fr-FR")} €`}
              </td>
              <td className="text-right py-0.5">
                {(b.rate * 100).toFixed(0)} %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
