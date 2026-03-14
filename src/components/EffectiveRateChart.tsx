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
  futureInput: TaxInput | null;
  futureResult: TaxResult | null;
}

interface CurvePoint {
  income: number;
  rate1: number;
  tax1: number;
  rate2?: number;
  tax2?: number;
  marker1?: boolean;
  marker2?: boolean;
}

function buildCurveData(
  input1: TaxInput,
  input2: TaxInput | null,
  income1: number,
  income2: number | null,
  maxIncome: number,
): CurvePoint[] {
  const step = Math.max(1_000, Math.round(maxIncome / 100 / 1_000) * 1_000);

  const incomes = new Set<number>();
  for (let income = 0; income <= maxIncome; income += step) {
    incomes.add(income);
  }
  incomes.add(income1);
  if (income2 !== null) incomes.add(income2);

  const sorted = [...incomes].sort((a, b) => a - b);

  return sorted.map((income) => {
    const r1 = simulate({
      ...input1,
      declarant: { ...input1.declarant, grossIncome: income },
      conjoint: input1.conjoint ? { ...input1.conjoint } : null,
    });

    const point: CurvePoint = {
      income,
      rate1: r1.effectiveRate,
      tax1: r1.finalTax,
      marker1: income === income1 ? true : undefined,
    };

    if (input2) {
      const r2 = simulate({
        ...input2,
        declarant: { ...input2.declarant, grossIncome: income },
        conjoint: input2.conjoint ? { ...input2.conjoint } : null,
      });
      point.rate2 = r2.effectiveRate;
      point.tax2 = r2.finalTax;
      point.marker2 = income2 !== null && income === income2 ? true : undefined;
    }

    return point;
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
  if (point.marker1) labels.push("Situation 1");
  if (point.marker2) labels.push("Situation 2");

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs space-y-1">
      {labels.length > 0 && (
        <p className="font-semibold text-gray-700">{labels.join(" & ")}</p>
      )}
      <p className="text-gray-600">
        Revenu brut : {formatCurrency(point.income)}
      </p>
      <div className="flex gap-4">
        <div>
          <p className="text-blue-600">Taux S1 : {point.rate1.toFixed(2)} %</p>
          <p className="text-blue-400">IR S1 : {formatCurrency(point.tax1)}</p>
        </div>
        {point.rate2 !== undefined && (
          <div>
            <p className="text-orange-600">Taux S2 : {point.rate2.toFixed(2)} %</p>
            <p className="text-orange-400">IR S2 : {formatCurrency(point.tax2!)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function makeDot(markerKey: "marker1" | "marker2", color: string) {
  return function Dot(props: any) {
    const { cx, cy, payload } = props;
    if (!payload?.[markerKey]) return null;
    return (
      <circle cx={cx} cy={cy} r={7} fill={color} stroke="white" strokeWidth={2} />
    );
  };
}

const Dot1 = makeDot("marker1", "#3b82f6");
const Dot2 = makeDot("marker2", "#f97316");

export function EffectiveRateChart({
  baseInput,
  currentResult,
  futureInput,
  futureResult,
}: EffectiveRateChartProps) {
  const maxScenarioIncome = Math.max(
    currentResult.grossIncome,
    futureResult?.grossIncome ?? 0,
  );
  const maxX = Math.max(50_000, Math.ceil((maxScenarioIncome * 1.5) / 10_000) * 10_000);

  const curveData = buildCurveData(
    baseInput,
    futureInput,
    currentResult.grossIncome,
    futureResult?.grossIncome ?? null,
    maxX,
  );

  const hasTwo = futureResult !== null;

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-2">
        Taux effectif d'imposition
      </h3>
      <div style={{ width: "100%", height: 280 }}>
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
              yAxisId="rate"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              domain={[0, "auto"]}
            />
            <YAxis
              yAxisId="tax"
              orientation="right"
              tick={{ fontSize: 11 }}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`
              }
              domain={[0, "auto"]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Situation 1 curves */}
            <Line
              yAxisId="rate"
              type="monotone"
              dataKey="rate1"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={<Dot1 />}
              activeDot={{ r: 4, fill: "#3b82f6", stroke: "white", strokeWidth: 1 }}
              name="Taux S1"
            />
            <Line
              yAxisId="tax"
              type="monotone"
              dataKey="tax1"
              stroke="#93c5fd"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              activeDot={false}
              name="IR S1"
            />

            {/* Situation 2 curves */}
            {hasTwo && (
              <Line
                yAxisId="rate"
                type="monotone"
                dataKey="rate2"
                stroke="#f97316"
                strokeWidth={2}
                dot={<Dot2 />}
                activeDot={{ r: 4, fill: "#f97316", stroke: "white", strokeWidth: 1 }}
                name="Taux S2"
              />
            )}
            {hasTwo && (
              <Line
                yAxisId="tax"
                type="monotone"
                dataKey="tax2"
                stroke="#fdba74"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
                activeDot={false}
                name="IR S2"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-blue-500" />
          Taux S1
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5 bg-blue-300" style={{ borderTop: "1px dashed" }} />
          IR S1
        </span>
        {hasTwo && (
          <>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 bg-orange-500" />
              Taux S2
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-4 h-0.5 bg-orange-300" style={{ borderTop: "1px dashed" }} />
              IR S2
            </span>
          </>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-full bg-blue-500" />
          Situation 1
        </span>
        {hasTwo && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500" />
            Situation 2
          </span>
        )}
      </div>
    </div>
  );
}
