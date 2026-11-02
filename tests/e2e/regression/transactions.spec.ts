import { test, expect } from '../../fixtures/index.js'
import { SEED } from '../../data/test-data.js'
import { BUGS, knownBug } from '../../utils/known-bugs.js'

/**
 * REGRESSION — Transactions
 * Listing, search & filters, CRUD, validation, persistence.
 */

const RENT   = 'txn-001'   // Dec 1, 2024 · Monthly Rent · −2,200 · Housing
const SALARY = 'txn-002'   // Dec 2, 2024 · Salary Deposit · +5,800 · Income

test.describe('Transactions', { tag: '@regression' }, () => {
  test.describe('list', () => {
    test.beforeEach(async ({ transactionsPage }) => {
      await transactionsPage.goto()
    })

    test('shows every seeded transaction', async ({ transactionsPage }) => {
      await transactionsPage.expectResultsCount(SEED.transactions)
      await expect(transactionsPage.resultsCount).toHaveText(`${SEED.transactions} transactions total`)
      await expect(transactionsPage.rows).toHaveCount(SEED.transactions)
    })

    test('row shows date, description, category and type', async ({ transactionsPage }) => {
      const row = transactionsPage.row(RENT)
      await expect(transactionsPage.rowDate(row)).toHaveText('Dec 1, 2024')
      await expect(row).toContainText('Monthly Rent')
      await expect(row).toContainText('Housing')
      await expect(row.locator('.badge')).toHaveText('expense')
    })

    test('income is styled positive and expenses negative', async ({ transactionsPage }) => {
      await expect(transactionsPage.rowAmount(transactionsPage.row(SALARY))).toHaveClass(/positive/)
      await expect(transactionsPage.rowAmount(transactionsPage.row(RENT))).toHaveClass(/negative/)
    })

    test.fail('amounts are formatted as signed currency', knownBug(BUGS.doubleDollar), async ({ transactionsPage }) => {
      await expect(transactionsPage.rowAmount(transactionsPage.row(SALARY))).toHaveText('+$5,800.00')
      await expect(transactionsPage.rowAmount(transactionsPage.row(RENT))).toHaveText('−$2,200.00')
    })
  })

  test.describe('for a user west of UTC', () => {
    test.use({ timezoneId: 'America/Los_Angeles' })

    test.fail('dates show the calendar day they were recorded on', knownBug(BUGS.timezoneDates), async ({ transactionsPage }) => {
      await transactionsPage.goto()
      await expect(transactionsPage.rowDate(transactionsPage.row(RENT))).toHaveText('Dec 1, 2024')
    })
  })

  test.describe('search and filters', () => {
    test.beforeEach(async ({ transactionsPage }) => {
      await transactionsPage.goto()
    })

    for (const query of ['netflix', 'NETFLIX', 'NetFl']) {
      test(`search "${query}" matches descriptions case-insensitively`, async ({ transactionsPage }) => {
        await transactionsPage.search(query)
        await transactionsPage.expectResultsCount(3)
        await expect(transactionsPage.rows).toHaveCount(3)
        for (const row of await transactionsPage.rows.all()) await expect(row).toContainText('Netflix')
      })
    }

    test('search with no match shows the empty state', async ({ transactionsPage }) => {
      await transactionsPage.search('xyznotfound123')
      await expect(transactionsPage.emptyState).toBeVisible()
      await expect(transactionsPage.emptyState).toContainText('No transactions found')
      await transactionsPage.expectResultsCount(0)
    })

    test('clearing the search restores the full list', async ({ transactionsPage }) => {
      await transactionsPage.search('rent')
      await expect(transactionsPage.resultsCount).toContainText('matching filters')
      await transactionsPage.search('')
      await expect(transactionsPage.resultsCount).toHaveText(`${SEED.transactions} transactions total`)
    })

    const typeFilters = [
      { type: 'income',  count: 6,  otherBadge: '.badge-expense' },
      { type: 'expense', count: 39, otherBadge: '.badge-income' },
    ] as const

    for (const { type, count, otherBadge } of typeFilters) {
      test(`type filter "${type}" shows only ${type} transactions`, async ({ transactionsPage }) => {
        await transactionsPage.filterByType(type)
        await transactionsPage.expectResultsCount(count)
        await expect(transactionsPage.root.locator(otherBadge)).toHaveCount(0)
      })
    }

    test('category filter shows only that category', async ({ transactionsPage }) => {
      await transactionsPage.filterByCategory('Food')
      await transactionsPage.expectResultsCount(7)
      for (const row of await transactionsPage.rows.all()) await expect(row).toContainText('Food')
    })

    test('search and filters combine', async ({ transactionsPage }) => {
      await transactionsPage.search('payment')
      await transactionsPage.filterByType('income')
      await transactionsPage.expectResultsCount(3)
      await transactionsPage.filterByCategory('Food')
      await transactionsPage.expectResultsCount(0)
    })
  })

  test.describe('add', () => {
    test.beforeEach(async ({ transactionsPage }) => {
      await transactionsPage.goto()
      await transactionsPage.openAddModal()
    })

    test('modal opens empty with sensible defaults', async ({ transactionsPage }) => {
      const { modal } = transactionsPage
      await expect(modal.title).toHaveText('Add transaction')
      await expect(modal.description).toHaveValue('')
      await expect(modal.amount).toHaveValue('')
      await expect(modal.type).toHaveValue('expense')
    })

    test('Cancel closes the modal without saving', async ({ transactionsPage }) => {
      await transactionsPage.modal.fill({ description: 'Never saved', amount: 10 })
      await transactionsPage.modal.cancelButton.click()
      await transactionsPage.modal.expectClosed()
      await transactionsPage.expectResultsCount(SEED.transactions)
    })

    test('✕ closes the modal', async ({ transactionsPage }) => {
      await transactionsPage.modal.closeButton.click()
      await transactionsPage.modal.expectClosed()
    })

    const invalidForms = [
      { scenario: 'description is empty',  data: { amount: 50 },                                  field: 'description', error: 'Description is required' },
      { scenario: 'description is blank',  data: { description: '   ', amount: 50 },              field: 'description', error: 'Description is required' },
      { scenario: 'amount is empty',       data: { description: 'Test' },                         field: 'amount',      error: 'Enter a valid positive amount' },
      { scenario: 'amount is zero',        data: { description: 'Test', amount: 0 },              field: 'amount',      error: 'Enter a valid positive amount' },
      { scenario: 'amount is negative',    data: { description: 'Test', amount: -10 },            field: 'amount',      error: 'Enter a valid positive amount' },
      { scenario: 'date is cleared',       data: { description: 'Test', amount: 10, date: '' },   field: 'date',        error: 'Date is required' },
    ] as const

    for (const { scenario, data, field, error } of invalidForms) {
      test(`rejects the form when ${scenario}`, async ({ transactionsPage }) => {
        await transactionsPage.modal.fill(data)
        await transactionsPage.modal.save()
        await transactionsPage.modal.expectFieldError(field, error)
      })
    }

    test('adds an expense to the top of the list as a negative amount', async ({ transactionsPage }) => {
      await transactionsPage.modal.fill({ description: 'QA expense', amount: '42.50', type: 'expense', category: 'Transport', note: 'Created by automated test' })
      await transactionsPage.modal.save()
      await transactionsPage.modal.expectClosed()

      await transactionsPage.expectResultsCount(SEED.transactions + 1)
      const row = transactionsPage.rows.first()
      await expect(row).toContainText('QA expense')
      await expect(row).toContainText('Created by automated test')
      await expect(row).toContainText('Transport')
      await expect(transactionsPage.rowAmount(row)).toHaveClass(/negative/)
      await expect(transactionsPage.rowAmount(row)).toContainText('42.50')
    })

    test('adds an income as a positive amount', async ({ transactionsPage }) => {
      await transactionsPage.modal.fill({ description: 'QA income', amount: 500, type: 'income', category: 'Income' })
      await transactionsPage.modal.save()

      const row = transactionsPage.rowByDescription('QA income')
      await expect(transactionsPage.rowAmount(row)).toHaveClass(/positive/)
      await expect(row.locator('.badge')).toHaveText('income')
    })

    test('new transaction persists after a reload', async ({ transactionsPage }) => {
      await transactionsPage.modal.fill({ description: 'Persistence check', amount: 99 })
      await transactionsPage.modal.save()
      await transactionsPage.modal.expectClosed()

      await transactionsPage.page.reload()
      await expect(transactionsPage.rowByDescription('Persistence check')).toBeVisible()
      await transactionsPage.expectResultsCount(SEED.transactions + 1)
    })
  })

  test.describe('add — date defaults', () => {
    test('date defaults to today', async ({ page, transactionsPage }) => {
      await page.clock.setFixedTime(new Date('2025-03-15T10:00:00Z'))
      await transactionsPage.goto()
      await transactionsPage.openAddModal()
      await expect(transactionsPage.modal.date).toHaveValue('2025-03-15')
    })
  })

  test.describe('edit', () => {
    test.beforeEach(async ({ transactionsPage }) => {
      await transactionsPage.goto()
    })

    test('modal opens pre-filled with the transaction', async ({ transactionsPage }) => {
      await transactionsPage.openEdit(RENT)
      const { modal } = transactionsPage
      await expect(modal.title).toHaveText('Edit transaction')
      await expect(modal.description).toHaveValue('Monthly Rent')
      await expect(modal.amount, 'amount is shown unsigned').toHaveValue('2200')
      await expect(modal.type).toHaveValue('expense')
      await expect(modal.date).toHaveValue('2024-12-01')
    })

    test('saves an edited description in place', async ({ transactionsPage }) => {
      await transactionsPage.openEdit('txn-010')
      await transactionsPage.modal.fill({ description: 'Spotify Premium Family' })
      await transactionsPage.modal.save()
      await transactionsPage.modal.expectClosed()

      await expect(transactionsPage.row('txn-010')).toContainText('Spotify Premium Family')
      await transactionsPage.expectResultsCount(SEED.transactions)
    })

    test('changing the type flips the sign of the amount', async ({ transactionsPage }) => {
      await transactionsPage.openEdit(RENT)
      await transactionsPage.modal.fill({ type: 'income' })
      await transactionsPage.modal.save()

      await expect(transactionsPage.rowAmount(transactionsPage.row(RENT))).toHaveClass(/positive/)
      await expect(transactionsPage.row(RENT).locator('.badge')).toHaveText('income')
    })
  })

  test.describe('delete', () => {
    test.beforeEach(async ({ transactionsPage }) => {
      await transactionsPage.goto()
    })

    test('asks for confirmation; Cancel keeps the transaction', async ({ transactionsPage }) => {
      await transactionsPage.requestDelete(RENT)
      await expect(transactionsPage.deleteDialog.root).toContainText('Delete transaction?')
      await transactionsPage.deleteDialog.cancel()
      await expect(transactionsPage.row(RENT)).toBeVisible()
    })

    test('confirming removes the transaction, also after a reload', async ({ transactionsPage }) => {
      await transactionsPage.deleteTransaction('txn-017')
      await expect(transactionsPage.row('txn-017')).toBeHidden()
      await transactionsPage.expectResultsCount(SEED.transactions - 1)

      await transactionsPage.page.reload()
      await expect(transactionsPage.row('txn-017')).toBeHidden()
    })
  })

  test.describe('with no transactions at all', () => {
    test.use({ appState: { transactions: [] } })

    test('shows the empty state with a call to action', async ({ transactionsPage }) => {
      await transactionsPage.goto()
      await transactionsPage.expectResultsCount(0)
      await expect(transactionsPage.emptyState).toBeVisible()

      await transactionsPage.emptyState.getByRole('button', { name: 'Add transaction' }).click()
      await expect(transactionsPage.modal.root).toBeVisible()
    })
  })
})
