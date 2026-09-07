# FocusFrame project walkthrough

This guide uses simple technical language for an interview or career conversation. The goal is to explain the decisions in the project clearly, not to present it as a production-scale system.

## Authentication

- **Problem:** Users need to sign in before using personal productivity data.
- **Files:** `src/auth.ts`, `src/lib/api-auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/components/auth-guard.tsx`.
- **Frontend flow:** The sign-in page starts Google sign-in; the session provider makes the session available to the dashboard.
- **Backend/API flow:** NextAuth handles OAuth and stores auth records through Prisma. API routes call `getCurrentUserId()`.
- **Models:** `User`, `Account`, `Session`, `VerificationToken`.
- **Decision:** The server session is the source of identity; the browser cannot choose the owner ID.
- **Question:** Why not trust a user ID in the request body?
- **Answer:** A user could change it before sending the request, so the server must derive identity from the authenticated session.

## Tasks

- **Problem:** Users need to track work, status, priority and deadlines.
- **Files:** `src/components/widgets/task-widget.tsx`, `src/hooks/use-tasks.ts`, `src/app/api/tasks/`, `src/lib/task-utils.ts`.
- **Frontend flow:** The widget loads tasks, creates or edits them, and filters by search, priority, status and deadline.
- **Backend/API flow:** `/api/tasks` handles list/create and `/api/tasks/[id]` handles update/delete. Routes validate and scope operations to the session user.
- **Models:** `Task`, optionally related to `FocusSession`.
- **Decision:** Deadline display and filtering are pure helpers, so date edge cases can be tested without rendering the UI.
- **Question:** How do you stop one user editing another task?
- **Answer:** The update/delete query includes both the task ID and authenticated user ID.

## Notes

- **Problem:** Users need a quick place for free-form notes.
- **Files:** `src/components/widgets/notes-widget.tsx`, `src/hooks/use-personal-widgets.ts`, `src/app/api/notes/[widgetId]/route.ts`.
- **Frontend flow:** The widget loads the note for its widget ID and saves changes through a mutation.
- **Backend/API flow:** The route finds or upserts the note using authenticated user and widget ID.
- **Models:** `Note` with a unique `(userId, widgetId)` pair.
- **Decision:** The widget ID identifies the dashboard location, but user ID remains part of the database key.
- **Question:** Why is note uniqueness composite?
- **Answer:** It allows each user one note per widget while preventing users from colliding with each other.

## Goals

- **Problem:** Users need longer-term targets in addition to daily tasks.
- **Files:** `src/components/widgets/goals-widget.tsx`, `src/hooks/use-personal-widgets.ts`, `src/app/api/goals/`.
- **Frontend flow:** The widget lists goals and supports adding, completing, editing and deleting them.
- **Backend/API flow:** Collection routes create/list goals; ID routes update/delete after ownership checks.
- **Models:** `Goal`, `User`.
- **Decision:** Priority and completion are structured fields rather than display text.
- **Question:** What does CRUD mean here?
- **Answer:** Create, read, update and delete; the goals API demonstrates all four operations.

## Bookmarks

- **Problem:** Users need quick access to useful websites.
- **Files:** `src/components/widgets/bookmarks-widget.tsx`, `src/hooks/use-personal-widgets.ts`, `src/app/api/bookmarks/`.
- **Frontend flow:** The widget adds titles, URLs and categories and displays saved links.
- **Backend/API flow:** The route trims and normalizes URLs and accepts only HTTP or HTTPS. Delete is scoped by bookmark ID and user ID.
- **Models:** `Bookmark`, `User`.
- **Decision:** Rejecting `javascript:`, `data:` and `file:` prevents unsafe bookmark schemes.
- **Question:** Why validate URLs on the server too?
- **Answer:** Browser validation can be bypassed; server validation protects the database and every client.

## Pomodoro and focus sessions

- **Problem:** Users need timed focus periods and a record of effort.
- **Files:** `src/components/widgets/pomodoro-widget.tsx`, `src/hooks/use-analytics.ts`, `src/app/api/focus-sessions/route.ts`.
- **Frontend flow:** The timer switches between work and break modes; a work session can be associated with an open task.
- **Backend/API flow:** A completed session is posted with duration, type and optional task ID. The API checks the related task belongs to the same user.
- **Models:** `FocusSession`, `Task`, `User`.
- **Decision:** The task relation is optional, so general focus time is supported.
- **Question:** Why check the task owner when saving a session?
- **Answer:** Otherwise a user could attach a session to another user’s task by guessing its ID.

## Analytics

- **Problem:** Users need feedback about consistency and focus effort.
- **Files:** `src/components/widgets/analytics-widget.tsx`, `src/hooks/use-analytics.ts`, `src/app/api/analytics/route.ts`, `src/lib/analytics-utils.ts`.
- **Frontend flow:** React Query loads a time range and the widget shows metrics, trend, streak and daily focus chart.
- **Backend/API flow:** The route loads only the current user’s sessions, tasks, goals and settings, then calculates the response.
- **Models:** `FocusSession`, `Task`, `Goal`, `UserSettings`.
- **Decision:** Date grouping uses local calendar dates consistently; pure calculations handle empty and zero-valued data safely.
- **Question:** Why extract analytics helpers?
- **Answer:** Pure functions are easier to reason about and test than calculations embedded inside a database route.

## Dashboard persistence

- **Problem:** Users should keep widget choices and layout between visits.
- **Files:** `src/contexts/dashboard-context.tsx`, `src/components/dashboard-grid.tsx`, `src/components/add-widget-dialog.tsx`, `src/app/api/dashboard/route.ts`.
- **Frontend flow:** Context holds widgets and layout. Changes save with a short debounce to avoid a request for every drag event.
- **Backend/API flow:** `GET` loads the current user’s layout and `PUT` validates then upserts it.
- **Models:** `UserLayout`, `User`.
- **Decision:** Layout is serialized JSON because it represents client layout state rather than a relational business object.
- **Question:** Why debounce saves?
- **Answer:** Dragging creates many intermediate states; debouncing reduces requests while preserving the final layout.

## Calendar and task deadlines

- **Problem:** Users need a calendar view of task deadlines.
- **Files:** `src/components/widgets/calendar-widget.tsx`, `src/lib/task-utils.ts`, `src/hooks/use-tasks.ts`.
- **Frontend flow:** The calendar reads user-owned tasks and groups deadlines by local date.
- **Backend/API flow:** Tasks come from `/api/tasks`; the calendar does not create a separate event model.
- **Models:** `Task`, `User`.
- **Decision:** Reusing task due dates avoids a second source of truth.
- **Question:** What happens when a task has no deadline?
- **Answer:** It remains in task lists but is not placed on a calendar date.

## Weather and news

- **Problem:** The dashboard can show useful external information beside personal work.
- **Files:** `src/components/widgets/weather-widget.tsx`, `src/hooks/useWeather.ts`, `src/app/api/weather/route.ts`, `src/components/widgets/news-widget.tsx`, `src/hooks/use-news.ts`, `src/app/api/news/route.ts`.
- **Frontend flow:** Widgets call local routes. Weather supports city search and refresh; news supports categories. Both distinguish live data from demo/fallback content.
- **Backend/API flow:** Server routes call OpenWeather or GNews and return a smaller UI response. Keys are server-only environment variables.
- **Models:** None; these are external data routes.
- **Decision:** Server proxying prevents third-party keys from reaching browser code.
- **Question:** Why not call OpenWeather directly from React?
- **Answer:** A browser request would expose the key. The server route keeps it private and centralizes errors.

## Validation

- **Problem:** API routes must reject malformed or unsafe input before Prisma.
- **Files:** `src/lib/api-validation.ts` and mutation routes under `src/app/api/`.
- **Frontend flow:** Forms send JSON; the UI can display returned errors but is not trusted for security.
- **Backend/API flow:** Routes parse JSON safely, trim bounded strings, validate dates and enums, bound numbers, validate dashboard shapes and restrict bookmark URLs.
- **Models:** Validation protects every model written by a mutation route.
- **Decision:** Small reusable helpers cover repeated rules without a large framework.
- **Question:** What should invalid JSON return?
- **Answer:** A controlled `400` response, without a raw parser exception or database call.

## User ownership and isolation

- **Problem:** Personal data must not cross account boundaries.
- **Files:** `src/lib/api-auth.ts`, all personal routes in `src/app/api/`, and their route tests.
- **Frontend flow:** The client does not choose the owner; it calls the API using the current session.
- **Backend/API flow:** Routes obtain the session user ID and include it in list, create, update, delete and related-object checks.
- **Models:** Every personal model relates to `User`; `FocusSession` also relates to `Task`.
- **Decision:** A foreign object is treated as not found, so the API does not reveal another user’s records.
- **Question:** What is authorization?
- **Answer:** Authentication asks who the user is. Authorization asks whether that user may perform this action on this resource.

## Testing

- **Problem:** Tests catch regressions in security rules and business calculations.
- **Files:** `src/**/*.test.ts`, `vitest.config.ts`.
- **Frontend flow:** Pure helper tests do not need a browser; route tests mock session and Prisma boundaries.
- **Backend/API flow:** Tests cover unauthenticated responses, ownership, invalid inputs, URL schemes, weather configuration, analytics helpers and task filters.
- **Models:** Route tests exercise model access patterns without changing the real database.
- **Decision:** Meaningful boundary and ownership cases are more useful than simply increasing test count.
- **Question:** What is still missing?
- **Answer:** There is no browser E2E suite or CI database fixture yet.

## Deployment and build

- **Problem:** The application needs a repeatable production build and hosted database.
- **Files:** `package.json`, `next.config.ts`, `prisma/schema.prisma`, `.github/workflows/quality.yml`.
- **Frontend flow:** Vercel builds and serves the Next.js App Router pages.
- **Backend/API flow:** Environment variables configure OAuth, Prisma and external API routes. Prisma migrations are applied separately from the build.
- **Models:** PostgreSQL contains the Prisma models and migration history.
- **Decision:** The build runs `prisma generate` before `next build`; migrations should be deployed deliberately rather than during parallel builds.
- **Question:** Why can a build fail before compiling application code?
- **Answer:** `next/font/google` downloads Inter during the build. A restricted network can block that request even when TypeScript and tests pass.

## How I built FocusFrame

Development was AI-assisted. AI helped with implementation suggestions, debugging, explaining unfamiliar code, reviewing alternatives and speeding up learning.

The project owner still defines what to build, understands the architecture, evaluates generated code, tests behavior, debugs failures, and decides what to keep or reject. AI assistance does not replace those responsibilities.
