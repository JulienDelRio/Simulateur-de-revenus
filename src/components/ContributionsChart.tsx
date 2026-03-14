import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
} from "recharts";
import type { SocialResult } from "../engine";
import type { TaxResult } from "../engine";

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

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload ?? payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{name ?? payload[0].name}</p>
      <p className="text-gray-600">{formatCurrency(value ?? payload[0].value)}</p>
    </div>
  );
}

// --- Chart 1: Donut ---
export function DonutChart({ social, label }: { social: SocialResult; label?: string }) {
  const data = groupByFamily(social);
  if (social.totalContributions === 0) return null;

  return (
    <div>
      {label && <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>}
      <div style={{ width: "100%", height: 260, display: "flex", justifyContent: "center" }}>
        <PieChart width={350} height={260}>
          <Pie
            data={data}
            cx="50%"
            cy="42%"
            innerRadius={45}
            outerRadius={80}
            dataKey="value"
            nameKey="name"
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
          <Legend verticalAlign="bottom" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </div>
    </div>
  );
}

// --- Chart 2: Stacked bar "Où va mon salaire" ---
export function SalaryBreakdownBar({ social, irAmount, netAfterAll, label }: ChartProps) {
  if (social.grossSalary === 0) return null;

  const families = groupByFamily(social);
  const dataEntry: Record<string, number> = { name: 1 };
  dataEntry["Net après IR"] = netAfterAll;
  dataEntry["Impôt"] = irAmount;
  if (social.mutuelleAnnual > 0) dataEntry["Mutuelle"] = social.mutuelleAnnual;
  for (const f of families) dataEntry[f.name] = f.value;
  if (social.overtimeRelief > 0) dataEntry["Net après IR"] += social.overtimeRelief;

  const data = [dataEntry];

  const segments = [
    { key: "Net après IR", color: COLORS.net },
    { key: "Impôt", color: COLORS.ir },
    ...(social.mutuelleAnnual > 0 ? [{ key: "Mutuelle", color: COLORS.mutuelle }] : []),
    ...families.map((f) => ({ key: f.name, color: f.color })),
  ];

  return (
    <div>
      {label && <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>}
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" barSize={40}>
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
            />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
            />
            {segments.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="a"
                fill={s.color}
                radius={i === segments.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1 text-xs text-gray-500">
        {segments.map((s) => (
          <span key={s.key} className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.key}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Chart 3: Waterfall (cascade) ---
// Horizontal bar chart showing deductions by family + summary
export function WaterfallChart({ social, irAmount, label }: ChartProps) {
  if (social.grossSalary === 0) return null;

  const netAfterAll = social.netBeforeIR - irAmount;
  const families = groupByFamily(social);

  type Row = { name: string; value: number; color: string };
  const rows: Row[] = [];

  const sorted = [...families].sort((a, b) => b.value - a.value);
  for (const f of sorted) {
    rows.push({ name: f.name, value: f.value, color: f.color });
  }
  if (social.mutuelleAnnual > 0) {
    rows.push({ name: "Mutuelle", value: social.mutuelleAnnual, color: COLORS.mutuelle });
  }
  if (irAmount > 0) {
    rows.push({ name: "Impôt sur le revenu", value: irAmount, color: COLORS.ir });
  }

  const totalDeductions = rows.reduce((s, r) => s + r.value, 0);
  const chartHeight = Math.max(200, rows.length * 32 + 80);

  return (
    <div>
      {label && <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>}

      <div className="flex justify-between text-sm mb-3 px-1">
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

      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer>
          <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 20 }}>
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10 }}
              width={130}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Montant"]}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {rows.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- Chart 4: Horizontal bars by family ---
export function HorizontalBarsChart({ social, label }: { social: SocialResult; label?: string }) {
  const families = groupByFamily(social);
  if (families.length === 0) return null;

  const sorted = [...families].sort((a, b) => b.value - a.value);

  return (
    <div>
      {label && <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>}
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={sorted} layout="vertical" margin={{ left: 10 }}>
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`}
            />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={130} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {sorted.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Backward-compatible export (used in SimulatorApp)
export function ContributionsChart({ social, label }: { social: SocialResult; label?: string }) {
  return <DonutChart social={social} label={label} />;
}
