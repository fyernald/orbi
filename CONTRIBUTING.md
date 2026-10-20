# Contributing

How we work in this repository. Short version: small branches, clear commit messages, one pull request per task.

## One-time setup

After you clone the repository, run this once in the project folder:

```bash
git config core.hooksPath .githooks
```

This turns on our local checks. They run when you commit and stop mistakes before they reach GitHub.

## Commit messages

Format: `type: short description`

| Type | Use it for | Example |
|---|---|---|
| `feat` | A new feature for the user | `feat: add login form` |
| `fix` | A bug fix | `fix: show error on wrong password` |
| `docs` | Documentation only | `docs: update setup steps in README` |
| `style` | Formatting only, no change in behavior | `style: fix indentation in login page` |
| `refactor` | Rewrite code without changing what it does | `refactor: move question logic to its own file` |
| `test` | Add or change tests | `test: add tests for the scheduler` |
| `chore` | Maintenance (setup, config, templates) | `chore: add .gitignore` |

Rules:

- Start with a lowercase word after the colon, use a verb (`add`, `fix`, `update`, `remove`), and do not end with a period.
- Keep the first line under 72 characters.
- One commit does one thing.

## Branches

Create a branch from `main` for every task. Name it `type/issue-number-short-name`:

- `feature/12-login-form`
- `fix/20-wrong-password-message`
- `docs/readme-team-table`

## Pull requests

1. Push your branch and open a pull request.
2. Write the title in the commit format, for example `feat: add login form`.
3. For `feat` and `fix` pull requests, link the issue in the description: `Closes #12`.
4. Wait for the automatic checks to turn green and ask a teammate for a review.
5. After approval, use **Squash and merge**. The pull request title becomes the commit message on `main`.

## What is checked automatically

| Where | When | What |
|---|---|---|
| Your computer (`.githooks`) | When you commit | Commit message format, no secret files (`.env`), no conflict markers, no files over 5 MB |
| GitHub (Repo checks) | On every pull request | The same file checks, every commit message, the PR title, the branch name, and the issue link on `feat` and `fix` pull requests |
| GitHub (secret scanning) | When you push | Blocks pushes that contain API keys or tokens (turned on in repository settings) |

## My check failed. What now?

- **PR title is wrong:** click **Edit** next to the title on GitHub. The check runs again by itself.
- **Last commit message is wrong and not pushed yet:** `git commit --amend -m "fix: show error on wrong password"`
- **Bad commit messages are already pushed:** combine the last commits into one and push again.

  ```bash
  git reset --soft HEAD~3        # 3 = how many commits to combine
  git commit -m "feat: add login form"
  git push --force-with-lease
  ```

- **A secret file or API key was committed:** remove it with `git rm --cached <file>`, and tell the team lead so the key can be replaced. A key that was pushed once must be treated as leaked.
- **Branch name is wrong:** rename it with `git branch -m <new-name>`, push the new name, and open a new pull request.
