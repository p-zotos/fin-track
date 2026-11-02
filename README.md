# FinTrack — Playwright E2E test framework

[![CI](https://github.com/p-zotos/fin-track/actions/workflows/ci.yml/badge.svg)](https://github.com/p-zotos/fin-track/actions/workflows/ci.yml)
![Playwright](https://img.shields.io/badge/tested%20with-Playwright-2EAD33)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6)

An end-to-end UI test framework built with **Playwright + TypeScript** around **FinTrack**, a small finance dashboard (React + Vite) that I built as the system under test.

**Live app:** https://p-zotos.github.io/fin-track/ (demo login: `alex@fintrack.demo` / `demo1234`)
**Latest test report:** https://p-zotos.github.io/fin-track/report/
**Bugs found:** [docs/BUG_REPORTS.md](docs/BUG_REPORTS.md). The suite found 12 defects, each documented and covered by a test.

---

## At a glance

| | |
|---|---|
| **Coverage** | ~120 tests: smoke, functional regression, accessibility (WCAG 2.1 AA) |
| **Browsers** | Chromium, Firefox, WebKit, Pixel 5, iPhone 13 (~600 runs per pipeline) |
| **Design** | Page Object Model with components · custom fixtures merged with `mergeTests` |
| **Test data** | Declarative app state (`test.use({ appState })`) · builders · hand-calculated oracles |
| **Techniques** | Data-driven tests · boundary-value analysis · clock & timezone control · axe-core |
| **Quality gates** | Strict TypeScript · ESLint with `eslint-plugin-playwright` and type-aware `no-floating-promises` |
| **CI/CD** | GitHub Actions: lint → 4 parallel shards → merged HTML report → deploy app + report to Pages |

---

## Framework design

```
tests/
├── e2e/
│   ├── auth.setup.ts            # logs in once via the UI, saves the session for all projects
│   ├── smoke/                   # @smoke      critical user journeys
│   ├── regression/              # @regression auth, dashboard, transactions, budgets, feature flags
│   └── a11y/                    # @a11y       axe scans, labels, keyboard operation
├── pages/
│   ├── BasePage.ts              # path + root element + goto()/expectLoaded()
│   ├── AppShellPage.ts          # pages inside the authenticated layout (sidebar, header, QA panel)
│   ├── LoginPage.ts  DashboardPage.ts  TransactionsPage.ts  BudgetsPage.ts
│   └── components/              # Sidebar, QaControls, TransactionModal, BudgetModal, ConfirmDialog
├── fixtures/
│   ├── app-state.fixture.ts     # declarative localStorage state → storageState
│   ├── pages.fixture.ts         # page objects as fixtures
│   ├── a11y.fixture.ts          # axe checker with known-issue allow-list
│   └── index.ts                 # mergeTests(...) — the single `test` every spec imports
├── data/test-data.ts            # credentials, seed sizes, expected figures, data builders
└── utils/
    ├── constants.ts             # routes, storage keys, exact URL matcher
    └── known-bugs.ts            # bug registry used by test.fail() annotations
```

### Key decisions

**Page objects composed from components.** Pages inherit from `BasePage` / `AppShellPage`. Shared UI (sidebar, modals, confirm dialogs, QA panel) is a component reused across pages instead of duplicated. Page objects expose locators and user actions. Assertion helpers are named `expect*()` and use web-first assertions that retry automatically, with no manual waits.

**State is declared, not clicked into place.** The app keeps its data in `localStorage`. The `appState` fixture writes the state a test needs into the browser context before the first page load:

```ts
test.use({ appState: { authenticated: false } })            // logged-out visitor
test.use({ appState: { budgets: [] } })                       // empty state
test.use({ appState: { flags: { showAIInsights: true } } })   // feature flag on
test.use({ appState: { budgets: [budget], transactions: [buildTransaction({ amount: -80 })] } })
```

This makes edge cases cheap to test: empty states, negative balances, and exact threshold values. It also keeps the UI steps in a test focused on the behaviour under test.

**Isolation by default.** Every test gets a fresh browser context, so no test depends on another and the suite runs fully in parallel. Authentication runs once, in a `setup` project, through the real login UI.

**Deterministic environment.** The config pins `locale: 'en-US'` and `timezoneId: 'UTC'`. Time-sensitive behaviour is then tested deliberately: `page.clock.setFixedTime()` controls "today", and `test.use({ timezoneId: 'America/Los_Angeles' })` is how BUG-004 was found.

**Independent oracles.** Expected figures (balances, budget percentages) are calculated by hand from the seed data and written into the tests. They are not computed with a copy of the app's own logic, which would repeat its bugs.

**Locator strategy.** User-facing locators (`getByRole`, `getByLabel`) where elements have an accessible name, and `data-testid` for data-bound elements such as rows and cards. When `getByLabel` *can't* find a field, that is itself a finding (BUG-008).

### Known bugs, kept visible

Each defect has a test asserting the **correct** behaviour, declared as an expected failure and linked to its report:

```ts
test.fail('"View all" opens the transactions page', knownBug(BUGS.viewAllLink), async ({ dashboardPage }) => { … })
```

The pipeline stays green and the report lists every open bug. When a fix lands, Playwright reports *"expected to fail, but passed"*, which is the signal to remove the marker. From then on the test guards against regressions.

### Accessibility

`a11y.expectNoViolations()` runs axe-core (WCAG 2.1 A/AA) and attaches the full results to the report. Already-reported violations are passed as `knownIssues` and recorded as annotations. **Any new violation still fails the test**, so known debt doesn't hide regressions. Separate tests cover what axe can't judge: label association, keyboard-only login, Escape handling and ARIA state.

---

## Running the tests

```bash
npm install
npx playwright install

npm test                    # everything, all 5 browser projects
npm run test:chromium       # fastest local feedback
npm run test:smoke          # @smoke only
npm run test:regression     # @regression only
npm run test:a11y           # @a11y only
npm run test:known-bugs     # the tests that document open bugs
npm run test:ui             # Playwright UI mode

npm run report              # open the last HTML report
npm run report:allure       # generate + open an Allure report
npm run check               # typecheck + lint
```

Playwright starts the app automatically: the dev server locally, the production build in CI.

## CI pipeline

[`.github/workflows/ci.yml`](.github/workflows/ci.yml), on every push and pull request:

1. **Lint & typecheck:** fails fast before any browser starts.
2. **E2E:** the production build is tested in 4 parallel shards across all browser projects. Retries and traces are on in CI only.
3. **Report:** blob reports from the shards are merged into one HTML report, with traces, screenshots and videos of failures.
4. **Deploy** (`main` only, after the tests pass): the app goes to GitHub Pages with the test report at `/fin-track/report/`.

---

## The app under test

FinTrack is a deliberately testable finance dashboard. It has no backend; all state lives in `localStorage`.

| Feature | Description |
|---|---|
| Authentication | Login / logout, session persistence, protected routes |
| Dashboard | Balance and monthly stats, income vs expenses chart, spending breakdown, recent transactions |
| Transactions | Add, edit, delete, search, filter by category and type |
| Budgets | Monthly limits per category, progress bars, "Near limit" (≥ 80%) and "Over budget" (> 100%) states |
| Feature flags | Runtime toggles (budget alerts, AI insights) |
| QA controls | Floating panel (bottom-right) to toggle flags and reset to seed data |

```bash
npm run dev     # http://localhost:5173/fin-track/
```

Source: `src/`. Seed data, the single source of truth for the demo data, is in [`src/data/seed.ts`](src/data/seed.ts).
