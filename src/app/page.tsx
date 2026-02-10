"use client";

import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import Strategy from "@/components/Strategy";
import CareerPathSteps from "@/components/CareerPathSteps";
import FutureGoals from "@/components/FutureGoals";
import type { PresentationContent } from "@/lib/types";

export default function Home() {
  const [content, setContent] = useState<PresentationContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-800">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <Hero content={content.hero} />
      <Timeline
        milestones={content.timeline}
        onMilestonesChange={(timeline) => {
          setContent((prev) => (prev ? { ...prev, timeline } : prev));
        }}
      />
      <Strategy content={content.strategy} />
      {content.careerPathSteps && (
        <CareerPathSteps content={content.careerPathSteps} />
      )}
      <FutureGoals content={content.futureGoals} />
    </>
  );
}
