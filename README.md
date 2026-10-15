# Orbi: Personal AI Study Coach

![License](https://img.shields.io/github/license/fyernald/project-z?color=blue)
![Last commit](https://img.shields.io/github/last-commit/fyernald/project-z)
![Open issues](https://img.shields.io/github/issues/fyernald/project-z)
![Closed issues](https://img.shields.io/github/issues-closed/fyernald/project-z)
![Pull requests](https://img.shields.io/github/issues-pr/fyernald/project-z)
![Contributors](https://img.shields.io/github/contributors/fyernald/project-z)
![Repo size](https://img.shields.io/github/repo-size/fyernald/project-z)
![Status](https://img.shields.io/badge/status-planning-yellow)
![Course](https://img.shields.io/badge/course-CSE301-informational)
![Methodology](https://img.shields.io/badge/methodology-Scrum-orange)

> **Byte4** | CSE301 Software Engineering and Development

A study app where students upload their notes, AI turns them into practice questions, and the app decides **what to study next** based on what the student gets wrong.

## About the project

Students often do not know what to revise or when. Our app removes that decision. The student adds notes for a course topic, the AI generates questions from them, and our own recommendation algorithm (a mastery score per topic and spaced repetition) builds a personalized study feed that focuses on weak topics and brings questions back at the right time.

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

| Name            | Role           |
| --------------- | -------------- |
| Nali Hazhar     | Product Owner  |
| Sarwan Mudhafar | ScrumMaster    |
| Birhat Karahan  | Lead Developer |
| Rabia Karhan    | Developer      |
| Hemn Murad      | Developer      |

## How we work

- **Methodology:** Scrum, 10 weeks, five 2-week sprints
- **Board:** [Orbi Backlog](https://github.com/users/fyernald/projects/2) (Table, Board, and Roadmap views)
- **Meetings:** every Thursday, 5:30 PM, Discord
- **Stand-ups:** each member answers three questions: what I did, what blocks me, what I will do next
- **Backlog:** every backlog item is a GitHub Issue. Features are written as user stories (`US-xx`), technical work as tasks (`T-xx`)

## Roadmap

| Sprint | Dates           | Goal                                                           |
| ------ | --------------- | -------------------------------------------------------------- |
| 1      | Oct 13 - Oct 26 | Foundation: setup, database, wireframes, login, courses, notes |
| 2      | Oct 27 - Nov 09 | AI questions and study sessions                                |
| 3      | Nov 10 - Nov 23 | Mastery score and spaced repetition                            |
| 4      | Nov 24 - Dec 07 | Today's study list, dashboard, testing                         |
| 5      | Dec 08 - Dec 21 | Demo, report, and extra features                               |

## Workflow

1. Pick an issue from the current sprint on the board and assign yourself.
2. Create a branch from `main`: `feature/<issue-number>-short-name` (for example `feature/12-login-page`).
3. Commit small and often, with clear messages (`Add login form validation`).
4. Open a pull request that links the issue (`Closes #12`).
5. At least one other team member reviews it.
6. After approval, merge into `main` and move the card to **Done**.

## Definition of done

A task is done when:

- [ ] The work is finished and runs without errors
- [ ] It meets all acceptance criteria on its story
- [ ] At least one other member reviewed it
- [ ] It is merged into `main`
- [ ] Its card is in the **Done** column

## Tech stack

_To be decided in Sprint 1 (task T-01)._

| Part       | Choice |
| ---------- | ------ |
| Frontend   | TBD    |
| Backend    | TBD    |
| Database   | TBD    |
| AI service | TBD    |
| Hosting    | TBD    |

## Getting started

_Setup and run instructions will be added once the tech stack is chosen._

```bash
git clone https://github.com/fyernald/project-z.git
cd project-z
```

## Important

Never commit passwords, API keys, or `.env` files. This repository is public.

## License

Distributed under the Apache-2.0 License. See [LICENSE](LICENSE).
