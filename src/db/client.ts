import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// At runtime on Vercel/serverless, use the pooler URL.
// Locally (and for migrations), the direct URL is used via drizzle.config.ts.
const connectionString = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL

// Provide a dummy connection string during build so the module loads without crashing.
// Any DB calls made at build time against this will fail gracefully in the try/catch
// wrappers in db-season.ts and db-matches.ts.
//
// In serverless (Vercel), each function invocation spins up a new postgres pool.
// Without max:1, pools accumulate and exhaust the Supabase session-mode connection limit.
// idle_timeout + max_lifetime ensure connections are released between invocations.
const client = postgres(connectionString ?? 'postgresql://localhost/placeholder', {
  prepare: false,
  max: connectionString ? 1 : 0,
  idle_timeout: 20,
  max_lifetime: 1800,
})

export const db = drizzle(client, { schema })

export type DB = typeof db
