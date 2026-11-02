import { test, expect } from '../../fixtures/index.js'
import { STAT_CARDS } from '../../pages/DashboardPage.js'
import { DEMO_CREDENTIALS, SEED } from '../../data/test-data.js'
import { appUrl } from '../../utils/constants.js'

/**
 * SMOKE — the critical user journeys, one test each.
 * Broad and shallow: if any of these fail, the build is not worth testing further.
 */

test.describe('Critical paths', { tag: '@smoke' }, () => {
  test.describe('logged out', () => {
    test.use({ appState: { authenticated: false } })

    test('visitor is redirected from a protected page to login', async ({ page, loginPage }) => {
      await page.goto('dashboard')
      await expect(page).toHaveURL(appUrl('login'))
      await loginPage.expectLoaded()
    })

    test('user can log in and lands on the dashboard', async ({ loginPage, dashboardPage }) => {
      await loginPage.goto()
      await loginPage.login(DEMO_CREDENTIALS)
      await expect(loginPage.page).toHaveURL(appUrl('dashboard'))
      await dashboardPage.expectLoaded()
    })

    test('invalid credentials are rejected', async ({ loginPage }) => {
      await loginPage.goto()
      await loginPage.login({ email: 'wrong@example.com', password: 'wrongpass' })
      await loginPage.expectError('Invalid email or password')
      await expect(loginPage.page).toHaveURL(appUrl('login'))
    })
  })

  test('dashboard shows stats, charts and recent activity', async ({ dashboardPage }) => {
    await dashboardPage.goto()
    for (const card of STAT_CARDS) await expect(dashboardPage.stat(card)).toBeVisible()
    await expect(dashboardPage.chartIncomeExpenses).toBeVisible()
    await expect(dashboardPage.chartSpendingBreakdown).toBeVisible()
    await expect(dashboardPage.recentRows.first()).toBeVisible()
  })

  test('user can move between all sections from the sidebar', async ({ dashboardPage, transactionsPage, budgetsPage }) => {
    await dashboardPage.goto()
    await dashboardPage.sidebar.navigateTo('transactions')
    await transactionsPage.expectLoaded()
    await dashboardPage.sidebar.navigateTo('budgets')
    await budgetsPage.expectLoaded()
    await dashboardPage.sidebar.navigateTo('dashboard')
    await dashboardPage.expectLoaded()
  })

  test('user can add a transaction', async ({ transactionsPage }) => {
    await transactionsPage.goto()
    await transactionsPage.expectResultsCount(SEED.transactions)
    await transactionsPage.addTransaction({ description: 'Smoke test coffee', amount: 4.5, type: 'expense' })
    await transactionsPage.expectResultsCount(SEED.transactions + 1)
    await expect(transactionsPage.rowByDescription('Smoke test coffee')).toBeVisible()
  })

  test('user can add a budget', async ({ budgetsPage }) => {
    await budgetsPage.goto()
    await expect(budgetsPage.cards).toHaveCount(SEED.budgets)
    await budgetsPage.addBudget({ name: 'Smoke test budget', limit: 100 })
    await expect(budgetsPage.cards).toHaveCount(SEED.budgets + 1)
    await expect(budgetsPage.cardByName('Smoke test budget')).toBeVisible()
  })

  test('user can log out', async ({ dashboardPage, loginPage }) => {
    await dashboardPage.goto()
    await dashboardPage.sidebar.logout()
    await loginPage.expectLoaded()
  })
})
