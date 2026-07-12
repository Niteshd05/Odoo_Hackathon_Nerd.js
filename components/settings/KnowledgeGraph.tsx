"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";

export type GraphNode = {
  id: string;
  label: string;
  type: "department" | "factor" | "policy" | "challenge";
  value: number;
  color: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  label?: string;
};

type PhysicsNode = GraphNode & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const TYPE_CONFIG: Record<string, { shape: string; icon: string }> = {
  department: { shape: "circle", icon: "Building2" },
  factor: { shape: "diamond", icon: "Sigma" },
  policy: { shape: "square", icon: "FileText" },
  challenge: { shape: "hexagon", icon: "Trophy" },
};

const LEGEND = [
  { type: "department", label: "Departments", color: "#34d399" },
  { type: "factor", label: "Emission Factors", color: "#38bdf8" },
  { type: "policy", label: "Policies", color: "#a78bfa" },
  { type: "challenge", label: "Challenges", color: "#fbbf24" },
];

export function KnowledgeGraph({
  nodes,
  edges,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const physicsNodes = useRef<PhysicsNode[]>([]);
  const animRef = useRef<number>(0);
  const [hoveredNode, setHoveredNode] = useState<PhysicsNode | null>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 500 });
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Initialize physics nodes
  useEffect(() => {
    const w = dimensions.w;
    const h = dimensions.h;
    physicsNodes.current = nodes.map((n, i) => ({
      ...n,
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: h / 2 + (Math.random() - 0.5) * h * 0.6,
      vx: 0,
      vy: 0,
      radius: Math.max(18, Math.min(36, n.value / 2.5)),
    }));
  }, [nodes, dimensions]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          w: entry.contentRect.width,
          h: Math.max(400, entry.contentRect.height),
        });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Physics simulation + render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.w * dpr;
    canvas.height = dimensions.h * dpr;
    ctx.scale(dpr, dpr);

    const pNodes = physicsNodes.current;
    const nodeMap = new Map(pNodes.map((n) => [n.id, n]));

    let time = 0;

    const tick = () => {
      time += 0.016;
      const w = dimensions.w;
      const h = dimensions.h;

      // Simple force simulation
      const damping = 0.92;
      const repulsion = 2000;
      const attraction = 0.003;
      const centerForce = 0.0008;

      // Repulsion between all nodes
      for (let i = 0; i < pNodes.length; i++) {
        for (let j = i + 1; j < pNodes.length; j++) {
          const dx = pNodes[j].x - pNodes[i].x;
          const dy = pNodes[j].y - pNodes[i].y;
          const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const force = repulsion / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          pNodes[i].vx -= fx;
          pNodes[i].vy -= fy;
          pNodes[j].vx += fx;
          pNodes[j].vy += fy;
        }
      }

      // Attraction along edges
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;
        const dx = t.x - s.x;
        const dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = (dist - 120) * attraction;
        const fx = (dx / Math.max(1, dist)) * force;
        const fy = (dy / Math.max(1, dist)) * force;
        s.vx += fx;
        s.vy += fy;
        t.vx -= fx;
        t.vy -= fy;
      }

      // Center gravity + update positions
      for (const n of pNodes) {
        n.vx += (w / 2 - n.x) * centerForce;
        n.vy += (h / 2 - n.y) * centerForce;
        n.vx *= damping;
        n.vy *= damping;
        n.x += n.vx;
        n.y += n.vy;
        // Bounds
        n.x = Math.max(n.radius + 10, Math.min(w - n.radius - 10, n.x));
        n.y = Math.max(n.radius + 10, Math.min(h - n.radius - 10, n.y));
      }

      // ── Render ──
      ctx.clearRect(0, 0, w, h);

      // Edges
      for (const edge of edges) {
        const s = nodeMap.get(edge.source);
        const t = nodeMap.get(edge.target);
        if (!s || !t) continue;

        const isHighlighted =
          hoveredNode && (hoveredNode.id === s.id || hoveredNode.id === t.id);

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
        ctx.strokeStyle = isHighlighted
          ? "rgba(52, 211, 153, 0.4)"
          : "rgba(148, 163, 184, 0.08)";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.stroke();

        // Animated pulse along highlighted edges
        if (isHighlighted) {
          const progress = (time * 0.3) % 1;
          const px = s.x + (t.x - s.x) * progress;
          const py = s.y + (t.y - s.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(52, 211, 153, 0.6)";
          ctx.fill();
        }
      }

      // Nodes
      for (const n of pNodes) {
        const isHovered = hoveredNode?.id === n.id;
        const isConnected =
          hoveredNode &&
          edges.some(
            (e) =>
              (e.source === hoveredNode.id && e.target === n.id) ||
              (e.target === hoveredNode.id && e.source === n.id),
          );
        const dimmed = hoveredNode && !isHovered && !isConnected;

        // Outer glow
        if (isHovered || isConnected) {
          const grad = ctx.createRadialGradient(n.x, n.y, n.radius, n.x, n.y, n.radius * 2.5);
          grad.addColorStop(0, n.color + "30");
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Pulsing border ring
        const pulseScale = 1 + Math.sin(time * 2 + n.x) * 0.05;
        const drawRadius = n.radius * pulseScale;

        // Node body
        ctx.beginPath();
        ctx.arc(n.x, n.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = dimmed ? "rgba(14, 20, 36, 0.6)" : "rgba(14, 20, 36, 0.85)";
        ctx.fill();

        // Node border
        ctx.beginPath();
        ctx.arc(n.x, n.y, drawRadius, 0, Math.PI * 2);
        ctx.strokeStyle = dimmed ? n.color + "20" : n.color + (isHovered ? "cc" : "60");
        ctx.lineWidth = isHovered ? 2.5 : 1.5;
        ctx.stroke();

        // Label
        ctx.font = `${isHovered ? "bold " : ""}${Math.max(9, drawRadius / 2.5)}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = dimmed ? "rgba(148,163,184,0.3)" : (isHovered ? "#ffffff" : "rgba(226,232,240,0.8)");
        ctx.fillText(n.label, n.x, n.y);
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [dimensions, edges, hoveredNode]);

  // Mouse hover detection
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mousePos.current = { x, y };

      const found = physicsNodes.current.find((n) => {
        const dx = n.x - x;
        const dy = n.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= n.radius + 4;
      });
      setHoveredNode(found ?? null);
    },
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="card relative overflow-hidden"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-gov/25 to-env/15">
          <Icon name="Network" className="h-4 w-4 text-gov-soft" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-white">ESG Knowledge Graph</h3>
          <p className="text-xs text-slate-500">Interactive view of data relationships</p>
        </div>
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-env animate-breathing" />
          {nodes.length} nodes · {edges.length} edges
        </span>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-white/[0.06] bg-ink-950/50 overflow-hidden"
        style={{ height: 420 }}
      >
        <canvas
          ref={canvasRef}
          style={{ width: dimensions.w, height: dimensions.h }}
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredNode(null)}
        />

        {/* Hovered node tooltip */}
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass absolute z-20 px-3 py-2 text-xs pointer-events-none"
            style={{
              left: Math.min(hoveredNode.x + 16, dimensions.w - 180),
              top: Math.max(hoveredNode.y - 40, 8),
              boxShadow: `0 0 30px -8px ${hoveredNode.color}30`,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: hoveredNode.color }} />
              <span className="font-semibold text-white">{hoveredNode.label}</span>
            </div>
            <div className="mt-1 text-slate-400 capitalize">{hoveredNode.type} · Score: {hoveredNode.value}</div>
          </motion.div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {LEGEND.map((l) => (
            <span key={l.type} className="flex items-center gap-1.5 rounded-md bg-ink-950/70 px-2 py-1 text-[10px] text-slate-400 backdrop-blur-sm border border-white/[0.06]">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
