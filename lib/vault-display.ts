// What visitors see of the vault. public/vault-graph.json is a raw export from
// Obsidian, so it holds housekeeping: index notes ("Self MOC") and filing tags
// ("frameworks"). This turns it into the map people fly through. The nightly
// export can keep overwriting the JSON; nothing here needs it to change.

export type VaultNode = { id: number; label: string; cluster: string; summary: string };
export type VaultGraphData = { generated: string; nodes: VaultNode[]; edges: [number, number][] };

// Tags become the questions behind them. A tag not listed here is not shown.
const QUESTION_BY_TAG: Record<string, string> = {
  ai: "What is AI actually changing?",
  agents: "Why does so much AI never get used?",
  thesis: "Why does so much AI never get used?",
  attention: "What is worth paying attention to?",
  meaning: "What is worth paying attention to?",
  neuroscience: "How does a brain actually learn?",
  focus: "How does a brain actually learn?",
  leadership: "What makes people follow someone?",
  career: "What do I do with my working life?",
  consulting: "What do I do with my working life?",
  energy: "How does energy really get built?",
  strategy: "How do you win when everyone is smart?",
  finance: "What is anything actually worth?",
  valuation: "What is anything actually worth?",
  marketing: "Why do people pay what they pay?",
  economics: "Why do people pay what they pay?",
  pricing: "Why do people pay what they pay?",
};

// Notes carrying these tags are coursework, so they recede. "frameworks" is
// only a signal here; it never becomes a question.
const CLASS_TAGS = new Set(["finance", "valuation", "economics", "marketing", "pricing", "frameworks"]);

const TITLE_FIXES: Record<string, string> = {
  "dcf-valuation": "DCF Valuation",
  "porter-five-forces": "Porter's Five Forces",
};

export function displayGraph(raw: VaultGraphData): VaultGraphData {
  const rawById = new Map(raw.nodes.map((n) => [n.id, n]));
  const classNotes = new Set<number>();
  for (const [a, b] of raw.edges) {
    const [na, nb] = [rawById.get(a), rawById.get(b)];
    if (!na || !nb) continue;
    if (na.cluster === "theme" && CLASS_TAGS.has(na.label)) classNotes.add(b);
    if (nb.cluster === "theme" && CLASS_TAGS.has(nb.label)) classNotes.add(a);
  }

  const nodes: VaultNode[] = [];
  const newId = new Map<number, number>(); // raw id -> display id
  for (const n of raw.nodes) {
    if (n.cluster === "moc" || n.cluster === "theme") continue;
    newId.set(n.id, nodes.length);
    nodes.push({
      ...n,
      id: nodes.length,
      label: TITLE_FIXES[n.label] ?? n.label,
      cluster: classNotes.has(n.id) ? "class" : n.cluster,
    });
  }

  const questionId = new Map<string, number>();
  for (const n of raw.nodes) {
    if (n.cluster !== "theme") continue;
    const q = QUESTION_BY_TAG[n.label];
    if (!q) continue;
    if (!questionId.has(q)) {
      questionId.set(q, nodes.length);
      nodes.push({ id: nodes.length, label: q, cluster: "theme", summary: "" });
    }
    newId.set(n.id, questionId.get(q)!);
  }

  const seen = new Set<string>();
  const edges: [number, number][] = [];
  for (const [a, b] of raw.edges) {
    const [x, y] = [newId.get(a), newId.get(b)];
    if (x === undefined || y === undefined || x === y) continue;
    const key = x < y ? `${x}-${y}` : `${y}-${x}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push([x, y]);
  }

  // a question nobody is filed under would be an empty star
  const used = new Set(edges.flat());
  const keep = nodes.filter((n) => n.cluster !== "theme" || used.has(n.id));
  const finalId = new Map(keep.map((n, i) => [n.id, i]));
  return {
    generated: raw.generated,
    nodes: keep.map((n, i) => ({ ...n, id: i })),
    edges: edges
      .filter(([a, b]) => finalId.has(a) && finalId.has(b))
      .map(([a, b]) => [finalId.get(a)!, finalId.get(b)!] as [number, number]),
  };
}
