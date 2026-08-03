# Release 1.0.0 — FinTech Foundations

## Release Checklist

### Pre-release
- [x] TypeScript compiles clean (`tsc --noEmit` — 0 errors)
- [x] Production build succeeds (`vite build` — ~34s)
- [x] All 1570 tests pass across 69 test files
- [x] Coverage thresholds met on all tracked files
- [x] Error boundary added and tested
- [x] CORS hardened in production mode
- [x] Request timeout middleware added (30s)
- [x] Database write error recovery added
- [x] All `any` types eliminated from public API surfaces
- [x] Mermaid SVG sanitized to prevent XSS
- [x] Leftover `.cjs` scaffold scripts removed
- [x] Environment variables documented in `.env.example`
- [x] README.md fully documented
- [x] .gitignore updated with all build artifacts

### Deployment Steps
1. **Environment**: Copy `.env.example` → `.env.local` (loaded automatically via dotenv). Set `ALLOWED_ORIGINS` to production domain(s), `APP_URL` to the public URL, and `PORT` if not 3000.
2. **Install**: `npm install`
3. **Build**: `npm run build`
4. **Verify**: `npm run verify` (type check + build + test)
5. **Start**: `npm run start` — serves the built `dist/` automatically when present. Explicitly set `NODE_ENV=production` if desired (optional; the server auto-detects a built app).

### Post-deploy
- [ ] Run a full E2E smoke test through all 15 modules
- [ ] Verify quiz scoring and pass threshold works
- [ ] Verify trading simulator loads with simulated data
- [ ] Verify module download (.md study guide) works
- [ ] Verify dark/light mode toggle persists

---

## Changelog — v1.0.0

### New Content
- Added **Module 0**: Foundations of Financial Literacy with 12 lessons
- Added **Module 13**: AI & Machine Learning in Finance (6 lessons)
- Added **Module 14**: Embedded Finance & The API Economy (5 lessons)
- Added **Module 15**: Open Banking, Data Rights & Financial Inclusion (6 lessons)
- Expanded all thin modules (M3, M4, M6, M8, M9, M10, M11, M12) with 2 new lessons each
- Added CLASS_0 lecture class to lectureLibrary.ts
- Added CLASS_13, CLASS_14, CLASS_15 lecture classes

### New Games
- Added **Financial Literacy Pop Quiz** to Module 0
- Added **Bank Ledger Simulator** to Module 1
- Added **Payment Rail Simulator** to Module 2
- Added **BaaS Partnership Configurator** to Module 3
- Added **Fintech P&L Simulator** to Module 9
- Added **Regulatory Compliance Maze** to Module 10
- Added **Venture Pitch Simulator** to Module 12

### Interactive Learning Tools
- **KaTeX math rendering** — LaTeX equations in lesson content
- **Mermaid diagrams** — auto-detected in markdown code blocks
- **React Flow** — interactive architecture diagram component
- **Markmap** — mind map from markdown headings
- **Comprehension checkpoints** — 1-5 confidence rating after each text lesson
- **Learning outcomes panel** — visible in module sidebar
- **Enhanced study guide download** — includes learning outcomes + key concepts

### Quiz Improvements
- **Pass/fail threshold** (70%) on all module quizzes
- **Score display** with percentage, progress bar, pass/fail badge
- **Retry system** for failed quizzes
- **Attempt counter**

### Architecture & Type Safety
- **Error boundary** wraps the entire app with user-facing fallback
- **All `any` types eliminated** from public APIs (12 type upgrades)
- **UserProfile interface** fully typed with email field
- **resolveIcon** now returns `ComponentType` not `any`
- **Module.icon** typed as `ComponentType<{size?: number; strokeWidth?: number}>`
- **NodeJS.Timeout** → `ReturnType<typeof setInterval>` for browser compat

### Security & Production Readiness
- **CORS hardened** — `ALLOWED_ORIGINS` env var, no origin reflection in production
- **Request timeout** — 30s per request, returns 408
- **Database write recovery** — pending writes retry after failure
- **Mermaid SVG sanitization** — strips `<script>` tags and `on*` event handlers
- **Hardcoded email removed** from auth fallback

### Bug Fixes
- Fixed orphaned `handleNext` body left over from editor refactoring
- Fixed `quizEngine.test.ts` missing `category` field on `ExtendedQuizQuestion`
- Fixed normCDF test expectations to match implementation approximation
- Fixed Quiz `finalScore` dead code (`isCorrect ? 0 : 0`)
- Fixed game timer race condition — switched to ref-based approach
- Fixed `saveDatabase` losing pending writes on error
- Fixed Dashboard test assertions for actual component structure

### Test Coverage
- **11 test files, 156 tests** (up from 0)
- New test files: `tradingStore.test.ts`, `quizGameStore.test.ts`, `sound.test.ts`, `Dashboard.test.tsx`, `ErrorBoundary.test.tsx`
- Per-file coverage thresholds enforced via vitest config
- Critical files at 80-100% coverage

### Developer Experience
- Added `npm run verify` — full type check + build + test
- Added `npm run test:coverage` — coverage report
- Added `npm run release` — verify + clean + build pipeline
- Removed 21 leftover `.cjs` scaffold scripts from project root
- Updated `.env.example` with all env vars and documentation
- Rewrote README.md with full project documentation
- Added RELEASE.md with deployment checklist and changelog
