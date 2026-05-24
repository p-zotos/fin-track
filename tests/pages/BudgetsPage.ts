import { type Page, type Locator, expect } from '@playwright/test'

export interface BudgetFormData {
  name?:       string
  categoryId?: string
  period?:     'monthly' | 'weekly' | 'yearly'
  limit?:      string | number
}

type BudgetValidationField = 'name' | 'limit'

export class BudgetsPage {
  readonly page: Page

  // Page root
  readonly root:        Locator
  readonly addButton:   Locator
  readonly budgetList:  Locator
  readonly emptyState:  Locator
  readonly alertBanner: Locator

  // Add/Edit modal
  readonly modal:             Locator
  readonly modalName:         Locator
  readonly modalCategory:     Locator
  readonly modalPeriod:       Locator
  readonly modalLimit:        Locator
  readonly modalSaveButton:   Locator
  readonly modalCancelButton: Locator
  readonly modalCloseButton:  Locator

  // Validation errors
  readonly errorName:  Locator
  readonly errorLimit: Locator

  // Delete confirm
  readonly deleteModal:         Locator
  readonly deleteConfirmButton: Locator
  readonly deleteCancelButton:  Locator

  constructor(page: Page) {
    this.page = page

    this.root        = page.getByTestId('budgets-page')
    this.addButton   = page.getByTestId('btn-add-budget')
    this.budgetList  = page.getByTestId('budgets-list')
    this.emptyState  = page.getByTestId('empty-state')
    this.alertBanner = page.getByTestId('budgets-alert-banner')

    this.modal             = page.getByTestId('budget-modal')
    this.modalName         = page.getByTestId('modal-input-budget-name')
    this.modalCategory     = page.getByTestId('modal-select-budget-category')
    this.modalPeriod       = page.getByTestId('modal-select-budget-period')
    this.modalLimit        = page.getByTestId('modal-input-budget-limit')
    this.modalSaveButton   = page.getByTestId('btn-save-budget')
    this.modalCancelButton = page.getByTestId('btn-cancel-budget-modal')
    this.modalCloseButton  = page.getByTestId('btn-close-budget-modal')

    this.errorName  = page.getByTestId('error-budget-name')
    this.errorLimit = page.getByTestId('error-budget-limit')

    this.deleteModal         = page.getByTestId('delete-budget-modal')
    this.deleteConfirmButton = page.getByTestId('btn-confirm-delete-budget')
    this.deleteCancelButton  = page.getByTestId('btn-cancel-delete-budget')
  }

  async goto(): Promise<void> {
    await this.page.goto('budgets/')
    await expect(this.root).toBeVisible()
  }

  async openAddModal(): Promise<void> {
    await this.addButton.click()
    await expect(this.modal).toBeVisible()
  }

  async fillBudgetForm(data: BudgetFormData): Promise<void> {
    const { name, categoryId, period, limit } = data
    if (name       !== undefined) await this.modalName.fill(name)
    if (categoryId !== undefined) await this.modalCategory.selectOption(categoryId)
    if (period     !== undefined) await this.modalPeriod.selectOption(period)
    if (limit      !== undefined) await this.modalLimit.fill(String(limit))
  }

  async saveBudget(): Promise<void> {
    await this.modalSaveButton.click()
  }

  async addBudget(data: BudgetFormData): Promise<void> {
    await this.openAddModal()
    await this.fillBudgetForm(data)
    await this.saveBudget()
    await expect(this.modal).not.toBeVisible()
  }

  async editBudget(budgetId: string): Promise<void> {
    await this.page.getByTestId(`btn-edit-budget-${budgetId}`).click()
    await expect(this.modal).toBeVisible()
  }

  async deleteBudget(budgetId: string): Promise<void> {
    await this.page.getByTestId(`btn-delete-budget-${budgetId}`).click()
    await expect(this.deleteModal).toBeVisible()
    await this.deleteConfirmButton.click()
    await expect(this.deleteModal).not.toBeVisible()
  }

  getBudgetCard(budgetId: string):     Locator { return this.page.getByTestId(`budget-card-${budgetId}`) }
  getBudgetProgress(budgetId: string): Locator { return this.page.getByTestId(`budget-progress-${budgetId}`) }
  getBudgetStatus(budgetId: string):   Locator { return this.page.getByTestId(`budget-status-${budgetId}`) }

  async assertBudgetVisible(budgetId: string): Promise<void> {
    await expect(this.getBudgetCard(budgetId)).toBeVisible()
  }

  async assertBudgetOverLimit(budgetId: string): Promise<void> {
    await expect(this.getBudgetStatus(budgetId)).toContainText('Over budget')
  }

  async assertBudgetNearLimit(budgetId: string): Promise<void> {
    await expect(this.getBudgetStatus(budgetId)).toContainText('Near limit')
  }

  async assertAlertBannerVisible(visible = true): Promise<void> {
    if (visible) await expect(this.alertBanner).toBeVisible()
    else         await expect(this.alertBanner).not.toBeVisible()
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible()
  }

  async assertValidationError(field: BudgetValidationField): Promise<void> {
    const errors: Record<BudgetValidationField, Locator> = {
      name:  this.errorName,
      limit: this.errorLimit,
    }
    await expect(errors[field]).toBeVisible()
  }
}