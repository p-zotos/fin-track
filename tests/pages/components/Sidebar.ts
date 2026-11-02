import { type Page, type Locator, expect } from '@playwright/test'
import { appUrl } from '../../utils/constants.js'

export type Section = 'dashboard' | 'transactions' | 'budgets'

const LABELS: Record<Section, string> = {
  dashboard:    'Dashboard',
  transactions: 'Transactions',
  budgets:      'Budgets',
}

export class Sidebar {
  readonly page:         Page
  readonly root:         Locator
  readonly nav:          Locator
  readonly userChip:     Locator
  readonly logoutButton: Locator

  constructor(page: Page) {
    this.page         = page
    this.root         = page.getByTestId('sidebar')
    this.nav          = page.getByTestId('sidebar-nav')
    this.userChip     = page.getByTestId('user-chip')
    this.logoutButton = page.getByTestId('btn-logout')
  }

  link(section: Section): Locator {
    return this.nav.getByRole('link', { name: LABELS[section], exact: true })
  }

  async navigateTo(section: Section): Promise<void> {
    await this.link(section).click()
    await expect(this.page).toHaveURL(appUrl(section))
  }

  async logout(): Promise<void> {
    await this.logoutButton.click()
    await expect(this.page).toHaveURL(appUrl('login'))
  }
}
