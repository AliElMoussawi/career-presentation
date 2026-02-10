"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "hero", label: "About" },
  { id: "timeline", label: "Timeline" },
  { id: "strategy", label: "Strategy" },
  { id: "career-path-steps", label: "Steps" },
  { id: "future", label: "Future" },
];

export default function Navigation() {
  const [active, setActive] = useState("hero");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 50);
      const scrollY = window.scrollY;
      const heights = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        return el ? el.offsetTop + el.offsetHeight / 2 : 0;
      });
      for (let i = heights.length - 1; i >= 0; i--) {
        if (scrollY >= heights[i] - 200) {
          setActive(SECTIONS[i]!.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const progress =
    (SECTIONS.findIndex((s) => s.id === active) + 1) / SECTIONS.length;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
          scrolled ? "bg-black/40 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <a href="#hero" className="text-lg font-bold text-white">
          Career Journey
        </a>
        <div className="flex gap-6">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`hidden text-sm font-medium transition sm:block ${
                active === s.id
                  ? "text-white underline decoration-2 underline-offset-4"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>
      <div className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 pl-4 lg:flex">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`h-2 w-2 rounded-full transition ${
              active === s.id ? "bg-white scale-125" : "bg-white/50 hover:bg-white/80"
            }`}
            title={s.label}
          />
        ))}
      </div>
      <div
        className="fixed left-0 top-0 z-50 h-1 bg-white/80 transition-all duration-300"
        style={{ width: `${progress * 100}%` }}
      />
    </>
  );
}
