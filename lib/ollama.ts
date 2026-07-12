import { Ollama } from "ollama";

// EcoSphere's AI runs on Ollama (no paid API key). The primary model is a
// cloud-hosted gpt-oss so no local GPU is required; a smaller model is used as
// a fallback if the primary is unavailable.
// Normalize the host: Ollama's own OLLAMA_HOST is often a bind address like
// "0.0.0.0:11434" with no scheme, which is not a valid fetch URL. Add the
// scheme and rewrite the unroutable 0.0.0.0 to loopback.
function normalizeHost(raw: string | undefined): string {
  let host = (raw || "http://127.0.0.1:11434").trim();
  if (!/^https?:\/\//i.test(host)) host = `http://${host}`;
  return host.replace("0.0.0.0", "127.0.0.1");
}

const HOST = normalizeHost(process.env.OLLAMA_HOST);
const MODEL = process.env.OLLAMA_MODEL || "gpt-oss:120b-cloud";
const FALLBACK = process.env.OLLAMA_FALLBACK_MODEL || "gpt-oss:20b-cloud";

const client = new Ollama({ host: HOST });

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/** Is an Ollama runtime reachable and does it expose one of our models? */
export async function checkOllama(): Promise<{ ok: boolean; model?: string; reason?: string }> {
  try {
    const res = await fetch(`${HOST}/api/tags`, { cache: "no-store" });
    if (!res.ok) return { ok: false, reason: `Ollama responded ${res.status}` };
    const data = (await res.json()) as { models?: { name: string }[] };
    const names = new Set((data.models ?? []).map((m) => m.name));
    if (names.has(MODEL)) return { ok: true, model: MODEL };
    if (names.has(FALLBACK)) return { ok: true, model: FALLBACK };
    // Any model at all is better than nothing.
    const first = data.models?.[0]?.name;
    if (first) return { ok: true, model: first };
    return { ok: false, reason: "No models pulled in Ollama" };
  } catch (e) {
    return { ok: false, reason: `Cannot reach Ollama at ${HOST}` };
  }
}

/** Non-streaming chat completion, with automatic fallback to the smaller model. */
export async function chatOnce(messages: ChatMessage[]): Promise<string> {
  const tryModel = async (model: string) => {
    const res = await client.chat({
      model,
      messages,
      stream: false,
      think: false,
      options: { temperature: 0.3 },
    });
    return res.message?.content ?? "";
  };
  try {
    return await tryModel(MODEL);
  } catch {
    return await tryModel(FALLBACK);
  }
}

/**
 * Streaming chat. Yields content chunks (reasoning tokens are ignored). Falls
 * back to the smaller model if the primary throws before streaming starts.
 */
export async function* streamChat(
  messages: ChatMessage[],
): AsyncGenerator<string> {
  const run = async function* (model: string) {
    const stream = await client.chat({
      model,
      messages,
      stream: true,
      think: false,
      options: { temperature: 0.3 },
    });
    for await (const part of stream) {
      const chunk = part.message?.content;
      if (chunk) yield chunk;
    }
  };
  try {
    yield* run(MODEL);
  } catch {
    yield* run(FALLBACK);
  }
}

export const AI_MODEL_LABEL = MODEL;
