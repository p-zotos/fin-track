import { type Page, type Locator, expect } from '@playwright/test'
import { categoryId } from '../../data/test-data.js'

export interface BudgetFormData {
  name?:     string
  /** Category name as shown to the user, e.g. "Food". */
  category?: string
  period?:   'monthly' | 'weekly' | 'yearly'
  limit?:    string | number
}

export type BudgetField = 'name' | 'limit'

/**
 * Add / edit budget modal.
 * Located by data-testid: these fields have no associated <label> (BUG-008), so getByLabel can't find them.
 */
export class BudgetModal {
  readonly root:         Locator
  readonly title:        Locator
  readonly name:         Locator
  readonly category:     Locator
  readonly period:       Locator
  readonly limit:        Locator
  readonly saveButton:   Locator
  readonly cancelButton: Locator
  readonly closeButton:  Locator

  constructor(page: Page) {
    this.root         = page.getByTestId('budget-modal')
    this.title        = this.root.locator('.modal-title')
    this.name         = this.root.getByTestId('modal-input-budget-name')
    this.category     = this.root.getByTestId('modal-select-budget-category')
    this.period       = this.root.getByTestId('modal-select-budget-period')
    this.limit        = this.root.getByTestId('modal-input-budget-limit')
    this.saveButton   = this.root.getByTestId('btn-save-budget')
    this.cancelButton = this.root.getByTestId('btn-cancel-budget-modal')
    this.closeButton  = this.root.getByTestId('btn-close-budget-modal')
  }

  fieldError(field: BudgetField): Locator {
    return this.root.getByTestId(`error-budget-${field}`)
  }

  async fill(data: BudgetFormData): Promise<void> {
    const { name, category, period, limit } = data
    if (name     !== undefined) await this.name.fill(name)
    if (category !== undefined) await this.category.selectOption(categoryId(category))
    if (period   !== undefined) await this.period.selectOption(period)
    if (limit    !== undefined) await this.limit.fill(String(limit))
  }

  async save(): Promise<void> {
    await this.saveButton.click()
  }

  async expectClosed(): Promise<void> {
    await expect(this.root).toBeHidden()
  }

  async expectFieldError(field: BudgetField, message: string): Promise<void> {
    await expect(this.fieldError(field)).toHaveText(message)
    await expect(this.root, 'modal stays open while the form is invalid').toBeVisible()
  }
}
