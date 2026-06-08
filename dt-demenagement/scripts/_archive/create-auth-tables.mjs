import postgres from 'postgres'

const sql = postgres('postgresql://neondb_owner:npg_kqitWg4csvF6@ep-spring-lab-al19ppyj.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require')

await sql`
  CREATE TABLE IF NOT EXISTS auth_users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP,
    image TEXT
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS auth_accounts (
    "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at INTEGER,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    PRIMARY KEY (provider, "providerAccountId")
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS auth_sessions (
    "sessionToken" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
  )
`

await sql`
  CREATE TABLE IF NOT EXISTS auth_verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,
    PRIMARY KEY (identifier, token)
  )
`

console.log('✅ Tables NextAuth créées : auth_users, auth_accounts, auth_sessions, auth_verification_tokens')
await sql.end()
