# 🚀 FocusFrame

[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black)](https://focus-frame.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org)

FocusFrame is a personal productivity dashboard. It brings tasks, Pomodoro focus sessions, analytics, notes, goals, bookmarks, weather and news into one customizable workspace. All personal data is isolated by the signed-in user.

## ✨ Highlights

### Custom workspace

- Add, remove, reorder and resize dashboard widgets.
- Persist the widget layout for each account.
- Responsive desktop, tablet and mobile layouts.

### Tasks and deadlines

- Create, edit and delete user-owned tasks.
- Organize tasks with **To do**, **In progress** and **Done** columns.
- Set priorities and due dates.
- Search by title or description.
- Filter by priority and deadline: overdue, due today, upcoming or no deadline.
- View task deadlines in the calendar and a next-seven-days list.

### Focus and analytics

- Configurable Pomodoro work, short-break and long-break durations.
- Optional browser notification and sound on session completion.
- Link a focus session to an open task.
- Track focus time per task.
- View real focus time, completed tasks and goals, productivity trend, streaks, peak focus hours and a seven-day chart.
- Set personal daily focus and Pomodoro goals.

### Personal data widgets

- Auto-saving notes, scoped to the widget and signed-in user.
- Persistent goals and bookmarks.
- Secure, authenticated server APIs for all personal content.

### External data

- Weather widget with live data and a demo fallback.
- Latest News widget via the GNews API.
- GNews is fetched through a server route, so its API key is never exposed to the browser.

## 🛠 Tech stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 with the App Router |
| UI | React 19, TypeScript, Tailwind CSS, Framer Motion |
| Data fetching | TanStack React Query |
| Database | PostgreSQL with Prisma ORM |
| Authentication | NextAuth.js, Google OAuth and Prisma Adapter |
| Drag and drop | dnd-kit |
| Hosting | Vercel and Neon PostgreSQL |

## 📸 Screenshot

![FocusFrame dashboard preview](/public/images/dashboard-preview.png)

## 🚀 Run locally

### Prerequisites

- Node.js 20 or newer
- A PostgreSQL database (for example, Neon)
- A Google OAuth application
- Optional: a [GNews](https://gnews.io) API key for live headlines
- Optional: an OpenWeather API key for live weather

### Install

```bash
git clone https://github.com/ge-lang/focus-frame.git
cd focus-frame
npm install
cp .env.example .env
```

### Configure environment variables

Update `.env` with your own values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret used by NextAuth |
| `NEXTAUTH_URL` | Yes | Application URL, such as `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GNEWS_API_KEY` | No | Server-only GNews API key for live headlines |
| `NEXT_PUBLIC_OPENWEATHER_API_KEY` | No | Public weather API key used by the weather widget |

Example:

```env
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
AUTH_SECRET="generate_a_long_random_value"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GNEWS_API_KEY="your_gnews_api_key"
NEXT_PUBLIC_OPENWEATHER_API_KEY="your_openweather_api_key"
```

> Never prefix the GNews key with `NEXT_PUBLIC_` and never commit `.env` files. GNews requests are made server-side by `/api/news`.

### Prepare the database and start the app

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📁 Project structure

```text
src/
├── app/
│   ├── api/                    # Authenticated route handlers
│   ├── auth/                   # Sign-in page
│   ├── dashboard/              # Dashboard route and layout
│   ├── layout.tsx              # App-wide providers
│   └── page.tsx                # Main dashboard entry point
├── components/
│   ├── widgets/                # Dashboard widget UI
│   └── *.tsx                   # Dashboard and auth components
├── contexts/                   # Dashboard layout state
├── hooks/                      # React Query and browser hooks
├── lib/                        # Prisma and server auth helpers
└── types/                      # Shared TypeScript types
prisma/
├── schema.prisma               # Database schema
└── migrations/                 # Versioned PostgreSQL migrations
```

## 🔌 API reference

All personal-data endpoints require an authenticated session and only expose data that belongs to the current user.

| Route | Methods | Description |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | `GET`, `POST` | NextAuth endpoints |
| `/api/dashboard` | `GET`, `PUT` | Load and save widget layout |
| `/api/tasks` | `GET`, `POST` | List and create tasks; includes task focus time |
| `/api/tasks/[id]` | `PUT`, `DELETE` | Update or delete an owned task |
| `/api/notes/[widgetId]` | `GET`, `PUT` | Load and save a widget note |
| `/api/goals` | `GET`, `POST` | List and create goals |
| `/api/goals/[id]` | `PUT`, `DELETE` | Update or delete a goal |
| `/api/bookmarks` | `GET`, `POST` | List and create bookmarks |
| `/api/bookmarks/[id]` | `DELETE` | Delete a bookmark |
| `/api/focus-sessions` | `POST` | Record a completed Pomodoro session |
| `/api/analytics` | `GET` | Fetch analytics for `today`, `week`, `month` or `year` |
| `/api/settings` | `GET`, `PUT` | Focus goals and notification preferences |
| `/api/news` | `GET` | Server-side GNews proxy; accepts `category` |
| `/api/weather` | `GET` | Weather data route |

## ✅ Quality checks

```bash
npx tsc --noEmit
npm run lint
npx next build
```

The project currently has two non-blocking lint warnings related to an image element and a Pomodoro hook dependency.

## 🌐 Deploy to Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add every required variable from `.env.example` in **Settings → Environment Variables**.
4. Set `NEXTAUTH_URL` to the deployed domain.
5. Configure the same deployed domain as an authorized redirect URI in Google Cloud OAuth.
6. Deploy.

The build script runs `prisma generate`, `prisma migrate deploy` and `next build`. This applies all committed database migrations during deployment.

### GNews shows Demo Data

The widget deliberately falls back to demo data if GNews cannot return live headlines. Check the following:

1. `GNEWS_API_KEY` exists in the Vercel **Production** environment.
2. The variable name is exactly `GNEWS_API_KEY`, not `NEXT_PUBLIC_GNEWS_API_KEY`.
3. Redeploy after adding or changing the variable.
4. Verify that the API key is active and has remaining GNews quota.

## 🧭 Roadmap

- Google Calendar OAuth integration.
- Deadline reminders for tasks.
- API and end-to-end tests with continuous integration.
- Additional widget templates and dashboard presets.

## 📄 License

MIT
