import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Neural net nodes: [x%, y%, size, opacity, color]
const NODES = [
  [50, 50, 18, 1,    "#60a5fa"], // center hub — large blue
  [32, 38, 12, 0.9,  "#fcd34d"], // MOC yellow
  [62, 42, 11, 0.9,  "#fcd34d"],
  [44, 62, 11, 0.85, "#fcd34d"],
  [20, 28, 9,  0.85, "#60a5fa"], // people
  [38, 22, 8,  0.8,  "#60a5fa"],
  [72, 25, 8,  0.8,  "#60a5fa"],
  [80, 48, 9,  0.82, "#60a5fa"],
  [15, 55, 7,  0.75, "#34d399"], // learnings green
  [26, 68, 7,  0.75, "#34d399"],
  [55, 75, 7,  0.72, "#34d399"],
  [68, 70, 7,  0.7,  "#34d399"],
  [85, 65, 6,  0.7,  "#c084fc"], // patterns purple
  [78, 75, 6,  0.68, "#c084fc"],
  [10, 40, 6,  0.65, "#fb923c"], // self orange
  [18, 72, 6,  0.65, "#fb923c"],
  [60, 18, 6,  0.68, "#22d3ee"], // school cyan
  [88, 30, 5,  0.6,  "#22d3ee"],
  [42, 82, 5,  0.6,  "#fb923c"],
  [8,  22, 5,  0.55, "#60a5fa"],
  [90, 18, 4,  0.5,  "#34d399"],
  [5,  75, 4,  0.5,  "#c084fc"],
  [72, 85, 4,  0.5,  "#fcd34d"],
  [95, 55, 4,  0.48, "#60a5fa"],
];

// Edges: pairs of node indices
const EDGES = [
  [0,1],[0,2],[0,3],[0,6],[0,7],
  [1,4],[1,5],[1,14],
  [2,6],[2,7],[2,16],
  [3,10],[3,11],[3,18],
  [4,19],[5,16],[6,17],[7,13],
  [8,14],[9,10],[10,11],[11,12],
  [12,13],[13,7],[15,9],[16,17],
];

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

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#080f1e",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Neural net edges */}
        {EDGES.map(([a, b], i) => {
          const na = NODES[a], nb = NODES[b];
          const x1 = na[0] as number / 100 * 1200;
          const y1 = na[1] as number / 100 * 630;
          const x2 = nb[0] as number / 100 * 1200;
          const y2 = nb[1] as number / 100 * 630;
          const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
          const angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x1,
                top: y1,
                width: len,
                height: 1,
                background: "rgba(96,165,250,0.15)",
                transformOrigin: "0 50%",
                transform: `rotate(${angle}deg)`,
              }}
            />
          );
        })}

        {/* Neural net nodes */}
        {NODES.map(([x, y, r, op, color], i) => {
          const px = (x as number) / 100 * 1200 - (r as number);
          const py = (y as number) / 100 * 630 - (r as number);
          const size = (r as number) * 2;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: px,
                top: py,
                width: size,
                height: size,
                borderRadius: "50%",
                background: color as string,
                opacity: op as number,
                boxShadow: `0 0 ${(r as number) * 3}px ${color as string}`,
              }}
            />
          );
        })}

        {/* Dark overlay — left 55% for text readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(8,15,30,0.97) 0%, rgba(8,15,30,0.9) 50%, rgba(8,15,30,0.2) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "absolute",
            left: 72,
            top: 0,
            bottom: 0,
            width: 720,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 0",
          }}
        >
          {/* Kicker */}
          <div style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.2em", textTransform: "uppercase" }}>
            {kicker}
          </div>

          {/* Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: title.length > 45 ? 52 : 62,
                fontWeight: 700,
                color: "#f1f5f9",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {title}
            </div>
            {summary && (
              <div style={{ fontSize: 20, color: "#64748b", lineHeight: 1.5 }}>
                {summary.length > 110 ? summary.slice(0, 110) + "…" : summary}
              </div>
            )}
          </div>

          {/* Author */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 700, color: "white",
            }}>J</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#e2e8f0" }}>Joshua Agarwal</div>
              <div style={{ fontSize: 12, color: "#475569" }}>P.Eng · Wharton MBA · Building with AI</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
