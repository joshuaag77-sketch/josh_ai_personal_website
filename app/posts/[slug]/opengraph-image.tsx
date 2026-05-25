import { ImageResponse } from "next/og";
import { getPostBySlug, getAllPosts } from "@/lib/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

// Neural net: 4 layers of nodes, connected left→right
// Layer configs: [x, nodeCount, nodeSpacing, color]
const LAYERS = [
  { x: 700,  n: 4, gap: 110, color: "#60a5fa" },
  { x: 840,  n: 6, gap: 82,  color: "#818cf8" },
  { x: 980,  n: 6, gap: 82,  color: "#a78bfa" },
  { x: 1120, n: 3, gap: 130, color: "#c084fc" },
];

function layerNodes(layer: typeof LAYERS[0]) {
  const totalH = (layer.n - 1) * layer.gap;
  const startY = (630 - totalH) / 2;
  return Array.from({ length: layer.n }, (_, i) => ({
    x: layer.x,
    y: startY + i * layer.gap,
    color: layer.color,
  }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  const title = post?.title ?? "Josh Agarwal";
  const kicker = post?.kicker ?? "Field Notes";
  const summary = post?.summary ?? "";

  const allLayers = LAYERS.map(layerNodes);

  // Build edges between adjacent layers
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let l = 0; l < allLayers.length - 1; l++) {
    for (const a of allLayers[l]) {
      for (const b of allLayers[l + 1]) {
        edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
  }

  return new ImageResponse(
    (
      <div style={{
        width: 1200, height: 630,
        background: "#080f1e",
        display: "flex", position: "relative", overflow: "hidden",
        fontFamily: "system-ui, sans-serif",
      }}>

        {/* ── Neural net edges ── */}
        {edges.map((e, i) => {
          const dx = e.x2 - e.x1, dy = e.y2 - e.y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          return (
            <div key={i} style={{
              position: "absolute",
              left: e.x1, top: e.y1,
              width: len, height: 1,
              background: "rgba(129,140,248,0.07)",
              transformOrigin: "0 0",
              transform: `rotate(${angle}deg)`,
            }} />
          );
        })}

        {/* ── Neural net nodes — layered circles to fake blur/glow ── */}
        {allLayers.flat().map((node, i) => (
          <div key={i} style={{ display: "flex", position: "absolute", left: 0, top: 0, width: 0, height: 0 }}>
            {/* outer halo */}
            <div style={{ position: "absolute", left: node.x - 32, top: node.y - 32, width: 64, height: 64, borderRadius: "50%", background: node.color, opacity: 0.06 }} />
            {/* mid glow */}
            <div style={{ position: "absolute", left: node.x - 20, top: node.y - 20, width: 40, height: 40, borderRadius: "50%", background: node.color, opacity: 0.1 }} />
            {/* inner glow */}
            <div style={{ position: "absolute", left: node.x - 11, top: node.y - 11, width: 22, height: 22, borderRadius: "50%", background: node.color, opacity: 0.2 }} />
            {/* core */}
            <div style={{ position: "absolute", left: node.x - 5, top: node.y - 5, width: 10, height: 10, borderRadius: "50%", background: node.color, opacity: 0.7 }} />
          </div>
        ))}

        {/* ── Fade: right side bleeds in, left stays dark for text ── */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, #080f1e 48%, rgba(8,15,30,0.5) 72%, rgba(8,15,30,0) 100%)",
        }} />

        {/* ── Left accent bar ── */}
        <div style={{
          position: "absolute", left: 0, top: 0, width: 5, height: "100%",
          background: "linear-gradient(180deg, #6366f1, #3b82f6, #06b6d4)",
        }} />

        {/* ── Text content ── */}
        <div style={{
          position: "absolute", left: 72, top: 0, bottom: 0, width: 680,
          display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "64px 0",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#818cf8", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            {kicker}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{
              fontSize: title.length > 40 ? 52 : 62,
              fontWeight: 700, color: "#f8fafc",
              lineHeight: 1.1, letterSpacing: "-0.025em",
            }}>
              {title}
            </div>
            {summary && (
              <div style={{ fontSize: 20, color: "#475569", lineHeight: 1.5 }}>
                {summary.length > 95 ? summary.slice(0, 95) + "…" : summary}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "linear-gradient(135deg, #6366f1, #3b82f6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 700, color: "white",
            }}>J</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>Joshua Agarwal</div>
              <div style={{ fontSize: 13, color: "#334155" }}>P.Eng · Wharton MBA · Building with AI</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
