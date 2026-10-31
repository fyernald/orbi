# 0003: Tutor chat and AI tools

- **Status:** Accepted
- **Date:** 2026-11-01
- **Deciders:** Team Byte4
- **Related:** [0001: Tech stack](01-tech-stack.md), [0002: App patterns](02-app-patterns.md) (this record changes rule 6 and rule 7 for the tutor), US-04, T-05, T-12

## Context

Orbi is an AI tutor, not only a question generator. Students chat with it, and the same chat makes practice questions, asks the student what they mean when a request is unclear, and later makes flashcards, diagrams, charts, and mock exams.

Two accepted rules do not fit a chat:

- 0001 and 0002 rule 7 send AI generation to `generation_jobs` and `orbi-worker`. A chat reply has to stream to the browser while it is written. A worker cannot do that without extra machinery (a queue plus a second stream channel).
- 0002 rule 6 plans our own `AiProvider` interface in `packages/core`. The AI SDK already gives one interface for every provider, with streaming, tool calls, and checked structured output.

## Decision

### 1. Chat replies stream straight from the API

- `POST /api/chats/:chatId/messages` streams the reply as Server-Sent Events in the AI SDK UI message format. The client reads it with `useChat`.
- Questions, and later flashcards and the rest, made inside the chat are tool calls in the same stream. They do not go through the worker.
- `generation_jobs` and `orbi-worker` stay for slow batch work that nobody watches live, for example a whole PDF turned into questions. Nothing uses them yet.
- When the browser stops the request (Stop, or the tab closes), the server stops the model and saves what was finished.
- A student can have at most 3 replies running at once, across all their chats. The server counts them in memory and answers `429` for a fourth; the composer says so before sending. With more than one API process, this count would have to move to the database.
- Text is passed through the AI SDK's `smoothStream`, so models that send a reply in a few large pieces (Gemini Flash-Lite) still show it word by word.
- nginx does not buffer the stream because the route sends `X-Accel-Buffering: no`.

### 2. The AI SDK is the provider layer

- `apps/server/src/ai/` holds the model catalog (`catalog.ts`) and a registry that turns a catalog id into an AI SDK `LanguageModel`. A provider is used only when its API key is set.
- A new provider is a new `@ai-sdk/*` package, one entry in the registry, and catalog rows. Nothing else changes.
- The rest of rule 6 stays: the user picks the model, the server only accepts catalog ids, and every saved AI record keeps the provider and model.
- Tests use the AI SDK's `MockLanguageModelV4`, so no test calls a real API.
- `packages/core` stays pure logic (mastery score, SM-2). The placeholder `QuestionGenerator` interface is removed.

### 3. One chat, many kinds of reply

A reply is a list of parts. Text is markdown. Everything else is a **tool**:

| Tool              | Runs where            | What it does                                       |
| ----------------- | --------------------- | -------------------------------------------------- |
| `createQuestions` | server                | saves multiple-choice questions as pending (US-04) |
| `askStudent`      | browser (the student) | asks one clarifying question with 2 to 4 options   |
| later             | server or browser     | flashcards, diagrams, charts, mock exam link       |

- Every tool's input and output schema lives in `packages/shared/src/tutor-tools.ts`, so the server checks the AI's data and the client gets the types.
- The server tool lives in `apps/server/src/modules/tutor/tools/`, one file per tool.
- The client draws each tool with its own component, listed in `features/tutor/components/chat/tool-views.tsx`. The list is typed by the shared tools, so a tool without a view does not compile.
- The AI never sends HTML or code to run. It sends data that a Zod schema checks first.

### 4. The composer action decides the tool

- **Ask Orbi** lets the AI choose any tool, so "make me questions" in plain chat still works.
- **Questions** forces `createQuestions` on the first step.
- An action without a tool yet (Flashcards, Mock exam) answers "coming soon" instead of pretending.

### 5. Storage

- Each topic has its own chats, and the course has one more for questions about everything (`chat.topic_id` is null). Switching topics in the workspace switches chats; a chat that is not on screen keeps its reply streaming and its draft. Picking another topic (or Whole course) in the message box opens that chat and takes the draft along.
- The whole-course chat reads the notes of every topic and is about no single topic (`topicId` null). It cannot make practice questions, because questions belong to one topic.
- `chat_message` keeps the AI SDK `UIMessage` parts as `jsonb`, plus the topic, action, and model of the message.
- `question` keeps each generated question with its status (pending, approved, rejected), its source (AI or manual), the provider and model, and the chat message that made it.
- A chat opens on its newest 30 messages (`GET /api/chats/:chatId`), and older ones load in pages of 30 as the student scrolls up (`GET /api/chats/:chatId/messages?before=<message id>`). A skeleton holds their place while they load.
- Messages loaded from the database are checked with `validateUIMessages` before they go back to the model.

## Not used

- ❌ Streaming through `orbi-worker` (needs a queue and a second stream channel for no gain)
- ❌ Our own `AiProvider` interface on top of the AI SDK (two layers that do the same job)
- ❌ Letting the AI send HTML, React, or chart code to run
- ❌ Next.js API routes for the chat (0001 still applies, the chat runs in Fastify)

## Consequences

- The tutor works with any model in the catalog without new code.
- A new kind of reply is three small pieces: a shared schema, a server tool (or none, for browser tools), and a view.
- The API process now holds long requests open while the model writes. That is fine for the expected number of students. If it is not later, the worker can take over batch work first.
- `T-05` is covered by this record and the `ai/` folder, except the per-user default model in the profile, which comes with the settings page.
