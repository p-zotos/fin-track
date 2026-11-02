import { type Page, type Locator, expect } from '@playwright/test'
import { categoryId } from '../../data/test-data.js'

export interface TransactionFormData {
  description?: string
  amount?:      string | number
  type?:        'income' | 'expense'
  date?:        string
  /** Category name as shown to the user, e.g. "Food". */
  category?:    string
  note?:        string
}

export type TransactionField = 'description' | 'amount' | 'date'

/** Add / edit transaction modal. Fields are located by their visible label, as a user finds them. */
export class TransactionModal {
  readonly root:         Locator
  readonly title:        Locator
  readonly description:  Locator
  readonly amount:       Locator
  readonly type:         Locator
  readonly date:         Locator
  readonly category:     Locator
  readonly note:         Locator
  readonly saveButton:   Locator
  readonly cancelButton: Locator
  readonly closeButton:  Locator

  constructor(page: Page) {
    this.root         = page.getByTestId('transaction-modal')
    this.title        = this.root.locator('.modal-title')
    this.description  = this.root.getByLabel('Description')
    this.amount       = this.root.getByLabel('Amount')
    this.type         = this.root.getByLabel('Type')
    this.date         = this.root.getByLabel('Date')
    this.category     = this.root.getByLabel('Category')
    this.note         = this.root.getByLabel('Note')
    this.saveButton   = this.root.getByTestId('btn-save-transaction')
    this.cancelButton = this.root.getByTestId('btn-cancel-modal')
    this.closeButton  = this.root.getByTestId('btn-close-modal')
  }

  fieldError(field: TransactionField): Locator {
    return this.root.getByTestId(`error-${field}`)
  }

  async fill(data: TransactionFormData): Promise<void> {
    const { description, amount, type, date, category, note } = data
    if (description !== undefined) await this.description.fill(description)
    if (amount      !== undefined) await this.amount.fill(String(amount))
    if (type        !== undefined) await this.type.selectOption(type)
    if (date        !== undefined) await this.date.fill(date)
    if (category    !== undefined) await this.category.selectOption(categoryId(category))
    if (note        !== undefined) await this.note.fill(note)
  }

  async save(): Promise<void> {
    await this.saveButton.click()
  }

  async expectClosed(): Promise<void> {
    await expect(this.root).toBeHidden()
  }

  async expectFieldError(field: TransactionField, message: string): Promise<void> {
    await expect(this.fieldError(field)).toHaveText(message)
    await expect(this.root, 'modal stays open while the form is invalid').toBeVisible()
  }
}
