import { NextResponse } from "next/server";

/**
 * Placeholder for future RAG/chatbot endpoint.
 * When ready: accept a question, query vector DB for relevant post chunks,
 * call LLM with system prompt + context, return answer.
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "Chat endpoint not implemented yet. Will support RAG over site content.",
    },
    { status: 501 }
  );
}
