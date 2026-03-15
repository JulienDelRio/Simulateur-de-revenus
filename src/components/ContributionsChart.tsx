import { useState } from "react";
import type { SocialResult, EmployerResult } from "../engine";
import { groupByFamily } from "./contributionFamilies";

interface ChartProps {
  social: SocialResult;
  employer: EmployerResult;
  irAmount: number;
  label?: string;
}

const COLORS = {
  net: "#10b981",
  ir: "#ef4444",
  employer: "#9333ea",
  sante: "#f43f5e",
  retraite: "#6366f1",
  famille: "#f59e0b",
  chomage: "#0ea5e9",
  csgCrds: "#14b8a6",
  prevoyance: "#8b5cf6",
  formation: "#64748b",
  mutuelle: "#a855f7",
  total: "#6b7280",
};

function familyColor(name: string): string {
  if (name === "Santé") return COLORS.sante;
  if (name === "Retraite") return COLORS.retraite;
  if (name === "Famille / Logement") return COLORS.famille;
  if (name === "Chômage") return COLORS.chomage;
  if (name === "CSG / CRDS") return COLORS.csgCrds;
  if (name === "Prévoyance") return COLORS.prevoyance;
  if (name === "Formation / Transport") return COLORS.formation;
  return COLORS.total;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function WaterfallChart({ social, employer, irAmount, label }: ChartProps) {
  if (social.grossSalary === 0) return null;

  const netAfterAll = social.netBeforeIR - irAmount;
  const employerFamilies = groupByFamily(employer.contributions);
  const socialFamilies = groupByFamily(social.contributions);

  type Step = { name: string; top: number; bottom: number; color: string; isTotal: boolean };

  const steps: Step[] = [];
  let running = employer.superBrut;

  // Start: Super brut
  steps.push({ name: "Super brut", top: employer.superBrut, bottom: 0, color: COLORS.employer, isTotal: true });

  // Employer contributions (grouped by family, descending)
  const empSorted = [...employerFamilies].sort((a, b) => b.amount - a.amount);
  for (const f of empSorted) {
    const newRunning = running - f.amount;
    steps.push({ name: f.name, top: running, bottom: newRunning, color: familyColor(f.name), isTotal: false });
    running = newRunning;
  }

  // RGDU (positive step back up)
  if (employer.rgdu.isEligible && employer.rgdu.amount > 0) {
    const newRunning = running + employer.rgdu.amount;
    steps.push({ name: "RGDU", top: newRunning, bottom: running, color: COLORS.net, isTotal: false });
    running = newRunning;
  }

  // Middle: Brut
  steps.push({ name: "Brut", top: social.grossSalary, bottom: 0, color: COLORS.total, isTotal: true });
  running = social.grossSalary;

  // Employee contributions (grouped by family, descending)
  const socSorted = [...socialFamilies].sort((a, b) => b.amount - a.amount);
  for (const f of socSorted) {
    const newRunning = running - f.amount;
    steps.push({ name: f.name, top: running, bottom: newRunning, color: familyColor(f.name), isTotal: false });
    running = newRunning;
  }

  // Overtime relief
  if (social.overtimeRelief > 0) {
    const newRunning = running + social.overtimeRelief;
    steps.push({ name: "Réduction HS", top: newRunning, bottom: running, color: COLORS.net, isTotal: false });
    running = newRunning;
  }

  // Mutuelle
  if (social.mutuelleAnnual > 0) {
    const newRunning = running - social.mutuelleAnnual;
    steps.push({ name: "Mutuelle", top: running, bottom: newRunning, color: COLORS.mutuelle, isTotal: false });
    running = newRunning;
  }

  // IR
  if (irAmount > 0) {
    const newRunning = running - irAmount;
    steps.push({ name: "Impôt", top: running, bottom: newRunning, color: COLORS.ir, isTotal: false });
    running = newRunning;
  }

  // End: Net
  steps.push({ name: "Net", top: netAfterAll, bottom: 0, color: COLORS.net, isTotal: true });

  // Y axis
  const yMin = 0;
  const yMax = Math.ceil(employer.superBrut * 1.05 / 1000) * 1000;
  const yRange = yMax - yMin;

  // Chart dimensions
  const svgWidth = 560;
  const svgHeight = 300;
  const marginLeft = 10;
  const marginRight = 10;
  const marginTop = 10;
  const marginBottom = 60;
  const plotW = svgWidth - marginLeft - marginRight;
  const plotH = svgHeight - marginTop - marginBottom;

  const barCount = steps.length;
  const gap = 4;
  const barW = Math.min(34, (plotW - gap * (barCount - 1)) / barCount);
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
          Super brut : <span className="font-semibold text-purple-600">{formatCurrency(employer.superBrut)}</span>
        </span>
        <span className="text-gray-500">
          Brut : <span className="font-semibold text-gray-700">{formatCurrency(social.grossSalary)}</span>
        </span>
        <span className="text-gray-500">
          Net : <span className="font-semibold text-green-600">{formatCurrency(netAfterAll)}</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full"
        style={{ maxHeight: 300 }}
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
              {i > 0 && i < steps.length - 1 && !step.isTotal && (
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
                fontSize={7}
                fill={step.isTotal ? "#374151" : "#6b7280"}
                fontWeight={step.isTotal ? "bold" : "normal"}
                transform={`rotate(-40, ${x + barW / 2}, ${svgHeight - marginBottom + 12})`}
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
            <text x={x} y={Math.max(y, 12)} textAnchor="middle" fontSize={8} fontWeight="bold" fill={step.color}>
              {formatCurrency(amount)}
            </text>
          );
        })()}
      </svg>
    </div>
  );
}
