# Progress Checklist

`[ ]` todo · `[~]` in progress / partial · `[x]` done

## H0 Scaffold
- [x] Next.js + TS + Tailwind app created, dark theme, base layout + side nav
- [x] Prisma + SQLite wired, schema from Section 5, `migrate` + `generate`
- [ ] Seed script producing rich data
- [x] Seeded users + simple session + role-aware nav
- [x] `docs/` created with all four continuity files

## H1 Environmental
- [ ] Emission Factor CRUD
- [ ] Operation records + auto carbon calculation (respect EsgConfig.autoEmissionEnabled)
- [ ] Department carbon tracking view
- [ ] Environmental Goals with progress bars
- [ ] Environmental dashboard (emissions by department, trend over time)

## H2 Gamification
- [ ] Challenge CRUD + lifecycle state transitions (Draft->Active->Under Review->Completed, Archive anytime)
- [ ] Challenge participation + XP award on approval
- [ ] Badge auto-award engine (respect badgeAutoAwardEnabled)
- [ ] Reward catalog + redemption (stock check + point deduction)
- [ ] Leaderboard (employees by XP)

## H3 Scoring + Org Dashboard
- [ ] Environmental score computation from real data
- [ ] Department total score (weighted, configurable) + overall ESG
- [ ] ESG Configuration settings screen (weights + feature toggles)
- [ ] Org-level ESG dashboard (overall score, pillar breakdown, department ranking)

## H4 AI
- [ ] ESG Copilot chat: grounded Q&A over ESG data with record citations
- [ ] AI-generated ESG Summary Report
- [ ] Carbon anomaly detection flag on carbon transactions

## H5 Polish + Demo
- [ ] ESG Summary report export to PDF and CSV
- [ ] Empty states, loading states, toasts
- [ ] Demo data sanity pass (every screen populated)
- [ ] Demo rehearsal against the script in Section 8
- [ ] README with run instructions
