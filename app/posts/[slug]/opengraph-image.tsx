import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #0b1120 0%, #0d1829 60%, #0b1120 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background dot grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Radial glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Radial glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Top: kicker + site name */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative" }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#60A5FA",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            {kicker}
          </div>
          <div style={{ fontSize: 14, color: "#475569", letterSpacing: "0.05em" }}>
            josh-ai-personal-website.vercel.app
          </div>
        </div>

        {/* Center: title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "relative" }}>
          <div
            style={{
              fontSize: title.length > 50 ? 52 : 62,
              fontWeight: 700,
              color: "#f1f5f9",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              maxWidth: 960,
            }}
          >
            {title}
          </div>
          {summary && (
            <div
              style={{
                fontSize: 22,
                color: "#94a3b8",
                lineHeight: 1.5,
                maxWidth: 880,
              }}
            >
              {summary.length > 120 ? summary.slice(0, 120) + "…" : summary}
            </div>
          )}
        </div>

        {/* Bottom: author */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: "white",
            }}
          >
            J
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0" }}>
              Joshua Agarwal
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              P.Eng · Wharton MBA · Building with AI
            </div>
          </div>
          {/* Right accent line */}
          <div
            style={{
              marginLeft: "auto",
              height: 2,
              width: 80,
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              borderRadius: 2,
            }}
          />
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
