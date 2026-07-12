# Build Log

## 2026-07-12 - Scaffold + continuity docs
- What: Scaffolded Next.js 14 (App Router) + TS + Tailwind, dark glass theme, Prisma + SQLite
  schema for all Section 5 models, cookie-based seeded session with a persona switcher, and a
  role-aware sidebar + mobile nav. App boots clean (HTTP 200).
- Files: package.json, tsconfig, tailwind.config.ts, prisma/schema.prisma, lib/{prisma,utils,
  session,nav}.ts, lib/actions/session.ts, app/layout.tsx, app/(app)/layout.tsx,
  components/layout/*, components/ui/*.
- Commit: (see git log)
- Notes/gotchas: AI provider is Ollama (gpt-oss:120b-cloud), NOT Anthropic - see DECISIONS.md.
  SQLite has no enums, so Json/enum fields are Strings. Seed script is the next action.
