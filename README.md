# FocusFrame

FocusFrame is a personal productivity dashboard built as a junior full-stack portfolio project. It brings tasks, Pomodoro focus sessions, notes, goals, bookmarks, analytics, weather and news into one customizable workspace.

## Core features

- Google OAuth sign-in.
- User-owned tasks with statuses, priorities, deadlines, search and filters.
- Pomodoro work and break sessions, optionally linked to a task.
- Notes, goals and bookmarks stored per signed-in user.
- A persistent, draggable dashboard layout.
- Analytics for focus time, completed tasks and goals, trends, streaks and peak hours.
- Weather and news integrations with clearly labeled demo/fallback states.

## Tech stack

- Next.js 16 App Router and React 19
- TypeScript and Tailwind CSS 3
- TanStack React Query for client data fetching and caching
- NextAuth.js with Google OAuth and the Prisma adapter
- Prisma ORM with PostgreSQL
- Vitest for automated tests
- Vercel and a PostgreSQL provider such as Neon for deployment

## Architecture overview

The browser renders React components and widgets. Hooks use React Query or small browser-side state helpers to call Next.js API routes. Server routes obtain the authenticated session, validate input, enforce ownership, and use Prisma to read or write PostgreSQL data. News and weather are server-side proxy routes so their API keys are not sent to the browser.

More detail is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The interview-oriented explanation is in [docs/PROJECT-WALKTHROUGH.md](docs/PROJECT-WALKTHROUGH.md), with short study answers in [docs/INTERVIEW-CHEATSHEET.md](docs/INTERVIEW-CHEATSHEET.md).

## Authentication and user-data isolation

NextAuth.js creates the server session after Google sign-in. Personal API routes derive the current user ID from that session; they do not trust a user ID from a request body, query string or route parameter. Queries and object mutations are scoped to both the resource ID and authenticated user ID where applicable. This prevents a signed-in user from accessing another user’s resource by guessing an ID.

## Database models

The main Prisma relationships are:

- `User` has many `Task`, `Note`, `Goal`, `Bookmark` and `FocusSession` records.
- `Task` can have many `FocusSession` records.
- `User` has one `UserSettings` record and one `UserLayout` record.
- A focus session may reference a task owned by the same user.

The schema and versioned migrations are in `prisma/`. `Task.userId` is currently nullable for historical compatibility; it has not been changed in this phase.

## External APIs

- OpenWeather provides weather and city-search data through `/api/weather`.
- GNews provides headlines through `/api/news`.
- `OPENWEATHER_API_KEY` and `GNEWS_API_KEY` are server-only variables. If an external service is unavailable or not configured, the UI may show clearly labeled demo/fallback content.

## Local setup

### Prerequisites

- Node.js 20 or newer
- PostgreSQL
- A Google OAuth application
- Optional GNews and OpenWeather API keys

### Install and configure

```bash
git clone https://github.com/ge-lang/focus-frame.git
cd focus-frame
npm ci
```

Create a local `.env` file with the variables below. Do not commit it.

```bash
npx prisma migrate dev
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | NextAuth session secret |
| `NEXTAUTH_URL` | Yes | Application URL |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GNEWS_API_KEY` | No | Server-only GNews key |
| `OPENWEATHER_API_KEY` | No | Server-only OpenWeather key |

Never use a `NEXT_PUBLIC_` prefix for these API keys.

## Quality commands

```bash
npm ci
npx prisma validate
npx prisma generate
npx tsc --noEmit
npm run lint
npm test
npm run build
```

The build also runs `prisma generate`. `next/font/google` fetches the Inter font during a production build, so a network-restricted environment can fail at that step even when the application code is valid.

## Testing

Vitest covers API authentication, ownership boundaries, validation, weather configuration behavior, analytics helpers and task deadline/filter helpers. The current suite has 31 passing tests across 13 test files. Browser end-to-end testing is not part of the current project.

## Deployment

The intended deployment target is Vercel with PostgreSQL. Configure all required environment variables in the deployment environment, configure the Google OAuth redirect URI for the deployed domain, and apply Prisma migrations separately from the application build. The repository build command is `npm run build`.

## Known limitations

- Google OAuth is the only configured sign-in provider.
- Weather and news depend on external services and may use demo/fallback content.
- The build needs access to Google Fonts unless the font strategy is changed deliberately.
- `Task.userId` remains nullable pending a separate data audit and reviewed migration plan.
- There is no browser E2E suite or CI database fixture yet.

## Roadmap

- Audit and safely resolve nullable task ownership data.
- Add a repeatable CI database/test environment.
- Add deadline reminders.
- Consider Google Calendar integration as a separate future feature.
- Expand widget templates and dashboard presets.

## AI-assisted development

Development was AI-assisted. AI was used for implementation suggestions, debugging, explaining code, comparing alternatives and speeding up learning. The project owner remains responsible for defining the requirements, understanding the architecture, evaluating generated code, testing behavior, debugging failures, and deciding what to keep or reject.

## License

MIT
