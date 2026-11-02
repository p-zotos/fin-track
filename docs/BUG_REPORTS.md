# Bug reports

Defects found in FinTrack by the automated suite. Each one has a test written against the **expected** behaviour, declared with `test.fail(...)` and tagged `@known-bug`:

- the suite stays green while the bug exists, and the HTML report links each test to its bug ID;
- when a bug is fixed, its test starts passing, Playwright flags it as *"expected to fail, but passed"*, and the marker is removed. The test then guards against regressions.

Registry: [`tests/utils/known-bugs.ts`](../tests/utils/known-bugs.ts) · Run them: `npm run test:known-bugs`

| ID | Severity | Summary | Area |
|---|---|---|---|
| [BUG-001](#bug-001) | Low | Page header always shows "FinTrack" instead of the page name | Layout |
| [BUG-002](#bug-002) | High | Dashboard "View all" link leads to a 404 page | Navigation |
| [BUG-003](#bug-003) | Medium | Transaction amounts render with a double dollar sign | Transactions |
| [BUG-004](#bug-004) | High | Dates shift back one day for users west of UTC | Data |
| [BUG-005](#bug-005) | Medium | Chart tooltip labels both series as "Income" | Dashboard |
| [BUG-006](#bug-006) | Medium | Modals have no dialog role and ignore Escape | Accessibility |
| [BUG-007](#bug-007) | Medium | Secondary text fails WCAG AA colour contrast | Accessibility |
| [BUG-008](#bug-008) | Medium | Form controls without a programmatic label | Accessibility |
| [BUG-009](#bug-009) | Low | Chart graphics have no text alternative | Accessibility |
| [BUG-010](#bug-010) | Low | Budget alerts flag does not apply live on the Budgets page | Feature flags |
| [BUG-011](#bug-011) | High | "Reset to seed data" keeps added records and changed flags | QA controls |
| [BUG-012](#bug-012) | Medium | On mobile, the recent transactions table scrolls but can't be reached by keyboard | Accessibility |

Environment for all reports: `main` branch, Vite dev server and production build, Chromium / Firefox / WebKit, desktop and mobile viewports.

---

<a id="bug-001"></a>
## BUG-001 — Page header always shows "FinTrack"

**Severity:** Low · **Test:** `dashboard.spec.ts › page header shows the current page name`

**Steps**
1. Log in and open the Dashboard.
2. Use the sidebar to open Transactions, then Budgets.

**Expected:** The header reads "Dashboard", "Transactions" or "Budgets".
**Actual:** The header always reads "FinTrack".

**Root cause:** `PageTitle` ([src/App.tsx:44](../src/App.tsx#L44)) looks up `window.location.pathname` in a map keyed by `/dashboard` etc., but the real path includes the router basename (`/fin-track/dashboard`), so no key ever matches. It also reads `window.location`, so it would not re-render on client-side navigation anyway. Use `useLocation()` from React Router.

---

<a id="bug-002"></a>
## BUG-002 — "View all" link leads to a 404

**Severity:** High: a dead end on the main page · **Test:** `dashboard.spec.ts › "View all" opens the transactions page`

**Steps**
1. Open the Dashboard.
2. Click **View all →** in *Recent transactions*.

**Expected:** The Transactions page opens at `/fin-track/transactions`.
**Actual:** The browser goes to `/transactions`, outside the app's base path. Locally Vite shows *"did you mean /fin-track/transactions?"*; on GitHub Pages it's a 404.

**Root cause:** A raw `<a href="/transactions">` ([src/pages/DashboardPage.tsx:163](../src/pages/DashboardPage.tsx#L163)) bypasses the router `basename`. Use `<Link to="/transactions">`.

**Note:** The original test asserted `toHaveURL(/\/transactions/)`, which also matches the broken URL, so it passed. The test now matches the exact route (`appUrl()` in `tests/utils/constants.ts`) and checks that the page actually rendered.

---

<a id="bug-003"></a>
## BUG-003 — Double dollar sign in transaction amounts

**Severity:** Medium: incorrect financial display · **Test:** `transactions.spec.ts › amounts are formatted as signed currency`

**Steps:** Open Transactions and look at any amount.

**Expected:** `−$2,200.00`, `+$5,800.00`
**Actual:** `−$$2,200.00`, `+$$5,800.00`

**Root cause:** [src/pages/TransactionsPage.tsx:151](../src/pages/TransactionsPage.tsx#L151) renders a literal `$` before `fmt()`, which already formats as USD currency.

---

<a id="bug-004"></a>
## BUG-004 — Dates shift back one day west of UTC

**Severity:** High: wrong dates and wrong monthly totals for all users in the Americas · **Test:** `transactions.spec.ts › for a user west of UTC › dates show the calendar day they were recorded on`

**Steps**
1. Set the browser/OS timezone to `America/Los_Angeles`.
2. Open Transactions and find "Monthly Rent" (recorded on 2024-12-01).

**Expected:** `Dec 1, 2024`
**Actual:** `Nov 30, 2024`. The same parsing decides which month a transaction belongs to, so the dashboard's December totals and budget spending also change.

**Root cause:** `new Date('2024-12-01')` parses a date-only ISO string as **UTC midnight**, which is the previous evening in negative-offset timezones ([store.ts:103](../src/data/store.ts#L103), [TransactionsPage.tsx:135](../src/pages/TransactionsPage.tsx#L135), [DashboardPage.tsx:181](../src/pages/DashboardPage.tsx#L181)). Use `parseISO` from date-fns, which parses as local time.

**How it was found:** The suite pins `timezoneId: 'UTC'` for deterministic results and overrides it for this scenario with `test.use({ timezoneId: 'America/Los_Angeles' })`.

---

<a id="bug-005"></a>
## BUG-005 — Tooltip labels both series as "Income"

**Severity:** Medium: misleading figures · **Test:** `dashboard.spec.ts › tooltip names each series correctly`

**Steps:** Hover any bar in the *Income vs Expenses* chart.

**Expected:** `Income : $6,550` and `Expenses : $3,361`
**Actual:** `Income : $6,550` and `Income : $3,361`

**Root cause:** The tooltip formatter ([DashboardPage.tsx:115](../src/pages/DashboardPage.tsx#L115)) picks the label with `typeof v === 'number'`, which is true for both series. Use the series `name` argument the formatter receives.

---

<a id="bug-006"></a>
## BUG-006 — Modals have no dialog semantics and ignore Escape

**Severity:** Medium: WCAG 2.1.1 Keyboard, 4.1.2 Name, Role, Value · **Tests:** `accessibility.spec.ts › Escape closes the transaction modal`, `› modals are exposed as dialogs`

**Steps:** Open *Add transaction* and press <kbd>Esc</kbd>. Inspect the modal with a screen reader.

**Expected:** Escape closes the modal. The modal is announced as a dialog named "Add transaction", and focus stays inside it.
**Actual:** Escape does nothing. The modal is a plain `<div>` with no `role="dialog"`, `aria-modal` or `aria-labelledby` ([TransactionsPage.tsx:171](../src/pages/TransactionsPage.tsx#L171), [BudgetsPage.tsx:145](../src/pages/BudgetsPage.tsx#L145) and both delete confirmations).

---

<a id="bug-007"></a>
## BUG-007 — Colour contrast below WCAG AA

**Severity:** Medium: WCAG 1.4.3 Contrast (Minimum) · **Detected by:** axe `color-contrast` on every page

**Expected:** Text has at least 4.5:1 contrast with its background.
**Actual:** Tertiary text (`--text-3: #5c5a67` on the dark background, [global.css:13](../src/styles/global.css#L13)) is used for the sidebar section label, table headers, the results count, notes and budget captions, and falls below 4.5:1.

---

<a id="bug-008"></a>
## BUG-008 — Form controls without a programmatic label

**Severity:** Medium: WCAG 1.3.1 Info and Relationships, 4.1.2 · **Detected by:** axe `select-name`, plus `accessibility.spec.ts › budget form fields are labelled`

**Expected:** Every input and select has an associated label, so screen readers announce it and `getByLabel()` finds it.
**Actual:**
- The category and type filters on Transactions have no label ([TransactionsPage.tsx:87-91](../src/pages/TransactionsPage.tsx#L87-L91)).
- In the budget modal, `<label>` elements have no `htmlFor` and the controls have no `id` ([BudgetsPage.tsx:153-177](../src/pages/BudgetsPage.tsx#L153-L177)). The text inputs only get a name from their placeholder.

---

<a id="bug-009"></a>
## BUG-009 — Charts have no text alternative

**Severity:** Low: WCAG 1.1.1 Non-text Content · **Detected by:** axe `svg-img-alt` on the dashboard

**Expected:** Chart graphics expose an accessible name or summary.
**Actual:** Each sector of the *Spending breakdown* pie is rendered by Recharts as `<path role="img">` with no accessible name (7 nodes). Screen readers announce seven unlabelled images.

---

<a id="bug-010"></a>
## BUG-010 — Budget alerts flag does not apply live on Budgets

**Severity:** Low: inconsistent behaviour · **Test:** `feature-flags.spec.ts › toggling budget alerts updates the budgets page without a reload`

**Steps:** On Budgets, open **QA CONTROLS** and switch off *Budget alerts*.

**Expected:** The banner disappears, as it does on the Dashboard.
**Actual:** The banner stays until the page is reloaded.

**Root cause:** The Dashboard listens for the `fintrack:flags-changed` event; the Budgets page reads `getFlags()` once per render and never subscribes ([BudgetsPage.tsx:16](../src/pages/BudgetsPage.tsx#L16)).

---

<a id="bug-011"></a>
## BUG-011 — "Reset to seed data" keeps added records and changed flags

**Severity:** High: the QA reset control can't be trusted to restore a known state · **Test:** `feature-flags.spec.ts › "Reset to seed data" discards added records and flag changes`

**Steps** (fresh browser profile)
1. Add a transaction.
2. In **QA CONTROLS**, switch on *AI insights*.
3. Click **Reset to seed data**.

**Expected:** 45 seed transactions, default flags.
**Actual:** The added transaction is still listed and *AI insights* is still on. Deleted records *are* restored, which hides the bug in a quick manual check.

**Root cause:** When storage is empty, `load()` returns the seed object itself ([store.ts:15](../src/data/store.ts#L15)), not a copy. `saveTransaction` (`unshift`, [line 34](../src/data/store.ts#L34)), `saveBudget` (`push`, [line 52](../src/data/store.ts#L52)) and `setFlag` ([line 85](../src/data/store.ts#L85)) then change the in-memory seed, and `resetToSeedData()` saves those changed objects. Deleting uses `filter()`, which returns a new array, so deletions are not affected. Fix: return `structuredClone(fallback)` from `load()`.

**How it was found:** The first version of the reset test changed a flag and deleted a record in one test. Only the flag assertion failed. Splitting the test isolated the pattern: records that are *added* stick around, and records that are *removed* come back.

---

<a id="bug-012"></a>
## BUG-012 — Mobile: transactions table scrolls but can't be reached by keyboard

**Severity:** Medium: WCAG 2.1.1 Keyboard · **Detected by:** axe `scrollable-region-focusable`, dashboard scan, mobile projects only (Pixel 5, iPhone 13)

**Steps**
1. Open the Dashboard at a phone-sized viewport (~390px wide).
2. Try to reach the hidden columns of *Recent transactions* with the keyboard.

**Expected:** The layout adapts to narrow screens; any region that has to scroll can be focused (`tabindex="0"`) so keyboard users can scroll it.
**Actual:** The app has no responsive styles (no `@media` rules in `global.css`). The fixed sidebar leaves too little room, so the table overflows its `.table-wrap` container horizontally. That container holds no focusable elements, so keyboard users can't scroll it. The Transactions table isn't affected because its rows contain buttons.

**How it was found:** The dashboard axe scan passed on all three desktop browsers and failed on both mobile projects. The a11y fixture lets only *already reported* violations through, so a violation that appears in one environment still fails the test.
