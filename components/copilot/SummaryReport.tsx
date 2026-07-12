"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import { RichText } from "./RichText";
import { exportSummaryPDF, exportScorecardCSV, type ScorecardRow } from "@/lib/export";

type SummaryData = {
  markdown: string;
  model: string;
  generatedAt: string;
  recordCount: number;
  org: { overall: number; environmental: number; social: number; governance: number };
};

export function SummaryReport({
  available,
  departments,
}: {
  available: boolean;
  departments: ScorecardRow[];
}) {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/summary", { method: "POST" });
      if (res.status === 503) {
        toast.error("AI unavailable. Start Ollama to generate the report.");
        return;
      }
      const json = (await res.json()) as SummaryData;
      setData(json);
      toast.success("ESG Summary generated", {
        icon: <Icon name="FileCheck" className="h-4 w-4 text-env" />,
      });
    } catch {
      toast.error("Could not generate the summary.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!data) return;
    exportSummaryPDF({
      markdown: data.markdown,
      org: data.org,
      departments,
      model: data.model,
      generatedAt: data.generatedAt,
    });
    toast.success("PDF exported");
  };

  const downloadCSV = () => {
    exportScorecardCSV(departments);
    toast.success("CSV exported");
  };

  return (
    <div className="card flex flex-col relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-[120px] w-[120px] rounded-full bg-gov/[0.06] blur-[40px]" />

      <div className="mb-4 flex items-center gap-2.5 relative z-10">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gov/25 to-transparent">
          <Icon name="FileText" className="h-4 w-4 text-gov-soft" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">ESG Summary Report</h3>
          <p className="text-xs text-slate-500">AI-written, grounded in live data</p>
        </div>
      </div>

      {!data ? (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <Icon name="FileSparkles" className="h-8 w-8 text-slate-600" />
          </motion.div>
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Generate an executive ESG summary across all pillars, then export it to PDF or CSV.
          </p>
          <motion.button
            onClick={generate}
            disabled={!available || loading}
            className="btn-primary mt-5"
            whileHover={available ? { scale: 1.03 } : {}}
            whileTap={available ? { scale: 0.97 } : {}}
            style={available && !loading ? { boxShadow: "0 0 40px -8px rgba(52,211,153,0.4)" } : {}}
          >
            {loading ? (
              <>
                <Icon name="Loader2" className="h-4 w-4 animate-spin" /> Writing report...
              </>
            ) : (
              <>
                <Icon name="Sparkles" className="h-4 w-4" /> Generate report
              </>
            )}
          </motion.button>
          {!available && (
            <p className="mt-3 text-xs text-gold/80">Start Ollama to enable AI generation.</p>
          )}
        </div>
      ) : (
        <>
          <div className="relative z-10 mb-3 flex flex-wrap items-center gap-2">
            <motion.button
              onClick={downloadPDF}
              className="btn-ghost btn-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon name="FileDown" className="h-3.5 w-3.5" /> PDF
            </motion.button>
            <motion.button
              onClick={downloadCSV}
              className="btn-ghost btn-sm"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon name="Table" className="h-3.5 w-3.5" /> CSV
            </motion.button>
            <button onClick={generate} disabled={loading} className="btn-ghost btn-sm">
              <Icon name={loading ? "Loader2" : "RefreshCw"} className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Regenerate
            </button>
            <span className="ml-auto text-[11px] text-slate-500">
              {data.recordCount} records · {data.model}
            </span>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 no-scrollbar max-h-[440px] overflow-y-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm"
          >
            <RichText text={data.markdown} />
          </motion.div>
        </>
      )}
    </div>
  );
}
