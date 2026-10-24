# 0002: App patterns

- **Status:** Accepted
- **Date:** 2026-10-25
- **Deciders:** Team Byte4
- **Related:** [0001: Tech stack](01-tech-stack.md) (this record replaces its single-provider AI rule)

## Context

Four people write the code over five sprints. If every feature is built a different way, the code gets hard to review and painful to change. This record fixes **one way** to build each kind of thing. Follow it in every pull request.

Orbi will also use **several AI models at once** (for example Gemini, Claude), and the **user chooses** which one to use. 0001 only planned one swappable provider.

## Decision

### 1. Server: one folder per feature, three layers

```
apps/server/src/modules/courses/
  routes.ts       HTTP only: validate input, call the service, send the reply
  service.ts      business rules, for example "a topic needs a course the user owns"
  repository.ts   Drizzle queries only
```

- A request goes `route → service → repository → database`, never skipping a layer.
- Every repository function takes the `userId` and filters by it. This is how users only see their own data (0001 rule 6).
- Even a simple feature has all three files, so every feature looks the same.
- The one exception is `modules/auth`: Better Auth is its service and repository, so it only has `routes.ts`.

### 2. Wiring: factory functions, connected in one place

```ts
// apps/server/src/index.ts is the only file that connects the parts
const courses = createCourseService({ repo: createCourseRepository(db) });
const app = buildApp({ auth, services: { courses } });
```

- Every part is made by a `createX(deps)` function that returns an object with an interface type. Parts get what they need passed in. They never import `db` or another service directly.
- Tests pass in PGlite or a fake instead of the real database.
- No dependency-injection library.

### 3. Code style: factories, interfaces, pure core

- Services, repositories, AI providers, and schedulers are all `createX(deps)` factories that return an interface. Classes are only used for error types.
- Logic in `packages/core` (mastery score, SM-2) has no database and no clock inside. Time comes in as an argument.

```ts
export interface ReviewScheduler {
	next(card: Card, grade: Grade, now: Date): Review;
}

export const createSm2Scheduler = (): ReviewScheduler => ({
	next(card, grade, now) {
		// SM-2, no I/O
	},
});
```

A second algorithm later (for example FSRS) is a new `createFsrsScheduler`, and the code that uses `ReviewScheduler` does not change.

### 4. Validation: shared Zod schemas

- Request and response schemas live in `packages/shared`, one file per feature.
- The server validates with them (`fastify-type-provider-zod`). The client uses the same schemas for its types and forms.

```ts
// packages/shared/src/courses.ts
export const createCourseInput = z.object({
	name: z.string().trim().min(1).max(255),
	examDate: z.iso.date().optional(),
});
```

### 5. Errors: error classes and one handler

- Services throw `NotFoundError`, `ForbiddenError`, `ConflictError`, or `ValidationError`.
- One Fastify error handler turns them into the status code and the same JSON for every route:

```json
{ "error": { "code": "not_found", "message": "Course not found" } }
```

- Unknown errors become `500` with a generic message. The details go to the log, never to the user.

### 6. AI: providers behind one interface, the user picks the model

- One `AiProvider` interface in `packages/core`. One adapter per provider in `apps/server/src/ai/providers/`, for example `createGeminiProvider({ apiKey })`.
- A **model catalog** lists the models the user may choose from (id, label, provider, what it is good at). It is config, not code.
- The **user chooses**. There is a default model in the account settings, and each AI action (for example "Generate questions") has a model menu that starts on that default. The app never switches models by itself.
- The server only accepts model ids from the catalog. Each generated record saves the provider and model that made it.
- A new provider is a new adapter file plus catalog entries. Nothing else changes.

### 7. Events: direct calls first, jobs for slow work

| Situation                                                     | Use                                                    |
| ------------------------------------------------------------- | ------------------------------------------------------ |
| The caller needs the result                                   | A direct call to the service                           |
| The work is slow, must survive a crash, or runs in the worker | A row in `generation_jobs`, picked up by `orbi-worker` |
| One action has three or more unrelated reactions              | An in-process event bus (not yet, see below)           |

There is no event bus yet. When an action gets three or more unrelated reactions (probably "answer submitted" with streaks and badges), we propose one in a new decision record first.

### 8. Client: feature folders and query hooks

```
apps/client/src/
  app/                  Next.js pages, kept thin: they only put components together
  features/courses/
    components/         one component per file, each with one job
    hooks.ts            useCourses(), useCreateCourse() with TanStack Query
  components/ui/        shadcn/ui components
  components/form/      form pieces every feature reuses (TextField, FormError, SubmitButton)
  hooks/                hooks that are not tied to one feature
  lib/api.ts            the one typed API client (lib/auth-client.ts for Better Auth)
  lib/routes.ts         every page path
```

- Components never call `fetch`. They use the feature's hooks, and the hooks use `lib/api.ts` or `lib/auth-client.ts`.
- No god components. Split a component when it does more than one job (loads data, holds a form, and draws a layout). Presentational components only get props, so the Figma designs can restyle them without touching logic.
- Code used by one feature stays in that feature's folder. It moves to a shared folder only when a second feature needs it.
- **This structure is fixed.** Every feature follows it, from the first one. Changing it later means touching every feature.

### 9. Client state: each kind of state has one home

| State                                       | Where it lives                                         |
| ------------------------------------------- | ------------------------------------------------------ |
| Data from the server, including the session | TanStack Query                                         |
| Form values, field errors, submitting       | React Hook Form, validated with the shared Zod schemas |
| Small UI state (a menu is open)             | `useState` in the component                            |

- Who may see a page is decided **on the server** before anything is sent: the `/app` and login layouts call `getServerSession()` (`features/auth/server.ts`) and redirect. The browser never shows a page it should not, not even for a moment.
- The layouts hand that session to the query cache (`SessionBoundary`), so the client never asks again on load. After that, the session in the cache decides who is logged in. Page guards (`RequireSession`, `GuestOnly`) react to it when the user logs in or out, so hooks and forms never navigate by themselves.
- Logged-in pages live under `/app`. `/` is kept for the landing page.
- After logout, every cached query is removed, so the next user on the same browser never sees old data.
- No global store (Zustand, Redux). If state ever needs to be shared that none of the three above can hold, we decide it first.

## Not used

- ❌ Route handlers or services that call Drizzle directly (skips the repository)
- ❌ Importing `db` or services as module singletons (use factories, rule 2)
- ❌ Dependency-injection libraries (awilix, tsyringe)
- ❌ `Result` return objects instead of errors (every call would need extra checks)
- ❌ Generic `BaseRepository<T>` classes
- ❌ CQRS, event sourcing, full DDD, microservices (too much for four people and ten weeks)
- ❌ Choosing the AI model automatically
- ❌ A global client store (Zustand, Redux) for now, see rule 9

## Consequences

- Every new feature has the same files in the same places, so reviews are faster and anyone can work on any feature.
- Some files are small at first, for example a service that only forwards a call. That is the price of one shape for everything.
- `profile` gets a default-model column when the AI work starts (Sprint 2).
- A new pattern (event bus, cache layer, a new folder layer) needs a new decision record that the team agrees on first.
