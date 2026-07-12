# EcoSphere Build Control Document

> **You are Claude Code building EcoSphere, an ESG Management Platform, inside a 6-hour hackathon.**
> This file is the single source of truth for scope, stack, and the continuity protocol.
> Any AI session (including a fresh one that has never seen this project) must follow the
> **Session Startup Protocol** in Section 1 before writing a single line of code.

---

## 0. TL;DR for a brand-new session

If you are a fresh AI picking this up cold, do exactly this, in order:

1. Read `docs/HANDOFF.md`. It tells you the current state and the single next action.
2. Read `docs/PROGRESS.md`. It is the checklist of what is done, in progress, and not started.
3. Read `docs/DECISIONS.md`. It lists locked choices and things you must NOT do.
4. Skim the last ~40 lines of `docs/LOG.md` for recent context.
5. Run the app (`npm run dev`) and confirm it boots before changing anything.
6. Do the next action from `HANDOFF.md`. Update the docs as described in Section 1.

If `docs/` does not exist yet, you are the first session. Your Task 0 is to create it (Section 1.1).

---

## 1. Continuity Protocol (most important section)

This project will span multiple AI sessions because of rate limits. Continuity is enforced by four
files under `docs/`. Treat updating them as part of every task, not an afterthought.

### The four docs

| File | Purpose | Write pattern |
|---|---|---|
| `docs/HANDOFF.md` | "Start here." Current state + the ONE next action + how to run. | Overwrite each time |
| `docs/PROGRESS.md` | Checklist of every feature: done / in-progress / todo. | Edit checkboxes |
| `docs/LOG.md` | Append-only history of what changed, files touched, commit hashes. | Append only |
| `docs/DECISIONS.md` | Locked architectural choices, formulas, and hard "do not do" rules. | Append only |

### 1.1 First session only: create the docs

Before coding features, create `docs/` and seed the four files.

- `HANDOFF.md`: current state = "scaffold not started", next action = "Task H0", run instructions placeholder.
- `PROGRESS.md`: copy the checklist from Section 6 of this document verbatim, all unchecked.
- `LOG.md`: single header line `# Build Log`.
- `DECISIONS.md`: copy Section 4 (Locked Decisions) into it as the starting entries.

Commit: `chore: init continuity docs`.

### 1.2 Every session: after each meaningful chunk

A "chunk" = one feature or sub-task that leaves the app in a runnable state. After each chunk:

1. **Verify it runs.** Compile / start the dev server. Do not log progress you have not verified.
2. **PROGRESS.md**: tick the box, or mark `[~]` if partially done with a one-line note.
3. **LOG.md**: append an entry:
   ```
   ## <ISO timestamp> - <short title>
   - What: <1-2 lines>
   - Files: <key files touched>
   - Commit: <hash or "uncommitted">
   - Notes/gotchas: <anything the next session needs>
   ```
4. **DECISIONS.md**: if you made an architectural choice, picked a formula, added a dependency,
   or discovered a gotcha, append it. One entry per decision.
5. **HANDOFF.md**: rewrite the "Current State" and "Next Action" sections so a cold session
   can resume. Always leave exactly one clear next action.
6. **Git commit** with a conventional message (`feat:`, `fix:`, `chore:`, `docs:`).

### 1.3 Hard rules for every session

- Stay inside the vertical slice in Section 3. Do NOT fully build the stubbed modules.
- Never break the demo path. The app must boot and the core flow must work after every commit.
- Do not refactor working code in the last 90 minutes. Ship, do not polish internals.
- Verify by running/compiling at each step. Prefer surgical edits over rewrites.
- No new dependency without a DECISIONS.md entry explaining why.
- Keep seed data rich enough that every screen looks alive in a demo (no empty tables).
- Use hyphens, colons, or parentheses in prose and comments. Avoid em dashes.

---

## 2. What EcoSphere is

An ESG Management Platform. Organizations measure and improve Environmental, Social, and
Governance performance from one dashboard, with gamification to drive employee participation.

Four pillars:
- **Environmental**: carbon accounting, emission factors, sustainability goals, carbon reports.
- **Social**: CSR activities, employee participation, diversity, engagement.
- **Governance**: policies, audits, compliance tracking, governance reports.
- **Gamification**: challenges, badges, XP, rewards, leaderboards.

The winning angle for judges is not the CRUD (everyone builds that). It is: a complete,
rule-enforced Environmental + Gamification slice, a working weighted ESG scoring engine, and an
**ESG Copilot** (AI) that answers questions over the org's ESG data and writes the summary report.

---

## 3. Scope Strategy (read before building anything)

Six hours is not enough for all three pillars in full. Build a deep vertical slice, seed the rest.

### BUILD FULLY (this is what gets demoed)
- **Master data**: Department, Emission Factor, Category, Challenge (as config), Badge, Reward, Environmental Goal, Employee.
- **Environmental module**: emission factor config, carbon transactions with auto-calculation, department carbon tracking, environmental goals with progress, environmental dashboard with charts.
- **Gamification module**: challenge lifecycle, challenge participation with XP award, badge auto-award engine, reward redemption with stock + point deduction, leaderboard.
- **Scoring engine**: compute Environmental score from real data; Social + Governance scores read from seeded values; department total (weighted, configurable); overall ESG (employee-count-weighted average). This makes the org dashboard fully populated and believable.
- **ESG Copilot (AI, the wow factor)**: grounded Q&A over ESG data + AI-generated ESG Summary Report.
- **Carbon anomaly detection (AI, cheap + reliable)**: statistical outlier flag on carbon transactions.
- **Dashboard**: org-level ESG dashboard + environmental dashboard.
- One report exportable (ESG Summary) to PDF and CSV.

### STUB / SEED ONLY (do not build full flows)
- Social module: seed CSR activities and participation records, show a read-only list and a diversity chart. Do NOT build the full approval workflow.
- Governance module: seed policies, audits, compliance issues. Show read-only lists. Do NOT build the full acknowledgement/audit workflow.
- Custom report builder: skip. Ship the fixed ESG Summary report instead.
- Notifications: in-app toast/badge only. No email.
- Auth: seeded users with roles, simple session, role-aware nav. Do NOT build full auth (no email verification, no password reset).

If time remains after the slice is solid, promote items from stubbed to built in this order:
Social participation approval -> Governance policy acknowledgement -> Custom report builder.

---

## 4. Locked Decisions (also copy into docs/DECISIONS.md)

- **Stack**: Next.js 14 (App Router) + TypeScript + Tailwind. Prisma + SQLite for zero-config DB. Recharts for charts. Anthropic SDK for the ESG Copilot. Dark theme default.
- **Why this stack**: one language end to end, fastest scaffold, deploys to Vercel, matches the builder's existing skills. SQLite means no DB service to stand up during a hackathon.
- **Auth**: seeded users, lightweight cookie session, role stored on user. Roles: Admin, Manager, Employee. Role gates nav visibility, not hard security. This is a demo, keep it simple.
- **Operations source simplification**: instead of four separate Purchase/Manufacturing/Expense/Fleet tables, model one `OperationRecord` with a `type` enum and a `quantity`. Carbon auto-calc multiplies quantity by the matching emission factor. Note this simplification openly; it is defensible and saves an hour.
- **Scoring formulas** (configurable weights, defaults shown):
  - Environmental score per department (0-100): reward staying under goal.
    `env = clamp(100 * (goalTargetCO2 / max(actualCO2, 1)), 0, 100)`, averaged across that department's active goals. If no goal, use org median as baseline.
  - Social score: seeded per department for the slice (0-100).
  - Governance score: seeded per department for the slice (0-100).
  - Department total: `dept = env*wE + soc*wS + gov*wG`, default `wE=0.4, wS=0.3, wG=0.3`, weights editable in ESG Configuration settings.
  - Overall ESG: employee-count-weighted average of department totals.
  - Interpretation note: the PS phrasing is ambiguous; this reading (category weights inside department total, then aggregate across departments) is the sensible one. Record it so the demo explanation is consistent.
- **Badge auto-award**: on any XP or challenge-completion change for an employee, re-evaluate all badges whose unlock rule the employee now satisfies and award any new ones. Unlock rule stored as a small JSON like `{ "type": "xp", "gte": 500 }` or `{ "type": "challenges_completed", "gte": 5 }`.
- **Reward redemption**: transaction that checks stock > 0 and employee points >= cost, then decrements both. Reject otherwise with a clear message.
- **ESG Copilot retrieval**: no vector DB for v1. Pull relevant structured records (carbon transactions, goals, department scores, policies, compliance issues) via Prisma queries plus keyword match on the question, assemble a compact context block with record IDs, send to Claude with a grounding system prompt, return an answer that cites record IDs. Upgrade to embeddings only if the slice is done early.
- **API key**: read `ANTHROPIC_API_KEY` from `.env`. Never hardcode. If missing, the Copilot shows a graceful "AI unavailable, set API key" state instead of crashing.
- **Model for Copilot**: use a current Claude model string from the Anthropic docs; do not assume a model name from memory, confirm it.

---

## 5. Data Model

Use Prisma. Core models (fields abbreviated; add ids, timestamps, relations):

**Master**
- `Employee`: name, email, role (Admin|Manager|Employee), departmentId, xp (int, default 0), points (int, default 0).
- `Department`: name, code (unique), headId, parentId (nullable), employeeCount, status.
- `Category`: name, type (CSR|Challenge), status.
- `EmissionFactor`: name, unit (e.g. kg per unit), factor (float), sourceType (Purchase|Manufacturing|Expense|Fleet), status.
- `EnvironmentalGoal`: name, departmentId, metric (e.g. total CO2), targetValue, period, status.
- `Badge`: name, description, unlockRule (Json), icon.
- `Reward`: name, description, pointsRequired, stock, status.
- `ESGPolicy`: title, body, status (seed/stub).
- `ProductESGProfile`: optional, seed only if time allows.

**Transactional**
- `OperationRecord`: type (Purchase|Manufacturing|Expense|Fleet), departmentId, quantity, date, description. Drives carbon auto-calc.
- `CarbonTransaction`: operationRecordId (nullable), emissionFactorId, departmentId, quantity, computedCO2, date, auto (bool).
- `Challenge`: title, categoryId, description, xp, difficulty, evidenceRequired (bool), deadline, status (Draft|Active|Under Review|Completed|Archived).
- `ChallengeParticipation`: challengeId, employeeId, progress, proof (nullable), approval (Pending|Approved|Rejected), xpAwarded.
- `RewardRedemption`: rewardId, employeeId, pointsSpent, date.
- `EmployeeBadge`: employeeId, badgeId, awardedAt.
- `DepartmentScore`: departmentId, environmentalScore, socialScore, governanceScore, totalScore, computedAt.
- Seed-only: `CSRActivity`, `EmployeeParticipation`, `PolicyAcknowledgement`, `Audit`, `ComplianceIssue`.

**Settings**
- `EsgConfig`: single row. weightEnvironmental, weightSocial, weightGovernance, autoEmissionEnabled (bool), evidenceRequiredEnabled (bool), badgeAutoAwardEnabled (bool).

Provide a `prisma/seed.ts` that creates: 4-5 departments, ~15 employees, emission factors for each source type, ~40 operation records across departments and dates, derived carbon transactions, 6-8 challenges across lifecycle states, some challenge participations, 4-6 badges, 4-6 rewards, seeded social/governance scores, and a handful of policies/audits/compliance issues. Rich seed data is what makes the demo look real.

---

## 6. Feature Checklist (copy into docs/PROGRESS.md, all unchecked)

### H0 Scaffold
- [ ] Next.js + TS + Tailwind app created, dark theme, base layout + side nav
- [ ] Prisma + SQLite wired, schema from Section 5, `migrate` + `generate`
- [ ] Seed script producing rich data
- [ ] Seeded users + simple session + role-aware nav
- [ ] `docs/` created with all four continuity files

### H1 Environmental
- [ ] Emission Factor CRUD
- [ ] Operation records + auto carbon calculation (respect EsgConfig.autoEmissionEnabled)
- [ ] Department carbon tracking view
- [ ] Environmental Goals with progress bars
- [ ] Environmental dashboard (emissions by department, trend over time)

### H2 Gamification
- [ ] Challenge CRUD + lifecycle state transitions (Draft->Active->Under Review->Completed, Archive anytime)
- [ ] Challenge participation + XP award on approval
- [ ] Badge auto-award engine (respect badgeAutoAwardEnabled)
- [ ] Reward catalog + redemption (stock check + point deduction)
- [ ] Leaderboard (employees by XP)

### H3 Scoring + Org Dashboard
- [ ] Environmental score computation from real data
- [ ] Department total score (weighted, configurable) + overall ESG
- [ ] ESG Configuration settings screen (weights + feature toggles)
- [ ] Org-level ESG dashboard (overall score, pillar breakdown, department ranking)

### H4 AI
- [ ] ESG Copilot chat: grounded Q&A over ESG data with record citations
- [ ] AI-generated ESG Summary Report
- [ ] Carbon anomaly detection flag on carbon transactions

### H5 Polish + Demo
- [ ] ESG Summary report export to PDF and CSV
- [ ] Empty states, loading states, toasts
- [ ] Demo data sanity pass (every screen populated)
- [ ] Demo rehearsal against the script in Section 8
- [ ] README with run instructions

---

## 7. Six-Hour Timebox

| Block | Time | Focus |
|---|---|---|
| H0 | 0:00-0:45 | Scaffold, schema, seed, session, continuity docs |
| H1 | 0:45-2:00 | Environmental module + dashboard |
| H2 | 2:00-3:15 | Gamification module |
| H3 | 3:15-4:15 | Scoring engine + org dashboard + settings |
| H4 | 4:15-5:15 | ESG Copilot + AI summary + anomaly flag |
| H5 | 5:15-6:00 | Export, polish, rehearse |

If behind at any checkpoint, cut in this order: PDF export (keep CSV), anomaly detection,
diversity chart, parent-department hierarchy. Never cut: auto emission calc, badge auto-award,
reward redemption, the scoring chain, the Copilot. Those four are the demo.

---

## 8. Demo Script (rehearse this, build toward this)

1. Open org dashboard: overall ESG score, pillar breakdown, department ranking. "One number, live from operational data."
2. Environmental: add an operation record, show a carbon transaction auto-created and the department's emissions and score update.
3. Gamification: approve a challenge participation, show XP jump, a badge auto-unlock, then redeem a reward and watch points and stock drop.
4. Settings: change the ESG weights, return to dashboard, show the overall score recompute. "Configurable per organization."
5. ESG Copilot: ask "Why did our carbon score drop this quarter and which department is worst?" Show a grounded answer citing records. Then click "Generate ESG Summary Report" and export the PDF.
6. Anomaly: point at the flagged outlier carbon transaction.

The judges remember steps 2, 3, and 5. Make those three bulletproof.

---

## 9. Judge-Impact Notes

- Lead with the AI Copilot and the live scoring recompute; those separate you from the CRUD crowd.
- Keep every cause-effect chain short and visible on screen (action -> immediate update).
- Be honest that Social and Governance are seeded for the slice; frame it as prioritization, not a gap.
- Emphasize configurability (weights, feature toggles) as "enterprise-ready."

---

## 10. Definition of Done for v1

The app boots clean, the demo script in Section 8 runs end to end without errors, the four
continuity docs are current, and there is a README. Anything beyond that is bonus.
