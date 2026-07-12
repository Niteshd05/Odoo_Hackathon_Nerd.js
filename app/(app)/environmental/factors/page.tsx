import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { FactorManager } from "@/components/environmental/FactorManager";

export const dynamic = "force-dynamic";

export default async function FactorsPage() {
  const factors = await prisma.emissionFactor.findMany({
    include: { _count: { select: { carbon: true } } },
    orderBy: [{ sourceType: "asc" }, { name: "asc" }],
  });

  return (
    <div className="animate-fade-up space-y-2">
      <PageHeader
        eyebrow="Environmental"
        title="Emission Factors"
        icon="Sigma"
        description="The conversion rates that turn operational quantities into carbon. Editable per organization."
      />
      <FactorManager
        factors={factors.map((f) => ({
          id: f.id,
          name: f.name,
          unit: f.unit,
          factor: f.factor,
          sourceType: f.sourceType,
          status: f.status,
          usage: f._count.carbon,
        }))}
      />
    </div>
  );
}
