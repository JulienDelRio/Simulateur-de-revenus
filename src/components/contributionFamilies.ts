interface ContributionLike {
  label: string;
  amount: number;
}

export interface FamilyGroup {
  name: string;
  amount: number;
  lines: ContributionLike[];
}

const FAMILY_RULES: { name: string; match: (label: string) => boolean }[] = [
  {
    name: "Santé",
    match: (l) => l === "Maladie" || l === "AT/MP" || l === "CSA",
  },
  {
    name: "Retraite",
    match: (l) =>
      l.startsWith("Vieillesse") ||
      l.startsWith("Retraite") ||
      l.startsWith("Agirc-Arrco") ||
      l.startsWith("CEG") ||
      l.startsWith("CET") ||
      l === "APEC",
  },
  {
    name: "Famille / Logement",
    match: (l) => l === "Allocations familiales" || l === "FNAL",
  },
  {
    name: "Chômage",
    match: (l) => l === "Chômage" || l === "AGS",
  },
  {
    name: "CSG / CRDS",
    match: (l) => l.startsWith("CSG") || l === "CRDS",
  },
  {
    name: "Prévoyance",
    match: (l) => l === "Prévoyance cadres" || l === "Mutuelle",
  },
  {
    name: "Formation / Transport",
    match: (l) =>
      l === "Taxe d'apprentissage" || l === "CFP" || l === "Versement mobilité",
  },
];

export function groupByFamily(contributions: ContributionLike[]): FamilyGroup[] {
  const groups: Map<string, FamilyGroup> = new Map();

  for (const c of contributions) {
    const rule = FAMILY_RULES.find((r) => r.match(c.label));
    const familyName = rule?.name ?? "Autres";

    const existing = groups.get(familyName);
    if (existing) {
      existing.amount += c.amount;
      existing.lines.push(c);
    } else {
      groups.set(familyName, { name: familyName, amount: c.amount, lines: [c] });
    }
  }

  // Round amounts
  for (const g of groups.values()) {
    g.amount = Math.round(g.amount * 100) / 100;
  }

  // Return in FAMILY_RULES order, then "Autres" at the end
  const result: FamilyGroup[] = [];
  for (const rule of FAMILY_RULES) {
    const g = groups.get(rule.name);
    if (g) result.push(g);
  }
  const autres = groups.get("Autres");
  if (autres) result.push(autres);

  return result;
}
