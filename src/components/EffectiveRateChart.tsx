import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
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

interface CurvePoint {
  income: number;
  rate: number;
  currentMarker?: boolean;
  futureMarker?: boolean;
}

function buildCurveData(
  baseInput: TaxInput,
  maxIncome: number,
  currentIncome: number,
  futureIncome: number | null,
): CurvePoint[] {
  const step = Math.max(1_000, Math.round(maxIncome / 100 / 1_000) * 1_000);

  // Collect all incomes that need a point (regular grid + scenario incomes)
  const incomes = new Set<number>();
  for (let income = 0; income <= maxIncome; income += step) {
    incomes.add(income);
  }
  incomes.add(currentIncome);
  if (futureIncome !== null) incomes.add(futureIncome);

  const sorted = [...incomes].sort((a, b) => a - b);

  return sorted.map((income) => {
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
    return {
      income,
      rate: result.effectiveRate,
      currentMarker: income === currentIncome ? true : undefined,
      futureMarker: futureIncome !== null && income === futureIncome ? true : undefined,
    };
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload as CurvePoint | undefined;
  if (!point) return null;

  const labels: string[] = [];
  if (point.currentMarker) labels.push("Actuel");
  if (point.futureMarker) labels.push("Futur");

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs">
      {labels.length > 0 && (
        <p className="font-semibold text-gray-700">{labels.join(" / ")}</p>
      )}
      <p className="text-gray-600">
        Revenu brut : {formatCurrency(point.income)}
      </p>
      <p className="text-gray-600">
        Taux effectif : {point.rate.toFixed(2)} %
      </p>
    </div>
  );
}

function CustomDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload) return null;

  const dots: React.ReactElement[] = [];

  if (payload.currentMarker) {
    dots.push(
      <circle
        key="current"
        cx={cx}
        cy={cy}
        r={7}
        fill="#3b82f6"
        stroke="white"
        strokeWidth={2}
      />,
    );
  }

  if (payload.futureMarker) {
    dots.push(
      <circle
        key="future"
        cx={cx}
        cy={cy}
        r={7}
        fill="#f97316"
        stroke="white"
        strokeWidth={2}
      />,
    );
  }

  if (dots.length === 0) return null;
  return <g>{dots}</g>;
}

function ActiveDot(props: any) {
  const { cx, cy, payload } = props;
  if (!payload?.currentMarker && !payload?.futureMarker) {
    return <circle cx={cx} cy={cy} r={4} fill="#3b82f6" stroke="white" strokeWidth={1} />;
  }

  const color = payload.futureMarker ? "#f97316" : "#3b82f6";
  return <circle cx={cx} cy={cy} r={9} fill={color} stroke="white" strokeWidth={2} />;
}

export function EffectiveRateChart({
  baseInput,
  currentResult,
  futureResult,
}: EffectiveRateChartProps) {
  const maxScenarioIncome = Math.max(
    currentResult.grossIncome,
    futureResult?.grossIncome ?? 0,
  );
  const maxX = Math.max(50_000, Math.ceil((maxScenarioIncome * 1.5) / 10_000) * 10_000);

  const curveData = buildCurveData(
    baseInput,
    maxX,
    currentResult.grossIncome,
    futureResult?.grossIncome ?? null,
  );

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        Taux effectif d'imposition
      </h3>
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="income"
              type="number"
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
              domain={[0, maxX]}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={<ActiveDot />}
              name="Taux effectif"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
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
