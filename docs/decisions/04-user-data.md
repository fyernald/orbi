# 0004: User data

- **Status:** Proposed. The team agrees on it in a meeting before US-36, US-37, US-38, and US-39 start.
- **Date:** 2026-11-02
- **Deciders:** Team Byte4
- **Related:** T-23, [0003: Tutor chat](03-tutor-chat.md), [docs/database.md](../database.md), [docs/deployment.md](../deployment.md#backups), US-36, US-37, US-38, US-39, T-14, T-16

## Context

Orbi stores what students write: their notes, their chats with the tutor, and every answer they give. Many of them are school or university students, some under 18.

Turkey's KVKK (Art. 4) and the EU's GDPR (Art. 5) both say: collect only what a feature needs, say why, and keep it only as long as needed. The privacy page (US-36), the consent at sign-up (US-38), analytics (US-37), and download and delete (US-39) all need one list to follow. This record is that list.

This record is not legal advice. The privacy page text is checked by someone qualified before it goes live (US-36, item 6).

## Decision

### 1. Who is responsible

- **Controller:** Team Byte4, the four students who build Orbi. There is no company.
- **Contact for privacy requests:** `privacy@orbi.study`. The address forwards to every team member.
- A request (see, correct, download, delete) is answered within 30 days, as KVKK Art. 13 and GDPR Art. 12 require.

### 2. Minimum age

- Orbi is for students aged **13 and over**. This is `MIN_AGE` in `packages/shared/src/profile.ts`, already checked in onboarding by the client and the server.
- Sign-up asks the user to confirm they are 13 or over (US-38, item 5). Onboarding asks for the birth date and refuses anyone younger.
- A student under 16 is never asked about analytics (US-37), so nothing that needs consent is collected from them. Everything else Orbi does is needed to give the student the app they signed up for.

### 3. What Orbi collects

Nothing else is collected. Anything without a reason in this table is not stored. A new column, cookie, log field, or service that gets user data changes this record first.

The **Basis** column is the reason the law allows it:

- **Service:** needed to give the student the app (KVKK Art. 5(2)(c), GDPR Art. 6(1)(b)).
- **Security:** keeping accounts and the server safe (KVKK Art. 5(2)(f), GDPR Art. 6(1)(f)).
- **Consent:** only when the student says yes, and they can take it back (KVKK Art. 5(1), GDPR Art. 6(1)(a)).

#### Account and login

| Data                                                     | Stored in                      | Why Orbi needs it                                                                       | Kept for                                      | Basis    |
| -------------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- | --------------------------------------------- | -------- |
| Name                                                     | `user.name`                    | Greets the student and goes into emails                                                 | Until the account is deleted                  | Service  |
| Email and whether it is confirmed                        | `user.email`, `email_verified` | Login, confirming the account, password reset                                           | Until the account is deleted                  | Service  |
| Password, hashed                                         | `account.password`             | Login. Orbi never stores or sees the password itself                                    | Until it is changed or the account is deleted | Service  |
| Session: token, expiry, IP address, browser (user agent) | `session`                      | Keeps the student logged in. IP and browser show the student's devices and odd sign-ins | Until logout, or 7 days without use           | Security |
| Email confirmation and password reset links              | `verification`                 | One-time links in emails                                                                | 1 hour                                        | Service  |
| Accepted policy version and time (planned, US-38)        | `user` or `profile`            | Proves what the student agreed to, and asks again when the policy changes               | Until the account is deleted                  | Service  |

#### Profile (onboarding, US-38)

| Data                                       | Stored in                                   | Why Orbi needs it                                                   | Kept for                     | Basis   |
| ------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------- | ---------------------------- | ------- |
| Preferred name                             | `profile.preferred_name`                    | What Orbi calls the student                                         | Until changed or deleted     | Service |
| Birth date                                 | `profile.birth_date`                        | The minimum age, and whether analytics may be asked (section 2)     | Until the account is deleted | Service |
| How they use Orbi                          | `profile.uses`                              | Orders Home suggestions and tutor actions                           | Until changed or deleted     | Service |
| Education level, field of study            | `profile.education_level`, `field_of_study` | Question difficulty, terms, and examples from that field            | Until changed or deleted     | Service |
| Interests                                  | `profile.interests`                         | Examples in explanations, Home suggestions                          | Until changed or deleted     | Service |
| Explanation style                          | `profile.explanation_style`                 | How the tutor writes answers                                        | Until changed or deleted     | Service |
| Daily minutes, usual study time            | `profile.daily_minutes`, `study_time`       | Size of today's study list, and the suggested reminder time         | Until changed or deleted     | Service |
| Daily reminder on or off, its time (US-24) | `profile.reminder_enabled`, `reminder_time` | When the study reminder email is sent, if at all                    | Until changed or deleted     | Service |
| Language, time zone                        | `profile.locale`, `timezone`                | Language of the AI, and where a day starts for the list and streaks | Until changed or deleted     | Service |
| Analytics choice and time (planned, US-37) | `profile`                                   | Remembers the answer on every device                                | Until changed or deleted     | Consent |

#### Study content

| Data                                                          | Stored in              | Why Orbi needs it                                                   | Kept for                                      | Basis   |
| ------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------- | --------------------------------------------- | ------- |
| Courses (name, description, colour, goal) and topics          | `course`, `topic`      | How the student organises their studies                             | Until the student deletes them or the account | Service |
| Notes                                                         | `note`                 | The tutor and the questions are made from them                      | Until the student deletes them or the account | Service |
| Tutor chats and messages, with the model and timings          | `chat`, `chat_message` | The chat history, and the context the AI needs for the next reply   | Until the student deletes them or the account | Service |
| Practice questions, with the AI provider and model            | `question`             | Study sessions, and knowing which model wrote which question        | Until the student deletes them or the account | Service |
| Answers (choice, right or wrong, time, where)                 | `answer`               | Mastery score, spaced repetition, today's study list                | Until the question or the account is deleted  | Service |
| Explanations of wrong answers, with the AI provider and model | `answer_explanation`   | Shows why a choice was wrong again without a second AI call (US-07) | Until the question or the account is deleted  | Service |

#### Server and hosting

| Data                                                                                                                                                                     | Stored in                                              | Why Orbi needs it                     | Kept for                                            | Basis    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------- | --------------------------------------------------- | -------- |
| API request log: method, path (tokens masked), IP address, errors without what the student wrote                                                                         | Docker log files on the VPS (`apps/server/src/log.ts`) | Finding bugs and attacks              | At most 3 files of 10 MB per service, so a few days | Security |
| nginx access log: IP address, path, browser, time                                                                                                                        | `/var/log/nginx` on the VPS                            | Finding attacks and outages           | 14 days (Debian's logrotate)                        | Security |
| Database backups (everything above in the database)                                                                                                                      | The VPS, and an encrypted copy off the server (T-16)   | Getting the data back after a failure | 14 days on the VPS, 30 days off the server          | Security |
| Error reports (T-14): error, stack trace, API route or page path, browser                                                                                                | Sentry, EU region (Frankfurt)                          | Finding bugs students hit             | 30 days (Sentry's free plan)                        | Security |
| Traces of a share of requests and page loads: route or page path (no query), timings, database query text without values, AI model and token counts, Web Vitals, browser | Sentry, EU region (Frankfurt)                          | Finding slow pages and requests       | 30 days (Sentry's free plan)                        | Security |

#### Browser

| Data                | Stored in                                     | Why Orbi needs it                     | Kept for                     | Basis   |
| ------------------- | --------------------------------------------- | ------------------------------------- | ---------------------------- | ------- |
| Login cookie        | Cookie `better-auth.session_token`, HTTP only | Keeps the student logged in           | 7 days, renewed while in use | Service |
| Collapsed sidebar   | Cookie `sidebar_collapsed`                    | Draws the sidebar the way it was left | 1 year                       | Service |
| Light or dark theme | `localStorage` key `theme` (next-themes)      | Remembers the theme                   | Until the browser clears it  | Service |

These are all needed for the app to work, so Orbi shows no cookie banner. Analytics sets no cookie (section 5).

### 4. What Orbi does not collect

- **Profile picture.** `user.image` stays empty.
- **Social login tokens.** The token columns in `account` stay empty, because Orbi has only email and password. Adding Google or another login changes this record first.
- **Institution and occupation.** They are in `profile` but nothing uses them and onboarding does not ask. The columns are removed.
- **The student's email, name, birth date, or IP address in an AI request.** Only what the tutor needs goes to the model (section 6).
- **Anything for advertising.** Orbi has no ads and sells no data.

### 5. Analytics

Orbi uses **Umami**, self-hosted on the VPS (US-37).

- Its data stays on our server, in its own database in the same `postgres` container. No other company gets it.
- It is off until the student turns it on, and is only asked from students aged 16 and over. Saying no blocks nothing.
- It sets no cookie and does not store the IP address. It uses the IP only to find the country, and counts visits with a hash that changes every day.
- It never gets the user id, so an analytics record cannot be tied back to an account. Deleting an account therefore needs nothing removed from analytics (US-39, item 3).
- Ids in paths are replaced before sending, so `/app/courses/3f2a...` is sent as `/app/courses/[courseId]`.
- Data older than 12 months is deleted by a monthly job (US-37), because Umami keeps everything by itself.
- It runs only in production.

**Tracked events**, and nothing else:

| Event               | Extra data                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| Page view           | Path with ids replaced, referring site, browser, system, device type, screen size, language, country |
| `course_created`    | none                                                                                                 |
| `note_saved`        | none                                                                                                 |
| `chat_message_sent` | Composer action, model id                                                                            |
| `questions_created` | How many                                                                                             |
| `question_reviewed` | Approved or rejected                                                                                 |
| `question_answered` | Right or wrong, chat or study session                                                                |

Never sent: note contents, chat messages, AI prompts or replies, names, emails, or ids.

### 6. AI providers

The student picks the model (0002, rule 6). Every model in `apps/server/src/ai/catalog.ts` stays. When the student uses the tutor, the request to that provider holds:

- the notes of the topic, or of every topic for the whole-course chat,
- the chat history and the new message,
- the study preferences from the profile (education level, field of study, interests, explanation style, language).

| Provider  | Models   | Where                         | Trains on it?                                                                                                     | Kept by the provider   |
| --------- | -------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Google    | Gemini   | Google's servers, any country | **Yes.** Orbi uses the free tier: Google uses requests to improve its products, and human reviewers may read them | Not stated by Google   |
| Anthropic | Claude   | Mainly the United States      | No. Anthropic does not train on API requests                                                                      | 30 days                |
| DeepSeek  | DeepSeek | China                         | **Yes.** DeepSeek's privacy policy allows training on requests                                                    | Not stated by DeepSeek |

- The model menu stays as it is. The privacy page (US-36) explains this table in plain words, so the student knows where their notes go before they pick a model.
- A student who does not want their notes used for training can pick a Claude model.

### 7. Who else gets data

| Who                           | What                                                       | Why                                 |
| ----------------------------- | ---------------------------------------------------------- | ----------------------------------- |
| The VPS hosting provider      | Everything on the server, encrypted in transit             | Runs the server                     |
| The email provider            | Name, email, and the email text                            | Sends confirmation and reset emails |
| The off-server backup storage | Encrypted backups it cannot read                           | Keeps a copy if the VPS is lost     |
| Google, Anthropic, DeepSeek   | What section 6 lists, only for the model the student picks | The tutor and practice questions    |
| Sentry                        | Error reports and traces (section 3)                       | Finding bugs and slow pages         |

The privacy page names the hosting, email, and backup providers and their countries once the team has picked them.

### 8. Seeing, downloading, and deleting

- The student can download everything in the database tables above as one JSON file (US-39).
- Deleting the account removes all of it at once through the cascading deletes in `docs/database.md`.
- Backups roll out by themselves, so a deleted account is fully gone after **30 days**.
- Logs roll out within 14 days. They hold no study content.
- Analytics holds nothing linked to the account (section 5).

## Risks the team accepts

- **Gemini terms and age.** Google's Gemini API terms say users must be 18 or older, and forbid apps likely to be used by people under 18. Orbi allows students from 13 and keeps Gemini. Google could close the API key. If that happens, the Gemini models leave the catalog and students pick another model.
- **Gemini free tier.** Google asks that no personal information be sent to its free tier, and its reviewers may read requests. Notes can hold personal details.
- **DeepSeek.** Data goes to China, and may be used for training. KVKK (Art. 9) and GDPR (Chapter V) have rules for sending personal data abroad. The legal review in US-36 checks what the privacy page must say for this.
- **Anthropic and minors.** Anthropic's usage policy allows apps for people under 18 only with extra safety measures. The team checks those before students under 18 use Claude.

## Not used

- ❌ PostHog, self-hosted (needs ClickHouse and Kafka, too heavy for the VPS)
- ❌ Google Analytics or any analytics run by another company
- ❌ A cookie banner (no cookie needs consent)
- ❌ Storing the user id in analytics

## Consequences

- US-36 turns sections 1 to 8 into the privacy page. US-37, US-38, and US-39 build what sections 2, 5, and 8 promise.
- New work from this record, each its own card:
  - Remove `institution` and `occupation` from `profile`.
  - Delete expired sessions and email links every night.
  - Set up the `privacy@orbi.study` address.
  - Set up Sentry (T-14) without request bodies or IP addresses, in the EU region.
- Every pull request that stores new user data updates the table in section 3.
