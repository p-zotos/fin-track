import { type Page, type Locator, expect } from '@playwright/test'
import { AppShellPage } from './AppShellPage.js'
import { BudgetModal, type BudgetFormData } from './components/BudgetModal.js'
import { ConfirmDialog } from './components/ConfirmDialog.js'

export class BudgetsPage extends AppShellPage {
  readonly addButton:    Locator
  readonly budgetList:   Locator
  readonly cards:        Locator
  readonly emptyState:   Locator
  readonly alertBanner:  Locator
  readonly modal:        BudgetModal
  readonly deleteDialog: ConfirmDialog

  constructor(page: Page) {
    super(page, 'budgets', 'budgets-page')
    this.addButton    = page.getByTestId('btn-add-budget')
    this.budgetList   = page.getByTestId('budgets-list')
    this.cards        = page.locator('[data-testid^="budget-card-"]')
    this.emptyState   = page.getByTestId('empty-state')
    this.alertBanner  = page.getByTestId('budgets-alert-banner')
    this.modal        = new BudgetModal(page)
    this.deleteDialog = new ConfirmDialog(page, 'delete-budget-modal')
  }

  card(budgetId: string): Locator {
    return this.page.getByTestId(`budget-card-${budgetId}`)
  }

  cardByName(name: string): Locator {
    return this.cards.filter({ hasText: name })
  }

  /** "Over budget" / "Near limit" badge — only rendered at ≥ 80% usage. */
  status(budgetId: string): Locator {
    return this.page.getByTestId(`budget-status-${budgetId}`)
  }

  progressFill(budgetId: string): Locator {
    return this.page.getByTestId(`budget-progress-${budgetId}`).locator('.progress-bar-fill')
  }

  async openAddModal(): Promise<void> {
    await this.addButton.click()
    await expect(this.modal.root).toBeVisible()
  }

  async addBudget(data: BudgetFormData): Promise<void> {
    await this.openAddModal()
    await this.modal.fill(data)
    await this.modal.save()
    await this.modal.expectClosed()
  }

  async openEdit(budgetId: string): Promise<void> {
    await this.page.getByTestId(`btn-edit-budget-${budgetId}`).click()
    await expect(this.modal.root).toBeVisible()
  }

  async requestDelete(budgetId: string): Promise<void> {
    await this.page.getByTestId(`btn-delete-budget-${budgetId}`).click()
    await expect(this.deleteDialog.root).toBeVisible()
  }

  async deleteBudget(budgetId: string): Promise<void> {
    await this.requestDelete(budgetId)
    await this.deleteDialog.confirm()
  }
}
