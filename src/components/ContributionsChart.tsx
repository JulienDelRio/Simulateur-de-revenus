import { useState } from "react";
import type { SocialResult } from "../engine";

interface ChartProps {
  social: SocialResult;
  irAmount: number;
  label?: string;
}

interface FamilyData {
  name: string;
  value: number;
  color: string;
}

const COLORS = {
  net: "#10b981",
  ir: "#ef4444",
  vieillesse: "#3b82f6",
  retraite: "#6366f1",
  csgDeductible: "#14b8a6",
  csgNonDeductible: "#f59e0b",
  mutuelle: "#8b5cf6",
};

function groupByFamily(social: SocialResult): FamilyData[] {
  const families: Record<string, { amount: number; color: string }> = {
    "Vieillesse": { amount: 0, color: COLORS.vieillesse },
    "Retraite complémentaire": { amount: 0, color: COLORS.retraite },
    "CSG déductible": { amount: 0, color: COLORS.csgDeductible },
    "Prélèvements sociaux": { amount: 0, color: COLORS.csgNonDeductible },
  };

  for (const c of social.contributions) {
    if (c.label.startsWith("Vieillesse")) {
      families["Vieillesse"].amount += c.amount;
    } else if (
      c.label.startsWith("Retraite") ||
      c.label.startsWith("CEG") ||
      c.label.startsWith("CET") ||
      c.label.startsWith("APEC")
    ) {
      families["Retraite complémentaire"].amount += c.amount;
    } else if (c.label === "CSG déductible") {
      families["CSG déductible"].amount += c.amount;
    } else {
      families["Prélèvements sociaux"].amount += c.amount;
    }
  }

  return Object.entries(families)
    .filter(([, v]) => v.amount > 0)
    .map(([name, v]) => ({
      name,
      value: Math.round(v.amount * 100) / 100,
      color: v.color,
    }));
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

// --- Waterfall (cascade) ---
// Custom SVG waterfall chart with zoomed Y axis
export function WaterfallChart({ social, irAmount, label }: ChartProps) {
  if (social.grossSalary === 0) return null;

  const netAfterAll = social.netBeforeIR - irAmount;
  const families = groupByFamily(social);

  type Step = { name: string; top: number; bottom: number; color: string; isTotal: boolean };

  const steps: Step[] = [];
  let running = social.grossSalary;

  steps.push({ name: "Brut", top: social.grossSalary, bottom: 0, color: "#6b7280", isTotal: true });

  const sorted = [...families].sort((a, b) => b.value - a.value);
  for (const f of sorted) {
    const newRunning = running - f.value;
    steps.push({ name: f.name, top: running, bottom: newRunning, color: f.color, isTotal: false });
    running = newRunning;
  }
  if (social.overtimeRelief > 0) {
    const newRunning = running + social.overtimeRelief;
    steps.push({ name: "Réduction HS", top: newRunning, bottom: running, color: COLORS.net, isTotal: false });
    running = newRunning;
  }
  if (social.mutuelleAnnual > 0) {
    const newRunning = running - social.mutuelleAnnual;
    steps.push({ name: "Mutuelle", top: running, bottom: newRunning, color: COLORS.mutuelle, isTotal: false });
    running = newRunning;
  }
  if (irAmount > 0) {
    const newRunning = running - irAmount;
    steps.push({ name: "Impôt", top: running, bottom: newRunning, color: COLORS.ir, isTotal: false });
    running = newRunning;
  }
  steps.push({ name: "Net", top: netAfterAll, bottom: 0, color: COLORS.net, isTotal: true });

  // Y axis range: zoom to show details
  const yMin = Math.floor(netAfterAll * 0.9 / 1000) * 1000;
  const yMax = Math.ceil(social.grossSalary * 1.05 / 1000) * 1000;
  const yRange = yMax - yMin;

  const totalDeductions = social.grossSalary - netAfterAll;

  // Chart dimensions
  const svgWidth = 500;
  const svgHeight = 280;
  const marginLeft = 10;
  const marginRight = 10;
  const marginTop = 10;
  const marginBottom = 55;
  const plotW = svgWidth - marginLeft - marginRight;
  const plotH = svgHeight - marginTop - marginBottom;

  const barCount = steps.length;
  const gap = 6;
  const barW = Math.min(40, (plotW - gap * (barCount - 1)) / barCount);
  const totalBarWidth = barCount * barW + (barCount - 1) * gap;
  const offsetX = marginLeft + (plotW - totalBarWidth) / 2;

  function yToPixel(val: number): number {
    return marginTop + plotH - ((val - yMin) / yRange) * plotH;
  }

  // Y axis ticks
  const tickCount = 5;
  const tickStep = Math.ceil(yRange / tickCount / 1000) * 1000;
  const ticks: number[] = [];
  for (let t = Math.ceil(yMin / tickStep) * tickStep; t <= yMax; t += tickStep) {
    ticks.push(t);
  }

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div>
      {label && <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>}

      <div className="flex justify-between text-sm mb-2 px-1">
        <span className="text-gray-500">
          Brut : <span className="font-semibold text-gray-700">{formatCurrency(social.grossSalary)}</span>
        </span>
        <span className="text-gray-500">
          Net : <span className="font-semibold text-green-600">{formatCurrency(netAfterAll)}</span>
        </span>
        <span className="text-gray-500">
          Prélevé : <span className="font-semibold text-red-500">{formatCurrency(totalDeductions)}</span>
          {" "}({(totalDeductions / social.grossSalary * 100).toFixed(1)} %)
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ maxHeight: 280 }}
      >
        {/* Y axis ticks & grid */}
        {ticks.map((t) => {
          const y = yToPixel(t);
          return (
            <g key={t}>
              <line x1={marginLeft} x2={svgWidth - marginRight} y1={y} y2={y} stroke="#e5e7eb" strokeDasharray="3 3" />
              <text x={marginLeft - 2} y={y + 3} textAnchor="end" fontSize={8} fill="#9ca3af">
                {t >= 1000 ? `${(t / 1000).toFixed(0)}k` : t}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {steps.map((step, i) => {
          const x = offsetX + i * (barW + gap);
          const topClamped = Math.min(step.top, yMax);
          const bottomClamped = Math.max(step.isTotal ? 0 : step.bottom, yMin);
          const y1 = yToPixel(topClamped);
          const y2 = yToPixel(bottomClamped);
          const barHeight = Math.max(y2 - y1, 1);

          return (
            <g
              key={i}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ cursor: "pointer" }}
            >
              <rect
                x={x}
                y={y1}
                width={barW}
                height={barHeight}
                fill={step.color}
                rx={3}
                opacity={hoveredIdx !== null && hoveredIdx !== i ? 0.5 : 1}
              />
              {/* Connector line between bars */}
              {i > 0 && i < steps.length - 1 && (
                <line
                  x1={x - gap}
                  x2={x}
                  y1={yToPixel(step.top)}
                  y2={yToPixel(step.top)}
                  stroke="#d1d5db"
                  strokeDasharray="2 2"
                />
              )}
              {/* X label */}
              <text
                x={x + barW / 2}
                y={svgHeight - marginBottom + 12}
                textAnchor="end"
                fontSize={8}
                fill="#6b7280"
                transform={`rotate(-35, ${x + barW / 2}, ${svgHeight - marginBottom + 12})`}
              >
                {step.name}
              </text>
            </g>
          );
        })}

        {/* Tooltip */}
        {hoveredIdx !== null && (() => {
          const step = steps[hoveredIdx];
          const amount = step.isTotal ? step.top : Math.abs(step.top - step.bottom);
          const x = offsetX + hoveredIdx * (barW + gap) + barW / 2;
          const y = yToPixel(step.top) - 8;
          return (
            <text x={x} y={Math.max(y, 12)} textAnchor="middle" fontSize={9} fontWeight="bold" fill={step.color}>
              {formatCurrency(amount)}
            </text>
          );
        })()}
      </svg>
    </div>
  );
}

