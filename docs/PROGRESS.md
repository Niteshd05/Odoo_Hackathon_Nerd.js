# Progress Checklist

`[ ]` todo · `[~]` in progress / partial · `[x]` done

## H0 Scaffold
- [x] Next.js + TS + Tailwind app created, dark theme, base layout + side nav
- [x] Prisma + SQLite wired, schema from Section 5, `migrate` + `generate`
- [x] Seed script producing rich data
- [x] Seeded users + simple session + role-aware nav
- [x] `docs/` created with all four continuity files

## H1 Environmental
- [x] Emission Factor CRUD
- [x] Operation records + auto carbon calculation (respect EsgConfig.autoEmissionEnabled)
- [x] Department carbon tracking view
- [x] Environmental Goals with progress bars
- [x] Environmental dashboard (emissions by department, trend over time)

## H2 Gamification
- [x] Challenge CRUD + lifecycle state transitions (Draft->Active->Under Review->Completed, Archive anytime)
- [x] Challenge participation + XP award on approval
- [x] Badge auto-award engine (respect badgeAutoAwardEnabled)
- [x] Reward catalog + redemption (stock check + point deduction)
- [x] Leaderboard (employees by XP)

## H3 Scoring + Org Dashboard
- [x] Environmental score computation from real data
- [x] Department total score (weighted, configurable) + overall ESG
- [x] ESG Configuration settings screen (weights + feature toggles)
- [x] Org-level ESG dashboard (overall score, pillar breakdown, department ranking)

## H4 AI
- [x] ESG Copilot chat: grounded Q&A over ESG data with record citations
- [x] AI-generated ESG Summary Report
- [x] Carbon anomaly detection flag on carbon transactions

## H5 Polish + Demo
- [x] ESG Summary report export to PDF and CSV
- [x] Empty states, loading states, toasts
- [x] Demo data sanity pass (every screen populated)
- [~] Demo rehearsal against the script in Section 8 (verified via API + route checks)
- [x] README with run instructions
