# Git Lingo — Build Plan

Git Lingo teaches Git with an in-browser **fake Git engine + fake shell**: the learner types real-looking commands into a terminal and lessons check what they did.

v1 scope: **core + accounts + online deployment**.

## Progress

- [ ] Phase 0 — Setup and habits
- [x] Phase 1 — Engine data model
- [x] Phase 2 — Command parser
- [x] Phase 3 — Fake shell
- [ ] Phase 4 — Git commands
- [ ] Phase 5 — Lessons
- [ ] Phase 6 — Website UI
- [ ] Phase 7 — Accounts
- [ ] Phase 8 — Saved progress
- [ ] Phase 9 — End-to-end tests
- [ ] Phase 10 — Deploy online

## How to use this plan

Every subtask goes through four steps:

1. **Learn** — the concept, plus the doc to read. Next.js docs live in `node_modules/next/dist/docs/`; this Next version differs from older tutorials, so trust those docs.
2. **Build** — write the code.
3. **Check** — run the listed test or command and compare with the expected result.
4. **Review** — get the code reviewed, then commit once everything is green.

**How this plan was made:** start from the part with no dependencies (the engine is pure logic, with no UI or database), then build outward: logic → content → UI → server → deploy. Define "done" as a test *before* coding. Keep each subtask to about an hour and one idea.

---

## Phase 0: Setup and habits

| # | Subtask | Learn | Check |
|---|---|---|---|
| 0.1 ✅ | First git commit of the scaffold | git init/add/commit | `git log` shows 1 commit |
| 0.2 | Run the app, read the structure | `01-getting-started/02-project-structure.md`, `03-layouts-and-pages.md` | `pnpm dev` → http://localhost:3000 shows the starter page |
| 0.3 ✅ | First test (done as `src/engine/repo.test.ts`) | Arrange / act / assert | `pnpm test` passes |

## Phase 1: Engine data model ✅

Folder: `src/engine/`. Pure functions only (no React, no browser APIs).

| # | Subtask | File(s) | Check |
|---|---|---|---|
| 1.1 ✅ | `Repo`, `Commit`, `FileTree` types | `types.ts` | `pnpm exec tsc --noEmit` has no errors |
| 1.2 ✅ | `createEmptyRepo()` + deterministic `makeHash()` | `repo.ts`, `hash.ts` | `repo.test.ts`, `hash.test.ts` pass |
| 1.3 ✅ | `execute(repo, input) → { repo, output }`; never change the old repo | `execute.ts` | `execute.test.ts` passes |

## Phase 2: Command parser ✅

| # | Subtask | Hints | Check |
|---|---|---|---|
| 2.1 ✅ | `tokenize()` in `parse.ts` | Handle quotes: `git commit -m "first commit"` → `["git","commit","-m","first commit"]` | `parse.test.ts`: quotes, extra spaces, empty input |
| 2.2 ✅ | Detect `>` redirect for `echo` (`parse()`) | `echo hi > a.txt` → `{cmd:"echo", args:["hi"], redirect:"a.txt"}` | Test passes |
| 2.3 ✅ | Unknown command → friendly error (`execute()` uses `parse()`) | `command not found: foo` | Test passes |

## Phase 3: Fake shell (`ls`, `cat`, `touch`, `echo >`) ✅

One small function per command in `src/engine/shell.ts`.

| # | Command | Check (`shell.test.ts`) |
|---|---|---|
| 3.1 ✅ | `touch a.txt` | File exists with empty content |
| 3.2 ✅ | `echo hello > a.txt` | `cat a.txt` outputs `hello` |
| 3.3 ✅ | `ls` | Lists files sorted; empty dir → empty output |
| 3.4 ✅ | `cat missing.txt` | `cat: missing.txt: No such file or directory` |

## Phase 4: Git commands

One file per command in `src/engine/git/`, plus a dispatcher. Write the test first (red), then the code (green).

| # | Command | Rules | Check |
|---|---|---|---|
| 4.1 | `git init` | Sets `initialized`, head on `main` | Any git command before init → "not a git repository" |
| 4.2 | `git status` | Compare workingDir vs index vs last commit | Untracked / staged / modified shown correctly |
| 4.3 | `git add <file>` / `git add .` | Copy into index | `status` shows the file as staged |
| 4.4 | `git commit -m` | Snapshot index, parent = HEAD, move branch | Nothing staged → "nothing to commit"; `log` shows it |
| 4.5 | `git log` | Walk parents from HEAD | Newest first, correct messages |
| 4.6 | `git branch [name]` | List / create at HEAD | `*` marks the current branch |
| 4.7 | `git switch` / `git checkout <branch>` | Branch names only; refuse if uncommitted changes would be overwritten | Dirty switch refused; clean switch restores files |
| 4.8 | `git merge <branch>` | Fast-forward + clean merge; refuse conflicts with a "coming soon" message | Fast-forward, merge commit, conflict refused |
| 4.9 | Integration test | init → commit → branch → switch → commit → merge | All green; 40+ engine tests |

## Phase 5: Lessons

| # | Subtask | Hints | Check |
|---|---|---|---|
| 5.1 | `Lesson` type in `src/lessons/types.ts` | `id, title, intro, steps[{instruction, hint, isDone(repo)}]` | Types compile |
| 5.2 | Write 5 lessons | init · add+commit · log/status · branches+switch · merge | — |
| 5.3 | `solution: string[]` per lesson | Commands that solve it | `lessons.test.ts`: every solution completes every step |

## Phase 6: Website UI

| # | Subtask | Learn | Check |
|---|---|---|---|
| 6.1 | Component test setup | Add `jsdom` + `@testing-library/react`; include `*.test.tsx` in vitest | Dummy component test passes |
| 6.2 | `Terminal` client component | `05-server-and-client-components.md`; `useState`, ↑ history | Typing `git init` + Enter shows output |
| 6.3 | Routes `/`, `/lessons`, `/lessons/[id]` | `03-layouts-and-pages.md`, `04-linking-and-navigating.md` | Pages load; unknown id → 404 |
| 6.4 | Lesson page: instructions + terminal + step ticks | Lifting state up | Completing lesson 1 ticks every step |
| 6.5 | Repo visualizer | Rendering lists, keys | Commits appear live |
| 6.6 | Guest progress in `localStorage` | `useEffect`, `02-guides/preventing-flash-before-hydration.md` | Refresh → progress kept |
| 6.7 | Styling with Tailwind | `01-getting-started/11-css.md` | Fine at mobile width |

## Phase 7: Accounts

Stack: **PostgreSQL + Drizzle ORM + Better Auth**. Local DB via Docker; production DB on Neon.

| # | Subtask | Learn | Check |
|---|---|---|---|
| 7.1 | Local Postgres + env vars | `02-guides/environment-variables.md`; never commit `.env.local` | `psql` connects |
| 7.2 | Drizzle schema + migrations | Tables, keys | Tables visible in `drizzle-kit studio` |
| 7.3 | Better Auth email/password | `02-guides/authentication.md` | Sign up → user row exists; login sets a cookie |
| 7.4 | Sign-up / login / logout pages | `07-mutating-data.md`, `02-guides/forms.md` | Wrong password shows an error; logout clears the session |
| 7.5 | Protect `/profile` | Data Access Layer + `proxy.ts` (`01-getting-started/16-proxy.md`) | Logged out → redirected to login |

## Phase 8: Saved progress

| # | Subtask | Check |
|---|---|---|
| 8.1 | `progress` table (userId, lessonId, completedAt) | Migration runs |
| 8.2 | Server Action `completeLesson(lessonId)` that checks the session | Unauthenticated call rejected |
| 8.3 | Merge guest progress into the DB on login | 2 guest lessons → sign up → profile shows 2 |
| 8.4 | Profile page lists completed lessons | Matches the DB |

## Phase 9: End-to-end tests (Playwright)

Learn: `02-guides/testing/`.

| # | Flow | Check |
|---|---|---|
| 9.1 | Guest completes lesson 1 | `pnpm exec playwright test` green |
| 9.2 | Sign up → lesson → log out → log in → progress kept | Green |
| 9.3 | `pnpm build` | Exit code 0 |

## Phase 10: Deploy online

Recommended: **Vercel + Neon**. (DigitalOcean is an alternative — see `02-guides/self-hosting.md`.)

| # | Subtask | Learn | Check |
|---|---|---|---|
| 10.1 | Push the repo to GitHub | Remotes, push | Repo visible on GitHub |
| 10.2 | Neon DB + migrations | Prod vs dev env | Tables exist in Neon |
| 10.3 | Import to Vercel, set env vars | `01-getting-started/17-deploying.md`, `02-guides/production-checklist.md` | Live URL loads |
| 10.4 | Smoke-test production | — | Playwright suite green against the live URL |

---

## Release checklist

`pnpm lint && pnpm test && pnpm build && pnpm exec playwright test` all pass locally, then the E2E suite passes against the live URL.

## Open decisions

- New launch date
- Vercel vs DigitalOcean (decide at Phase 10)
