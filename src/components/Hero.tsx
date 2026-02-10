"use client";

import type { HeroContent } from "@/lib/types";

interface HeroProps {
  content: HeroContent;
}

export default function Hero({ content }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
    >
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 opacity-90" />
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <h1 className="animate-fade-in text-5xl font-bold tracking-tight text-white drop-shadow-lg sm:text-7xl md:text-8xl">
          {content.name}
        </h1>
        <p className="animate-fade-in text-xl font-medium text-white/90 [animation-delay:0.2s] sm:text-2xl opacity-0 [animation-fill-mode:forwards]">
          {content.title}
        </p>
        <p className="animate-fade-in max-w-2xl text-lg text-white/80 [animation-delay:0.4s] opacity-0 [animation-fill-mode:forwards]">
          {content.tagline}
        </p>
        <div className="animate-fade-in mt-4 flex flex-wrap items-center justify-center gap-4 [animation-delay:0.6s] opacity-0 [animation-fill-mode:forwards]">
          <a
            href="#timeline"
            className="rounded-full bg-white px-8 py-4 font-semibold text-indigo-700 shadow-xl transition hover:scale-105 hover:bg-white/95"
          >
            {content.ctaText}
          </a>
          {content.linkedInUrl && (
            <a
              href={content.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border-2 border-white bg-white/10 px-8 py-4 font-semibold text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-white/20"
            >
              {content.linkedInCtaText ?? "Let's connect"}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
