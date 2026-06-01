# Forma — AI Fitness Tracker

Next.js 16 + Clerk + Drizzle ORM + PostgreSQL (Neon/Supabase).

---

## Setup (first time)

### 1. Prerequisites

- Node.js v18+
- pnpm — install once globally if not already:

```bash
npm install -g pnpm
```

### 2. Install dependencies

```bash
pnpm install --no-frozen-lockfile
```

You may see a warning about ignored build scripts. Fix it by running:

```bash
pnpm approve-builds
```

Select all packages (spacebar to toggle, `a` to select all), then Enter. This only needs to be done once per machine.

### 3. Environment variables

Copy the example and fill in real values:

```bash
cp .env.local .env.local.bak   # optional backup
```

Edit `.env.local`:

```env
# Database — use the POOLED connection string (Neon: -pooler suffix, Supabase: port 6543)
DATABASE_URL=postgresql://user:password@host/forma?sslmode=require

# Clerk — get from https://dashboard.clerk.com → your app → API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Redirect paths (leave as-is)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/home
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/home
```

### 4. Run dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Common errors

| Error | Fix |
|---|---|
| `zsh: command not found: pnpm` | Run `npm install -g pnpm` |
| `ERR_PNPM_IGNORED_BUILDS` | Run `pnpm approve-builds` and select all |
| `pnpm install` fails with exit code 1 | Run `pnpm install --no-frozen-lockfile` first |
| Clerk error on load | Make sure `.env.local` has real Clerk keys (not `REPLACE_ME`) |

---

## Database migrations

```bash
# Generate migration files from schema changes
pnpm drizzle-kit generate

# Push schema directly to DB (dev only)
pnpm drizzle-kit push
```

> Note: The partial unique index `one_active_program` on `programs` table must be created manually:
> ```sql
> CREATE UNIQUE INDEX one_active_program ON programs (user_id) WHERE is_active;
> ```

---

## Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS v4
- **State**: Zustand + TanStack Query
- **Forms**: react-hook-form + Zod
- **UI**: Radix UI primitives + custom components
