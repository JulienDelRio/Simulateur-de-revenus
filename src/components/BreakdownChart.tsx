import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TaxResult } from "../engine";

interface BreakdownChartProps {
  current: TaxResult;
  future: TaxResult | null;
}

function formatK(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString();
}

export function BreakdownChart({ current, future }: BreakdownChartProps) {
  const data = [
    {
      name: "Actuel",
      "Net après IR": current.netAfterTax,
      "Impôt": current.finalTax,
    },
  ];

  if (future) {
    data.push({
      name: "Futur",
      "Net après IR": future.netAfterTax,
      "Impôt": future.finalTax,
    });
  }

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        Répartition brut / impôt / net
      </h3>
      <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={formatK} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number) =>
              new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: "EUR",
                maximumFractionDigits: 0,
              }).format(value)
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="Net après IR"
            stackId="a"
            fill="#3b82f6"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="Impôt"
            stackId="a"
            fill="#f97316"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
