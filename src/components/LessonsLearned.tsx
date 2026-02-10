"use client";

import { useRef, useEffect, useState } from "react";
import type { LessonLearned } from "@/lib/types";

interface LessonsLearnedProps {
  lessons: LessonLearned[];
}

const ICONS: Record<string, string> = {
  target: "🎯",
  lightbulb: "💡",
  rocket: "🚀",
  star: "⭐",
  heart: "❤️",
  fire: "🔥",
};

export default function LessonsLearned({ lessons }: LessonsLearnedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState<Set<number>>(new Set());

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target instanceof HTMLElement) {
            const i = parseInt(e.target.dataset.index ?? "-1", 10);
            if (i >= 0) setVisible((v) => new Set([...v, i]));
          }
        });
      },
      { threshold: 0.2 }
    );
    el.querySelectorAll("[data-index]").forEach((child) => ob.observe(child));
    return () => ob.disconnect();
  }, []);

  return (
    <section
      id="lessons"
      className="relative min-h-screen px-6 py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-700 via-orange-500 to-amber-600 opacity-90" />
      <div className="absolute inset-0 bg-black/10" />
      <div ref={ref} className="relative z-10 mx-auto max-w-4xl">
        <h2 className="mb-16 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Lessons Learned
        </h2>
        <div className="space-y-8">
          {lessons.map((l, i) => (
            <div
              key={l.id}
              data-index={i}
              className={`rounded-2xl bg-white/15 p-8 backdrop-blur-sm transition-all duration-700 ${
                visible.has(i)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <div className="flex items-start gap-6">
                <span className="text-4xl">
                  {ICONS[l.icon] ?? "📌"}
                </span>
                <div>
                  <div className="mb-2 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/30 text-lg font-bold text-white">
                      {l.number}
                    </span>
                    <h3 className="text-2xl font-bold text-white">
                      {l.headline}
                    </h3>
                  </div>
                  <p className="text-lg text-white/90">{l.paragraph}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
