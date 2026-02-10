"use client";

import type { CareerPathStepsContent } from "@/lib/types";

interface CareerPathStepsProps {
  content: CareerPathStepsContent;
}

export default function CareerPathSteps({ content }: CareerPathStepsProps) {
  return (
    <section
      id="career-path-steps"
      className="relative min-h-screen px-6 py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-violet-700 via-purple-600 to-indigo-700 opacity-90" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="mb-6 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          {content.headline}
        </h2>
        <p className="mb-16 text-center text-xl text-white/90">
          {content.description}
        </p>
        <div className="space-y-8">
          {content.steps.map((step) => (
            <div
              key={step.id}
              className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm sm:p-8"
            >
              <div className="flex items-start gap-4 sm:gap-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/30 text-lg font-bold text-white">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-white sm:text-2xl">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-white/90">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
