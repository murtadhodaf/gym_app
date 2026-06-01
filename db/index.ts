import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Module-level singleton — one client per serverless instance (pooler fans out)
const connectionString = process.env.DATABASE_URL!;

// max: 1 for serverless (Neon/Supabase pooler handles fan-out)
const client = postgres(connectionString, { max: 1 });

export const db = drizzle(client, { schema });
