import { test as base } from '@playwright/test'
import { LoginPage }        from '../pages/LoginPage.js'
import { DashboardPage }    from '../pages/DashboardPage.js'
import { TransactionsPage } from '../pages/TransactionsPage.js'
import { BudgetsPage }      from '../pages/BudgetsPage.js'

/**
 * Extended test fixture.
 * Import `test` and `expect` from this file in every spec
 * instead of directly from @playwright/test.
 *
 * Usage:
 *   import { test, expect } from '../../fixtures/pages.fixture.js'
 *
 *   test('my test', async ({ dashboardPage }) => { ... })
 */

interface PageFixtures {
  loginPage:        LoginPage
  dashboardPage:    DashboardPage
  transactionsPage: TransactionsPage
  budgetsPage:      BudgetsPage
}

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
  transactionsPage: async ({ page }, use) => {
    await use(new TransactionsPage(page))
  },
  budgetsPage: async ({ page }, use) => {
    await use(new BudgetsPage(page))
  },
})

export { expect } from '@playwright/test'