# Orbi: Personal AI Study Coach

[![CI](https://github.com/fyernald/orbi/actions/workflows/ci.yml/badge.svg)](https://github.com/fyernald/orbi/actions/workflows/ci.yml)
![License](https://img.shields.io/github/license/fyernald/orbi?color=blue)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Course](https://img.shields.io/badge/course-CSE301-informational)

> **Team Byte4** | CSE301 Software Engineering and Development

Orbi is a study app where students add their notes, AI turns them into practice questions, and the app decides **what to study next** based on what the student gets wrong.

## About the project

Students often do not know what to revise or when. Orbi removes that decision. The student adds notes for a course topic, the AI generates questions from them, and our own recommendation algorithm (a mastery score per topic and spaced repetition) builds a personalized study feed that focuses on weak topics and brings questions back at the right time.

The AI only **creates content** (questions and explanations). The decision of **what to show and when** is made by our own algorithm.

## Main features

**Core (must have)**

- Sign up and log in
- Courses, topics, and study notes
- AI-generated questions from notes, with approve or reject
- Study sessions with instant feedback
- Topic mastery score
- Spaced repetition scheduling
- "Today's study list" feed

**Planned (if time allows)**

- Progress dashboard and charts
- AI explanations for wrong answers
- Study plan by exam date
- PDF upload, streaks, reminders, sharing

The full list is on our [project board](https://github.com/users/fyernald/projects/2).

## Team

| Name            | Role                                |
| --------------- | ----------------------------------- |
| Nali Hazhar     | Product Owner                       |
| Sarwan Mudhafar | Scrum Master and Frontend Developer |
| Birhat Karahan  | Lead Developer & Software Architect |
| Rabia Karhan    | UI/UX Designer (Figma)              |

## How we work

- **Methodology:** Scrum, 10 weeks, five 2-week sprints
- **Board:** [Orbi Backlog](https://github.com/users/fyernald/projects/2) (Table, Board, and Roadmap views)
- **Meetings:** every Thursday, 5:30 PM, Discord
- **Stand-ups:** each member answers three questions: what I did, what blocks me, what I will do next
- **Backlog:** every backlog item is a GitHub Issue. Features are written as user stories (`US-xx`), technical work as tasks (`T-xx`)

## Roadmap

| Sprint | Dates           | Goal                                                              |
| ------ | --------------- | ----------------------------------------------------------------- |
| 1      | Oct 13 - Oct 26 | Foundation: monorepo, database, wireframes, login, courses, notes |
| 2      | Oct 27 - Nov 09 | AI questions and study sessions                                   |
| 3      | Nov 10 - Nov 23 | Mastery score and spaced repetition                               |
| 4      | Nov 24 - Dec 07 | Today's study list, dashboard, testing                            |
| 5      | Dec 08 - Dec 21 | Demo, report, and extra features                                  |

## Repository structure

```
orbi/
├── apps/
│   ├── client/          # Next.js frontend (React, App Router)
│   └── server/          # Fastify backend (Node.js), all routes under /api
├── packages/
│   ├── core/            # Pure TypeScript business logic (mastery score, SM-2 scheduler, QuestionGenerator interface)
│   └── shared/          # Types, constants, and small helpers used by client and server
├── deploy/              # Production Docker Compose and nginx config for the VPS
├── docs/
│   ├── decisions/       # Architecture decision records
│   ├── database.md      # Tables, relations, and how to change the schema
│   └── deployment.md    # How automatic deployment works and how to set it up
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # Typecheck, test, build, and deploy
│   │   └── repo-checks.yml  # PR title, issue link, file checks
│   └── dependabot.yml
├── .githooks/           # Local commit checks (see CONTRIBUTING.md)
├── docker-compose.yml   # Local PostgreSQL and Mailpit
├── .env.example         # Template for your local .env
└── pnpm-workspace.yaml  # Monorepo config
```

Each `apps/` and `packages/` folder has its own `package.json`, `tsconfig.json`, and `src/` directory. Folders such as `routes/`, `services/`, and `mastery/` are added as the sprints need them.

## Tech stack

TypeScript everywhere, in a pnpm monorepo:

- **Frontend:** Next.js, Tailwind CSS + shadcn/ui, TanStack Query
- **Backend:** Fastify, PostgreSQL with Drizzle ORM, Better Auth, Zod
- **AI:** Google Gemini API, server-side only, behind the `QuestionGenerator` interface
- **Testing:** Vitest (unit), Playwright (e2e, Sprint 4)
- **Hosting:** Docker Compose on the team VPS, behind nginx

The full stack and the reasons for each choice are in [docs/decisions/01-tech-stack.md](docs/decisions/01-tech-stack.md).

## Workflow

1. Pick an issue from the current sprint on the board and assign yourself.
2. Create a branch from `main` named `type/issue-number-short-name`, for example `feature/6-sign-up-form`. Allowed types: `feature`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
3. Commit small and often, using the format `type: short description` (for example `feat: add sign-up form`).
4. Open a pull request. Write the title in the same format. For `feat` and `fix` pull requests, link the issue with `Closes #6`.
5. Wait for the automatic checks to pass (formatting, typecheck, tests, build, and repo checks).
6. Ask at least one other team member to review.
7. After approval, use **Squash and merge** and move the card to **Done**.

Details are in [CONTRIBUTING.md](CONTRIBUTING.md).

## Definition of done

A task is done when:

- [ ] The work is finished and runs without errors
- [ ] It meets all acceptance criteria on its story
- [ ] At least one other member reviewed it
- [ ] All CI/CD checks passed
- [ ] It is merged into `main` (squash merge)
- [ ] Its card is in the **Done** column

## Getting started

### Prerequisites

- Node.js 22+ (the version is in `.nvmrc`, so `nvm use` or `fnm use` picks it up)
- pnpm through Corepack: run `corepack enable` once (it uses the pnpm version pinned in `package.json`)
- Docker and Docker Compose

### Local development

1. Clone the repository:

   ```bash
   git clone https://github.com/fyernald/orbi.git
   cd orbi
   ```

2. Install dependencies. This also turns on the local commit checks in `.githooks`:

   ```bash
   pnpm install
   ```

3. Copy the environment variables and fill in your own keys. Both the server and the client read this one file in the repository root:

   ```bash
   cp .env.example .env
   ```

4. Start the database and mail server:

   ```bash
   docker compose up -d
   ```

5. Start the frontend and backend together:

   ```bash
   pnpm dev
   ```

   The server creates and updates the database tables by itself when it starts.

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001/api` (health check: `/api/health`)
   - Mailpit (emails): `http://localhost:8025`

6. Run the tests:

   ```bash
   pnpm test
   ```

   Use `pnpm test:watch` to re-run tests on every change.

7. Format the code before you push (CI checks it):

   ```bash
   pnpm format
   ```

   With the recommended VS Code extensions, files are formatted on save.

Database migrations will be added with T-02.

## Environment variables

All variables are listed with comments in [.env.example](.env.example). The main ones:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: used by Docker Compose to create the database
- `DATABASE_URL`: PostgreSQL connection for the server (for example `postgresql://orbi:orbi_dev_password@localhost:5432/orbi`)
- `SERVER_PORT`, `HOST`: where the Fastify server listens (default `3001`, `127.0.0.1`)
- `API_URL`: where the Next.js client forwards `/api/*` requests in development
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`: session security and app URL
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`: email server (Mailpit locally)
- `GEMINI_API_KEY`: Google Gemini API key (server only)

## Deployment

Every merge into `main` is deployed to the team VPS automatically: GitHub Actions builds Docker images, uploads them to GitHub Container Registry, and restarts the containers on the VPS. The one-time setup and everyday tasks are in [docs/deployment.md](docs/deployment.md).

## Important

- Never commit passwords, API keys, or `.env`
- Run `docker compose up -d` before starting development
- Run tests and the formatter before pushing: `pnpm test` and `pnpm format`
- Squash merge only (no merge commits)

## License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE).
