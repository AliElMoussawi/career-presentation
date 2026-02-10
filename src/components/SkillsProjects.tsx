"use client";

import type { SkillBadge, ProjectCard } from "@/lib/types";

interface SkillsProjectsProps {
  skills: SkillBadge[];
  projects: ProjectCard[];
}

const CATEGORY_LABELS: Record<string, string> = {
  language: "Languages",
  framework: "Frameworks",
  tool: "Tools",
  other: "Other",
};

const CATEGORY_COLORS: Record<string, string> = {
  language: "bg-blue-500/80 hover:bg-blue-500",
  framework: "bg-violet-500/80 hover:bg-violet-500",
  tool: "bg-amber-500/80 hover:bg-amber-500",
  other: "bg-teal-500/80 hover:bg-teal-500",
};

export default function SkillsProjects({ skills, projects }: SkillsProjectsProps) {
  const byCategory = skills.reduce<Record<string, SkillBadge[]>>((acc, s) => {
    const cat = s.category ?? "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <section
      id="skills"
      className="relative min-h-screen px-6 py-24"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-600 via-teal-600 to-cyan-700 opacity-90" />
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className="mb-16 text-center text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Skills & Projects
        </h2>

        <div className="mb-20">
          <h3 className="mb-6 text-2xl font-semibold text-white">
            Skills
          </h3>
          <div className="space-y-8">
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat}>
                <h4 className="mb-3 text-sm font-medium uppercase tracking-wider text-white/80">
                  {CATEGORY_LABELS[cat] ?? cat}
                </h4>
                <div className="flex flex-wrap gap-3">
                  {items.map((s) => (
                    <span
                      key={s.id}
                      className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow transition ${CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.other}`}
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-2xl font-semibold text-white">
            Featured Projects
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl bg-white/15 p-6 backdrop-blur-sm transition hover:scale-[1.02] hover:bg-white/25"
              >
                <h4 className="text-xl font-bold text-white">{p.title}</h4>
                <p className="mt-2 text-white/90">{p.description}</p>
                <ul className="mt-4 space-y-1">
                  {p.outcomes.map((o, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/85">
                      <span className="text-emerald-300">✓</span> {o}
                    </li>
                  ))}
                </ul>
                {p.techStack && p.techStack.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {p.techStack.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-white/20 px-2 py-1 text-xs text-white"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
