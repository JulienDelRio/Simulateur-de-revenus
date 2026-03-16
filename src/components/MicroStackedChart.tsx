import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { MicroCombinedResult } from "../engine";

function formatCurrencyInt(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface MicroStackedChartProps {
  result: MicroCombinedResult;
  label: string;
}

export function MicroStackedChart({ result, label }: MicroStackedChartProps) {
  const { micro, irAmount, netAfterAll } = result;

  const data = [
    {
      name: "CA",
      value: micro.turnover,
      color: "#6366f1",
    },
    {
      name: "Cotisations",
      cotisations: micro.socialContributions.amount,
      cfp: micro.cfp.amount,
      taxe: micro.taxeConsulaire.amount,
      net: micro.netBeforeTax,
      color: "#ef4444",
    },
    {
      name: "Net avant IR",
      value: micro.netBeforeTax,
      color: "#3b82f6",
    },
    {
      name: "IR",
      ir: irAmount,
      net: netAfterAll,
      color: "#f97316",
    },
    {
      name: "Net après IR",
      value: netAfterAll,
      color: "#22c55e",
    },
  ];

  // Build stacked data
  const chartData = [
    {
      name: "CA",
      "Net après IR": netAfterAll,
      "Impôt": irAmount,
      "Cotisations sociales": micro.socialContributions.amount,
      "CFP": micro.cfp.amount,
      "Taxe CCI": micro.taxeConsulaire.amount,
    },
    {
      name: "Cotisations",
      "Net après IR": netAfterAll,
      "Impôt": irAmount,
      "Cotisations sociales": 0,
      "CFP": 0,
      "Taxe CCI": 0,
    },
    {
      name: "Net avant IR",
      "Net après IR": netAfterAll,
      "Impôt": irAmount,
      "Cotisations sociales": 0,
      "CFP": 0,
      "Taxe CCI": 0,
    },
    {
      name: "Net après IR",
      "Net après IR": netAfterAll,
      "Impôt": 0,
      "Cotisations sociales": 0,
      "CFP": 0,
      "Taxe CCI": 0,
    },
  ];

  // Simpler approach: 4 columns
  const simpleData = [
    { name: "CA", montant: micro.turnover },
    { name: "Prélèvements\nsociaux", montant: micro.totalSocialCharges },
    { name: "IR", montant: irAmount },
    { name: "Net", montant: netAfterAll },
  ];

  const COLORS = ["#6366f1", "#ef4444", "#f97316", "#22c55e"];

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={simpleData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
              }
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(value: number) => [`${formatCurrencyInt(value)} €`]}
              labelFormatter={(label: string) => label.replace("\n", " ")}
            />
            <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
              {simpleData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
