import { computeOrgScore } from "@/lib/scoring";
import { PageHeader } from "@/components/ui/PageHeader";
import { Simulator } from "@/components/simulator/Simulator";

export const dynamic = "force-dynamic";

export default async function SimulatorPage() {
  const org = await computeOrgScore();

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Planning · Sandbox"
        title="What-if Simulator"
        icon="FlaskConical"
        accent="#A1A1AA"
        description="Model interventions and re-weighting, and watch the org ESG score and ranking react instantly. Nothing is saved."
      />
      <Simulator
        baseWeights={{ wE: org.weights.wE, wS: org.weights.wS, wG: org.weights.wG }}
        departments={org.departments.map((d) => ({
          id: d.departmentId,
          name: d.name,
          code: d.code,
          baseCO2: d.actualCO2,
          targetCO2: d.targetCO2,
          baseEnv: d.environmentalScore,
          soc: d.socialScore,
          gov: d.governanceScore,
          employeeCount: d.employeeCount,
        }))}
      />
    </div>
  );
}
