export type CareerPhase = "education" | "early" | "growth" | "current";

export interface HeroContent {
  name: string;
  title: string;
  tagline: string;
  ctaText: string;
  linkedInUrl?: string;
  linkedInCtaText?: string;
}

export interface StrategyContent {
  headline: string;
  description: string;
  points: string[];
  /** Optional positions (px) for each point; when set, cards are movable and use these. */
  pointPositions?: { x: number; y: number }[];
}

/** Label for the "company" field: School, University, or Company (default) */
export type PlaceLabel = "School" | "University" | "Company";

export interface TimelineMilestone {
  id: string;
  role: string;
  company: string;
  dateRange: string;
  description: string;
  project?: string;
  course?: string;
  phase: CareerPhase;
  logoUrl?: string;
  expandedDetails?: string;
  /** What the place is: School, University, or Company (default). Use for education vs jobs. */
  placeLabel?: PlaceLabel;
  /** Nested nodes held by this node (flipped-T: each node can hold another) */
  children?: TimelineMilestone[];
  /** Custom position on canvas (pixels); when set, node is movable and uses this position */
  position?: { x: number; y: number };
  /** Node shape: card (default) or circle */
  shape?: "card" | "circle";
  /** Optional color key; when set, overrides phase-based color. Use admin preset keys (e.g. emerald, cyan, violet). */
  color?: string;
}

export interface SkillBadge {
  id: string;
  name: string;
  category: "language" | "framework" | "tool" | "other";
}

export interface ProjectCard {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
  techStack?: string[];
}

export interface CareerPathStep {
  id: string;
  number: number;
  title: string;
  description: string;
}

export interface CareerPathStepsContent {
  headline: string;
  description: string;
  steps: CareerPathStep[];
}

export interface LessonLearned {
  id: string;
  number: number;
  headline: string;
  paragraph: string;
  icon: string;
}

export interface FutureGoal {
  id: string;
  title: string;
  description: string;
}

export interface FutureGoalsContent {
  headline: string;
  vision: string;
  goals: FutureGoal[];
  ctaText: string;
  /** If set, the CTA opens this URL (e.g. LinkedIn) in a new tab. */
  linkedInUrl?: string;
}

export interface PresentationContent {
  hero: HeroContent;
  strategy: StrategyContent;
  timeline: TimelineMilestone[];
  careerPathSteps?: CareerPathStepsContent;
  skills: SkillBadge[];
  projects: ProjectCard[];
  lessons: LessonLearned[];
  futureGoals: FutureGoalsContent;
}
