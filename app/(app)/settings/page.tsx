import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getEsgConfig, computeOrgScore } from "@/lib/scoring";
import { PageHeader } from "@/components/ui/PageHeader";
import { ConfigForm } from "@/components/settings/ConfigForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  // Role gate: only Admin/Manager may change org configuration.
  if (user && user.role === "Employee") redirect("/");

  const [config, org] = await Promise.all([getEsgConfig(), computeOrgScore()]);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="ESG Configuration"
        icon="SlidersHorizontal"
        accent="#a78bfa"
        description="Tune pillar weights and feature toggles. Changes recompute the org score instantly."
      />
      <ConfigForm
        initial={{
          wE: config.weightEnvironmental,
          wS: config.weightSocial,
          wG: config.weightGovernance,
          autoEmissionEnabled: config.autoEmissionEnabled,
          evidenceRequiredEnabled: config.evidenceRequiredEnabled,
          badgeAutoAwardEnabled: config.badgeAutoAwardEnabled,
        }}
        departments={org.departments.map((d) => ({
          name: d.name,
          env: d.environmentalScore,
          soc: d.socialScore,
          gov: d.governanceScore,
          employeeCount: d.employeeCount,
        }))}
      />
    </div>
  );
}
