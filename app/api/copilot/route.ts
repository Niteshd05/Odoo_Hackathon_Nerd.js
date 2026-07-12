import { NextRequest } from "next/server";
import { checkOllama, streamChat, type ChatMessage } from "@/lib/ollama";
import { buildEsgContext } from "@/lib/ai/context";
import { copilotMessages } from "@/lib/ai/prompts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { question, history } = (await req.json()) as {
    question: string;
    history?: ChatMessage[];
  };

  if (!question?.trim()) {
    return new Response("Question is required.", { status: 400 });
  }

  const health = await checkOllama();
  if (!health.ok) {
    return new Response(
      JSON.stringify({
        error: "AI_UNAVAILABLE",
        reason: health.reason,
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const { context } = await buildEsgContext(question);
  const messages = copilotMessages(question, context, history ?? []);

  // Stream tokens back as plain text.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of streamChat(messages)) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e) {
        controller.enqueue(
          encoder.encode("\n\n[The Copilot hit an error mid-response. Please try again.]"),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
    },
  });
}
