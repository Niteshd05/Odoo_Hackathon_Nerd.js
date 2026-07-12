# Deploying EcoSphere to Vercel

EcoSphere runs on **SQLite locally** (zero-config) but Vercel's serverless
filesystem is **ephemeral** - a SQLite file would reset on every deploy and is
not shared between serverless instances. For production you need a hosted
Postgres. This takes about 5 minutes.

---

## 1. Create a free Postgres database

Use any of these (all have a free tier):

- **Neon** - https://neon.tech (recommended, serverless Postgres)
- **Vercel Postgres** - from the Vercel dashboard → Storage
- **Supabase** - https://supabase.com

Copy the connection string. For Neon it looks like:

```
postgresql://user:password@ep-xxx.region.aws.neon.tech/ecosphere?sslmode=require
```

Neon also gives a **direct** (non-pooled) URL - keep it for migrations.

---

## 2. Point Prisma at Postgres

In `prisma/schema.prisma`, change the datasource provider:

```prisma
datasource db {
  provider  = "postgresql"        // was "sqlite"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")   // uncomment this line (Neon pooling)
}
```

No other schema changes are needed - enums are modelled as `String`, so the
schema is fully portable.

---

## 3. Environment variables (Vercel → Project → Settings → Environment Variables)

```
DATABASE_URL   = <pooled postgres url>
DIRECT_URL     = <direct postgres url>   # Neon; else same as DATABASE_URL

# ESG Copilot (Ollama). Point at any reachable Ollama host, or leave unset -
# the AI features degrade gracefully to an "AI unavailable" state.
OLLAMA_HOST            = https://your-ollama-host
OLLAMA_MODEL           = gpt-oss:120b-cloud
OLLAMA_FALLBACK_MODEL  = gpt-oss:20b-cloud
```

---

## 4. Create the schema + seed data (one time)

From your machine, with `DATABASE_URL` pointed at the new Postgres:

```bash
npx prisma migrate deploy   # or: npx prisma db push
npm run db:seed             # loads the rich demo organization
```

(Alternatively run `npx prisma db push` once, then seed.)

---

## 5. Deploy

- Push to GitHub and **Import** the repo in Vercel, **or** run `vercel` from the CLI.
- The build command is already `prisma generate && next build` (see `package.json`),
  and `postinstall` runs `prisma generate`, so the Prisma Client is always built.
- Framework preset: **Next.js** (auto-detected). No extra config required.

---

## Notes on scalability

- **Serverless-safe Prisma**: a single `PrismaClient` is reused across hot
  reloads and invocations (`lib/prisma.ts`), avoiding connection exhaustion. Use a
  **pooled** connection string (Neon/PgBouncer) for serverless.
- **Stateless app**: sessions are a signed cookie; there is no server-side
  session store to scale.
- **AI is external**: the Copilot calls Ollama over HTTP, so it scales
  independently and never blocks the rest of the app.
- **Read paths are cache-friendly**: pages use `export const dynamic` where live
  data is required and are otherwise static.
