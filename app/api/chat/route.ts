import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAllPosts } from "@/lib/posts";
import { getProfileMarkdown } from "@/lib/profile";

export const runtime = "nodejs";

function buildContext() {
  const profile = getProfileMarkdown();
  const posts = getAllPosts()
    .map((post) => `- ${post.title}: ${post.summary}`)
    .join("\n");

  return `PROFILE\n${profile}\n\nPOSTS\n${posts}`.trim();
}

function extractQuickFacts(profile: string) {
  const start = profile.indexOf("## Quick Facts");
  if (start === -1) return "";
  const rest = profile.slice(start);
  const end = rest.indexOf("## ", 3);
  const section = end === -1 ? rest : rest.slice(0, end);
  return section
    .split("\n")
    .filter((line) => line.trim().startsWith("-"))
    .map((line) => line.replace(/^[-\s]+/, "").trim())
    .join("\n");
}

function cannedAnswer(message: string) {
  const text = message.toLowerCase();
  if (text.includes("kiewit")) {
    return "Josh has prior experience with Kiewit, which added large-project engineering exposure and reinforced his focus on execution discipline and operational constraints.";
  }
  if (text.includes("avatar")) {
    return "Avatar is an early-stage, hydrogen-focused clean-tech venture concept from Josh's MBA materials. It reflects his interest in infrastructure-scale climate solutions and the need to align execution, governance, and capital discipline with technology.";
  }
  if (text.includes("ype") || text.includes("young professionals in energy")) {
    return "Josh held a leadership role in Young Professionals in Energy (YPE), aligned a divided board, delivered 12 events with new sponsors, and was unanimously elected 2026 President.";
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const direct = cannedAnswer(message);
    if (direct) {
      return NextResponse.json({ answer: direct });
    }

    const context = buildContext();
    const quickFacts = extractQuickFacts(context);

    const systemPrompt = `You are Josh Agarwal's personal site assistant. Use only the PROFILE and POSTS below. Be specific and concrete. If the question mentions Avatar, Kiewit, YPE, or Calgary, answer directly using the Quick Facts. Never say you don't have information if the term appears in Quick Facts. Keep answers 2-6 sentences.\n\nQUICK FACTS\n${quickFacts}\n\n${context}`;

    const client = new Anthropic({ apiKey });

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 320,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const answer = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Chat error", error);
    return NextResponse.json(
      { error: error?.message ?? "Unexpected server error" },
      { status: 500 }
    );
  }
}
