# 🚀 FocusFrame — Personal Productivity Dashboard

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black)](https://focus-frame.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org)

FocusFrame is a personal productivity dashboard with secure, user-specific data. Organise tasks, track focus sessions, keep notes and goals, and build a better daily workflow from one customizable dashboard.

## ✨ Features

- **Custom dashboard** — drag, reorder, add and remove widgets; each user’s layout is saved.
- **Task management** — authenticated CRUD, kanban status, priorities, due dates, search and deadline filters.
- **Pomodoro and focus tracking** — saved work, break and long-break sessions; optionally link work sessions to a task.
- **Real analytics** — focus time, completed tasks and goals, productivity trend, streaks, peak hours and a seven-day chart.
- **Personal widgets** — notes, goals and bookmarks persist per user.
- **Calendar** — task deadlines appear in the calendar and in a next-seven-days list.
- **Weather and news** — weather data plus GNews headlines fetched through a server-side route, so the GNews key stays private.
- **Browser notifications** — optional alerts when a Pomodoro work or break session finishes.
- **Authentication** — Google sign-in through NextAuth with Prisma and PostgreSQL.

## 🛠 Tech stack

- Next.js 16 (App Router), React 19 and TypeScript
- PostgreSQL with Prisma ORM
- NextAuth.js with the Prisma adapter
- TanStack React Query, dnd-kit, Framer Motion and Tailwind CSS
- Neon for PostgreSQL and Vercel for deployment

## 📸 Screenshot

![Dashboard preview](/public/images/dashboard-preview.png)

## 🚀 Getting started

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (for example, Neon)
- A Google OAuth application for sign-in
- Optional: a [GNews](https://gnews.io) API key for live news

### Installation

```bash
git clone https://github.com/ge-lang/focus-frame.git
cd focus-frame
npm install
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
AUTH_SECRET="a_long_random_secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GNEWS_API_KEY="your_gnews_api_key"
```

Run the database migrations and start the app:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 🔌 Main API routes

| Route | Purpose |
| --- | --- |
| `/api/tasks` | User-scoped task list and task creation |
| `/api/tasks/[id]` | Update or delete an owned task |
| `/api/dashboard` | Persist the dashboard layout |
| `/api/notes/[widgetId]` | Persist widget notes |
| `/api/goals` | Create, update and delete goals |
| `/api/bookmarks` | Create and delete bookmarks |
| `/api/focus-sessions` | Record completed focus sessions |
| `/api/analytics` | Productivity metrics for a selected period |
| `/api/settings` | Focus goals and notification preferences |
| `/api/news` | Secure server-side GNews proxy |

## 🌐 Deployment

1. Push the project to GitHub and import it into Vercel.
2. Add the variables from `.env.example` in **Vercel → Settings → Environment Variables**.
3. Set `GNEWS_API_KEY` only as a server environment variable — never use `NEXT_PUBLIC_GNEWS_API_KEY`.
4. Vercel runs `npm run build`, which generates Prisma Client and applies committed migrations with `prisma migrate deploy`.

## ✅ Quality checks

```bash
npx tsc --noEmit
npm run lint
npx next build
```

## 📄 License

MIT
