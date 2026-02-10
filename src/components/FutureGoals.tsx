"use client";

import type { FutureGoalsContent } from "@/lib/types";

interface FutureGoalsProps {
  content: FutureGoalsContent;
}

export default function FutureGoals({ content }: FutureGoalsProps) {
  const ctaLabel = content.ctaText || "Let's connect";
  const ctaHref = content.linkedInUrl || "#hero";

  return (
    <section
      id="future"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-orange-600 to-rose-600 opacity-90" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="mb-12 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          {content.headline}
        </h2>
        <a
          href={ctaHref}
          {...(content.linkedInUrl
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          className="inline-block rounded-full bg-white px-10 py-4 font-semibold text-orange-700 shadow-xl transition hover:scale-105 hover:bg-white/95"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
