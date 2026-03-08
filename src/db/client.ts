import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// At runtime on Vercel/serverless, use the pooler URL.
// Locally (and for migrations), the direct URL is used via drizzle.config.ts.
const connectionString = process.env.DATABASE_POOL_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_POOL_URL or DATABASE_URL environment variable is required')
}

// Disable prefetch for serverless — postgres.js opens a new connection per request
// when max is 1. Using the pooler (DATABASE_POOL_URL) handles the actual pooling.
const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })

export type DB = typeof db
