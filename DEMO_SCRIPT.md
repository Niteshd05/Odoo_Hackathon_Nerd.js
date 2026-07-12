# 🎬 EcoSphere - Demo Video Script

A tight **4-5 minute** walkthrough that lands the wow moments. Each scene lists
**[SHOW]** (what to click/point at) and **[SAY]** (voiceover). Timings are a guide.

**Before you record**
- Run `npm run db:reset` so the demo state is fresh (persona *Aarav Sharma* is one
  approval short of a badge).
- Start Ollama (`ollama pull gpt-oss:120b-cloud`) so the Copilot is live.
- Start the app: `npm run dev` → http://localhost:3000.
- Record at 1920x1080. Keep the browser zoom at 100%.

---

## Scene 0 - Sign in (0:00-0:20)

**[SHOW]** The `/login` screen: three role cards (Admin, Manager, Employee).
Click the **Admin - Priya Menon** card.

**[SAY]** "EcoSphere is an ESG management platform. It has real role-based access -
Admin, Manager, and Employee. I'll sign in as the Chief Sustainability Officer."

> Tip: hit the **theme toggle** (top-right sun/moon) once to show the light and
> dark maximalist themes, then leave it on dark.

---

## Scene 1 - The org dashboard (0:20-0:55)

**[SHOW]** The ESG Dashboard. Point at the big animated **overall ESG score**, the
**pillar breakdown** donut, the **department ranking**, and the **emissions trend**.

**[SAY]** "This is one number - the overall ESG score - computed live from real
operational data. Environmental, Social, and Governance each contribute, and you
can see exactly how every department ranks. Notice the numbers count up - nothing
here is a static mockup."

> If a red **carbon anomaly** banner shows, point at it: "It even flags statistical
> outliers in our carbon data automatically."

---

## Scene 2 - Live carbon calculation (0:55-1:35)

**[SHOW]** Sidebar → **Environmental → Operations**. Click **Add operation**.
Pick `Manufacturing`, department `Manufacturing`, quantity `500`. Watch the live
**Estimated carbon** preview update. Click **Record & calculate**. A toast appears.

**[SAY]** "Let's log a real operation. As I type the quantity, EcoSphere multiplies
it by the matching emission factor and previews the carbon in real time. When I
save, it auto-creates a carbon transaction - and the department's emissions and
ESG score update instantly."

**[SHOW]** Go back to the **Dashboard** to show the score/emissions reflect it.

---

## Scene 3 - Gamification: the crowd-pleaser (1:35-2:30)

**[SHOW]** Sidebar → **Gamification → Challenges**. In the **approval queue**, find
**Aarav Sharma**'s pending challenge. Click **Approve**.

**[SAY]** "Employees complete sustainability challenges. As a manager I approve
Aarav's submission - watch his XP jump..."

**[SHOW]** The **confetti badge-unlock** celebration fires (Rising Star).

**[SAY]** "...and because he just crossed 500 XP, a badge auto-unlocks. That whole
engine is rule-driven."

**[SHOW]** Sidebar → **Rewards**. Redeem an affordable reward (e.g. *Reusable Coffee
Cup*). Point at the **stock** dropping and **points** decreasing.

**[SAY]** "Points are real currency - redeeming a reward checks stock and deducts
points in one transaction." Then show **Leaderboard** briefly.

---

## Scene 4 - What-if Simulator (USP) (2:30-3:05)

**[SHOW]** Sidebar → **What-if Simulator**. Drag a department's **emissions** slider
down, then drag the **pillar weights**. The big score, grade, and **ranking reorder
live**.

**[SAY]** "This is our planning sandbox. I can model an intervention - say we cut
Manufacturing's emissions - and instantly see the ESG score, grade, and department
ranking react, before committing anything. Great for target-setting."

---

## Scene 5 - Carbon Forecast (USP) (3:05-3:35)

**[SHOW]** Sidebar → **Environmental → Carbon Forecast**. Point at a department card:
the solid **actual** line, the dashed **projection** to year-end, the **goal line**,
and the **"Will breach"** risk flag.

**[SAY]** "EcoSphere also projects forward. Using the emissions trend, it forecasts
each department to year-end against its cap and flags who is on track to breach -
so you can act early."

---

## Scene 6 - The AI ESG Copilot (the differentiator) (3:35-4:20)

**[SHOW]** Sidebar → **ESG Copilot**. Click the suggested question *"Why did our
carbon score drop and which department is worst?"* Let the answer **stream in**, and
point at the **cited record chips** (e.g. `[DEPT:MFG]`).

**[SAY]** "This is the ESG Copilot. It answers questions grounded in our live data,
and it cites the exact records it used - so it's auditable, not hand-wavy. It runs
on a local Ollama model, no paid API."

**[SHOW]** Click **Generate report** in the Summary panel. When it renders, click
**PDF**.

**[SAY]** "And it writes a full executive ESG summary that we can export to PDF or
CSV in one click."

---

## Scene 7 - Configurable + full pillars (4:20-4:50)

**[SHOW]** Sidebar → **ESG Configuration**. Drag the pillar-weight sliders; the
**overall score preview recomputes live**. Save.

**[SAY]** "Everything is configurable - change the pillar weights and the whole
organization's score recomputes. Enterprise-ready."

**[SHOW]** Quickly visit **Social** (volunteer for an activity / log hours) and
**Governance** (acknowledge a policy, change a compliance issue status).

**[SAY]** "Social and Governance are fully functional too - volunteers log hours,
employees acknowledge policies, and managers drive compliance issues to resolution."

---

## Scene 8 - Close (4:50-5:00)

**[SHOW]** Press **Cmd/Ctrl + K** to open the **command palette**; type "dashboard"
and hit enter.

**[SAY]** "There's a command palette to jump anywhere instantly, a live activity
feed, light and dark themes - EcoSphere turns ESG from a spreadsheet into a living,
gamified, AI-assisted platform. Thanks for watching."

---

## One-line elevator pitch (for the intro or thumbnail)

> **EcoSphere** - one live ESG score from real operational data, a gamified
> engine that drives participation, predictive carbon forecasting, and an AI
> Copilot that answers grounded, cited questions and writes the report for you.

## The three moments judges remember - nail these
1. **Scene 3** - approve → XP jump → badge confetti → reward stock drop.
2. **Scene 4/5** - the live simulator + the breach forecast (few teams have this).
3. **Scene 6** - the Copilot streaming a cited answer, then exporting the PDF.
