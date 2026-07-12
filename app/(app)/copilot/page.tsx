import { computeOrgScore } from "@/lib/scoring";
import { checkOllama, AI_MODEL_LABEL } from "@/lib/ollama";
import { PageHeader } from "@/components/ui/PageHeader";
import { Icon } from "@/components/ui/Icon";
import { CopilotChat } from "@/components/copilot/CopilotChat";
import { SummaryReport } from "@/components/copilot/SummaryReport";

export const dynamic = "force-dynamic";

export default async function CopilotPage() {
  const [health, org] = await Promise.all([checkOllama(), computeOrgScore()]);

  const departments = org.departments.map((d) => ({
    name: d.name,
    code: d.code,
    environmentalScore: d.environmentalScore,
    socialScore: d.socialScore,
    governanceScore: d.governanceScore,
    totalScore: d.totalScore,
    actualCO2: d.actualCO2,
    targetCO2: d.targetCO2,
  }));

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="AI"
        title="ESG Copilot"
        icon="Sparkles"
        accent="#a78bfa"
        description="Grounded question-answering over your live ESG data, and an AI-written summary report."
        actions={
          <div
            className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs ${
              health.ok
                ? "border-env/25 bg-env/10 text-env"
                : "border-gold/25 bg-gold/10 text-gold"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {health.ok && <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-env/70" />}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${health.ok ? "bg-env" : "bg-gold"}`} />
            </span>
            {health.ok ? `Ollama · ${health.model ?? AI_MODEL_LABEL}` : "AI offline"}
          </div>
        }
      />

      {!health.ok && (
        <div className="flex items-start gap-3 rounded-2xl border border-gold/25 bg-gold/[0.07] px-4 py-3 text-sm text-slate-300">
          <Icon name="Info" className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
          <span>
            The Copilot needs a local Ollama runtime. Install Ollama, run{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-gold">ollama pull gpt-oss:120b-cloud</code>, and refresh.
            EcoSphere stays fully usable without it - {health.reason}.
          </span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <CopilotChat available={health.ok} />
        <SummaryReport available={health.ok} departments={departments} />
      </div>
    </div>
  );
}
