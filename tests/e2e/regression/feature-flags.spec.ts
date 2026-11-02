import { test, expect } from '../../fixtures/index.js'
import { SEED } from '../../data/test-data.js'
import { BUGS, knownBug } from '../../utils/known-bugs.js'

/**
 * REGRESSION — Feature flags & QA controls
 *
 * Flag *behaviour* is tested by declaring the flag state up front (fast, no UI setup);
 * the QA controls panel itself is tested through the UI, the way a tester would use it.
 */

test.describe('Feature flags', { tag: '@regression' }, () => {
  test.describe('defaults', () => {
    test('budget alerts are on and AI insights are off', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.budgetAlertBanner).toBeVisible()
      await expect(dashboardPage.aiInsightsPanel).toBeHidden()
    })
  })

  test.describe('showBudgetAlerts off', () => {
    test.use({ appState: { flags: { showBudgetAlerts: false } } })

    test('hides the alert banner on the dashboard', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.budgetAlertBanner).toBeHidden()
    })

    test('hides the alert banner on the budgets page but keeps the status badges', async ({ budgetsPage }) => {
      await budgetsPage.goto()
      await expect(budgetsPage.alertBanner).toBeHidden()
      await expect(budgetsPage.status('bud-6')).toHaveText('Over budget')
    })
  })

  test.describe('showAIInsights on (unreleased feature)', () => {
    test.use({ appState: { flags: { showAIInsights: true } } })

    test('shows the AI insights panel on the dashboard', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.aiInsightsPanel).toBeVisible()
      await expect(dashboardPage.aiInsightsPanel).toContainText('AI Insights')
    })
  })
})

test.describe('QA controls panel', { tag: '@regression' }, () => {
  test('opens and closes from the floating toggle', async ({ dashboardPage }) => {
    await dashboardPage.goto()
    const { qaControls } = dashboardPage
    await expect(qaControls.panel).toBeHidden()
    await qaControls.open()
    await expect(qaControls.flag('showBudgetAlerts')).toBeChecked()
    await expect(qaControls.flag('showAIInsights')).not.toBeChecked()
    await qaControls.close()
  })

  test('toggling a flag updates the dashboard without a reload', async ({ dashboardPage }) => {
    await dashboardPage.goto()
    await dashboardPage.qaControls.setFlag('showAIInsights', true)
    await expect(dashboardPage.aiInsightsPanel).toBeVisible()
    await dashboardPage.qaControls.setFlag('showBudgetAlerts', false)
    await expect(dashboardPage.budgetAlertBanner).toBeHidden()
  })

  test.fail('toggling budget alerts updates the budgets page without a reload', knownBug(BUGS.budgetFlagLive), async ({ budgetsPage }) => {
    await budgetsPage.goto()
    await expect(budgetsPage.alertBanner).toBeVisible()
    await budgetsPage.qaControls.setFlag('showBudgetAlerts', false)
    await expect(budgetsPage.alertBanner).toBeHidden()
  })

  test('flag changes persist across reloads', async ({ dashboardPage }) => {
    await dashboardPage.goto()
    await dashboardPage.qaControls.setFlag('showAIInsights', true)
    await dashboardPage.page.reload()
    await expect(dashboardPage.aiInsightsPanel).toBeVisible()
  })

  test('"Reset to seed data" restores deleted records', async ({ transactionsPage }) => {
    await transactionsPage.goto()
    await transactionsPage.deleteTransaction('txn-001')
    await transactionsPage.expectResultsCount(SEED.transactions - 1)

    await transactionsPage.qaControls.resetData()

    await transactionsPage.expectLoaded()
    await transactionsPage.expectResultsCount(SEED.transactions)
    await expect(transactionsPage.row('txn-001')).toBeVisible()
  })

  test.fail('"Reset to seed data" discards added records and flag changes', knownBug(BUGS.resetKeepsEdits), async ({ transactionsPage }) => {
    await transactionsPage.goto()
    await transactionsPage.addTransaction({ description: 'Should be discarded', amount: 10 })
    await transactionsPage.qaControls.setFlag('showAIInsights', true)

    await transactionsPage.qaControls.resetData()

    await transactionsPage.expectLoaded()
    await expect.soft(transactionsPage.rowByDescription('Should be discarded')).toBeHidden()
    await transactionsPage.qaControls.open()
    await expect.soft(transactionsPage.qaControls.flag('showAIInsights')).not.toBeChecked()
  })
})
