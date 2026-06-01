import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Module-level singleton — one client per serverless instance (pooler fans out)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing environment variable: DATABASE_URL");
}

// Guard against the placeholder value shipped in .env.local. Without a real
// connection string, postgres resolves the literal host "host", which hangs on
// DNS for ~20s before failing with ENOTFOUND.
if (/:\/\/user:password@host\//.test(connectionString) || /@host\//.test(connectionString)) {
  throw new Error(
    "DATABASE_URL is still set to the placeholder value. Set a real Postgres connection string in .env.local (e.g. from Neon/Supabase)."
  );
}

// max: 1 for serverless (Neon/Supabase pooler handles fan-out).
// connect_timeout fails fast instead of hanging on DNS/connection issues.
const client = postgres(connectionString, {
  max: 1,
  connect_timeout: 5, // seconds — fail fast so the UI is never stuck on a bad DB
  idle_timeout: 20,
});

export const db = drizzle(client, { schema });
