"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StrategyContent } from "@/lib/types";

interface StrategyProps {
  content: StrategyContent;
}

const SEA_WIDTH = 1100;
const SEA_HEIGHT = 650;
const CARD_WIDTH = 280;
const DRAG_THRESHOLD = 5;
const DRAG_PAD_X = 120;
const DRAG_PAD_Y = 80;

function defaultVPositions(n: number): { x: number; y: number }[] {
  const numPairs = Math.floor(n / 2);
  const hasCenter = n % 2 === 1;
  const positions: { x: number; y: number }[] = [];
  const rowStep = 72;
  const xMargin = 24;
  const xStep = 44;
  for (let row = 0; row < numPairs; row++) {
    positions[row] = {
      x: xMargin + row * xStep,
      y: 24 + row * rowStep,
    };
    positions[n - 1 - row] = {
      x: SEA_WIDTH - xMargin - CARD_WIDTH - row * xStep,
      y: 24 + row * rowStep,
    };
  }
  if (hasCenter) {
    positions[numPairs] = {
      x: (SEA_WIDTH - CARD_WIDTH) / 2,
      y: 24 + numPairs * rowStep,
    };
  }
  return positions;
}

const SWAY_DURATION = 5;
const SWAY_OFFSET = 0.6; // stagger delay between cards (seconds)

export default function Strategy({ content }: StrategyProps) {
  const points = content.points;
  const n = points.length;
  const [positions, setPositions] = useState<{ x: number; y: number }[]>(() =>
    content.pointPositions && content.pointPositions.length === n
      ? content.pointPositions
      : defaultVPositions(n)
  );
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const dragStartRef = useRef({ clientX: 0, clientY: 0, posX: 0, posY: 0 });
  const hasDraggedRef = useRef(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      hasDraggedRef.current = false;
      dragStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        posX: positions[index].x,
        posY: positions[index].y,
      };
      setDraggingIndex(index);
    },
    [positions]
  );

  const applyDrag = useCallback((clientX: number, clientY: number) => {
    const idx = draggingIndex;
    if (idx === null) return;
    const { clientX: startX, clientY: startY, posX, posY } = dragStartRef.current;
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) hasDraggedRef.current = true;
    const minX = -DRAG_PAD_X;
    const maxX = SEA_WIDTH - CARD_WIDTH + DRAG_PAD_X;
    const minY = -DRAG_PAD_Y;
    const maxY = SEA_HEIGHT - 80 + DRAG_PAD_Y;
    setPositions((prev) => {
      const next = [...prev];
      next[idx] = {
        x: Math.max(minX, Math.min(maxX, posX + dx)),
        y: Math.max(minY, Math.min(maxY, posY + dy)),
      };
      return next;
    });
  }, [draggingIndex]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (draggingIndex === null) return;
      applyDrag(e.clientX, e.clientY);
    },
    [draggingIndex, applyDrag]
  );

  const handleMouseUp = useCallback(() => {
    setHasEntered(true);
    setDraggingIndex(null);
  }, []);

  useEffect(() => {
    if (draggingIndex === null) return;
    const onMove = (e: MouseEvent) => handleMouseMove(e);
    const onUp = () => handleMouseUp();
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
  }, [draggingIndex, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const t = setTimeout(() => setHasEntered(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      id="strategy"
      className="relative min-h-screen px-6 py-24"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes strategy-hold {
          0%, 100% { opacity: 1; }
        }
        @keyframes strategy-sway {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(2px, -3px) rotate(0.3deg); }
          50% { transform: translate(-2px, 2px) rotate(-0.3deg); }
          75% { transform: translate(1px, 2px) rotate(0.2deg); }
        }
      `}} />
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600 via-blue-600 to-cyan-600 opacity-90" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="mb-12 animate-slide-up text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          {content.headline}
        </h2>
        <p className="mb-16 animate-slide-up text-xl text-white/90 [animation-delay:0.1s] opacity-0 [animation-fill-mode:forwards]">
          {content.description}
        </p>
        {/* Sea: V-shape base, draggable cards with sway */}
        <div
          className="relative mx-auto overflow-visible"
          style={{ width: SEA_WIDTH, minHeight: SEA_HEIGHT }}
        >
          {points.map((point, i) => {
            const isDragging = draggingIndex === i;
            const slideDelay = 0.2 + i * 0.08;
            const swayStart = hasEntered
              ? (i * SWAY_OFFSET) % SWAY_DURATION
              : slideDelay + 0.7 + (i * SWAY_OFFSET) % SWAY_DURATION;
            const useHold = hasEntered;
            const animation = isDragging
              ? undefined
              : useHold
                ? `strategy-hold 0.01s forwards, strategy-sway ${SWAY_DURATION}s ease-in-out ${swayStart}s infinite`
                : `slide-up 0.7s ease-out ${slideDelay}s forwards, strategy-sway ${SWAY_DURATION}s ease-in-out ${swayStart}s infinite`;
            return (
              <div
                key={i}
                role="button"
                tabIndex={0}
                onMouseDown={(e) => handleMouseDown(e, i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMouseDown(e as unknown as React.MouseEvent, i);
                  }
                }}
                className="absolute flex max-w-[280px] cursor-grab select-none items-center rounded-2xl border-l-4 border-white/40 bg-white/15 py-3 pl-5 pr-6 text-base font-medium text-white shadow-lg backdrop-blur-sm opacity-0 transition-shadow duration-200 hover:scale-[1.02] hover:bg-white/25 hover:shadow-xl active:cursor-grabbing sm:py-4 sm:text-lg [animation-fill-mode:forwards]"
                style={{
                  animation,
                  left: positions[i].x,
                  top: positions[i].y,
                  zIndex: isDragging ? 20 : 10,
                  opacity: isDragging ? 1 : undefined,
                }}
              >
                <span className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/30 text-sm font-bold sm:h-10 sm:w-10">
                  {i + 1}
                </span>
                {point}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
