import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { slugify } from "@/lib/slug";

// One generation per day — cached by Next's data cache.
export const revalidate = 86400;

type GNode = { id: number; label: string; cluster: string };
type Graph = { nodes: GNode[]; edges: [number, number][] };

function dateSeed(): number {
  const d = new Date().toISOString().slice(0, 10);
  let h = 0;
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0;
  return h;
}

export async function GET() {
  try {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "public", "vault-graph.json"),
      "utf-8"
    );
    const g: Graph = JSON.parse(raw);
    const isNote = (i: number) => g.nodes[i].cluster !== "theme";
    // prefer note-to-note edges across different galaxies — the interesting threads
    const cross = g.edges.filter(
      ([a, b]) => isNote(a) && isNote(b) && g.nodes[a].cluster !== g.nodes[b].cluster
    );
    const pool = cross.length > 0 ? cross : g.edges.filter(([a, b]) => isNote(a) && isNote(b));
    if (pool.length === 0) return NextResponse.json({ error: "no edges" }, { status: 404 });

    const [ai, bi] = pool[dateSeed() % pool.length];
    const a = g.nodes[ai];
    const b = g.nodes[bi];

    let line = "Two notes, one thread — follow it into the vault.";
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      const client = new Anthropic({ apiKey });
      const res = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 90,
        system:
          "You write one intriguing sentence (max 140 characters) hinting at what could connect two note titles from a personal knowledge graph. You only know the titles — write it as a thoughtful hint or question, never a factual claim about the notes' contents. No quotes, no emoji, no preamble.",
        messages: [
          {
            role: "user",
            content: `Note A: "${a.label}" — Note B: "${b.label}". These notes are actually linked in the graph. One sentence.`,
          },
        ],
      });
      const text = res.content
        .filter((x) => x.type === "text")
        .map((x) => x.text)
        .join("")
        .trim();
      if (text) line = text.slice(0, 160);
    }

    return NextResponse.json({
      date: new Date().toISOString().slice(0, 10),
      a: { label: a.label, slug: slugify(a.label) },
      b: { label: b.label, slug: slugify(b.label) },
      line,
    });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 500 });
  }
}
