import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { SocialResult } from "../engine";

interface ContributionsChartProps {
  social: SocialResult;
  label?: string;
}

interface FamilyData {
  name: string;
  value: number;
  color: string;
}

function groupByFamily(social: SocialResult): FamilyData[] {
  const families: Record<string, { amount: number; color: string }> = {
    "Vieillesse": { amount: 0, color: "#3b82f6" },
    "Retraite complémentaire": { amount: 0, color: "#6366f1" },
    "CSG déductible": { amount: 0, color: "#10b981" },
    "CSG/CRDS non déductible": { amount: 0, color: "#f59e0b" },
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
      families["CSG/CRDS non déductible"].amount += c.amount;
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

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-md shadow-sm px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{name}</p>
      <p className="text-gray-600">{formatCurrency(value)}</p>
    </div>
  );
}

export function ContributionsChart({ social, label }: ContributionsChartProps) {
  const data = groupByFamily(social);

  if (social.totalContributions === 0) return null;

  return (
    <div>
      {label && (
        <h3 className="text-md font-semibold text-gray-700 mb-2">{label}</h3>
      )}
      <div style={{ width: "100%", height: 280, display: "flex", justifyContent: "center" }}>
        <PieChart width={350} height={280}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
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
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
          </PieChart>
      </div>
    </div>
  );
}
