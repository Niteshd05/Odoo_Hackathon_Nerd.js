"use client";

import React from "react";

// A deliberately tiny markdown-ish renderer for Copilot output: headings,
// bold, bullet lists, and grounded record-ID citations like [DEPT:MFG] which
// are rendered as accent chips so judges can see the answer is grounded.
const CITE = /\[[A-Z]+:[A-Za-z0-9_-]+\]|\[ORG\]|\[GAMI\]/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on citations first.
  const parts = text.split(CITE);
  const cites = text.match(CITE) ?? [];
  parts.forEach((part, i) => {
    // Bold within the plain part.
    const boldSplit = part.split(/\*\*(.+?)\*\*/g);
    boldSplit.forEach((seg, j) => {
      if (j % 2 === 1) {
        nodes.push(<strong key={`${keyPrefix}-b-${i}-${j}`} className="font-semibold text-fg">{seg}</strong>);
      } else if (seg) {
        nodes.push(<span key={`${keyPrefix}-t-${i}-${j}`}>{seg}</span>);
      }
    });
    if (cites[i]) {
      nodes.push(
        <span
          key={`${keyPrefix}-c-${i}`}
          className="mx-0.5 inline-flex items-center rounded-md border border-env/25 bg-env/10 px-1.5 py-0.5 font-mono text-[11px] text-env-soft"
        >
          {cites[i].replace(/[[\]]/g, "")}
        </span>,
      );
    }
  });
  return nodes;
}

export function RichText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-300">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;
        if (trimmed.startsWith("# ")) {
          return <h2 key={i} className="pt-1 text-lg font-bold text-fg">{renderInline(trimmed.slice(2), `h${i}`)}</h2>;
        }
        if (trimmed.startsWith("## ")) {
          return <h3 key={i} className="pt-1 text-sm font-semibold uppercase tracking-wide text-env-soft">{renderInline(trimmed.slice(3), `h${i}`)}</h3>;
        }
        if (/^[-*•]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-env/70" />
              <span>{renderInline(trimmed.replace(/^[-*•]\s/, ""), `li${i}`)}</span>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          return (
            <div key={i} className="flex gap-2 pl-1">
              <span className="font-mono text-xs text-env-soft">{trimmed.match(/^\d+/)?.[0]}.</span>
              <span>{renderInline(trimmed.replace(/^\d+\.\s/, ""), `ol${i}`)}</span>
            </div>
          );
        }
        return <p key={i}>{renderInline(trimmed, `p${i}`)}</p>;
      })}
    </div>
  );
}
