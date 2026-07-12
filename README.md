<div align="center">

# 🌍 EcoSphere

### An ESG Management Platform with a live scoring engine and an AI ESG Copilot

Measure and improve **Environmental, Social, and Governance** performance from one
dashboard - with gamification to drive employee participation and a grounded AI
Copilot that answers questions over your live ESG data.

Built for the Odoo Hackathon · Next.js 14 · Prisma · Ollama (gpt-oss:120b-cloud)

</div>

---

## Why EcoSphere stands out

Everyone builds the CRUD. EcoSphere leads with the parts judges remember:

- **A live, rule-enforced Environmental + Gamification slice.** Record an operation and a
  carbon transaction is auto-calculated; approve a challenge and XP jumps, a badge
  auto-unlocks, then a reward redemption drops points and stock - all on screen, instantly.
- **A weighted ESG scoring engine.** One number, computed live from operational data. Change
  the pillar weights in settings and watch the overall score recompute before you even save.
- **An AI ESG Copilot (no paid API key).** Grounded question-answering over your ESG data with
  citations to the exact records used, plus an AI-written ESG Summary Report you can export to
  PDF and CSV. Powered by **Ollama** running `gpt-oss:120b-cloud`.
- **Statistical carbon anomaly detection** that flags outlier emissions right in the ledger.

---

## The stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS, custom dark "glass" design system, Framer Motion |
| Database | Prisma + SQLite (zero-config) |
| Charts | Recharts |
| AI | **Ollama** (`gpt-oss:120b-cloud`, `gpt-oss:20b-cloud` fallback) - no API key |
| Exports | jsPDF + jspdf-autotable (PDF), native CSV |

Full rationale and locked decisions live in [`docs/DECISIONS.md`](docs/DECISIONS.md).

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create the SQLite database and seed a rich demo organization
npm run db:reset

# 3. Start the app
npm run dev
# -> http://localhost:3000
```

### Enabling the AI Copilot (optional but recommended)

EcoSphere talks to a local [Ollama](https://ollama.com) runtime - **no API key required**.

```bash
# Install Ollama, then pull the model (cloud-hosted, no local GPU needed)
ollama pull gpt-oss:120b-cloud
```

Configuration lives in `.env` (`OLLAMA_HOST`, `OLLAMA_MODEL`, `OLLAMA_FALLBACK_MODEL`). If
Ollama is not running, the Copilot and Summary Report show a graceful "AI unavailable" state
and **everything else in the app keeps working**.

---

## The 90-second demo path

1. **Org Dashboard** - the overall ESG score, pillar breakdown, and department ranking, all
   live from operational data.
2. **Environmental → Operations** - add an operation record and watch a carbon transaction get
   auto-created; the department's emissions and score update.
3. **Gamification → Challenges** - approve `Aarav Sharma`'s pending challenge. XP jumps and the
   **Rising Star** badge auto-unlocks with a celebration. Then redeem a reward and watch points
   and stock drop.
4. **ESG Configuration** - drag the pillar weights and watch the overall score recompute live,
   then save to apply it org-wide.
5. **ESG Copilot** - ask *"Why did our carbon score drop and which department is worst?"* for a
   grounded, cited answer. Click **Generate report** and export the PDF.
6. **Carbon Ledger** - point at the flagged anomaly outlier.

The seed leaves `Aarav Sharma` exactly one approval short of a badge, so step 3 lands every time.

---

## Roles & personas

Auth is intentionally lightweight (a seeded-user cookie session - see `docs/DECISIONS.md`). Use
the **persona switcher** in the top-right to jump between an Admin (Priya Menon), Managers, and
Employees. Role gates nav visibility and the ESG Configuration screen.

---

## Project structure

```
app/(app)/        Authenticated app shell + all feature pages
app/api/          Copilot + Summary streaming/JSON endpoints
components/       UI kit, charts, and per-module client components
lib/              prisma, scoring engine, carbon calc, gamification,
                  badges, Ollama client, AI retrieval + prompts, exports
prisma/           schema + rich seed script
docs/             Continuity docs (handoff, progress, log, decisions)
```

---

## What is fully built vs seeded

**Built end-to-end:** master data, the Environmental module (emission factors, operations +
auto carbon calc, goals, carbon ledger, dashboard), the Gamification module (challenge
lifecycle, XP award, badge auto-award, reward redemption, leaderboard), the scoring engine, the
org dashboard, ESG configuration, and the AI Copilot + summary + anomaly detection.

**Seeded slice (read-only, by design):** the Social (CSR) and Governance (policies, audits,
compliance) modules. These are honestly labelled in-app as prioritization, not a gap - the depth
went into the Environmental, Gamification, Scoring, and AI flows.

---

## Useful scripts

```bash
npm run dev        # start the dev server
npm run build      # production build (type-checks every route)
npm run db:reset   # wipe + re-seed the database
npm run db:seed    # re-run the seed only
npm run db:studio  # open Prisma Studio
```

---

<div align="center">
<sub>EcoSphere · one number, live from operational data.</sub>
</div>
