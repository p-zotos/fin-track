import { type Page, type Locator, expect } from '@playwright/test'

export interface TransactionFormData {
  description?: string
  amount?:      string | number
  type?:        'income' | 'expense'
  date?:        string
  note?:        string
}

type ValidationField = 'description' | 'amount' | 'date'

export class TransactionsPage {
  readonly page: Page

  // Page root & filters
  readonly root:           Locator
  readonly searchInput:    Locator
  readonly filterCategory: Locator
  readonly filterType:     Locator
  readonly addButton:      Locator
  readonly resultsCount:   Locator
  readonly emptyState:     Locator

  // Add/Edit modal
  readonly modal:             Locator
  readonly modalDescription:  Locator
  readonly modalAmount:       Locator
  readonly modalType:         Locator
  readonly modalDate:         Locator
  readonly modalCategory:     Locator
  readonly modalNote:         Locator
  readonly modalSaveButton:   Locator
  readonly modalCancelButton: Locator
  readonly modalCloseButton:  Locator

  // Validation errors
  readonly errorDescription: Locator
  readonly errorAmount:      Locator
  readonly errorDate:        Locator

  // Delete confirm modal
  readonly deleteModal:         Locator
  readonly deleteConfirmButton: Locator
  readonly deleteCancelButton:  Locator

  constructor(page: Page) {
    this.page = page

    this.root           = page.getByTestId('transactions-page')
    this.searchInput    = page.getByTestId('search-input')
    this.filterCategory = page.getByTestId('filter-category')
    this.filterType     = page.getByTestId('filter-type')
    this.addButton      = page.getByTestId('btn-add-transaction')
    this.resultsCount   = page.getByTestId('results-count')
    this.emptyState     = page.getByTestId('empty-state')

    this.modal             = page.getByTestId('transaction-modal')
    this.modalDescription  = page.getByTestId('modal-input-description')
    this.modalAmount       = page.getByTestId('modal-input-amount')
    this.modalType         = page.getByTestId('modal-select-type')
    this.modalDate         = page.getByTestId('modal-input-date')
    this.modalCategory     = page.getByTestId('modal-select-category')
    this.modalNote         = page.getByTestId('modal-input-note')
    this.modalSaveButton   = page.getByTestId('btn-save-transaction')
    this.modalCancelButton = page.getByTestId('btn-cancel-modal')
    this.modalCloseButton  = page.getByTestId('btn-close-modal')

    this.errorDescription = page.getByTestId('error-description')
    this.errorAmount      = page.getByTestId('error-amount')
    this.errorDate        = page.getByTestId('error-date')

    this.deleteModal         = page.getByTestId('delete-confirm-modal')
    this.deleteConfirmButton = page.getByTestId('btn-confirm-delete')
    this.deleteCancelButton  = page.getByTestId('btn-cancel-delete')
  }

  async goto(): Promise<void> {
    await this.page.goto('transactions/')
    await expect(this.root).toBeVisible()
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text)
    await this.page.waitForTimeout(200)
  }

  async filterByCategory(categoryName: string): Promise<void> {
    await this.filterCategory.selectOption({ label: categoryName })
  }

  async filterByType(type: 'income' | 'expense'): Promise<void> {
    await this.filterType.selectOption(type)
  }

  async clearFilters(): Promise<void> {
    await this.searchInput.clear()
    await this.filterCategory.selectOption('')
    await this.filterType.selectOption('')
  }

  async openAddModal(): Promise<void> {
    await this.addButton.click()
    await expect(this.modal).toBeVisible()
  }

  async fillTransactionForm(data: TransactionFormData): Promise<void> {
    const { description, amount, type, date, note } = data
    if (description !== undefined) await this.modalDescription.fill(description)
    if (amount      !== undefined) await this.modalAmount.fill(String(amount))
    if (type        !== undefined) await this.modalType.selectOption(type)
    if (date        !== undefined) await this.modalDate.fill(date)
    if (note        !== undefined) await this.modalNote.fill(note)
  }

  async saveTransaction(): Promise<void> {
    await this.modalSaveButton.click()
  }

  async addTransaction(data: TransactionFormData): Promise<void> {
    await this.openAddModal()
    await this.fillTransactionForm(data)
    await this.saveTransaction()
    await expect(this.modal).not.toBeVisible()
  }

  async editTransaction(txnId: string): Promise<void> {
    await this.page.getByTestId(`btn-edit-${txnId}`).click()
    await expect(this.modal).toBeVisible()
  }

  async deleteTransaction(txnId: string): Promise<void> {
    await this.page.getByTestId(`btn-delete-${txnId}`).click()
    await expect(this.deleteModal).toBeVisible()
    await this.deleteConfirmButton.click()
    await expect(this.deleteModal).not.toBeVisible()
  }

  async getResultsCount(): Promise<number> {
    const text = await this.resultsCount.textContent() ?? ''
    const match = text.match(/^(\d+)/)
    return match ? parseInt(match[1], 10) : 0
  }

  async assertTransactionVisible(txnId: string): Promise<void> {
    await expect(this.page.getByTestId(`txn-row-${txnId}`)).toBeVisible()
  }

  async assertTransactionNotVisible(txnId: string): Promise<void> {
    await expect(this.page.getByTestId(`txn-row-${txnId}`)).not.toBeVisible()
  }

  async assertEmptyState(): Promise<void> {
    await expect(this.emptyState).toBeVisible()
  }

  async assertValidationError(field: ValidationField): Promise<void> {
    const errors: Record<ValidationField, Locator> = {
      description: this.errorDescription,
      amount:      this.errorAmount,
      date:        this.errorDate,
    }
    await expect(errors[field]).toBeVisible()
  }
}