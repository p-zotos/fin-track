import { test, expect } from '../../fixtures/index.js'
import { DECEMBER_2024, buildTransaction, categoryId } from '../../data/test-data.js'
import { appUrl } from '../../utils/constants.js'
import { BUGS, knownBug } from '../../utils/known-bugs.js'

/**
 * REGRESSION — Dashboard
 * Calculated figures, charts, alerts and navigation.
 */

test.describe('Dashboard', { tag: '@regression' }, () => {
  test.describe('stat cards', () => {
    test('show the correct figures for the seeded month', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await dashboardPage.expectStats(DECEMBER_2024)
    })

    test('label the reporting period', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.stat('balance')).toContainText('All time')
      await expect(dashboardPage.stat('income')).toContainText('Income · Dec')
      await expect(dashboardPage.stat('expenses')).toContainText('Expenses · Dec')
      await expect(dashboardPage.stat('net')).toContainText('Income minus expenses')
    })

    test('update after a transaction is added for the month', async ({ dashboardPage, transactionsPage }) => {
      await transactionsPage.goto()
      await transactionsPage.addTransaction({ description: 'Late December groceries', amount: 100, type: 'expense', date: '2024-12-31' })

      await dashboardPage.sidebar.navigateTo('dashboard')
      await dashboardPage.expectStats({ balance: '$9,387', income: '$6,750', expenses: '$3,899', net: '$2,851' })
    })

    test.describe('when spending exceeds income', () => {
      test.use({
        appState: {
          transactions: [
            buildTransaction({ amount: 100,  type: 'income', categoryId: categoryId('Income') }),
            buildTransaction({ amount: -600, type: 'expense' }),
          ],
        },
      })

      test('show a negative net and balance', async ({ dashboardPage }) => {
        await dashboardPage.goto()
        await dashboardPage.expectStats({ balance: '-$500', income: '$100', expenses: '$600', net: '-$500' })
      })
    })

    test.describe('with no transactions', () => {
      test.use({ appState: { transactions: [] } })

      test('show zero everywhere and no alerts', async ({ dashboardPage }) => {
        await dashboardPage.goto()
        await dashboardPage.expectStats({ balance: '$0', income: '$0', expenses: '$0', net: '$0' })
        await expect(dashboardPage.recentRows).toHaveCount(0)
        await expect(dashboardPage.budgetAlertBanner).toBeHidden()
      })
    })
  })

  test.describe('charts', () => {
    test.beforeEach(async ({ dashboardPage }) => {
      await dashboardPage.goto()
    })

    test('income vs expenses chart renders a bar per series per month', async ({ dashboardPage }) => {
      // 3 months × 2 series
      await expect(dashboardPage.chartIncomeExpenses.locator('.recharts-bar-rectangle')).toHaveCount(6)
      await expect(dashboardPage.chartIncomeExpenses.getByText('Income', { exact: true })).toBeVisible()
      await expect(dashboardPage.chartIncomeExpenses.getByText('Expenses', { exact: true })).toBeVisible()
    })

    test('spending breakdown lists December spending by category', async ({ dashboardPage }) => {
      const breakdown = dashboardPage.chartSpendingBreakdown
      await expect(breakdown.locator('.recharts-pie-sector')).toHaveCount(7)
      await expect(breakdown).toContainText('Housing$2,200')
      await expect(breakdown).toContainText('Shopping$429')
      await expect(breakdown, 'savings transfers are not spending').not.toContainText('Savings')
    })

    test.fail('tooltip names each series correctly', knownBug(BUGS.tooltipLabels), async ({ dashboardPage }) => {
      await dashboardPage.hoverIncomeExpensesChart()
      await expect(dashboardPage.chartTooltip).toContainText('Income')
      await expect(dashboardPage.chartTooltip).toContainText('Expenses')
    })
  })

  test.describe('budget alert banner', () => {
    test('names the budgets that are over their limit', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.budgetAlertBanner).toHaveText(/2 budgets exceeded this month: Food, Shopping/)
    })
  })

  test.describe('recent transactions', () => {
    test('shows the 6 most recent transactions', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.recentRows).toHaveCount(6)
      await expect(dashboardPage.recentRows.first()).toContainText('Monthly Rent')
    })

    test.fail('"View all" opens the transactions page', knownBug(BUGS.viewAllLink), async ({ dashboardPage, transactionsPage }) => {
      await dashboardPage.goto()
      await dashboardPage.viewAllLink.click()
      await expect(dashboardPage.page).toHaveURL(appUrl('transactions'))
      await transactionsPage.expectLoaded()
    })
  })

  test.describe('navigation', () => {
    test.beforeEach(async ({ dashboardPage }) => {
      await dashboardPage.goto()
    })

    test('highlights the active section', async ({ dashboardPage }) => {
      const { sidebar } = dashboardPage
      await expect(sidebar.link('dashboard')).toHaveClass(/active/)

      await sidebar.navigateTo('transactions')
      await expect(sidebar.link('transactions')).toHaveClass(/active/)
      await expect(sidebar.link('dashboard')).not.toHaveClass(/active/)
    })

    test.fail('page header shows the current page name', knownBug(BUGS.pageTitle), async ({ dashboardPage }) => {
      await expect(dashboardPage.pageTitle).toHaveText('Dashboard')
      await dashboardPage.sidebar.navigateTo('transactions')
      await expect(dashboardPage.pageTitle).toHaveText('Transactions')
      await dashboardPage.sidebar.navigateTo('budgets')
      await expect(dashboardPage.pageTitle).toHaveText('Budgets')
    })
  })
})
