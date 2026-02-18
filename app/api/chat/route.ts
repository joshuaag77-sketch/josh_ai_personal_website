import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/posts";
import { getProfileMarkdown } from "@/lib/profile";

const OPENAI_API_URL = "https://api.openai.com/v1/responses";
export const runtime = "nodejs";

function buildContext() {
  const profile = getProfileMarkdown();
  const posts = getAllPosts()
    .map((post) => `- ${post.title}: ${post.summary}`)
    .join("\n");

  return `PROFILE\n${profile}\n\nPOSTS\n${posts}`.trim();
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
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

    const context = buildContext();

    const systemPrompt =
      "You are Josh Agarwal's personal site assistant. Answer questions using the provided profile and posts context only. Keep answers concise, professional, and grounded. If something is unknown, say so.";

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Context:\n${context}`,
          },
          { role: "user", content: message },
        ],
        max_output_tokens: 300,
        temperature: 0.3,
        store: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI request failed:", errorText);
      return NextResponse.json(
        { error: errorText || "OpenAI request failed" },
        { status: 500 }
      );
    }

    const data = await response.json();

    let answer = data.output_text;
    if (!answer && Array.isArray(data.output)) {
      for (const item of data.output) {
        if (item.type === "message" && Array.isArray(item.content)) {
          const textChunk = item.content.find(
            (part: any) => part.type === "output_text"
          );
          if (textChunk?.text) {
            answer = textChunk.text;
            break;
          }
        }
      }
    }

    return NextResponse.json({ answer: answer || "" });
  } catch (error: any) {
    console.error("Chat error", error);
    return NextResponse.json(
      { error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
