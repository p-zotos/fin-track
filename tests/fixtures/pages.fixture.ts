import { test as base } from '@playwright/test'
import { LoginPage }        from '../pages/LoginPage.js'
import { DashboardPage }    from '../pages/DashboardPage.js'
import { TransactionsPage } from '../pages/TransactionsPage.js'
import { BudgetsPage }      from '../pages/BudgetsPage.js'

export interface PageFixtures {
  loginPage:        LoginPage
  dashboardPage:    DashboardPage
  transactionsPage: TransactionsPage
  budgetsPage:      BudgetsPage
}

/** Page objects, created lazily — a test only pays for the pages it asks for. */
export const test = base.extend<PageFixtures>({
  loginPage:        async ({ page }, use) => { await use(new LoginPage(page)) },
  dashboardPage:    async ({ page }, use) => { await use(new DashboardPage(page)) },
  transactionsPage: async ({ page }, use) => { await use(new TransactionsPage(page)) },
  budgetsPage:      async ({ page }, use) => { await use(new BudgetsPage(page)) },
})
