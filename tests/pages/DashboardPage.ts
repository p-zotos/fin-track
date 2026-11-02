import { type Page, type Locator, expect } from '@playwright/test'
import { AppShellPage } from './AppShellPage.js'

export type StatCard = 'balance' | 'income' | 'expenses' | 'net'

export const STAT_CARDS: readonly StatCard[] = ['balance', 'income', 'expenses', 'net']

export class DashboardPage extends AppShellPage {
  readonly statGrid:               Locator
  readonly chartIncomeExpenses:    Locator
  readonly chartSpendingBreakdown: Locator
  readonly chartTooltip:           Locator
  readonly recentTransactions:     Locator
  readonly recentRows:             Locator
  readonly viewAllLink:            Locator
  readonly budgetAlertBanner:      Locator
  readonly aiInsightsPanel:        Locator

  constructor(page: Page) {
    super(page, 'dashboard', 'dashboard-page')
    this.statGrid               = page.getByTestId('stat-grid')
    this.chartIncomeExpenses    = page.getByTestId('chart-income-expenses')
    this.chartSpendingBreakdown = page.getByTestId('chart-spending-breakdown')
    this.chartTooltip           = this.chartIncomeExpenses.locator('.recharts-default-tooltip')
    this.recentTransactions     = page.getByTestId('recent-transactions')
    this.recentRows             = this.recentTransactions.locator('tbody tr')
    this.viewAllLink            = this.recentTransactions.getByRole('link', { name: 'View all' })
    this.budgetAlertBanner      = page.getByTestId('budget-alert-banner')
    this.aiInsightsPanel        = page.getByTestId('ai-insights-panel')
  }

  stat(card: StatCard): Locator {
    return this.page.getByTestId(`stat-${card}`)
  }

  statValue(card: StatCard): Locator {
    return this.stat(card).locator('.card-value')
  }

  /** Hovers the first bar of the Income vs Expenses chart to reveal its tooltip. */
  async hoverIncomeExpensesChart(): Promise<void> {
    await this.chartIncomeExpenses.locator('.recharts-bar-rectangle').first().hover()
    await expect(this.chartTooltip).toBeVisible()
  }

  async expectStats(expected: Partial<Record<StatCard, string>>): Promise<void> {
    for (const [card, value] of Object.entries(expected)) {
      await expect.soft(this.statValue(card as StatCard), `${card} card`).toHaveText(value)
    }
  }
}
