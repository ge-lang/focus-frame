# FocusFrame interview cheatsheet

## Core technologies

**What is Next.js?** A React framework that adds routing, server-side capabilities, API routes and production tooling.

**What is React?** A library for building user interfaces from reusable components that respond to state and props.

**What is TypeScript?** JavaScript with static types. It catches many mistakes before runtime and makes data contracts clearer.

**What is Prisma?** An ORM and typed database client. It lets the application query PostgreSQL using TypeScript-friendly models.

**Why PostgreSQL?** It is a reliable relational database with strong constraints, relations and good support from Prisma and hosted providers.

## APIs and data

**What is an API route?** A server endpoint that receives an HTTP request, performs controlled work, and returns an HTTP response.

**What is CRUD?** Create, Read, Update and Delete—the basic operations used by resources such as tasks and goals.

**What is authentication?** Verifying who a user is. FocusFrame uses Google OAuth through NextAuth.js.

**What is authorization?** Checking what an authenticated user is allowed to access or change.

**What is user-data isolation?** Ensuring every personal query and mutation is scoped to the current user, so object IDs cannot cross account boundaries.

**What is React Query?** A library for fetching, caching, refetching and invalidating server state in React applications.

**What is a database relation?** A defined connection between records, such as one User having many Tasks.

**What is a migration?** A versioned database change that can be applied consistently across environments.

**How do Tasks and FocusSessions relate?** A focus session belongs to a user and may optionally reference one of that user’s tasks. A task can have many focus sessions.

**Why validate API input?** Requests can be manually crafted and browser validation can be bypassed. Server validation keeps malformed or unsafe data out of the database.

**Why are API keys kept server-side?** Anything sent to browser code can be inspected. Server routes can call external services without exposing the key.

## Project decisions

**What tests does this project have?** Vitest tests cover route authentication and ownership, invalid inputs, external API configuration, analytics helpers and task deadline/filter logic. The suite currently has 31 passing tests across 13 files.

**What problems did you encounter?** Prisma cache permissions affected local setup, TypeScript typing needed cleanup, analytics mixed local and UTC date semantics, and a restricted network blocked the Google Fonts build request.

**What did AI do and what did you do?** AI suggested implementations, explained errors and compared alternatives. I defined the requirements, reviewed the changes, ran tests, investigated failures and decided which changes were appropriate.

**What would you improve next?** I would safely resolve nullable task ownership after checking data, add a repeatable CI database fixture, add browser E2E coverage, and improve deployment observability.

**Why use local date semantics for analytics?** Users see calendar days in their local time. Using local-midnight boundaries and local date keys keeps the chart and streak calculations consistent.

**Why is a foreign object returned as not found?** It prevents the API from revealing whether another user’s object exists.

**Why debounce dashboard saves?** Dragging produces many intermediate layouts. Debouncing reduces requests while preserving the final layout.

**Why can the production build need network access?** The app uses `next/font/google` for Inter, which downloads the font during a build. A restricted environment can fail there even if code checks pass.
