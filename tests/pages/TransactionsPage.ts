import { type Page, type Locator, expect } from '@playwright/test'
import { AppShellPage } from './AppShellPage.js'
import { TransactionModal, type TransactionFormData } from './components/TransactionModal.js'
import { ConfirmDialog } from './components/ConfirmDialog.js'
import { categoryId } from '../data/test-data.js'

export class TransactionsPage extends AppShellPage {
  readonly searchInput:    Locator
  readonly filterCategory: Locator
  readonly filterType:     Locator
  readonly addButton:      Locator
  readonly resultsCount:   Locator
  readonly rows:           Locator
  readonly emptyState:     Locator
  readonly modal:          TransactionModal
  readonly deleteDialog:   ConfirmDialog

  constructor(page: Page) {
    super(page, 'transactions', 'transactions-page')
    this.searchInput    = page.getByTestId('search-input')
    this.filterCategory = page.getByTestId('filter-category')
    this.filterType     = page.getByTestId('filter-type')
    this.addButton      = page.getByTestId('btn-add-transaction')
    this.resultsCount   = page.getByTestId('results-count')
    this.rows           = this.root.locator('tbody tr')
    this.emptyState     = page.getByTestId('empty-state')
    this.modal          = new TransactionModal(page)
    this.deleteDialog   = new ConfirmDialog(page, 'delete-confirm-modal')
  }

  row(txnId: string): Locator {
    return this.page.getByTestId(`txn-row-${txnId}`)
  }

  rowByDescription(description: string): Locator {
    return this.rows.filter({ hasText: description })
  }

  /** Amount cell of a row, e.g. "−$2,200.00". */
  rowAmount(row: Locator): Locator {
    return row.locator('.amount')
  }

  rowDate(row: Locator): Locator {
    return row.locator('td').first()
  }

  async search(text: string): Promise<void> {
    await this.searchInput.fill(text)
  }

  async filterByCategory(name: string): Promise<void> {
    // Options read e.g. "🍔 Food", so select by value rather than by visible label.
    await this.filterCategory.selectOption(categoryId(name))
  }

  async filterByType(type: 'income' | 'expense'): Promise<void> {
    await this.filterType.selectOption(type)
  }

  async openAddModal(): Promise<void> {
    await this.addButton.click()
    await expect(this.modal.root).toBeVisible()
  }

  async addTransaction(data: TransactionFormData): Promise<void> {
    await this.openAddModal()
    await this.modal.fill(data)
    await this.modal.save()
    await this.modal.expectClosed()
  }

  async openEdit(txnId: string): Promise<void> {
    await this.page.getByTestId(`btn-edit-${txnId}`).click()
    await expect(this.modal.root).toBeVisible()
  }

  async requestDelete(txnId: string): Promise<void> {
    await this.page.getByTestId(`btn-delete-${txnId}`).click()
    await expect(this.deleteDialog.root).toBeVisible()
  }

  async deleteTransaction(txnId: string): Promise<void> {
    await this.requestDelete(txnId)
    await this.deleteDialog.confirm()
  }

  /** Reads the current count once — for before/after comparisons. Prefer expectResultsCount for assertions. */
  async getResultsCount(): Promise<number> {
    const text = await this.resultsCount.innerText()
    return Number.parseInt(text, 10)
  }

  /** Web-first: retries until the "N transactions …" text shows the expected number. */
  async expectResultsCount(count: number): Promise<void> {
    await expect(this.resultsCount).toHaveText(new RegExp(`^${count} transactions? `))
  }
}
