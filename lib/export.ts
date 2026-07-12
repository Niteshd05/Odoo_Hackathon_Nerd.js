import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export type ScorecardRow = {
  name: string;
  code: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
  actualCO2: number;
  targetCO2: number | null;
};

/** Download the AI ESG Summary + scorecard as a formatted PDF. */
export function exportSummaryPDF(opts: {
  markdown: string;
  org: { overall: number; environmental: number; social: number; governance: number };
  departments: ScorecardRow[];
  model: string;
  generatedAt: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 56;

  // Header band
  doc.setFillColor(10, 14, 26);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(52, 211, 153);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("EcoSphere", margin, 48);
  doc.setTextColor(200, 210, 225);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text("ESG Summary Report", margin, 68);
  doc.setFontSize(9);
  doc.setTextColor(140, 150, 165);
  doc.text(
    `Generated ${new Date(opts.generatedAt).toLocaleString()}  ·  AI model: ${opts.model}`,
    pageW - margin,
    68,
    { align: "right" },
  );

  y = 118;

  // Score band
  const scores = [
    { label: "Overall ESG", value: opts.org.overall },
    { label: "Environmental", value: opts.org.environmental },
    { label: "Social", value: opts.org.social },
    { label: "Governance", value: opts.org.governance },
  ];
  const boxW = (pageW - margin * 2 - 24) / 4;
  scores.forEach((s, i) => {
    const x = margin + i * (boxW + 8);
    doc.setDrawColor(220, 226, 235);
    doc.setFillColor(246, 248, 250);
    doc.roundedRect(x, y, boxW, 54, 6, 6, "FD");
    
    // Center the value
    doc.setTextColor(30, 40, 55);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(String(s.value), x + boxW / 2, y + 26, { align: "center" });
    
    // Center the label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 120, 135);
    doc.text(s.label.toUpperCase(), x + boxW / 2, y + 42, { align: "center" });
  });
  y += 80;

  // Narrative (strip markdown markers for the PDF body)
  doc.setTextColor(40, 48, 62);
  const clean = opts.markdown
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1");

  const lines = clean.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) {
      if (y > 56) y += 6;
      continue;
    }
    
    const isHeading = rawLine.startsWith("#");
    const isBullet = rawLine.trim().startsWith("-") || rawLine.trim().startsWith("*");
    let textContent = rawLine.replace(/^#+\s*/, "");
    if (isBullet) {
      textContent = textContent.replace(/^[-*]\s*/, "- ");
    }
    textContent = textContent.trim();

    // Sanitize non-ASCII characters to prevent jsPDF text measuring/spacing bugs
    textContent = textContent
      .replace(/₂/g, "2")
      .replace(/—/g, "-")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[^\x20-\x7E]/g, ""); // strip all other non-ASCII

    if (isHeading) {
      y += 12; // extra space before heading
      if (y > 770) {
        doc.addPage();
        y = 56;
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(20, 30, 40);
      doc.text(textContent, margin, y, { align: "left" });
      y += 18;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 58, 72);
      
      const wrapped = doc.splitTextToSize(textContent, pageW - margin * 2 - (isBullet ? 10 : 0));
      for (const wLine of wrapped) {
        if (y > 770) {
          doc.addPage();
          y = 56;
        }
        doc.text(wLine, margin + (isBullet ? 10 : 0), y, { align: "left" });
        y += 14;
      }
      y += 4; // space after paragraph
    }
  }

  // Scorecard table
  if (y > 640) {
    doc.addPage();
    y = 56;
  }
  autoTable(doc, {
    startY: y + 8,
    head: [["Department", "Env", "Social", "Gov", "Total", "CO2", "Goal"]],
    body: opts.departments.map((d) => [
      d.name,
      d.environmentalScore.toFixed(0),
      d.socialScore.toFixed(0),
      d.governanceScore.toFixed(0),
      d.totalScore.toFixed(1),
      d.actualCO2.toLocaleString(),
      d.targetCO2 ? d.targetCO2.toLocaleString() : "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [16, 24, 40], textColor: [210, 220, 235] },
    styles: { fontSize: 9, cellPadding: 5 },
    margin: { left: margin, right: margin },
  });

  doc.save(`EcoSphere-ESG-Summary-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/** Download the department scorecard as CSV. */
export function exportScorecardCSV(departments: ScorecardRow[]) {
  const header = [
    "Department",
    "Code",
    "Environmental",
    "Social",
    "Governance",
    "Total",
    "ActualCO2_kg",
    "GoalCO2_kg",
  ];
  const rows = departments.map((d) => [
    d.name,
    d.code,
    d.environmentalScore.toFixed(1),
    d.socialScore.toFixed(1),
    d.governanceScore.toFixed(1),
    d.totalScore.toFixed(1),
    String(d.actualCO2),
    d.targetCO2 !== null ? String(d.targetCO2) : "",
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `EcoSphere-Scorecard-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
