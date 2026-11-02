/**
 * Registry of defects found in the app under test.
 *
 * Each bug has a test written against the *expected* behaviour and declared with
 * `test.fail(title, knownBug(BUGS.x), body)`. The suite stays green while the bug exists,
 * and turns red the moment the bug is fixed — prompting the marker to be removed.
 *
 * Full reports (steps, expected vs actual, root cause): docs/BUG_REPORTS.md
 */

export interface KnownBug {
  id:       string
  summary:  string
  severity: 'High' | 'Medium' | 'Low'
}

export const BUGS = {
  pageTitle:        { id: 'BUG-001', severity: 'Low',    summary: 'Page header always shows "FinTrack" instead of the page name' },
  viewAllLink:      { id: 'BUG-002', severity: 'High',   summary: 'Dashboard "View all" link leads to a 404 page' },
  doubleDollar:     { id: 'BUG-003', severity: 'Medium', summary: 'Transaction amounts render with a double dollar sign ("−$$2,200.00")' },
  timezoneDates:    { id: 'BUG-004', severity: 'High',   summary: 'Dates shift back one day for users west of UTC' },
  tooltipLabels:    { id: 'BUG-005', severity: 'Medium', summary: 'Income vs Expenses tooltip labels both series as "Income"' },
  modalSemantics:   { id: 'BUG-006', severity: 'Medium', summary: 'Modals have no dialog role and cannot be closed with Escape' },
  colorContrast:    { id: 'BUG-007', severity: 'Medium', summary: 'Secondary text fails WCAG AA colour contrast' },
  unlabelledFields: { id: 'BUG-008', severity: 'Medium', summary: 'Form controls without a programmatic label' },
  chartTextAlt:     { id: 'BUG-009', severity: 'Low',    summary: 'Chart graphics have no text alternative' },
  budgetFlagLive:   { id: 'BUG-010', severity: 'Low',    summary: 'Budget alerts flag does not apply live on the Budgets page' },
  resetKeepsEdits:  { id: 'BUG-011', severity: 'High',   summary: '"Reset to seed data" keeps added records and changed flags' },
  mobileTableKeys:  { id: 'BUG-012', severity: 'Medium', summary: 'On mobile, the recent transactions table scrolls but cannot be reached by keyboard' },
} as const satisfies Record<string, KnownBug>

/** Test details for a test that documents a known bug: tagged and linked in the HTML report. */
export const knownBug = (bug: KnownBug) => ({
  tag:        '@known-bug',
  annotation: { type: 'issue', description: `${bug.id} (${bug.severity}): ${bug.summary} — see docs/BUG_REPORTS.md` },
})
