import { type Page, type Locator, expect } from '@playwright/test'

type NavigableSection = 'dashboard' | 'transactions' | 'budgets'

export class DashboardPage {
  readonly page: Page

  // Page root
  readonly root: Locator

  // Stat cards
  readonly statBalance:  Locator
  readonly statIncome:   Locator
  readonly statExpenses: Locator
  readonly statNet:      Locator
  readonly statGrid:     Locator

  // Charts
  readonly chartIncomeExpenses:    Locator
  readonly chartSpendingBreakdown: Locator

  // Recent transactions
  readonly recentTransactions: Locator

  // Feature-flagged elements
  readonly budgetAlertBanner: Locator
  readonly aiInsightsPanel:   Locator

  // Sidebar
  readonly sidebar:         Locator
  readonly navDashboard:    Locator
  readonly navTransactions: Locator
  readonly navBudgets:      Locator
  readonly userChip:        Locator
  readonly logoutButton:    Locator

  constructor(page: Page) {
    this.page = page

    this.root = page.getByTestId('dashboard-page')

    this.statBalance  = page.getByTestId('stat-balance')
    this.statIncome   = page.getByTestId('stat-income')
    this.statExpenses = page.getByTestId('stat-expenses')
    this.statNet      = page.getByTestId('stat-net')
    this.statGrid     = page.getByTestId('stat-grid')

    this.chartIncomeExpenses    = page.getByTestId('chart-income-expenses')
    this.chartSpendingBreakdown = page.getByTestId('chart-spending-breakdown')

    this.recentTransactions = page.getByTestId('recent-transactions')

    this.budgetAlertBanner = page.getByTestId('budget-alert-banner')
    this.aiInsightsPanel   = page.getByTestId('ai-insights-panel')

    this.sidebar         = page.getByTestId('sidebar')
    this.navDashboard    = page.getByTestId('nav-dashboard')
    this.navTransactions = page.getByTestId('nav-transactions')
    this.navBudgets      = page.getByTestId('nav-budgets')
    this.userChip        = page.getByTestId('user-chip')
    this.logoutButton    = page.getByTestId('btn-logout')
  }

  async goto(): Promise<void> {
    await this.page.goto('dashboard/')
    await expect(this.root).toBeVisible()
  }

  async assertAllStatCardsVisible(): Promise<void> {
    await expect(this.statBalance).toBeVisible()
    await expect(this.statIncome).toBeVisible()
    await expect(this.statExpenses).toBeVisible()
    await expect(this.statNet).toBeVisible()
  }

  async assertChartsVisible(): Promise<void> {
    await expect(this.chartIncomeExpenses).toBeVisible()
    await expect(this.chartSpendingBreakdown).toBeVisible()
  }

  async assertRecentTransactionsVisible(): Promise<void> {
    await expect(this.recentTransactions).toBeVisible()
    const rows = this.page.locator('[data-testid^="txn-row-"]')
    await expect(rows.first()).toBeVisible()
  }

  async assertBudgetAlertVisible(visible = true): Promise<void> {
    if (visible) await expect(this.budgetAlertBanner).toBeVisible()
    else         await expect(this.budgetAlertBanner).not.toBeVisible()
  }

  async assertAIInsightsPanelVisible(visible = true): Promise<void> {
    if (visible) await expect(this.aiInsightsPanel).toBeVisible()
    else         await expect(this.aiInsightsPanel).not.toBeVisible()
  }

  async navigateTo(section: NavigableSection): Promise<void> {
    const links: Record<NavigableSection, Locator> = {
      dashboard:    this.navDashboard,
      transactions: this.navTransactions,
      budgets:      this.navBudgets,
    }
    await links[section].click()
    await expect(this.page).toHaveURL(new RegExp(`/${section}`))
  }

  async logout(): Promise<void> {
    await this.logoutButton.click()
    await expect(this.page).toHaveURL(/\/login/)
  }

  async getStatCardValue(card: Locator): Promise<string | null> {
    return card.locator('.card-value').textContent()
  }
}