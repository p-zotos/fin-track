import { test, expect } from '../../fixtures/pages.fixture.js'
import { DEMO_CREDENTIALS, WRONG_CREDENTIALS } from '../../utils/constants.js'

/**
 * SMOKE SUITE
 * Critical happy-path tests across all pages.
 * Runs on every push / PR — must complete in under 2 minutes.
 * @tags: @smoke
 */

test.describe('Authentication @smoke', () => {
  // This forces these 4 tests to start with a completely empty, unauthenticated browser cache
  test.use({ storageState: { cookies: [], origins: [] } })
  test('redirects unauthenticated user to login', async ({ page }) => {
    await page.goto('dashboard/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('logs in with valid credentials and lands on dashboard', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.login(DEMO_CREDENTIALS.email, DEMO_CREDENTIALS.password)
    await loginPage.assertRedirectedToDashboard()
  })

  test('shows error on invalid credentials', async ({ loginPage }) => {
    await loginPage.goto()
    await loginPage.login(WRONG_CREDENTIALS.email, WRONG_CREDENTIALS.password)
    await loginPage.assertError('Invalid email or password')
  })
})

test.describe('Dashboard @smoke', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.goto()
  })

  test('renders all four stat cards', async ({ dashboardPage }) => {
    await dashboardPage.assertAllStatCardsVisible()
  })

  test('renders both charts', async ({ dashboardPage }) => {
    await dashboardPage.assertChartsVisible()
  })

  test('renders recent transactions table with data', async ({ dashboardPage }) => {
    await dashboardPage.assertRecentTransactionsVisible()
  })

  test('sidebar navigation links are present', async ({ dashboardPage }) => {
    await expect(dashboardPage.sidebar).toBeVisible()
    await expect(dashboardPage.navDashboard).toBeVisible()
    await expect(dashboardPage.navTransactions).toBeVisible()
    await expect(dashboardPage.navBudgets).toBeVisible()
  })
})

test.describe('Transactions @smoke', () => {
  test.beforeEach(async ({ transactionsPage }) => {
    await transactionsPage.goto()
  })

  test('renders the transactions list', async ({ transactionsPage }) => {
    const count = await transactionsPage.getResultsCount()
    expect(count).toBeGreaterThan(0)
  })

  test('can add a new transaction', async ({ transactionsPage }) => {
    const before = await transactionsPage.getResultsCount()
    await transactionsPage.addTransaction({
      description: 'Smoke Test Transaction',
      amount: '10',
      type: 'expense',
    })
    const after = await transactionsPage.getResultsCount()
    expect(after).toBe(before + 1)
  })
})

test.describe('Budgets @smoke', () => {
  test.beforeEach(async ({ budgetsPage }) => {
    await budgetsPage.goto()
  })

  test('renders the budgets list with data', async ({ budgetsPage }) => {
    await expect(budgetsPage.budgetList).toBeVisible()
  })

  test('can add a new budget', async ({ budgetsPage }) => {
    await budgetsPage.addBudget({ name: 'Smoke Test Budget', limit: '100' })
    await expect(budgetsPage.page.getByText('Smoke Test Budget')).toBeVisible()
  })
})