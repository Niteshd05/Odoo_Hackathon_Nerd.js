# Handoff - Start Here

## Current State
The full vertical slice is complete and the production build passes clean (17 routes). The app
boots, is richly seeded, and the entire demo path in the build doc's Section 8 works:

- Org ESG dashboard (live weighted score, pillar breakdown, department ranking, anomaly banner)
- Environmental: operations + auto carbon calc, carbon ledger with anomaly flags, emission-factor
  CRUD, goals with progress, carbon dashboard
- Gamification: challenge lifecycle, approval-driven XP/points, badge auto-award with celebration,
  reward redemption (stock + points checks), leaderboard, badge gallery
- ESG Configuration with live weight recompute + feature toggles
- Social + Governance seeded read-only views
- ESG Copilot (streaming, grounded, cited) + AI ESG Summary Report with PDF/CSV export
- Statistical carbon anomaly detection

## Next Action
Optional polish only. In priority order if continuing:
1. Promote Social participation approval from seeded to built.
2. Governance policy acknowledgement flow.
3. Add a couple of screenshots to the README.

## How to Run
```bash
npm install
npm run db:reset      # push schema + seed rich demo data
npm run dev           # http://localhost:3000
```
AI Copilot needs Ollama running with `gpt-oss:120b-cloud` pulled. Without it, AI screens show a
graceful "AI unavailable" state; everything else works.

## Key Facts for a Cold Session
- AI = Ollama (`gpt-oss:120b-cloud`), NOT Anthropic. See DECISIONS.md.
- `lib/ollama.ts` normalizes `OLLAMA_HOST` (system env may set a schemeless `0.0.0.0:11434`).
- Enums are String fields (SQLite). `Badge.unlockRule` is a JSON string.
- Scoring formulas + weights: DECISIONS.md; weights editable in ESG Configuration.
- The seed leaves `Aarav Sharma` (480 XP) one approval short of the Rising Star badge.
- `prisma/seed.ts` is excluded from the Next type-check (run via tsx).
