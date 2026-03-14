import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { simulate } from "../engine";
import type { TaxInput, TaxResult } from "../engine";

interface EffectiveRateChartProps {
  baseInput: TaxInput;
  currentResult: TaxResult;
  futureResult: TaxResult | null;
}

function buildCurveData(baseInput: TaxInput): { income: number; rate: number }[] {
  const points: { income: number; rate: number }[] = [];
  const maxIncome = 200_000;
  const step = 2_000;

  for (let income = 0; income <= maxIncome; income += step) {
    const input: TaxInput = {
      ...baseInput,
      declarant: {
        ...baseInput.declarant,
        grossIncome: income,
      },
      conjoint: baseInput.conjoint
        ? { ...baseInput.conjoint, grossIncome: 0 }
        : null,
    };

    const result = simulate(input);
    points.push({
      income,
      rate: result.effectiveRate,
    });
  }

  return points;
}

export function EffectiveRateChart({
  baseInput,
  currentResult,
  futureResult,
}: EffectiveRateChartProps) {
  const curveData = buildCurveData(baseInput);

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        Taux effectif d'imposition
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={curveData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="income"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()
            }
            label={{
              value: "Revenu brut (€)",
              position: "insideBottom",
              offset: -5,
              fontSize: 11,
            }}
          />
          <YAxis
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v.toFixed(0)}%`}
            domain={[0, "auto"]}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(2)} %`}
            labelFormatter={(v) =>
              `Revenu brut : ${Number(v).toLocaleString("fr-FR")} €`
            }
          />
          <Line
            type="monotone"
            dataKey="rate"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            name="Taux effectif"
          />
          <ReferenceDot
            x={currentResult.grossIncome}
            y={currentResult.effectiveRate}
            r={6}
            fill="#3b82f6"
            stroke="white"
            strokeWidth={2}
          />
          {futureResult && (
            <ReferenceDot
              x={futureResult.grossIncome}
              y={futureResult.effectiveRate}
              r={6}
              fill="#f97316"
              stroke="white"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
          Actuel
        </span>
        {futureResult && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
            Futur
          </span>
        )}
      </div>
    </div>
  );
}
