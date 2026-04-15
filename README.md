# ShortForge (Phase 1 SaaS)

ShortForge is a production-oriented SaaS starter for short-form video operations. It ships with auth, a protected dashboard, CRUD workflows, and a fake generation pipeline designed for swapping in real AI providers later.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI components
- Supabase Auth
- Postgres + Drizzle ORM
- Zod + React Hook Form
- TanStack Query

## Features

- Premium marketing landing page (`/`)
- Supabase sign up, sign in, sign out
- Protected dashboard routes via middleware
- Dashboard shell with sidebar + top nav
- Overview cards + recent activity
- Channels CRUD
- Series CRUD + detail page
- Videos list + detail page
- Fake generation pipeline with topic-aware outputs (queued → scripting → captions → assembling → complete)
- Service layer abstraction for channels/series/videos/generation
- Drizzle schema + migration SQL + seed script (2 channels, 3 series, 6 videos)

## Setup

1. Install dependencies

```bash
npm install
```

2. Copy env vars

```bash
cp .env.example .env.local
```

3. Fill in values in `.env.local`

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (optional currently)
- `DATABASE_URL`

4. Run migrations and seed

```bash
npm run db:migrate
npm run db:seed
```

5. Start app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Architecture Notes

- Business logic is isolated in `lib/services/*`
- UI reads/writes via typed route handlers (`app/api/*`)
- Generation logic lives in `generation-service` and can be replaced by a real provider adapter
- Validation is centralized with Zod in `lib/validation/*`

## UX Enhancements

- Shared Zod validation for auth, channels, series, and generation payloads
- Consistent status badges and skeleton loading states across dashboard surfaces
- Toast notifications for form actions and generation kicks
- Mobile bottom navigation for dashboard sections
- Activity log panel on dashboard

## Demo Flow

1. Sign up and sign in.
2. Create channel.
3. Create series.
4. Open series detail and click **Generate Video**.
5. Watch status/step update every 2s on video detail page.
