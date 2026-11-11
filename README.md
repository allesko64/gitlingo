# Git Lingo

Learn Git by typing real commands in a fake in-browser shell. Lessons check what you did; progress saves for guests (local) and signed-in users (Neon Postgres).

## Stack

- Next.js + React + Tailwind
- Better Auth (email/password + optional Google)
- Neon Postgres + Drizzle ORM
- Vitest + Playwright

## Local setup

```bash
pnpm install
cp .env.example .env.local
# Fill DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm test` | Unit tests |
| `pnpm e2e` | Playwright (builds + starts the app) |
| `pnpm db:migrate` | Apply Drizzle migrations |
| `pnpm db:check` | Print DB name + tables |
| `pnpm build` / `pnpm start` | Production build |

### Google sign-in (optional)

1. Create an OAuth Web client in Google Cloud Console.
2. Redirect URI: `{BETTER_AUTH_URL}/api/auth/callback/google`
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_GOOGLE_AUTH=1` in `.env.local`.

## Deploy (Vercel + Neon)

1. Push to GitHub and import the project in Vercel.
2. Set production env vars from `.env.example` (`BETTER_AUTH_URL` must be the live origin, e.g. `https://gitlingo.ayulabs.tech`).
3. Run migrations against the production Neon DB once.
4. Add the custom domain in Vercel and point DNS at it.
