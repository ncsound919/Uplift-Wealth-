# Business Builder Simplified Pipeline — Design

Date: 2026-08-06

## Goal

Make the Wealth Business Builder feel like a calm, simple pipeline for novice users. Remove the heavy on-screen dashboard information (telemetry HUD, badge shelf, sidebar telemetry, 5-tab dossier) and move that detail into a final downloadable plan document.

## Background

- `src/components/FintechBusinessBuilder.tsx` (2,039 lines) currently defaults to a dense 12-step "Assembly Line" with:
  - Header telemetry HUD (Legitimacy / Launch Cost / Fundability / Yr 1 Revenue)
  - Roadmap progress bar (6 milestones)
  - Badge shelf ("ACTIVE UNLOCKS")
  - Sidebar: telemetry HUD, live elevator pitch, structuring advice card
  - Step 12: 5-tab on-screen dossier (Pitch / Legal / Banking / Compliance / Growth)
  - 3-mode toggle: QuickStart / Step-by-Step / Starter Map
- `src/components/BusinessQuickStart.tsx` already implements an 8-question, one-at-a-time flow with Skip options.
- `src/lib/starterKit.ts` already has 9 downloadable templates (pitch, legal, finance, compliance, product) but is **not wired into the builder**.

## Decisions (confirmed with user)

1. **Default landing = QuickStart** (8 simple questions, one per screen). The 12-step Assembly Line is kept but hidden behind an "Advanced mode" link.
2. **Completion screen = calm Summary + Download.** Show a short summary (name, type, a few key choices) and a prominent "Download My Complete Plan" button.
3. **Download = main plan document + the 9 StarterKit files.**

## Flow

```
Land on QuickStart → answer 8 questions (1 per screen) → "Connecting the dots" reveal
→ Calm Summary screen → [Download My Complete Plan] / [Run stress test] / [Start over]
                                            └→ "Edit in Advanced mode" → 12-step Assembly Line
```

## Changes

### 1. `FintechBusinessBuilder.tsx`

- Default `mode` becomes `'quickstart'` (was `'builder'`).
- Replace the 3-button mode toggle with one subtle **"Advanced: 12-step Assembly Line"** link (shown in quickstart/summary). In builder mode show a "Back to QuickStart" link. The in-builder **Starter Map** mode/toggle is removed (it already has its own sidebar route).
- **Strip dashboard chrome** from the 12-step view: remove header telemetry HUD, the badge shelf, and the whole sidebar (telemetry / elevator pitch / advice). Keep roadmap + current step + Back/Next.
- Step 12's on-screen 5-tab dossier is removed and replaced by the `BusinessSummary` completion screen.
- New mode `'summary'` rendered after QuickStart completes (in addition to step 12 in builder mode).
- Keep `onAwardXp`, `onCompleteCapstone`, and the stress-test simulator (triggered from the summary screen as a secondary action).
- `STATE_PORTALS` moves to a shared module `src/lib/statePortals.ts` so both the builder (step 8 UI) and the plan downloader can use it.

### 2. New `src/components/BusinessSummary.tsx`

Calm completion screen: business name, a few key facts (type, customers, pricing, structure, funding), primary **"Download My Complete Plan"** button, secondary **"Run stress test"** and **"Start over"**, plus an "Edit in Advanced mode" link. Styled to be light on visual density (no telemetry numbers on screen).

### 3. New `src/lib/planDownload.ts`

- `buildPlanContext()` assembles a `PlanContext` (extends the existing `BusinessContext` used by starterKit) from builder state.
- `buildPlanDocument(ctx)` returns a Markdown string containing everything currently in the dossier tabs: executive pitch summary, TAM / Year-1 revenue, 12-month pipeline, structure-specific legal blueprint (LLC / C-Corp / Solo), action steps (state filing, EIN, startup banking), FinCEN BOI + licensing compliance, growth/tools stack.
- `downloadCompletePlan(ctx)` downloads the main `{name}-complete-plan.md` document **and** calls the existing `downloadAllStarterFiles(ctx)`.

### 4. `BusinessQuickStart.tsx`

- Light restyle for a calmer, centered pipeline (larger type, cleaner progress, fewer chrome flourishes).
- Finish flow now hands to `FintechBusinessBuilder` → `summary` mode (the existing `onComplete` → `applyBlueprint` path; previously it jumped into builder step 12).

### 5. Tests

- Update `FintechBusinessBuilder.test.tsx` for the new default mode and completion screen.
- New `src/lib/planDownload.test.ts` and `src/components/BusinessSummary.test.tsx`.
- Full suite + `npm run verify` (tsc + vite build + vitest).

## Out of scope

- No change to `BusinessBlueprint` / `buildBlueprint` logic.
- No change to the simulator algorithm.
- No change to the Starter Map page itself (only the in-builder toggle is removed).
