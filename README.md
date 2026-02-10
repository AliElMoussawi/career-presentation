# Career Journey Presentation

A colorful, energetic interactive presentation website for your tech career story — built with Next.js.

## Features

- **Vibrant gradient backgrounds** shifting between sections (purple → blue → teal → orange)
- **Bold typography** with smooth scroll-triggered animations
- **Interactive career timeline** with expandable milestone cards, color-coded by phase
- **Skills & projects** with visual badges and outcome highlights
- **Lessons learned** with staggered fade-in animations
- **Future goals** roadmap and closing CTA
- **Admin dashboard** at `/admin` to edit all content — no code changes needed

## Quick Start

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for the presentation and [http://localhost:3000/admin](http://localhost:3000/admin) to edit content.

## Editing Content

1. Go to **http://localhost:3000/admin**
2. Edit any section: Hero, Strategy, Timeline, Skills, Projects, Lessons, Future Goals
3. Add/remove milestones, skills, projects, lessons, and goals
4. Upload company or course logos via the Upload button on timeline cards (or paste image URLs)
5. Click **Save Changes** to persist edits

Content is stored in `data/content.json` and can also be edited directly if preferred.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main presentation (fetches content)
│   ├── admin/page.tsx    # Admin dashboard
│   └── api/
│       ├── content/      # GET/PUT content
│       └── upload/       # POST for logo uploads
├── components/           # Hero, Strategy, Timeline, etc.
└── lib/
    ├── types.ts          # TypeScript types
    └── data.ts           # Read/write content.json
data/
└── content.json          # All editable content
```

## Deployment

- **Vercel**: Connect the repo; API routes and file writes work in serverless (content.json persists between requests on Vercel's filesystem, but consider a database for production if you need guaranteed persistence across deployments).
- For production with many editors, consider switching to a database (e.g. SQLite, PostgreSQL) or a headless CMS.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- TypeScript
