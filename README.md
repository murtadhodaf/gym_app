# Forma — AI Gym Monitoring App

Next.js 16 · Clerk Auth · Drizzle ORM · PostgreSQL (Supabase/Neon) · Tailwind CSS v4

---

## Prerequisites

Before anything, make sure you have these installed on your machine:

| Tool | Version | Install |
|---|---|---|
| **Node.js** | v18+ | [nodejs.org](https://nodejs.org) |
| **pnpm** | latest | `npm install -g pnpm` |
| **Git** | any | [git-scm.com](https://git-scm.com) |

You'll also need accounts on two external services:

- **[Supabase](https://supabase.com)** (or Neon) — PostgreSQL database, free tier is enough
- **[Clerk](https://clerk.com)** — Authentication, free tier is enough

Optional (for AI features):
- **OpenAI** or **Anthropic** API key

---

## Quick Start

### 1. Clone & install

```bash
git clone <repo-url>
cd Forma-App
pnpm install --no-frozen-lockfile
```

If you see a warning about ignored build scripts, run:

```bash
pnpm approve-builds
```

Select all packages (press `a` then Enter). This only needs to be done once per machine.

---

### 2. Set up the database (Supabase)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Once created, go to **Project Settings → Database → Connection string**
3. Select **Transaction pooler** mode and copy the URI (it uses port `6543`)

The URL format looks like:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```

---

### 3. Set up Clerk authentication

1. Go to [clerk.com](https://clerk.com) → **Create Application**
2. Enable **Email** and **Google** sign-in (or whichever you prefer)
3. Go to **API Keys** and copy:
   - `Publishable Key` → starts with `pk_test_...`
   - `Secret Key` → starts with `sk_test_...`

---

### 4. Configure environment variables

Create your `.env.local` file:

```bash
cp .env.local .env.local.example   # backup the example (optional)
```

Then fill in `.env.local` with your real values:

```env
# ── Database ──────────────────────────────────────────────────────────────────
# Use the POOLED / Transaction pooler connection string
# Supabase: port 6543 | Neon: use the -pooler suffix URL
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# ── Clerk Auth ────────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk redirect paths (leave as-is unless you change routing)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home

# ── AI (optional) ─────────────────────────────────────────────────────────────
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
```

---

### 5. Push database schema

This creates all tables in your Supabase database:

```bash
pnpm drizzle-kit push
```

Then run this SQL manually in **Supabase → SQL Editor** (required for the "one active program per user" constraint):

```sql
CREATE UNIQUE INDEX IF NOT EXISTS one_active_program ON programs (user_id) WHERE is_active;
```

---

### 6. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you should see the sign-in page.

---

## Project Structure

```
Forma-App/
├── app/              # Next.js App Router pages & API routes
├── components/       # Reusable UI components
├── db/
│   ├── schema.ts     # Drizzle schema (source of truth for DB)
│   └── index.ts      # DB connection
├── lib/              # Utilities, helpers
├── data/             # Server actions / data fetching
├── middleware.ts      # Clerk auth middleware
└── drizzle.config.ts # Drizzle Kit config
```

---

## Database Migrations

```bash
# Generate migration files after schema changes
pnpm drizzle-kit generate

# Apply migrations to the database
pnpm drizzle-kit push

# Open Drizzle Studio (visual DB browser)
pnpm drizzle-kit studio
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Auth | Clerk |
| Database | PostgreSQL (Supabase/Neon) |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS v4 |
| State management | Zustand + TanStack Query |
| Forms | react-hook-form + Zod |
| UI primitives | Radix UI |

---

## Troubleshooting

| Error | Fix |
|---|---|
| `zsh: command not found: pnpm` | Run `npm install -g pnpm` |
| `ERR_PNPM_IGNORED_BUILDS` | Run `pnpm approve-builds` and select all |
| `pnpm install` fails | Run `pnpm install --no-frozen-lockfile` |
| Clerk error on load | Check `.env.local` has real keys, not placeholder values |
| DB connection error | Make sure you're using the **pooled** connection string (port 6543 for Supabase) |
| `relation "users" does not exist` | Run `pnpm drizzle-kit push` to create tables |
