# Handoff - Start Here

## Current State
Scaffold is complete and boots clean. Next.js 14 App Router + Tailwind dark theme, Prisma +
SQLite schema pushed, cookie session + persona switcher + role-aware nav all working. The four
continuity docs exist. The database has NO seed data yet, so the app currently shows the
"needs seed data" guard on the shell.

## Next Action
Write `prisma/seed.ts` (rich data per Section 5), then `npm run db:reset` to populate. After
that, build the Environmental module (H1).

## How to Run
```bash
npm install
npm run db:reset      # push schema + seed
npm run dev           # http://localhost:3000
```
AI Copilot needs Ollama running with `gpt-oss:120b-cloud` pulled. Without it, AI screens show a
graceful "AI unavailable" state; everything else works.

## Key Facts for a Cold Session
- AI = Ollama (`gpt-oss:120b-cloud`), NOT Anthropic. See DECISIONS.md.
- Enums are String fields (SQLite). `Badge.unlockRule` and Json-like fields are JSON strings.
- Scoring formulas and weights live in DECISIONS.md; weights are editable in ESG Configuration.
