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
          background: "#080f1e",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Big soft glow — right side */}
        <div style={{
          position: "absolute",
          right: -80,
          top: -80,
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(59,130,246,0.15) 45%, transparent 70%)",
        }}/>

        {/* Smaller accent glow — bottom left */}
        <div style={{
          position: "absolute",
          left: -60,
          bottom: -80,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 65%)",
        }}/>

        {/* Left accent bar */}
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 5,
          height: "100%",
          background: "linear-gradient(180deg, #6366f1, #3b82f6, #06b6d4)",
        }}/>

        {/* Content */}
        <div style={{
          position: "absolute",
          left: 72,
          top: 0,
          bottom: 0,
          right: 72,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 0",
        }}>
          {/* Kicker */}
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#818cf8",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
          }}>
            {kicker}
          </div>

          {/* Title + summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
            <div style={{
              fontSize: title.length > 42 ? 54 : 64,
              fontWeight: 700,
              color: "#f8fafc",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
            }}>
              {title}
            </div>
            {summary && (
              <div style={{ fontSize: 22, color: "#475569", lineHeight: 1.5 }}>
                {summary.length > 100 ? summary.slice(0, 100) + "…" : summary}
              </div>
            )}
          </div>

          {/* Author row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
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
            <div style={{ fontSize: 13, color: "#1e293b", letterSpacing: "0.05em" }}>
              josh-ai-personal-website.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
