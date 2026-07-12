import { checkOllama, chatOnce, AI_MODEL_LABEL } from "@/lib/ollama";
import { buildEsgContext } from "@/lib/ai/context";
import { summaryMessages } from "@/lib/ai/prompts";
import { computeOrgScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

export async function POST() {
  const health = await checkOllama();
  if (!health.ok) {
    return Response.json(
      { error: "AI_UNAVAILABLE", reason: health.reason },
      { status: 503 },
    );
  }

  const [{ context, recordCount }, org] = await Promise.all([
    buildEsgContext(""),
    computeOrgScore(),
  ]);

  const markdown = await chatOnce(summaryMessages(context));

  return Response.json({
    markdown,
    model: AI_MODEL_LABEL,
    recordCount,
    generatedAt: new Date().toISOString(),
    org: {
      overall: org.overall,
      environmental: org.environmental,
      social: org.social,
      governance: org.governance,
    },
  });
}
