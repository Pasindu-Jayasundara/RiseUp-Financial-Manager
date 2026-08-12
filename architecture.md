# Financial management platform — system architecture

## 1. Scope and assumptions

Requirements mapped from your brief:

| # | Requirement | Handled by |
|---|---|---|
| 1 | Users add income sources | Finance Engine — Income Service |
| 2 | Users add current expenses with values | Finance Engine — Expense Service |
| 3 | Users add skills → job matching to reach target income | Goal & Career Engine — Skill/Job Matching |
| 4 | Auto-generate roadmap to goals, based on monthly targets | Goal & Career Engine — Roadmap Service |
| 5 | Daily "how close are you" motivational notification | Notification Engine |
| 6 | Split income into savings / loans / family / daily expenses / hobbies | Finance Engine — Budget Allocation Service |
| 7 | Age and medical conditions factored into suggestions | Finance Engine + Goal Engine, via a shared Personalization Context |
| 8 | Financial situation reports | Analytics & Prediction Service — Reporting |
| 9 | Future financial *position* prediction (not user-set — system-inferred, based on completing tasks) | Analytics & Prediction Service — Forecasting (ML) |
| 10 | Blockchain | Blockchain Integration Service |

**Assumption on blockchain scope** (this wasn't fully specified, so the design below picks a concrete, low-risk starting point — flag if your intent differs):
- Used as an **immutable audit ledger** for milestone completions and goal achievements (tamper-evident proof of progress — useful if you later want to let users showcase verified financial discipline, e.g. to lenders or employers).
- Optionally, **smart contracts for locked savings goals** (a user commits X amount toward a goal; funds/records are only "released" — marked complete — when conditions are met).
- **Not** used as the system of record for live transactional data (balances, daily expense entries) — that stays in the relational DB for cost, speed, and privacy reasons. Only hashes/commitments of significant events go on-chain.
- A **permissioned chain** (Hyperledger Fabric, or a private/consortium EVM chain via Polygon Supernets or similar) is assumed rather than a public chain, since this involves personal financial and medical-adjacent data. Public-chain tokenized rewards can be layered in later without changing this core design.

---

## 2. Architecture style

**Event-driven microservices**, behind a single API gateway.

- **Why microservices**: the domains are genuinely independent (income/expense tracking vs. job matching vs. notifications vs. ML forecasting vs. blockchain writes) with different scaling needs and different release cadences. The prediction and blockchain services in particular benefit from being decoupled — they're slower, heavier, and shouldn't block a user saving an expense entry.
- **Why event-driven**: nearly every requirement is "when X changes, something else needs to react" — a new expense entry should ripple into budget allocation, roadmap progress, and eventually a notification. An event bus (Kafka, or a managed equivalent like AWS SNS/SQS or Google Pub/Sub) lets each service react independently instead of chaining synchronous calls.

```
Client apps (web/mobile)
        │
   API Gateway (auth, rate limiting, routing)
        │
 ┌──────┼──────────────┬─────────────────┐
 │      │               │                 │
Finance  Goal & Career  Notification     Analytics &
Engine   Engine         Engine           Prediction
 │      │               │                 │
 └──────┴───────┬───────┴─────────────────┘
                 │
          Event bus (Kafka)
                 │
     ┌───────────┼───────────────┐
 Relational DB  Blockchain      ML store / cache
 (Postgres)     ledger          (feature store + Redis)
```

---

## 3. Core services

### 3.1 User & Personalization Context Service
Owns identity, profile, **age**, and **medical conditions** (and any other sensitivity flags). This is deliberately a *separate, tightly-access-controlled* service rather than fields bolted onto a generic "user" table, because:
- Medical data has different legal handling requirements than a display name.
- Other services (budget allocation, roadmap, prediction) should consume a **derived, minimal context** — e.g. `{age_band: "45-54", risk_flags: ["chronic_condition_high_cost"], health_expense_buffer_pct: 12}` — rather than querying raw medical fields directly. This limits blast radius if a downstream service is compromised and keeps the medical data itself in one auditable place.
- Suggestion logic (§5) reads from this derived context, never from raw medical records.

### 3.2 Finance Engine
- **Income Service** — CRUD for income sources (salary, freelance, passive, etc.), each with amount, frequency, stability flag (fixed vs. variable).
- **Expense Service** — CRUD for expense entries, with categories and recurrence.
- **Budget Allocation Service** — takes total income and splits it into the five buckets (savings, loans, family, daily expenses, hobbies). Two modes:
  - *Rule-based default*: a configurable percentage template (e.g. 20/15/20/35/10), adjusted by age band and medical risk flags from the Personalization Context (e.g. older users or flagged medical conditions get a higher default "essential/health buffer" carved out of daily expenses before hobbies).
  - *User-adjustable*: the user can override any bucket; the system just warns if loan/essential coverage drops below a safe threshold.

### 3.3 Goal & Career Engine
- **Goal & Roadmap Service** — user sets a target income (or the system proposes one, see §3.4). This service breaks the gap between current and target income into **monthly milestones**, and turns those into a task list (skills to acquire, applications to make, savings targets to hit). Roadmap regenerates when income, expenses, or skill list change.
- **Skill/Job Matching Service** — takes the user's declared skills + target income, calls out to a job-market data source (could be a licensed job-board API or a maintained internal dataset) to suggest realistic roles/skills-gaps that close the income gap. This is the one component most dependent on an external data source, so it should be designed with a pluggable provider interface from day one.

### 3.4 Analytics & Prediction Service
Two distinct things live here — don't conflate them:
- **Reporting** — deterministic, explainable: spend-by-category breakdowns, income vs. expense trends, savings-rate over time. Standard aggregation queries, no ML needed.
- **Forecasting** — this is the "what position could you realistically reach" feature. Distinct from the user's own stated goal: it's a system-generated projection based on the user's trajectory *if they keep completing roadmap tasks at their current rate*. Practically:
  - Model input features: income growth rate, expense stability, roadmap task completion rate, skill-acquisition pace, savings rate, age band, market data for the user's target job category.
  - Approach: start with a transparent model (e.g. gradient-boosted regression or even a well-tuned rules engine) before reaching for anything opaque — this is financial guidance, and users (and you) will want to explain *why* a projection says what it says. Log inputs/outputs so the model can be audited or challenged.
  - Output: something like "at current pace, projected income position in 12 months: $X–$Y range" — always a range, never a false-precision single number.

### 3.5 Notification Engine
- Runs a scheduled daily job (per user timezone) that computes progress-to-goal delta since the last check-in, and generates a short motivational message. Two building blocks:
  - **Progress computation** — reuses the Roadmap Service's milestone data plus that day's activity (expenses logged, tasks completed) rather than recomputing goal logic itself.
  - **Message generation** — template-based first (safer, predictable tone), optionally swapped for an LLM-assisted layer later for more natural phrasing, but keep a template fallback so notification tone stays consistent and controllable.
- Delivery via push (mobile), email, or in-app — a thin adapter layer so channels can be added without touching the computation logic.

### 3.6 Blockchain Integration Service
- Sits behind the event bus as a **consumer**, not in the synchronous request path — writing to a chain is comparatively slow, and no user-facing action should block on it.
- Listens for events like `goal_milestone_completed`, `savings_goal_locked`, `roadmap_finished`, hashes the relevant record, and commits it to the permissioned ledger. Stores the resulting transaction hash back on the Postgres record for reference/verification.
- If you go with the smart-contract savings-lock option: the contract holds a *commitment record* (not necessarily custody of real funds — that's a much bigger regulatory step involving custodial/e-money licensing) that's marked fulfilled when the Finance Engine confirms the savings target was hit over the committed period.

---

## 4. Data architecture

**Core relational entities** (Postgres):
`users`, `personalization_context`, `income_sources`, `expenses`, `budget_allocations`, `skills`, `job_recommendations`, `goals`, `roadmap_milestones`, `roadmap_tasks`, `notifications_log`, `reports_cache`, `blockchain_records (record_type, source_table, source_id, tx_hash, chain_timestamp)`.

**Event bus topics** (examples): `income.updated`, `expense.created`, `budget.recalculated`, `roadmap.milestone_completed`, `prediction.updated`, `notification.due`.

**ML/feature store**: a small feature store (even a well-indexed Postgres schema or Feast if you want to be formal about it) holding the rolling features the forecasting model consumes, refreshed on relevant events rather than recomputed from scratch each time.

**Cache (Redis)**: dashboard aggregates, today's notification state, rate limiting.

---

## 5. Age/medical-aware suggestion logic

Keep this as a **policy layer**, not scattered if-statements across services:
- The Personalization Context exposes derived flags (age band, health-cost risk tier) — never raw diagnosis data — to a shared `SuggestionPolicy` module.
- Budget Allocation, Roadmap, and Prediction services all call this module when generating defaults, so the logic (and its limits) live in one auditable place.
- Treat this as **advisory, not directive** — surface suggestions with the reasoning shown ("we've increased your essential-expense buffer because of your profile"), and always let the user override. This matters both for trust and because you are not a licensed financial or medical advisor — the product should be framed as budgeting guidance, not medical or financial advice.

---

## 6. Security, privacy, compliance

Given medical + financial data in one place, this needs to be a first-class design concern, not an afterthought:
- Encrypt medical/health fields at rest with field-level encryption, separate from general profile data.
- Strict RBAC: only the Personalization Context Service touches raw medical fields; everything downstream gets derived flags.
- Full audit log of who/what accessed medical fields.
- Data residency and consent flows appropriate to wherever your users are (e.g. GDPR if EU users, HIPAA-adjacent handling if US and medical data is involved — note HIPAA applies to covered entities, but "HIPAA-grade" controls are a reasonable bar regardless).
- Blockchain writes should **never** contain raw personal or medical data — only hashes/commitments — since data on a ledger is difficult or impossible to delete later (a real tension with "right to erasure" requirements).

---

## 7. Suggested tech stack

| Layer | Suggestion |
|---|---|
| Frontend | React/Next.js (web), React Native or Flutter (mobile) |
| API Gateway | Kong / AWS API Gateway |
| Services | Node.js (NestJS) or Go, per-service |
| Event bus | Kafka (or managed: Confluent Cloud, AWS MSK) |
| Primary DB | PostgreSQL |
| Cache | Redis |
| ML serving | Python (FastAPI) microservice, scikit-learn/XGBoost to start |
| Blockchain | Hyperledger Fabric (permissioned) or a private EVM chain (Polygon Supernets/Avalanche subnet) |
| Infra | Kubernetes, Terraform, per-service CI/CD |

---

## 8. Phased build order

1. **Phase 1 — core finance**: User service, Income/Expense, Budget Allocation, basic reporting. No ML, no blockchain yet.
2. **Phase 2 — goals**: Goal/Roadmap Service, Skill/Job Matching (start with a static or manually curated dataset before integrating a live job-market API), Notification Engine (template-based).
3. **Phase 3 — intelligence**: Forecasting model, age/medical-aware policy layer.
4. **Phase 4 — blockchain**: Immutable milestone ledger first (simplest, lowest regulatory risk); evaluate smart-contract savings locks only after legal/compliance review, since it edges toward custodial financial product territory.
