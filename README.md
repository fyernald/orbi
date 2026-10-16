# Orbi: Personal AI Study Coach

![License](https://img.shields.io/github/license/fyernald/orbi?color=blue)
![Last commit](https://img.shields.io/github/last-commit/fyernald/orbi)
![Open issues](https://img.shields.io/github/issues/fyernald/orbi)
![Closed issues](https://img.shields.io/github/issues-closed/fyernald/orbi)
![Pull requests](https://img.shields.io/github/issues-pr/fyernald/orbi)
![Contributors](https://img.shields.io/github/contributors/fyernald/orbi)
![Repo size](https://img.shields.io/github/repo-size/fyernald/orbi)
![Status](https://img.shields.io/badge/status-in%20development-yellow)
![Course](https://img.shields.io/badge/course-CSE301-informational)
![Methodology](https://img.shields.io/badge/methodology-Scrum-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-Monorepo-blue)

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

| Name | Scrum role | Title |
|---|---|---|
| Nali Hazhar | Product Owner | Product Owner |
| Sarwan Mudhafar | ScrumMaster | Scrum Master and Frontend Developer |
| Birhat Karahan | Developer | Lead Developer & Software Architect |
| Rabia Karhan | Developer | UI/UX Designer (Figma) |

## How we work

- **Methodology:** Scrum, 10 weeks, five 2-week sprints
- **Board:** [Orbi Backlog](https://github.com/users/fyernald/projects/2) (Table, Board, and Roadmap views)
- **Meetings:** every Thursday, 5:30 PM, Discord
- **Stand-ups:** each member answers three questions: what I did, what blocks me, what I will do next
- **Backlog:** every backlog item is a GitHub Issue. Features are written as user stories (`US-xx`), technical work as tasks (`T-xx`)

## Roadmap

| Sprint | Dates | Goal |
|---|---|---|
| 1 | Oct 13 - Oct 26 | Foundation: monorepo, database, wireframes, login, courses, notes |
| 2 | Oct 27 - Nov 09 | AI questions and study sessions |
| 3 | Nov 10 - Nov 23 | Mastery score and spaced repetition |
| 4 | Nov 24 - Dec 07 | Today's study list, dashboard, testing |
| 5 | Dec 08 - Dec 21 | Demo, report, and extra features |

## Repository structure
```
orbi/
├── apps/
│ ├── client/ # Next.js frontend (React)
│ │ ├── src/
│ │ │ ├── app/ # App Router pages
│ │ │ ├── components/
│ │ │ └── lib/
│ │ ├── package.json
│ │ └── tsconfig.json
│ │
│ └── server/ # Fastify backend (Node.js)
│ ├── src/
│ │ ├── routes/
│ │ ├── services/
│ │ └── index.ts
│ ├── package.json
│ └── tsconfig.json
│
├── packages/
│ ├── core/ # Pure TypeScript business logic (no React, no framework)
│ │ ├── src/
│ │ │ ├── mastery/ # Mastery score algorithm
│ │ │ ├── scheduler/ # SM-2 spaced repetition
│ │ │ ├── ai/ # QuestionGenerator interface
│ │ │ └── types/
│ │ └── package.json
│ │
│ └── shared/ # Shared types, utilities, constants
│ ├── src/
│ │ ├── types/
│ │ ├── utils/
│ │ └── constants/
│ └── package.json
│
├── pnpm-workspace.yaml # Monorepo config
├── .github/
│ ├── workflows/
│ │ └── test.yml # CI/CD: tests, lint, build
│ └── dependabot.yml
├── docker-compose.yml # Local development
├── docker-compose.prod.yml # Production
├── Dockerfile # Multi-stage build
├── .env.example
├── .gitignore
├── .prettierignore
└── README.md
```

Each `apps/` and `packages/` folder has its own `package.json` and `src/` directory.

## Tech stack

The reasons for these choices are in [docs/decisions/0001-tech-stack.md](docs/decisions/0001-tech-stack.md).

| Part | Choice |
|---|---|
| **Monorepo** | pnpm workspaces |
| **Language** | TypeScript |
| **Frontend** | Next.js (React, App Router) |
| **Backend** | Fastify (Node.js) |
| **Database** | PostgreSQL (Docker) |
| **ORM** | Drizzle ORM |
| **Authentication** | Better Auth (email + password, sessions) |
| **Email** | Nodemailer + Mailpit (locally) |
| **AI service** | Google Gemini API (free tier), server-side only |
| **AI generation** | Async via `generation_jobs` table and `orbi-worker` container |
| **UI framework** | Tailwind CSS + shadcn/ui |
| **Validation** | Zod |
| **Data fetching** | TanStack Query |
| **Testing** | Vitest (unit), Playwright (e2e, Sprint 4) |
| **Monitoring** | Sentry (Sprint 2) |
| **Package manager** | pnpm |
| **UI design** | Figma |
| **Hosting** | Self-hosted on team VPS (Debian) |
| **Deployment** | Docker + docker-compose, GitHub Actions CI/CD, Caddy reverse proxy |
| **Container registry** | GitHub Container Registry |
| **Backups** | Daily pg_dump + off-server copy |

## Workflow

1. Pick an issue from the current sprint on the board and assign yourself.
2. Create a branch from `main` named `type/issue-number-short-name`, for example `feat/6-sign-up-form`.
3. Commit small and often, using the format `type(scope): short description` (for example `feat(auth): add sign-up form`).
4. Open a pull request. Write the title in the same format. For `feat` and `fix` pull requests, link the issue with `Closes #6`.
5. Wait for the automatic checks to pass (tests, lint, build).
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

- Node.js 18+
- Docker and Docker Compose
- pnpm (`npm install -g pnpm`)

### Local development

1. Clone the repository:
```bash
   git clone https://github.com/fyernald/orbi.git
   cd orbi
   git config core.hooksPath .githooks
```

2. Install dependencies:
```bash
   pnpm install
```

3. Copy environment variables:
```bash
   cp .env.example .env.local
```
   Edit `.env.local` and fill in your own keys.

4. Start the database and mail server:
```bash
   docker compose up -d
```

5. Run migrations:
```bash
   pnpm run --filter server db:migrate
```

6. Start development servers:
```bash
   # Terminal 1: Frontend
   pnpm run --filter client dev
   
   # Terminal 2: Backend
   pnpm run --filter server dev
```

   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:3001`
   - Mailpit (emails): `http://localhost:1025`

7. Run tests:
```bash
   # Unit tests
   pnpm run test
   
   # Watch mode
   pnpm run test:watch
```

## Environment variables

See `.env.example`. Key variables:

- `DATABASE_URL`: PostgreSQL connection (e.g., `postgresql://user:password@postgres:5432/orbi`)
- `GEMINI_API_KEY`: Google Gemini API key
- `BETTER_AUTH_SECRET`: Random string for session security
- `BETTER_AUTH_URL`: App URL (e.g., `http://localhost:3000`)
- `MAILPIT_HOST` and `MAILPIT_PORT`: Email server

## Deployment

See [docs/deployment.md](docs/deployment.md). Birhat handles all deployment.

## Important

- Never commit passwords, API keys, or `.env.local`
- Always run `docker compose up` before starting development
- Run tests before pushing: `pnpm run test`
- Squash merge only (no merge commits)

## License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE).
