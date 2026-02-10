"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type {
  PresentationContent,
  HeroContent,
  StrategyContent,
  TimelineMilestone,
  PlaceLabel,
  CareerPathStepsContent,
  CareerPathStep,
  SkillBadge,
  ProjectCard,
  LessonLearned,
  FutureGoalsContent,
  CareerPhase,
} from "@/lib/types";

const PHASES: CareerPhase[] = ["education", "early", "growth", "current"];
const MILESTONE_SHAPES: { value: TimelineMilestone["shape"]; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "circle", label: "Circle" },
];
const MILESTONE_COLOR_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Default (by phase)" },
  { value: "emerald", label: "Emerald" },
  { value: "cyan", label: "Cyan" },
  { value: "violet", label: "Violet" },
  { value: "amber", label: "Amber" },
  { value: "rose", label: "Rose" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "gray", label: "Gray" },
];
const PLACE_LABELS: { value: PlaceLabel | ""; label: string }[] = [
  { value: "", label: "Company (default)" },
  { value: "School", label: "School" },
  { value: "University", label: "University" },
  { value: "Company", label: "Company" },
];
const CATEGORIES = ["language", "framework", "tool", "other"] as const;
const ICONS = ["target", "lightbulb", "rocket", "star", "heart", "fire"];

export default function AdminPage() {
  const router = useRouter();
  const [content, setContent] = useState<PresentationContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadingLogoId, setUploadingLogoId] = useState<string | null>(null);
  const [newMilestoneShape, setNewMilestoneShape] = useState<TimelineMilestone["shape"]>("card");
  const [newMilestoneColor, setNewMilestoneColor] = useState<string>("");

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    fetch("/api/content")
      .then((r) => r.json())
      .then(setContent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!content) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error("Save failed");
      setMessage("Saved successfully!");
    } catch {
      setMessage("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url;
  };

  const updateHero = (patch: Partial<HeroContent>) =>
    setContent((c) => c && { ...c, hero: { ...c.hero, ...patch } });

  const updateStrategy = (patch: Partial<StrategyContent>) =>
    setContent((c) => c && { ...c, strategy: { ...c.strategy, ...patch } });

  const updateStrategyPoint = (i: number, v: string) =>
    setContent((c) => {
      if (!c) return c;
      const points = [...c.strategy.points];
      points[i] = v;
      return { ...c, strategy: { ...c.strategy, points } };
    });

  const addStrategyPoint = () =>
    setContent((c) =>
      c
        ? {
            ...c,
            strategy: {
              ...c.strategy,
              points: [...c.strategy.points, "New point"],
            },
          }
        : c
    );

  const removeStrategyPoint = (i: number) =>
    setContent((c) => {
      if (!c) return c;
      const points = c.strategy.points.filter((_, j) => j !== i);
      return { ...c, strategy: { ...c.strategy, points } };
    });

  const updateMilestone = (id: string, patch: Partial<TimelineMilestone>) =>
    setContent((c) =>
      c
        ? {
            ...c,
            timeline: c.timeline.map((m) =>
              m.id === id ? { ...m, ...patch } : m
            ),
          }
        : c
    );

  const addMilestone = () =>
    setContent((c) =>
      c
        ? {
            ...c,
            timeline: [
              ...c.timeline,
              {
                id: crypto.randomUUID().slice(0, 8),
                role: "New Role",
                company: "Company",
                dateRange: "YYYY - YYYY",
                description: "",
                phase: "early",
                shape: newMilestoneShape,
                color: newMilestoneColor || undefined,
              },
            ],
          }
        : c
    );

  const removeMilestone = (id: string) =>
    setContent((c) =>
      c
        ? { ...c, timeline: c.timeline.filter((m) => m.id !== id) }
        : c
    );

  const handleLogoUpload = async (milestoneId: string, file: File) => {
    setUploadingLogoId(milestoneId);
    setMessage(null);
    try {
      const url = await uploadLogo(file);
      updateMilestone(milestoneId, { logoUrl: url });
      setMessage("Image uploaded");
    } catch {
      setMessage("Image upload failed");
    } finally {
      setUploadingLogoId(null);
    }
  };

  const updateSkill = (id: string, patch: Partial<SkillBadge>) =>
    setContent((c) =>
      c
        ? {
            ...c,
            skills: c.skills.map((s) => (s.id === id ? { ...s, ...patch } : s)),
          }
        : c
    );

  const addSkill = () =>
    setContent((c) =>
      c
        ? {
            ...c,
            skills: [
              ...c.skills,
              {
                id: crypto.randomUUID().slice(0, 8),
                name: "New Skill",
                category: "other",
              },
            ],
          }
        : c
    );

  const removeSkill = (id: string) =>
    setContent((c) =>
      c ? { ...c, skills: c.skills.filter((s) => s.id !== id) } : c
    );

  const updateProject = (id: string, patch: Partial<ProjectCard>) =>
    setContent((c) =>
      c
        ? {
            ...c,
            projects: c.projects.map((p) =>
              p.id === id ? { ...p, ...patch } : p
            ),
          }
        : c
    );

  const addProject = () =>
    setContent((c) =>
      c
        ? {
            ...c,
            projects: [
              ...c.projects,
              {
                id: crypto.randomUUID().slice(0, 8),
                title: "New Project",
                description: "",
                outcomes: [],
              },
            ],
          }
        : c
    );

  const removeProject = (id: string) =>
    setContent((c) =>
      c ? { ...c, projects: c.projects.filter((p) => p.id !== id) } : c
    );

  const updateProjectOutcome = (pid: string, i: number, v: string) =>
    setContent((c) => {
      if (!c) return c;
      const p = c.projects.find((x) => x.id === pid);
      if (!p) return c;
      const outcomes = [...(p.outcomes ?? [])];
      outcomes[i] = v;
      return {
        ...c,
        projects: c.projects.map((x) =>
          x.id === pid ? { ...x, outcomes } : x
        ),
      };
    });

  const addProjectOutcome = (pid: string) =>
    setContent((c) => {
      if (!c) return c;
      const p = c.projects.find((x) => x.id === pid);
      if (!p) return c;
      const outcomes = [...(p.outcomes ?? []), ""];
      return {
        ...c,
        projects: c.projects.map((x) =>
          x.id === pid ? { ...x, outcomes } : x
        ),
      };
    });

  const removeProjectOutcome = (pid: string, i: number) =>
    setContent((c) => {
      if (!c) return c;
      const p = c.projects.find((x) => x.id === pid);
      if (!p) return c;
      const outcomes = (p.outcomes ?? []).filter((_, j) => j !== i);
      return {
        ...c,
        projects: c.projects.map((x) =>
          x.id === pid ? { ...x, outcomes } : x
        ),
      };
    });

  const updateCareerPathSteps = (patch: Partial<CareerPathStepsContent>) =>
    setContent((c) =>
      c && c.careerPathSteps
        ? { ...c, careerPathSteps: { ...c.careerPathSteps, ...patch } }
        : c
    );

  const updateCareerPathStep = (id: string, patch: Partial<CareerPathStep>) =>
    setContent((c) =>
      c && c.careerPathSteps
        ? {
            ...c,
            careerPathSteps: {
              ...c.careerPathSteps,
              steps: c.careerPathSteps.steps.map((s) =>
                s.id === id ? { ...s, ...patch } : s
              ),
            },
          }
        : c
    );

  const addCareerPathStep = () =>
    setContent((c) => {
      if (!c?.careerPathSteps) return c;
      const steps = c.careerPathSteps.steps;
      return {
        ...c,
        careerPathSteps: {
          ...c.careerPathSteps,
          steps: [
            ...steps,
            {
              id: crypto.randomUUID().slice(0, 8),
              number: steps.length + 1,
              title: "New step",
              description: "",
            },
          ],
        },
      };
    });

  const removeCareerPathStep = (id: string) =>
    setContent((c) =>
      c && c.careerPathSteps
        ? {
            ...c,
            careerPathSteps: {
              ...c.careerPathSteps,
              steps: c.careerPathSteps.steps.filter((s) => s.id !== id),
            },
          }
        : c
    );

  const updateLesson = (id: string, patch: Partial<LessonLearned>) =>
    setContent((c) =>
      c
        ? {
            ...c,
            lessons: c.lessons.map((l) =>
              l.id === id ? { ...l, ...patch } : l
            ),
          }
        : c
    );

  const addLesson = () =>
    setContent((c) =>
      c
        ? {
            ...c,
            lessons: [
              ...c.lessons,
              {
                id: crypto.randomUUID().slice(0, 8),
                number: c.lessons.length + 1,
                headline: "New Lesson",
                paragraph: "",
                icon: "target",
              },
            ],
          }
        : c
    );

  const removeLesson = (id: string) =>
    setContent((c) =>
      c ? { ...c, lessons: c.lessons.filter((l) => l.id !== id) } : c
    );

  const updateFutureGoals = (patch: Partial<FutureGoalsContent>) =>
    setContent((c) =>
      c ? { ...c, futureGoals: { ...c.futureGoals, ...patch } } : c
    );

  const updateFutureGoal = (id: string, patch: { title?: string; description?: string }) =>
    setContent((c) =>
      c
        ? {
            ...c,
            futureGoals: {
              ...c.futureGoals,
              goals: c.futureGoals.goals.map((g) =>
                g.id === id ? { ...g, ...patch } : g
              ),
            },
          }
        : c
    );

  const addFutureGoal = () =>
    setContent((c) =>
      c
        ? {
            ...c,
            futureGoals: {
              ...c.futureGoals,
              goals: [
                ...c.futureGoals.goals,
                {
                  id: crypto.randomUUID().slice(0, 8),
                  title: "New Goal",
                  description: "",
                },
              ],
            },
          }
        : c
    );

  const removeFutureGoal = (id: string) =>
    setContent((c) =>
      c
        ? {
            ...c,
            futureGoals: {
              ...c.futureGoals,
              goals: c.futureGoals.goals.filter((g) => g.id !== id),
            },
          }
        : c
    );

  if (loading || !content) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 px-4 py-8 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-zinc-400">
              Edit your career presentation content
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-zinc-700 px-4 py-2 font-medium hover:bg-zinc-600"
            >
              View Presentation
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-zinc-600 px-4 py-2 font-medium text-zinc-300 hover:bg-zinc-800"
            >
              Log out
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-2 ${
              message.includes("Failed") ? "bg-red-900/50" : "bg-emerald-900/50"
            }`}
          >
            {message}
          </div>
        )}

        {/* Hero */}
        <Section title="Hero / About Me">
          <Field label="Name" value={content.hero.name} onChange={(v) => updateHero({ name: v })} />
          <Field label="Title" value={content.hero.title} onChange={(v) => updateHero({ title: v })} />
          <Field label="Tagline" value={content.hero.tagline} onChange={(v) => updateHero({ tagline: v })} />
          <Field label="CTA Button Text" value={content.hero.ctaText} onChange={(v) => updateHero({ ctaText: v })} />
          <Field
            label="LinkedIn URL"
            value={content.hero.linkedInUrl ?? ""}
            onChange={(v) => updateHero({ linkedInUrl: v || undefined })}
          />
          <Field
            label="LinkedIn button text"
            value={content.hero.linkedInCtaText ?? "Let's connect"}
            onChange={(v) => updateHero({ linkedInCtaText: v || undefined })}
          />
        </Section>

        {/* Strategy */}
        <Section title="Strategy">
          <Field label="Headline" value={content.strategy.headline} onChange={(v) => updateStrategy({ headline: v })} />
          <Field label="Description" value={content.strategy.description} onChange={(v) => updateStrategy({ description: v })} />
          {content.strategy.points.map((p, i) => (
            <div key={i} className="flex gap-2">
              <Field
                label={`Point ${i + 1}`}
                value={p}
                onChange={(v) => updateStrategyPoint(i, v)}
              />
              <button
                type="button"
                onClick={() => removeStrategyPoint(i)}
                className="mt-6 rounded bg-red-900/50 px-2 hover:bg-red-900/70"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStrategyPoint}
            className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
          >
            + Add Point
          </button>
        </Section>

        {/* Timeline */}
        <Section title="Career Timeline">
          {content.timeline.map((m) => (
            <div key={m.id} className="mb-6 rounded-lg border border-zinc-700 p-4">
              <div className="mb-2 flex justify-between">
                <span className="font-medium">{m.role} @ {m.company}</span>
                <button
                  type="button"
                  onClick={() => removeMilestone(m.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <Field label="Role" value={m.role} onChange={(v) => updateMilestone(m.id, { role: v })} />
              <Field label="Company / School / University name" value={m.company} onChange={(v) => updateMilestone(m.id, { company: v })} />
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Place type</label>
                <select
                  value={m.placeLabel ?? ""}
                  onChange={(e) => updateMilestone(m.id, { placeLabel: (e.target.value || undefined) as PlaceLabel | undefined })}
                  className="mt-1 w-full rounded bg-zinc-800 px-3 py-2"
                >
                  {PLACE_LABELS.map((opt) => (
                    <option key={opt.value || "default"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-500">Use School or University for education; Company for jobs.</p>
              </div>
              <Field label="Date Range" value={m.dateRange} onChange={(v) => updateMilestone(m.id, { dateRange: v })} />
              <Field label="Description" value={m.description} onChange={(v) => updateMilestone(m.id, { description: v })} textarea />
              <Field label="Project (optional)" value={m.project ?? ""} onChange={(v) => updateMilestone(m.id, { project: v || undefined })} />
              <Field label="Course (optional)" value={m.course ?? ""} onChange={(v) => updateMilestone(m.id, { course: v || undefined })} />
              <Field label="Expanded Details" value={m.expandedDetails ?? ""} onChange={(v) => updateMilestone(m.id, { expandedDetails: v || undefined })} textarea />
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Phase</label>
                <select
                  value={m.phase}
                  onChange={(e) => updateMilestone(m.id, { phase: e.target.value as CareerPhase })}
                  className="mt-1 w-full rounded bg-zinc-800 px-3 py-2"
                >
                  {PHASES.map((ph) => (
                    <option key={ph} value={ph}>{ph}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Shape</label>
                <select
                  value={m.shape ?? "card"}
                  onChange={(e) => updateMilestone(m.id, { shape: (e.target.value as TimelineMilestone["shape"]) || undefined })}
                  className="mt-1 w-full rounded bg-zinc-800 px-3 py-2"
                >
                  {MILESTONE_SHAPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Color</label>
                <select
                  value={m.color ?? ""}
                  onChange={(e) => updateMilestone(m.id, { color: e.target.value || undefined })}
                  className="mt-1 w-full rounded bg-zinc-800 px-3 py-2"
                >
                  {MILESTONE_COLOR_OPTIONS.map((opt) => (
                    <option key={opt.value || "default"} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Image / Logo</label>
                <div className="mt-1 flex flex-wrap items-start gap-3">
                  {m.logoUrl && (
                    <div className="flex shrink-0 flex-col items-center gap-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.logoUrl}
                        alt=""
                        className="h-20 w-20 rounded border border-zinc-600 object-contain bg-zinc-800"
                      />
                      <span className="text-xs text-zinc-500">Current</span>
                    </div>
                  )}
                  <div className="flex flex-1 min-w-0 flex-col gap-2">
                    <input
                      type="text"
                      value={m.logoUrl ?? ""}
                      onChange={(e) => updateMilestone(m.id, { logoUrl: e.target.value || undefined })}
                      placeholder="Image URL or upload below"
                      className="w-full rounded bg-zinc-800 px-3 py-2"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`logo-${m.id}`}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleLogoUpload(m.id, f);
                          e.target.value = "";
                        }}
                        disabled={uploadingLogoId === m.id}
                      />
                      <label
                        htmlFor={`logo-${m.id}`}
                        className={`cursor-pointer rounded px-4 py-2 text-sm ${uploadingLogoId === m.id ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" : "bg-zinc-700 hover:bg-zinc-600"}`}
                      >
                        {uploadingLogoId === m.id ? "Uploading…" : "Upload image"}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <label className="text-sm text-zinc-400">New milestone shape:</label>
            <select
              value={newMilestoneShape ?? "card"}
              onChange={(e) => setNewMilestoneShape((e.target.value as TimelineMilestone["shape"]) || "card")}
              className="rounded bg-zinc-800 px-3 py-2 text-sm"
            >
              {MILESTONE_SHAPES.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <label className="text-sm text-zinc-400">Color:</label>
            <select
              value={newMilestoneColor}
              onChange={(e) => setNewMilestoneColor(e.target.value)}
              className="rounded bg-zinc-800 px-3 py-2 text-sm"
            >
              {MILESTONE_COLOR_OPTIONS.map((opt) => (
                <option key={opt.value || "default"} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={addMilestone}
              className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
            >
              + Add Milestone
            </button>
          </div>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          {content.skills.map((s) => (
            <div key={s.id} className="mb-2 flex gap-2">
              <Field label="" value={s.name} onChange={(v) => updateSkill(s.id, { name: v })} />
              <select
                value={s.category}
                onChange={(e) => updateSkill(s.id, { category: e.target.value as SkillBadge["category"] })}
                className="mt-6 h-10 rounded bg-zinc-800 px-3"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeSkill(s.id)}
                className="mt-6 rounded bg-red-900/50 px-2 hover:bg-red-900/70"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSkill}
            className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
          >
            + Add Skill
          </button>
        </Section>

        {/* Projects */}
        <Section title="Projects">
          {content.projects.map((p) => (
            <div key={p.id} className="mb-6 rounded-lg border border-zinc-700 p-4">
              <div className="mb-2 flex justify-between">
                <span className="font-medium">{p.title}</span>
                <button
                  type="button"
                  onClick={() => removeProject(p.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <Field label="Title" value={p.title} onChange={(v) => updateProject(p.id, { title: v })} />
              <Field label="Description" value={p.description} onChange={(v) => updateProject(p.id, { description: v })} textarea />
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Outcomes</label>
                {(p.outcomes ?? []).map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={o}
                      onChange={(e) => updateProjectOutcome(p.id, i, e.target.value)}
                      className="mt-1 flex-1 rounded bg-zinc-800 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeProjectOutcome(p.id, i)}
                      className="mt-1 rounded bg-red-900/50 px-2 hover:bg-red-900/70"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addProjectOutcome(p.id)}
                  className="mt-1 rounded bg-zinc-700 px-2 py-1 text-sm hover:bg-zinc-600"
                >
                  + Outcome
                </button>
              </div>
              <Field
                label="Tech Stack (comma-separated)"
                value={(p.techStack ?? []).join(", ")}
                onChange={(v) =>
                  updateProject(p.id, {
                    techStack: v ? v.split(",").map((x) => x.trim()).filter(Boolean) : undefined,
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addProject}
            className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
          >
            + Add Project
          </button>
        </Section>

        {/* Career Path Steps */}
        {content.careerPathSteps && (
          <Section title="Career Path Steps (before Lessons Learned)">
            <Field
              label="Headline"
              value={content.careerPathSteps.headline}
              onChange={(v) => updateCareerPathSteps({ headline: v })}
            />
            <Field
              label="Description"
              value={content.careerPathSteps.description}
              onChange={(v) => updateCareerPathSteps({ description: v })}
              textarea
            />
            {content.careerPathSteps.steps.map((s) => (
              <div key={s.id} className="mb-6 rounded-lg border border-zinc-700 p-4">
                <div className="mb-2 flex justify-between">
                  <span className="font-medium">Step {s.number}</span>
                  <button
                    type="button"
                    onClick={() => removeCareerPathStep(s.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
                <Field
                  label="Number"
                  value={String(s.number)}
                  onChange={(v) =>
                    updateCareerPathStep(s.id, { number: parseInt(v, 10) || 1 })
                  }
                />
                <Field
                  label="Title"
                  value={s.title}
                  onChange={(v) => updateCareerPathStep(s.id, { title: v })}
                />
                <Field
                  label="Description"
                  value={s.description}
                  onChange={(v) => updateCareerPathStep(s.id, { description: v })}
                  textarea
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addCareerPathStep}
              className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
            >
              + Add Step
            </button>
          </Section>
        )}

        {/* Lessons */}
        <Section title="Lessons Learned">
          {content.lessons.map((l) => (
            <div key={l.id} className="mb-6 rounded-lg border border-zinc-700 p-4">
              <div className="mb-2 flex justify-between">
                <span className="font-medium">Lesson {l.number}</span>
                <button
                  type="button"
                  onClick={() => removeLesson(l.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <Field label="Number" value={String(l.number)} onChange={(v) => updateLesson(l.id, { number: parseInt(v, 10) || 1 })} />
              <Field label="Headline" value={l.headline} onChange={(v) => updateLesson(l.id, { headline: v })} />
              <Field label="Paragraph" value={l.paragraph} onChange={(v) => updateLesson(l.id, { paragraph: v })} textarea />
              <div className="mt-2">
                <label className="block text-sm text-zinc-400">Icon</label>
                <select
                  value={l.icon}
                  onChange={(e) => updateLesson(l.id, { icon: e.target.value })}
                  className="mt-1 w-full rounded bg-zinc-800 px-3 py-2"
                >
                  {ICONS.map((ic) => (
                    <option key={ic} value={ic}>{ic}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addLesson}
            className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
          >
            + Add Lesson
          </button>
        </Section>

        {/* Future Goals */}
        <Section title="Future Goals">
          <Field
            label="Headline"
            value={content.futureGoals.headline}
            onChange={(v) => updateFutureGoals({ headline: v })}
          />
          <Field
            label="Vision"
            value={content.futureGoals.vision}
            onChange={(v) => updateFutureGoals({ vision: v })}
            textarea
          />
          <Field
            label="CTA Text"
            value={content.futureGoals.ctaText}
            onChange={(v) => updateFutureGoals({ ctaText: v })}
          />
          <Field
            label="LinkedIn URL (CTA link)"
            value={content.futureGoals.linkedInUrl ?? ""}
            onChange={(v) => updateFutureGoals({ linkedInUrl: v || undefined })}
          />
          {content.futureGoals.goals.map((g) => (
            <div key={g.id} className="mb-4 rounded-lg border border-zinc-700 p-4">
              <div className="flex justify-between">
                <Field label="Goal Title" value={g.title} onChange={(v) => updateFutureGoal(g.id, { title: v })} />
                <button
                  type="button"
                  onClick={() => removeFutureGoal(g.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
              <Field label="Description" value={g.description} onChange={(v) => updateFutureGoal(g.id, { description: v })} textarea />
            </div>
          ))}
          <button
            type="button"
            onClick={addFutureGoal}
            className="rounded bg-zinc-700 px-4 py-2 text-sm hover:bg-zinc-600"
          >
            + Add Goal
          </button>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-xl font-bold text-white">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const base = "mt-1 w-full rounded bg-zinc-800 px-3 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";
  return (
    <div>
      {label && <label className="block text-sm text-zinc-400">{label}</label>}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={base}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        />
      )}
    </div>
  );
}
