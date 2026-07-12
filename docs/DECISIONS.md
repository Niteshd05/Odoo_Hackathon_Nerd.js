# Locked Decisions

Append-only. One entry per architectural choice, formula, dependency, or gotcha.

## Stack

- **Framework**: Next.js 14 (App Router) + TypeScript + Tailwind CSS. Dark theme default.
- **Database**: Prisma + SQLite (zero-config, no service to stand up). Enums modelled as
  `String` fields since SQLite has no native enum; allowed values documented in the schema.
- **Charts**: Recharts.
- **Why this stack**: one language end to end, fastest scaffold, matches the builder's skills.

## AI provider: Ollama (NOT Anthropic)

- The original brief named the Anthropic SDK. We deliberately switched the ESG Copilot,
  AI summary, and any AI feature to **Ollama** with the **`gpt-oss:120b-cloud`** model.
- **Why**: no paid API key is available. Ollama's cloud passthrough runs the 120B model
  without local GPU, and falls back to `gpt-oss:20b-cloud` if the primary is unavailable.
- Config via `.env`: `OLLAMA_HOST`, `OLLAMA_MODEL`, `OLLAMA_FALLBACK_MODEL`. No secret keys.
- If Ollama is unreachable, AI surfaces show a graceful "AI unavailable" state, never crash.
- Retrieval is grounded, no vector DB for v1: relevant structured records are pulled via
  Prisma + keyword match, assembled into a compact context block with record IDs, and the
  model is asked to cite those IDs.

## Auth

- Seeded users, lightweight httpOnly cookie session, role stored on the user.
- Roles: Admin, Manager, Employee. Role gates nav visibility, not hard security. Demo only.
- A persona switcher in the topbar swaps the active user cookie.

## Operations source simplification

- Instead of four Purchase/Manufacturing/Expense/Fleet tables, one `OperationRecord` with a
  `type` enum and a `quantity`. Carbon auto-calc multiplies quantity by the matching emission
  factor. Defensible simplification, saves time; disclosed in the demo.

## Scoring formulas (configurable weights, defaults shown)

- Environmental score per department (0-100): reward staying under goal.
  `env = clamp(100 * (goalTargetCO2 / max(actualCO2, 1)), 0, 100)`, averaged across that
  department's active goals. If no goal, use org median as baseline.
- Social score: seeded per department for the slice (0-100), stored on `Department.seedSocialScore`.
- Governance score: seeded per department (0-100), stored on `Department.seedGovScore`.
- Department total: `dept = env*wE + soc*wS + gov*wG`, default `wE=0.4, wS=0.3, wG=0.3`,
  weights editable in ESG Configuration.
- Overall ESG: employee-count-weighted average of department totals.
- Interpretation: category weights inside department total, then aggregate across departments.

## Badge auto-award

- On any XP or challenge-completion change, re-evaluate all badges whose unlock rule the
  employee now satisfies and award new ones. Rule stored as JSON string, e.g.
  `{"type":"xp","gte":500}` or `{"type":"challenges_completed","gte":5}`.

## Reward redemption

- Transaction checks `stock > 0` and `employee.points >= cost`, then decrements both.
  Rejects otherwise with a clear message.

## Dependencies added (with reason)

- `framer-motion` - page/nav animations and the animated score gauge (the "wow" polish).
- `recharts` - all charts.
- `lucide-react` - icon set, also drives the data-driven nav/badge icons by name.
- `sonner` - toast notifications (in-app only, no email per scope).
- `jspdf` + `jspdf-autotable` - ESG Summary PDF export.
- `date-fns` - date handling in seed and charts.
- `clsx` + `tailwind-merge` - `cn()` class helper.
- `ollama` - typed client for the local/cloud Ollama runtime.
- `tsx` - run the TypeScript seed script.
