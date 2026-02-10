"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { TimelineMilestone } from "@/lib/types";

function placeDisplay(m: TimelineMilestone): string {
  const label = m.placeLabel ?? "Company";
  return label === "Company" ? m.company : `${label}: ${m.company}`;
}

const DRAG_THRESHOLD = 5;

interface TimelineProps {
  milestones: TimelineMilestone[];
  onMilestonesChange?: (milestones: TimelineMilestone[]) => void;
}

const PHASE_COLORS: Record<string, string> = {
  education: "from-emerald-500 to-teal-600",
  early: "from-cyan-500 to-blue-600",
  growth: "from-violet-500 to-purple-600",
  current: "from-amber-500 to-orange-600",
};

/** Preset colors for milestone color override (admin dropdown) */
const MILESTONE_COLORS: Record<string, string> = {
  default: "",
  emerald: "from-emerald-500 to-teal-600",
  cyan: "from-cyan-500 to-blue-600",
  violet: "from-violet-500 to-purple-600",
  amber: "from-amber-500 to-orange-600",
  rose: "from-rose-500 to-pink-600",
  blue: "from-blue-500 to-indigo-600",
  green: "from-green-500 to-emerald-600",
  gray: "from-gray-500 to-gray-600",
};

function getGradient(m: TimelineMilestone): string {
  const override = m.color ? MILESTONE_COLORS[m.color] : undefined;
  if (override && override !== "") return override;
  return PHASE_COLORS[m.phase] ?? "from-gray-500 to-gray-600";
}

const SEGMENT_WIDTH = 280;
const ROAD_WIDTH = 24;
const SVG_HEIGHT = 320;
const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;
const ZOOM_WHEEL_FACTOR = 0.003;

/** Path through current node positions so the road stays connected when nodes are moved */
function buildPolylineThroughPoints(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  let d = `M ${first.x} ${first.y}`;
  for (const p of rest) d += ` L ${p.x} ${p.y}`;
  return d;
}

function getNodePositionsHorizontal(count: number) {
  const positions: { x: number; align: "top" | "center" | "bottom" }[] = [];
  for (let i = 0; i < count; i++) {
    const x = (i + 0.5) * SEGMENT_WIDTH;
    const align =
      i === 0 ? "center" : i % 2 === 1 ? "top" : "bottom";
    positions.push({ x, align });
  }
  return positions;
}

function getDefaultPositionInPixels(
  index: number,
  count: number,
  width: number,
  height: number
): { x: number; y: number } {
  const positions = getNodePositionsHorizontal(count);
  const pos = positions[index];
  if (!pos) return { x: width / 2, y: height / 2 };
  const y =
    pos.align === "center"
      ? height / 2
      : pos.align === "top"
        ? height * 0.18
        : height * 0.82;
  return { x: pos.x, y };
}

/** Circular node: compact circle (draggable, click to expand); shows role and company inside. */
function MilestoneCircle({
  m,
  isExpanded,
  onToggle,
  onOpenDetails,
  gradient,
  preventPan,
  placeDisplayLabel,
}: {
  m: TimelineMilestone;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
  gradient: string;
  preventPan: (v: boolean) => void;
  placeDisplayLabel: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        onMouseDown={() => preventPan(true)}
        onMouseUp={() => preventPan(false)}
        onMouseLeave={() => preventPan(false)}
        className={`flex h-24 w-24 flex-shrink-0 cursor-grab flex-col items-center justify-center gap-0.5 rounded-full bg-gradient-to-br px-1.5 py-2 shadow-xl ring-4 ring-white/30 transition hover:scale-110 hover:shadow-2xl active:cursor-grabbing md:h-28 md:w-28 ${gradient}`}
      >
        {m.logoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.logoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-contain md:h-11 md:w-11" />
            <p className="line-clamp-1 max-w-full text-center text-[10px] font-semibold leading-tight text-white md:text-xs">{m.role}</p>
            <p className="line-clamp-1 max-w-full text-center text-[9px] leading-tight text-white/95 md:text-[10px]">{placeDisplayLabel}</p>
          </>
        ) : (
          <>
            <p className="line-clamp-2 max-w-full text-center text-xs font-semibold leading-tight text-white md:text-sm">{m.role}</p>
            <p className="line-clamp-2 max-w-full text-center text-[10px] leading-tight text-white/95 md:text-xs">{placeDisplayLabel}</p>
          </>
        )}
      </div>
      {isExpanded && (
        <div className="mt-2 w-56 rounded-xl bg-black/20 p-3 text-left shadow-lg">
          <p className="font-bold text-white">{m.role}</p>
          <p className="text-sm text-white/90">{placeDisplayLabel}</p>
          <p className="text-xs text-white/80">{m.dateRange}</p>
          <p className="mt-2 text-xs text-white/95">{m.description}</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="mt-2 rounded bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
          >
            Full details
          </button>
        </div>
      )}
    </div>
  );
}

/** Details modal: full details and image display (no upload – use admin dashboard to change image) */
function DetailModal({
  milestone: m,
  gradient,
  onClose,
}: {
  milestone: TimelineMilestone;
  gradient: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Node details"
    >
      <div
        className={`max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-gradient-to-br p-8 shadow-2xl sm:max-w-4xl sm:p-9 ${gradient}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{m.role}</h3>
            <p className="mt-1.5 text-lg font-medium text-white/90 sm:text-xl">{placeDisplay(m)}</p>
            <p className="mt-1 text-base text-white/80 sm:text-lg">{m.dateRange}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white/20 p-2.5 text-white hover:bg-white/30"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {m.logoUrl && (
          <div className="mt-6 overflow-hidden rounded-xl bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.logoUrl}
              alt=""
              className="h-52 w-full object-contain object-center sm:h-64 md:h-72"
            />
          </div>
        )}

        <div className="mt-6 space-y-4 text-base sm:text-lg">
          <p className="text-white/95">{m.description}</p>
          {m.project && (
            <p className="text-white/85">
              <span className="font-semibold">Project:</span> {m.project}
            </p>
          )}
          {m.course && (
            <p className="text-white/85">
              <span className="font-semibold">Course:</span> {m.course}
            </p>
          )}
          {m.expandedDetails && (
            <div className="border-t border-white/30 pt-4">
              <p className="text-sm font-medium text-white/80">More details</p>
              <p className="mt-2 text-white/90">{m.expandedDetails}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Single milestone card (draggable, click to expand) */
function MilestoneCard({
  m,
  isExpanded,
  onToggle,
  onOpenDetails,
  gradient,
  isChild,
  preventPan,
}: {
  m: TimelineMilestone;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenDetails: () => void;
  gradient: string;
  isChild?: boolean;
  preventPan: (v: boolean) => void;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} shadow-xl ${isChild ? "rounded-xl" : ""}`}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => e.key === "Enter" && onToggle()}
        onMouseDown={() => preventPan(true)}
        onMouseUp={() => preventPan(false)}
        onMouseLeave={() => preventPan(false)}
        className={`block w-full cursor-grab p-4 text-left transition hover:scale-[1.02] hover:shadow-2xl active:cursor-grabbing md:p-6 ${isChild ? "p-3" : ""}`}
      >
        {m.logoUrl && (
          <div className={`overflow-hidden rounded-lg bg-white/20 ${isChild ? "mb-2 h-8 w-8" : "mb-3 h-10 w-10"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.logoUrl} alt="" className="h-full w-full object-contain" />
          </div>
        )}
        <h3 className={`font-bold text-white ${isChild ? "text-sm" : "text-lg"}`}>{m.role}</h3>
        <p className={`font-medium text-white/90 ${isChild ? "text-xs" : "text-sm"}`}>{placeDisplay(m)}</p>
        <p className={`mt-1 text-white/80 ${isChild ? "text-xs" : "text-sm"}`}>{m.dateRange}</p>
        {!isExpanded && (
          <p className={`mt-2 line-clamp-2 text-white/95 ${isChild ? "text-xs" : "text-sm"}`}>{m.description}</p>
        )}
        {isExpanded && (
          <>
            <p className="mt-2 text-white/95 text-sm">{m.description}</p>
            {m.project && (
              <p className="mt-2 text-sm text-white/85">
                <span className="font-semibold">Project:</span> {m.project}
              </p>
            )}
            {m.course && (
              <p className="mt-1 text-sm text-white/85">
                <span className="font-semibold">Course:</span> {m.course}
              </p>
            )}
            {m.expandedDetails && (
              <div className="mt-3 border-t border-white/30 pt-3">
                <p className="text-sm text-white/90">{m.expandedDetails}</p>
              </div>
            )}
          </>
        )}
        <span
          className={`absolute right-3 top-3 text-lg text-white/90 transition-transform ${isExpanded ? "rotate-180" : ""} ${isChild ? "text-sm" : ""}`}
        >
          ▼
        </span>
      </div>
      {isExpanded && (
        <div className="border-t border-white/20 px-4 pb-3 pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/30"
          >
            Open full details
          </button>
        </div>
      )}
    </div>
  );
}

export default function Timeline({
  milestones: initialMilestones,
  onMilestonesChange,
}: TimelineProps) {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>(initialMilestones);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailNode, setDetailNode] = useState<TimelineMilestone | null>(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragNodeStart, setDragNodeStart] = useState({ clientX: 0, clientY: 0, posX: 0, posY: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const preventPanRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const preventPan = useCallback((v: boolean) => {
    preventPanRef.current = v;
  }, []);

  const handleToggleExpand = useCallback(
    (id: string) => {
      if (hasDraggedRef.current) {
        hasDraggedRef.current = false;
        return;
      }
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const { path, svgWidth, svgHeight, nodePositions } = useMemo(() => {
    const count = milestones.length;
    const baseWidth = Math.max(600, count * SEGMENT_WIDTH);
    const baseHeight = SVG_HEIGHT;
    const positions = milestones.map((m, i) =>
      m.position ?? getDefaultPositionInPixels(i, count, baseWidth, baseHeight)
    );
    const d = buildPolylineThroughPoints(positions);
    const padding = 100;
    const width = Math.max(baseWidth, ...positions.map((p) => p.x)) + padding;
    const height = Math.max(baseHeight, ...positions.map((p) => p.y)) + padding;
    return { path: d, svgWidth: width, svgHeight: height, nodePositions: positions };
  }, [milestones]);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = -e.deltaY * ZOOM_WHEEL_FACTOR;
      setScale((s) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, s + delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const getNodePosition = useCallback(
    (id: string): { x: number; y: number } => {
      const idx = milestones.findIndex((n) => n.id === id);
      if (idx === -1) return { x: svgWidth / 2, y: svgHeight / 2 };
      const m = milestones[idx];
      if (m.position) return m.position;
      const baseW = Math.max(600, milestones.length * SEGMENT_WIDTH);
      return getDefaultPositionInPixels(idx, milestones.length, baseW, SVG_HEIGHT);
    },
    [milestones, svgWidth, svgHeight]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (preventPanRef.current) return;
      const nodeEl = (e.target as HTMLElement).closest("[data-milestone-node]");
      if (nodeEl) return;
      if ((e.target as HTMLElement).closest("button")) return;
      setIsPanning(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart(pan);
    },
    [pan]
  );

  const handleNodeDragStart = useCallback(
    (e: React.MouseEvent, id: string) => {
      if ((e.target as HTMLElement).closest("button")) return;
      e.stopPropagation();
      hasDraggedRef.current = false;
      const pos = getNodePosition(id);
      setDraggingNodeId(id);
      setDragNodeStart({ clientX: e.clientX, clientY: e.clientY, posX: pos.x, posY: pos.y });
    },
    [getNodePosition]
  );

  const applyNodeDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!draggingNodeId) return;
      const dx = (clientX - dragNodeStart.clientX) / scale;
      const dy = (clientY - dragNodeStart.clientY) / scale;
      const dist = Math.hypot(dx * scale, dy * scale);
      if (dist > DRAG_THRESHOLD) hasDraggedRef.current = true;
      const newX = Math.max(0, dragNodeStart.posX + dx);
      const newY = Math.max(0, dragNodeStart.posY + dy);
      setMilestones((prev) => {
        const next = prev.map((n) =>
          n.id === draggingNodeId ? { ...n, position: { x: newX, y: newY } } : n
        );
        queueMicrotask(() => onMilestonesChange?.(next));
        return next;
      });
    },
    [draggingNodeId, dragNodeStart, scale, onMilestonesChange]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (draggingNodeId) {
        applyNodeDrag(e.clientX, e.clientY);
        return;
      }
      if (!isPanning) return;
      setPan({
        x: panStart.x + e.clientX - dragStart.x,
        y: panStart.y + e.clientY - dragStart.y,
      });
    },
    [draggingNodeId, isPanning, panStart, dragStart, applyNodeDrag]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setIsPanning(false);
    setDraggingNodeId(null);
  }, []);

  useEffect(() => {
    if (!draggingNodeId) return;
    const onMove = (e: MouseEvent) => applyNodeDrag(e.clientX, e.clientY);
    const onUp = () => setDraggingNodeId(null);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [draggingNodeId, applyNodeDrag]);

  const openDetails = useCallback((m: TimelineMilestone) => setDetailNode(m), []);
  const closeDetails = useCallback(() => setDetailNode(null), []);

  return (
    <section
      id="timeline"
      className="relative min-h-screen px-4 py-20 md:px-6 md:py-24"
    >
      {/* Dark, calm backdrop to make the road and nodes pop */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 opacity-95" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-2 sm:px-4">
        <h2 className="mb-6 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Career Journey
        </h2>

        {/* Career workflow canvas (desktop) */}
        <div
          ref={canvasRef}
          className="relative hidden overflow-hidden rounded-2xl border-2 border-white/20 bg-black/10 md:block"
          style={{
            height: "clamp(420px, 65vh, 580px)",
            cursor: isPanning ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          role="application"
          aria-label="Career workflow canvas"
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              className="relative flex-shrink-0"
              style={{ width: svgWidth, height: svgHeight }}
            >
              {/* Road path */}
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="absolute inset-0 h-full w-full"
              >
                <defs>
                  <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.35)" />
                  </linearGradient>
                  <filter id="roadShadow">
                    <feDropShadow dx="2" dy="0" stdDeviation="3" floodOpacity="0.3" />
                  </filter>
                </defs>
                <path
                  d={path}
                  fill="none"
                  stroke="url(#roadGradient)"
                  strokeWidth={ROAD_WIDTH}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#roadShadow)"
                />
                <path
                  d={path}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="12 8"
                />
              </svg>

              {/* Node cards / circles (movable; path connects current positions) */}
              {milestones.map((m, i) => {
                const isExpanded = expandedId === m.id;
                const gradient = getGradient(m);
                const position = nodePositions[i] ?? getDefaultPositionInPixels(i, milestones.length, svgWidth, svgHeight);
                const hasChildren = m.children && m.children.length > 0;
                const isCircle = m.shape === "circle";

                return (
                  <div
                    key={m.id}
                    data-milestone-node
                    data-milestone-id={m.id}
                    onMouseDown={(e) => handleNodeDragStart(e, m.id)}
                    className="absolute z-10 cursor-move"
                    style={{
                      left: position.x,
                      top: position.y,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className={isCircle ? "" : "w-[260px] max-w-[90%]"} onClick={(e) => e.stopPropagation()}>
                      {isCircle ? (
                        <MilestoneCircle
                          m={m}
                          isExpanded={isExpanded}
                          onToggle={() => handleToggleExpand(m.id)}
                          onOpenDetails={() => openDetails(m)}
                          gradient={gradient}
                          preventPan={preventPan}
                          placeDisplayLabel={placeDisplay(m)}
                        />
                      ) : (
                        <>
                          <MilestoneCard
                            m={m}
                            isExpanded={isExpanded}
                            onToggle={() => handleToggleExpand(m.id)}
                            onOpenDetails={() => openDetails(m)}
                            gradient={gradient}
                            preventPan={preventPan}
                          />
                          {hasChildren && (
                            <div className="mt-2 flex flex-wrap justify-center gap-2 border-t border-white/20 pt-2">
                              {m.children!.map((child) => (
                                <div key={child.id} className="w-full min-w-0 max-w-[200px]">
                                  <MilestoneCard
                                    m={child}
                                    isExpanded={expandedId === child.id}
                                    onToggle={() => handleToggleExpand(child.id)}
                                    onOpenDetails={() => openDetails(child)}
                                    gradient={getGradient(child)}
                                    isChild
                                    preventPan={preventPan}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Details panel (modal) with image display and upload */}
        {detailNode && (() => {
          const current = milestones.find((m) => m.id === detailNode.id) ?? detailNode;
          const gradient = getGradient(current);
          return (
            <DetailModal
              milestone={current}
              gradient={gradient}
              onClose={closeDetails}
            />
          );
        })()}

        {/* Mobile: simple stacked list (no pan/zoom) */}
        <div className="mt-8 flex flex-col gap-6 md:hidden">
          {milestones.map((m, i) => {
            const isExpanded = expandedId === m.id;
            const gradient = getGradient(m);
            const hasChildren = m.children && m.children.length > 0;
            return (
              <div key={m.id} className="relative flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-4 w-4 shrink-0 rounded-full border-4 border-white/90 bg-teal-400 shadow" />
                  {i < milestones.length - 1 && (
                    <div className="mt-1 h-full w-0.5 flex-1 bg-white/40" />
                  )}
                </div>
                <div className="flex-1">
                  <MilestoneCard
                    m={m}
                    isExpanded={isExpanded}
                    onToggle={() => handleToggleExpand(m.id)}
                    onOpenDetails={() => openDetails(m)}
                    gradient={gradient}
                    preventPan={preventPan}
                  />
                  {hasChildren && (
                    <div className="mt-3 flex flex-col gap-2 border-t border-white/20 pt-3">
                      {m.children!.map((child) => (
                        <MilestoneCard
                          key={child.id}
                          m={child}
                          isExpanded={expandedId === child.id}
                          onToggle={() => handleToggleExpand(child.id)}
                          onOpenDetails={() => openDetails(child)}
                          gradient={getGradient(child)}
                          isChild
                          preventPan={preventPan}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
