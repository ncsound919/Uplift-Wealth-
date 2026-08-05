# Business Builder QuickStart + Dictionary Bridge — Design

Date: 2026-08-04

## Goal

Make the Wealth business builder easier to understand, let users start **any** kind of business (not just fintech) by answering a short questionnaire that auto-assembles the full plan, and bridge fintech jargon to the existing Finance Dictionary across the wealth modules.

## Background

- `src/components/FintechBusinessBuilder.tsx` (1,928 lines) is a dense 12-step "FinTech Assembly Line" with jargon-heavy titles, plus a "Starter Map" mode (`FintechStarterMap.tsx`).
- The Wealth modules render markdown bodies via `src/components/wealth/ChapterShell.tsx` using `react-markdown`.
- A Finance Dictionary already exists: `src/components/FinanceGlossary.tsx` exports `FINANCE_GLOSSARY_TERMS: GlossaryTerm[]` (term / definition / example / category / phaseLink).

## Part 1 — QuickStart wizard (3rd mode)

Add `mode: 'quickstart'` to the builder alongside `builder` and `map`.

### Questionnaire (8 questions, each with a Skip option)
1. What kind of business? — Fintech / Retail & E-commerce / Food & Restaurants / Services & Trades / Consulting & Coaching / Real Estate / Other
2. Who are your customers?
3. What problem do you solve?
4. How do you make money? — subscription / transaction fee / product margin / service fee
5. Solo founder or team?
6. What's your business name? (optional, auto-suggests)
7. Bootstrap or raise money?
8. Where will you register? (US state, sensible default)

### Assembler
New file `src/lib/businessBlueprint.ts`: deterministic function mapping the 8 answers → a `BusinessBlueprint` object that seeds all builder state (lane/problem/cohort/monetization/structure/state/HQ/APIs/growth/equity/funding).

### Handoff
After the last question: staged **"Connecting the dots" reveal** (type → customers → pricing → entity → funding → launch), then jump to the pre-filled **Dossier** (step 12). "Edit in Assembly Line" is a secondary action.

## Part 2 — Any-business support

- New `businessType` state on the builder (defaults `fintech`, preserving current behavior).
- Non-fintech swaps:
  - Step 1 lanes → Retail / Food / Services / Consulting / etc. (fintech still available).
  - Step 10 "API Core Rails" → "Tools & Operations" (POS, inventory, bookkeeping, payments processing).
  - Compliance/Sim → business licenses/permits instead of FinCEN/KYC API focus, adjusted sim copy.
- Entity, state, HQ, funding, growth, equity steps are already business-agnostic.

## Part 3 — Plain-English builder copy

- Rename the 12 step titles and 6 milestone labels to plain English.
- Add a one-line plain-English hint under each step heading.
- Underlying model/behavior unchanged.

## Part 4 — Dictionary highlighting in wealth modules

- New `src/components/wealth/GlossaryInline.tsx`: renders text with glossary terms from `FINANCE_GLOSSARY_TERMS` highlighted as spans with a hover tooltip (definition + example) and a link to `/glossary`.
- Wire into `ChapterShell.tsx` so all 7 wealth chapters get highlighting via one change.

## Testing

- Extend `FintechBusinessBuilder.test.tsx`: QuickStart flow, blueprint mapping, non-fintech swaps, plain-English labels.
- New `src/lib/businessBlueprint.test.ts`.
- Glossary/ChapterShell highlighting tests.
- Full suite + production build.
