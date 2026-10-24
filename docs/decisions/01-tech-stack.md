# 0001: Tech stack

- **Status:** Accepted. The AI rules are updated by [0002: App patterns](02-app-patterns.md) (several providers, the user picks the model).
- **Date:** 2026-10-16
- **Deciders:** Team Byte4
- **Related:** Task T-01 (Project setup)

## Context

Orbi is a personal AI study coach. Students add notes, AI generates practice questions, and our own algorithm (mastery score per topic and spaced repetition) decides what to study next.

We need a tech stack that:

- lets a team of four finish a working product in five two-week sprints,
- costs nothing to run during and after the course,
- uses a language the team already knows (the Lead Developer prefers TypeScript),
- keeps the AI service API key on the server only,
- avoids vendor lock-in (no proprietary databases or hosting platforms),
- can later be reused for a mobile app (via `packages/core` shared logic),
- runs on the team's existing self-hosted VPS (Debian).

## Decision

### Monorepo structure

| Part                | Choice                                  |
| ------------------- | --------------------------------------- |
| **Package manager** | pnpm workspaces                         |
| **Build/CI**        | Turborepo (optional, for build caching) |

### Frontend

| Part              | Choice                       |
| ----------------- | ---------------------------- |
| **Language**      | TypeScript                   |
| **Framework**     | Next.js (React, App Router)  |
| **UI framework**  | Tailwind CSS + shadcn/ui     |
| **Data fetching** | TanStack Query (React Query) |
| **Validation**    | Zod                          |

### Backend

| Part               | Choice                                   |
| ------------------ | ---------------------------------------- |
| **Language**       | TypeScript                               |
| **Framework**      | Fastify (Node.js)                        |
| **Database**       | PostgreSQL (Docker)                      |
| **ORM**            | Drizzle ORM                              |
| **Authentication** | Better Auth (email + password, sessions) |
| **Email**          | Nodemailer + Mailpit (locally)           |

### AI & async work

| Part              | Choice                                                        |
| ----------------- | ------------------------------------------------------------- |
| **AI service**    | Google Gemini API (free tier), server-side only               |
| **AI generation** | Async via `generation_jobs` table and `orbi-worker` container |
| **Cache**         | In-app (Drizzle query results), no Redis                      |

### Shared logic

| Part             | Choice                                                      |
| ---------------- | ----------------------------------------------------------- |
| **Core logic**   | `packages/core/` — pure TypeScript (no React, no framework) |
| **Shared types** | `packages/shared/` — types, utilities, constants            |

### Testing & quality

| Part              | Choice                   |
| ----------------- | ------------------------ |
| **Unit testing**  | Vitest                   |
| **E2E testing**   | Playwright (Sprint 4)    |
| **Linting**       | ESLint + Prettier        |
| **Type checking** | TypeScript (strict mode) |
| **CI/CD**         | GitHub Actions           |

### Design

| Part            | Choice                            |
| --------------- | --------------------------------- |
| **UI design**   | Figma                             |
| **Prototyping** | Figma (wireframes and components) |

### Monitoring & observability

| Part                 | Choice                                     |
| -------------------- | ------------------------------------------ |
| **Error monitoring** | Sentry (Sprint 2)                          |
| **Logging**          | Console (development), Sentry (production) |

### Deployment

| Part                        | Choice                                   |
| --------------------------- | ---------------------------------------- |
| **Hosting**                 | Self-hosted on team VPS (Debian)         |
| **Container orchestration** | Docker + Docker Compose                  |
| **Reverse proxy**           | nginx + certbot (already on the VPS)     |
| **Container registry**      | GitHub Container Registry                |
| **CI/CD pipeline**          | GitHub Actions (push, PR checks, deploy) |
| **Backups**                 | Daily pg_dump + off-server copy          |

### Not used

- ❌ Supabase (vendor lock-in)
- ❌ Vercel (vendor lock-in, no server control)
- ❌ Firebase (expensive for AI, proprietary)
- ❌ Next.js API routes (inflexible backend, mixed concerns)
- ❌ Microservices (overkill for 4 people, 10 weeks)
- ❌ GraphQL (adds complexity; REST is simpler)
- ❌ Redis (not needed; caching is in-app)
- ❌ Kubernetes (Docker Compose is enough)
- ❌ RLS (row-level security in database; we scope by userId in code)

## Reasons

### One language everywhere

Everyone can read and review the whole codebase. Frontend and backend share TypeScript types. The same `packages/core` logic can run on a future mobile app (React Native / Expo).

### Separate frontend and backend

Fastify backend gives us full control:

- Better performance than Next.js API routes
- Easier to add background jobs (the `orbi-worker` container)
- Simpler to scale independently later
- Clear separation of concerns

### Monorepo simplifies sharing

pnpm workspaces let us:

- Share types between frontend and backend (no code generation, no API schema tools)
- Share business logic in `packages/core` (mastery score, SM-2 scheduler)
- Deploy the client, the server, and the worker with one CI/CD pipeline

### Fast start

- Next.js is familiar; we keep it for frontend.
- Fastify is lightweight and fast; minimal boilerplate.
- Better Auth handles sign-up, login, sessions without custom code.
- Drizzle ORM is lightweight; migrations live in the repo, not in a managed service.
- Docker Compose runs PostgreSQL and Mailpit locally with one command.

### Zero cost

PostgreSQL, Drizzle, Better Auth, Nodemailer, Vitest, Playwright, and Fastify are all free and open source. The Gemini API has a free tier. We host on the team's existing VPS.

### No vendor lock-in

- Database: PostgreSQL (can move to any host).
- Backend: Fastify (plain Node.js, easy to move).
- Frontend: Next.js (can move to any Node.js host).
- AI provider: Swappable via `QuestionGenerator` interface in `packages/core`.
- Hosting: Our own VPS, full control.

## Architecture rules

1. **Monorepo with clear boundaries.**
   - `apps/client` — frontend only, imports from `packages/shared` and `packages/core`
   - `apps/server` — backend only, imports from `packages/shared` and `packages/core`
   - `packages/core` — pure TypeScript, no React, no Fastify, no database drivers (only Drizzle types)
   - `packages/shared` — types, constants, no logic

2. **Core logic is separate from frameworks.**
   - Mastery score, SM-2 scheduler, and their interfaces live in `packages/core`.
   - No React imports, no Fastify imports, no async I/O.
   - Unit tested in isolation (Vitest).
   - Easy to reuse in a mobile app later.

3. **The AI service sits behind an interface.**
   - `QuestionGenerator` hides which AI provider is used.
   - Swap from Gemini to Groq without changing the rest of the app.
   - Implemented in `apps/server`, but interface lives in `packages/core`.

4. **API keys stay on the server.**
   - AI calls go through `/api/*` routes in Fastify backend.
   - Keys are never sent to the browser and never committed.
   - Real keys live in the git-ignored `.env` at the repository root, read by the server only; `.env.example` is committed.

5. **Async AI work runs in a separate container.**
   - `orbi-worker` polls `generation_jobs` table and calls Gemini.
   - Main backend stays responsive.
   - Failed jobs are retried automatically.

6. **Authorization is scoped to the user.**
   - Repository queries filter by `userId` without relying on database RLS.
   - Tests can run in parallel without a separate test database.

## Consequences

- We depend on the Gemini free tier (60 requests/min). We plan error handling and daily limits (T-12) and may add a content-hash cache.
- Database schema must be designed carefully (T-02, T-12, T-13) because it's shared between web and future mobile.
- Deployment is Birhat's sole responsibility. If Birhat is unavailable, the team cannot deploy.
- A mobile app is not part of this course project. If built later, we can use React Native (Expo) with the same PostgreSQL project and code in `packages/core`.
- The web app can be made installable as a PWA and mobile-friendly (US-25, Sprint 5), but that is optional.

## Options considered

| Option                          | Why not chosen                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Next.js (frontend + API routes) | Inflexible. API routes lack features for background jobs, middleware, and performance tuning. Hard to scale backend separately. |
| React + Express backend         | More boilerplate. Express is mature but less type-safe than Fastify.                                                            |
| Django + React                  | Django is strong, but team prefers TypeScript. Django's ORM is not TypeScript-friendly.                                         |
| Firebase + React                | Proprietary, expensive once AI API usage grows. Vendor lock-in.                                                                 |
| Microservices                   | Overkill for 4 people in 10 weeks. Adds deployment and debugging complexity.                                                    |

## Review

We review this decision at the end of Sprint 1. If the stack blocks us (e.g., Fastify learning curve is too steep, the VPS is too slow, Gemini rate-limits us severely), we write a new decision record that updates or replaces this one.
