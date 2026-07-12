import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState, StatusPill } from "@/components/ui/misc";
import { Icon } from "@/components/ui/Icon";
import { OperationForm } from "@/components/environmental/OperationForm";
import { formatCO2, formatNumber, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_ICON: Record<string, string> = {
  Purchase: "ShoppingCart",
  Manufacturing: "Factory",
  Expense: "Receipt",
  Fleet: "Truck",
};

export default async function OperationsPage() {
  const [departments, factors, operations, config] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.emissionFactor.findMany({ where: { status: "Active" }, orderBy: { name: "asc" } }),
    prisma.operationRecord.findMany({
      include: { department: true, carbon: { include: { emissionFactor: true } } },
      orderBy: { date: "desc" },
      take: 60,
    }),
    prisma.esgConfig.findUnique({ where: { id: "singleton" } }),
  ]);

  return (
    <div className="animate-fade-up space-y-6">
      <PageHeader
        eyebrow="Environmental"
        title="Operations"
        icon="Factory"
        description="Every operation records a quantity; EcoSphere auto-derives the carbon it emits."
        actions={
          <OperationForm
            departments={departments.map((d) => ({ id: d.id, name: d.name, code: d.code }))}
            factors={factors.map((f) => ({
              id: f.id, name: f.name, unit: f.unit, factor: f.factor, sourceType: f.sourceType,
            }))}
          />
        }
      />

      {!config?.autoEmissionEnabled && (
        <div className="flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.07] px-4 py-2.5 text-sm text-gold">
          <Icon name="AlertCircle" className="h-4 w-4" />
          Auto emission calculation is currently OFF in ESG Configuration. New operations will
          not generate carbon transactions.
        </div>
      )}

      <div className="card">
        {operations.length === 0 ? (
          <EmptyState
            icon="Factory"
            title="No operations yet"
            description="Record your first operation to see carbon auto-calculated."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="pb-3 font-medium">Operation</th>
                  <th className="pb-3 font-medium">Department</th>
                  <th className="pb-3 text-right font-medium">Quantity</th>
                  <th className="pb-3 font-medium">Emission factor</th>
                  <th className="pb-3 text-right font-medium">CO2</th>
                  <th className="pb-3 text-right font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => {
                  const carbon = op.carbon[0];
                  return (
                    <tr key={op.id} className="table-row">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="grid h-8 w-8 place-items-center rounded-lg bg-line/5">
                            <Icon name={TYPE_ICON[op.type] ?? "Box"} className="h-4 w-4 text-slate-300" />
                          </div>
                          <div>
                            <div className="font-medium text-fg">{op.type}</div>
                            <div className="text-xs text-slate-500">{op.description ?? "-"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-300">{op.department.name}</td>
                      <td className="py-3 text-right text-slate-300">{formatNumber(op.quantity)}</td>
                      <td className="py-3">
                        {carbon ? (
                          <span className="text-slate-400">{carbon.emissionFactor.name}</span>
                        ) : (
                          <StatusPill status="no calc" />
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {carbon ? (
                          <span className="font-semibold text-env-soft">{formatCO2(carbon.computedCO2)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="py-3 text-right text-slate-500">{shortDate(op.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
