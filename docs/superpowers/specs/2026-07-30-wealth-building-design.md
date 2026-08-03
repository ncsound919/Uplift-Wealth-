# Wealth Building Section — Design Spec

**Date:** 2026-07-30
**Status:** Approved for planning
**Scope:** New top-level "Wealth Building" section in the FinTech Foundations platform

---

## Purpose

The existing 13 modules teach learners how to **build fintech products** (lending engines, payment APIs, fraud detection, robo-advisors). This new section addresses a parallel need: **using that knowledge to build personal and community wealth**, with explicit focus on the Black community's wealth gap.

The user's framing: "one of the primary issues in the Black community is not knowing how to go from $1 to $100 to $10,000 to $100,000 to $1,000,000, flipping houses, IRAs, mutual funds, bonds, business building, drop shipping, group economics, building and using credit."

**Audience:** Beginner-to-intermediate learners who want actionable personal-finance guidance, not a fintech product engineering guide.

---

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| Scope | Top-level sidebar section, not a module | Distinct category: "Building fintech" vs "Building personal wealth" |
| Structure | 5 chapters, hub-and-spoke (independent) | Returning users can pick any chapter; no forced linear path |
| Content format | Light shell + markdown body | Faster to author, consistent structure, reuses existing markdown renderer |
| Tooling | 5 specialized tools, one per chapter | Each tool is contextual to its chapter |
| Flagship tool | Compound Growth Visualizer | Gets the most polish — confetti on $1→$1M milestones |
| Tracking | Completion-only (localStorage) | Per user decision — no XP, no badges, no backend |
| External links | Inline action links in markdown body | Contextual, actionable in the moment |
| Group Economics | Modern focus built on historical reference | Per user — Garvey, Black Wall Street, susus as foundation |

---

## Architecture

### Navigation

New top-level sidebar entry between "Business Builder" and "Fintech Starter Map" in the Syllabus Path section. Icons/gradients position it as a peer of Business Builder.

**Routes:**
- `/wealth-building` — Hub showing 5 chapter cards + compound growth preview
- `/wealth-building/credit` — Chapter 1
- `/wealth-building/investing` — Chapter 2
- `/wealth-building/real-estate` — Chapter 3
- `/wealth-building/business` — Chapter 4
- `/wealth-building/group-economics` — Chapter 5

### State Changes in `App.tsx`

Add 6 new view values to the `activeView` union:
```ts
'wealth_building' | 'wealth_credit' | 'wealth_investing' |
'wealth_real_estate' | 'wealth_business' | 'wealth_group_economics'
```

Reuse the existing `useLocation` → `activeView` sync effect (App.tsx lines 141–202). Add 6 new `else if` branches mapping paths to views.

localStorage key: `wealth_chapters_completed` — JSON string array of chapter IDs.

### Component Tree

```
App.tsx
└── WealthBuilding.tsx (hub)              /wealth-building
    └── wealth/
        ├── ChapterShell.tsx              (shared light wrapper)
        ├── MarkCompleteButton.tsx        (shared)
        ├── CreditMastery.tsx             /wealth-building/credit
        │   └── tools/CreditActionPlan.tsx
        ├── InvestingIRAs.tsx             /wealth-building/investing
        │   └── tools/CompoundGrowthVisualizer.tsx
        ├── RealEstate.tsx                /wealth-building/real-estate
        │   └── tools/RealEstateAnalyzer.tsx
        ├── BusinessBuilding.tsx          /wealth-building/business
        │   └── tools/BusinessViabilityCalculator.tsx
        └── GroupEconomics.tsx            /wealth-building/group-economics
            └── tools/GroupPoolCalculator.tsx
```

### Data Layer

**`src/data/wealthChapters.ts`** — single source of truth for all 5 chapters:

```ts
export interface WealthChapter {
  id: 'credit' | 'investing' | 'real_estate' | 'business' | 'group_economics';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  gradient: string;              // e.g., 'from-emerald-500 to-amber-500'
  body: string;                  // markdown — the entire chapter content
  estimatedMinutes: number;
}

export const wealthChapters: WealthChapter[] = [ /* 5 entries */ ];
```

The `body` markdown includes:
- H2/H3 headings for sections
- Bullet lists for concepts
- Numbered lists for steps
- Inline links `[label](url)` — the markdown renderer makes them open in new tabs with `rel="noopener noreferrer"`
- Historical/contextual notes via `>` blockquotes (rendered with a gold/emerald "Black Wall Street Wisdom" style — same pattern as the existing "Did You Know?" blockquotes in `ModuleView`)

### Reused Existing Patterns

- **Markdown rendering:** `ModuleView.tsx` already renders lesson content via a markdown renderer. The same pattern applies to `chapter.body`. No new dependency.
- **View state machine:** `activeView` enum + URL sync effect, identical to existing views.
- **Lazy loading:** `lazy(() => import(...))` pattern, identical to other components.
- **PageMeta wrapper:** Each chapter uses `<PageMeta title={...} canonical={...} />`.

---

## Components

### `ChapterShell.tsx`

```tsx
interface ChapterShellProps {
  chapter: WealthChapter;
  tool: ReactNode;
}

export function ChapterShell({ chapter, tool }: ChapterShellProps) {
  const { isComplete, markComplete } = useChapterCompletion(chapter.id);
  return (
    <article>
      <BackLink to="/wealth-building" />
      <header> {/* gradient hero + icon + title + subtitle */} </header>
      <MarkdownRenderer content={chapter.body} />
      <ToolCard>{tool}</ToolCard>
      <MarkCompleteButton isComplete={isComplete} onClick={markComplete} />
    </article>
  );
}
```

Each chapter component is then trivial:
```tsx
export function CreditMastery() {
  return <ChapterShell chapter={creditChapter} tool={<CreditActionPlan />} />;
}
```

### `useChapterCompletion.ts`

```ts
export function useChapterCompletion(chapterId: string) {
  const [completed, setCompleted] = useState<Set<string>>(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem('wealth_chapters_completed') || '[]'));
    } catch { return new Set(); }
  });

  const isComplete = completed.has(chapterId);
  const markComplete = () => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(chapterId);
      localStorage.setItem('wealth_chapters_completed', JSON.stringify([...next]));
      return next;
    });
  };
  const reset = () => {
    setCompleted(new Set());
    localStorage.removeItem('wealth_chapters_completed');
  };

  return { isComplete, markComplete, completed, reset };
}
```

### `MarkCompleteButton.tsx`

A button with two states:
- Default: "Mark Complete" with check icon
- Complete: "Completed ✓" with green styling, disabled

Listens for `storage` events so completion state syncs across tabs.

---

## Hub: `WealthBuilding.tsx`

- Responsive grid (2-3 columns desktop, 1 mobile) of 5 chapter cards
- Each card: gradient, icon, title, estimated minutes, completion ring (filled if done)
- Cards sorted: incomplete first, completed last (motivates next action)
- Top stats: `<progress bar>` showing chapters completed / 5
- Bottom: live `<CompoundGrowthVisualizer compact />` with default values — the first taste of the flagship tool
- Optional: "Reset all progress" button (admin-y, bottom-right)
- a11y: each card is a `<button>` with aria-label, role="region" on the hub

---

## The 5 Tools

Each tool follows the same pattern: 4 numeric inputs → 1 calculation → 1+ result displays. All tools are pure-function math — no external state, no API calls.

### `CompoundGrowthVisualizer.tsx` (flagship)
- Inputs: starting amount, monthly contribution, annual return %, years
- Display: animated bar growing from $1 → final $ + milestone tag
- On passing $100, $1K, $10K, $100K, $1M: confetti burst + label "You'd hit $X here"
- Most polished of the 5 tools; the visual hook

### `CreditActionPlan.tsx`
- Inputs: current score, target score, monthly budget for credit-building expenses
- Output: months to reach target, suggested utilization %, recommended actions

### `RealEstateAnalyzer.tsx`
- Inputs: purchase price, rehab cost, expected monthly rent, vacancy %
- Output: cap rate, cash-on-cash return, 5-year projection chart

### `BusinessViabilityCalculator.tsx`
- Inputs: startup cost, expected monthly revenue, monthly expenses, customer acquisition cost
- Output: break-even months, 12-month P&L, projected 24-month run rate

### `GroupPoolCalculator.tsx`
- Inputs: number of members, monthly contribution, months in pool, expected return %
- Output: total pool value, per-member payout, projected growth chart

---

## Inline Action Links

Pre-vetted URL library embedded directly in chapter markdown bodies. All links:
- Open in new tab (`target="_blank"`)
- Include `rel="noopener noreferrer"`
- Visually distinct (ExternalLink icon + color-coded by type)
- a11y: aria-label includes destination description

**Chapter 1 — Credit Mastery:**
- AnnualCreditReport.com (free weekly reports)
- MyFICO (FICO score purchase)
- CFPB Dispute Portal (file credit disputes)
- IRS Identity Protection PIN
- SBA Credit Resources (for DUNS/Paydex)

**Chapter 2 — Investing & IRAs:**
- IRS Pub 590-B (IRA distribution rules)
- FINRA BrokerCheck (verify advisors)
- SEC EDGAR (fund research)
- Vanguard / Fidelity / Schwab fund screeners
- IRS Form 1040-ES (estimated tax)

**Chapter 3 — Real Estate:**
- HUD Homebuyer Counseling
- Zillow Research
- Census Bureau housing data
- BiggerPockets BRRRR calculator
- FEMA flood maps

**Chapter 4 — Business Building:**
- SBA Small Business Planner
- SCORE (free mentorship)
- BizBuySell (business acquisitions)
- USPTO trademark search
- State-specific LLC filing (e.g., Secretary of State)

**Chapter 5 — Group Economics:**
- Foundation for Black Entrepreneurship
- Official Black Wall Street (business directory)
- Buy Black app
- GoFundMe / iFundWomen (crowdfunding)
- National Association of Investment Clubs (NAIC)
- SEC investment club guide

---

## Group Economics Content

Per user decision: modern focus built on historical references.

**Historical references mentioned:**
- Marcus Garvey's UNIA (Universal Negro Improvement Association) — pooled capital for Black business
- Black Wall Street / Tulsa's Greenwood district — proof community-controlled capital works
- Rotating credit associations (susu, sou sou, tanda, hui) — West African, Caribbean, Latin American traditions

**Modern focus:**
- Investment clubs (NAIC model)
- LLC formation for investment pools
- Crowdfunding syndicates (Republic, Wefunder)
- Black-owned business directories (Official Black Wall Street, Buy Black)
- Group purchasing power (collective healthcare, business insurance rates)

**Tone:** substantive but not preachy. The historical context is presented as evidence that group economics works, not as a lecture.

### Markdown rendering approach

Reuse the existing `react-markdown` setup from `ModuleView.tsx` (already includes `remark-math` + `rehype-katex`). For the Wealth Building shell, configure `react-markdown` with a custom `components` prop to apply:
- `blockquote` → render with the "Black Wall Street Wisdom" gold/emerald style
- Links `a` → `target="_blank"`, `rel="noopener noreferrer"`, ExternalLink icon
- Headings get app-style typography (matches existing lesson content)

No new dependencies. No new renderers. Custom styling goes in `ChapterShell.tsx`.

---

## Testing

Total tests added: ~30.

**Chapter tests (per chapter, 4 tests × 5 chapters = 20):**
- Renders title from data
- Renders markdown body (snapshot)
- Tool renders without crashing
- Mark-complete toggles localStorage correctly

**Hub tests (3 tests):**
- Renders all 5 chapter titles
- Shows correct completion state based on localStorage
- Card click navigates (with `useNavigate` mock)

**Tool tests (5 tests, 1 per tool):**
- Math calculation produces correct value for canonical inputs

**App.tsx tests (3 tests):**
- New sidebar entry appears
- Navigates to wealth hub
- Navigates to a chapter

**Hook tests (3 tests):**
- Initial state reads from localStorage
- markComplete writes to localStorage
- reset clears localStorage

**Manual smoke tests:**
- Visual: click through all 5 chapters, verify markdown renders
- A11y: Tab through hub, screen-reader announces each card
- Mobile: responsive grid collapses to 1 column
- All external links open in new tab with correct rel

---

## Out of Scope

- No backend persistence
- No XP/badges/streak integration
- No multi-language support
- No print/export
- No analytics beyond the existing `capture()` call
- No quizzes/check-for-understanding per chapter
- No comments / social features
- No automated link verification (URLs are verified manually in the spec commit)

---

## Implementation Sequence

**PR 1 — Foundation (data + shared components, no App.tsx changes)**
- `src/data/wealthChapters.ts` — 5 chapter entries with markdown bodies
- `src/hooks/useChapterCompletion.ts`
- `src/components/wealth/ChapterShell.tsx`
- `src/components/wealth/MarkCompleteButton.tsx`
- Tests: snapshot chapter bodies, hook behavior, mark-complete toggle

**PR 2 — 5 tools (parallel-buildable, no App.tsx changes)**
- All 5 tools in `src/components/wealth/tools/`
- Tests: 1 math test + 1 render test per tool

**PR 3 — Wiring (chapters + App.tsx)**
- 5 chapter components (10 lines each)
- `src/components/WealthBuilding.tsx` hub
- `src/App.tsx` — 6 new view values, lazy-load, sidebar entry, route sync
- `src/App.test.tsx` — new sidebar entry + navigation tests

**PR 4 — Regression**
- Full suite run
- Coverage check
- Visual smoke test

**PR 5 — Polish**
- Verify external links
- Add `nofollow`/`ugc`/`sponsored` where appropriate
- Lighthouse pass

---

## Acceptance Criteria

- [ ] All 5 chapters accessible via sidebar entry
- [ ] Each chapter shows: title, subtitle, markdown body, tool, mark-complete button
- [ ] Hub shows 5 cards with completion state
- [ ] Compound Growth Visualizer animates and shows milestones
- [ ] All 5 tool calculations produce correct values for known inputs
- [ ] Mark-complete persists across reload (localStorage)
- [ ] All external links open in new tab with `rel="noopener noreferrer"`
- [ ] Full test suite passes (754+ existing + ~30 new)
- [ ] No TypeScript errors
- [ ] No regressions in existing modules
- [ ] a11y: keyboard-navigable, screen-reader-friendly, focus states visible
- [ ] Mobile responsive (1-column grid at <640px)
- [ ] No new dependencies added
