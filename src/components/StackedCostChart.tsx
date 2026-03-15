import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SocialResult, EmployerResult } from "../engine";
import { groupByFamily } from "./contributionFamilies";

interface StackedCostChartProps {
  social: SocialResult;
  employer: EmployerResult;
  irAmount: number;
  label?: string;
}

function formatK(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value.toString();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

const COLORS = {
  superBrut: "#9333ea",
  patronal: "#c084fc",
  brut: "#6b7280",
  salarial: "#93c5fd",
  ir: "#fca5a5",
  net: "#10b981",
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs space-y-0.5">
      <p className="font-semibold text-gray-700">{data.name}</p>
      <p className="text-gray-600">Total : {formatCurrency(data.total)}</p>
      {data.details.map((d: { label: string; amount: number; color: string }, i: number) => (
        <p key={i} style={{ color: d.color }}>
          {d.label} : {formatCurrency(d.amount)}
        </p>
      ))}
    </div>
  );
}

export function StackedCostChart({ social, employer, irAmount, label }: StackedCostChartProps) {
  if (social.grossSalary === 0) return null;

  const netAfterAll = social.netBeforeIR - irAmount;
  const rgduAmount = employer.rgdu.amount;

  // Group employer contributions by family, net of RGDU
  const employerFamilies = groupByFamily(employer.contributions);
  const totalEmployerRaw = employerFamilies.reduce((s, f) => s + f.amount, 0);
  const patronalNet = totalEmployerRaw > 0
    ? Math.round((totalEmployerRaw - rgduAmount) * 100) / 100
    : 0;

  // Group employee contributions by family
  const socialFamilies = groupByFamily(social.contributions);
  const salarialTotal = social.totalContributions - social.overtimeRelief + social.mutuelleAnnual;

  const data = [
    {
      name: "Super brut",
      total: employer.superBrut,
      net: 0,
      ir: 0,
      salarial: 0,
      brut: 0,
      patronal: 0,
      superBrut: employer.superBrut,
      details: [
        { label: "Super brut", amount: employer.superBrut, color: COLORS.superBrut },
      ],
    },
    {
      name: "Coût employeur",
      total: employer.superBrut,
      net: 0,
      ir: 0,
      salarial: 0,
      brut: social.grossSalary,
      patronal: patronalNet,
      superBrut: 0,
      details: [
        { label: "Salaire brut", amount: social.grossSalary, color: COLORS.brut },
        { label: "Cotisations patronales", amount: patronalNet, color: COLORS.patronal },
        ...(rgduAmount > 0 ? [{ label: "dont RGDU", amount: -rgduAmount, color: "#10b981" }] : []),
      ],
    },
    {
      name: "Brut",
      total: social.grossSalary,
      net: 0,
      ir: 0,
      salarial: 0,
      brut: social.grossSalary,
      patronal: 0,
      superBrut: 0,
      details: [
        { label: "Salaire brut", amount: social.grossSalary, color: COLORS.brut },
      ],
    },
    {
      name: "Brut → Net",
      total: social.grossSalary,
      net: netAfterAll,
      ir: irAmount,
      salarial: salarialTotal,
      brut: 0,
      patronal: 0,
      superBrut: 0,
      details: [
        { label: "Net après impôt", amount: netAfterAll, color: COLORS.net },
        { label: "Impôt sur le revenu", amount: irAmount, color: COLORS.ir },
        { label: "Cotisations salariales", amount: salarialTotal, color: COLORS.salarial },
      ],
    },
    {
      name: "Net",
      total: netAfterAll,
      net: netAfterAll,
      ir: 0,
      salarial: 0,
      brut: 0,
      patronal: 0,
      superBrut: 0,
      details: [
        { label: "Net après impôt", amount: netAfterAll, color: COLORS.net },
      ],
    },
  ];

  const maxY = Math.ceil(employer.superBrut * 1.05 / 1000) * 1000;

  return (
    <div>
      {label && <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>}
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap="20%">
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis
              tick={{ fontSize: 10 }}
              tickFormatter={formatK}
              domain={[0, maxY]}
              unit=" €"
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="superBrut" stackId="a" fill={COLORS.superBrut} name="Super brut" />
            <Bar dataKey="patronal" stackId="a" fill={COLORS.patronal} name="Cotis. patronales" />
            <Bar dataKey="brut" stackId="a" fill={COLORS.brut} name="Brut" />
            <Bar dataKey="salarial" stackId="a" fill={COLORS.salarial} name="Cotis. salariales" />
            <Bar dataKey="ir" stackId="a" fill={COLORS.ir} name="Impôt" />
            <Bar dataKey="net" stackId="a" fill={COLORS.net} name="Net" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS.superBrut }} />
          Super brut
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS.patronal }} />
          Cotis. patronales
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS.brut }} />
          Brut
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS.salarial }} />
          Cotis. salariales
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS.ir }} />
          Impôt
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS.net }} />
          Net
        </span>
      </div>
    </div>
  );
}
