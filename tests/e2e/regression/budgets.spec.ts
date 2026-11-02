import { test, expect } from '../../fixtures/index.js'
import { SEED, buildBudget, buildTransaction, categoryId } from '../../data/test-data.js'

/**
 * REGRESSION — Budgets
 * Spending vs limit, status thresholds, alerts, CRUD, validation.
 *
 * Seeded December 2024 spending: Housing 2,200/2,200 (100%) · Food 310/300 (103%)
 * Transport 77/150 · Entertainment 61/80 · Healthcare 47/100 · Shopping 429/200 (215%) · Utilities 175/180 (97%)
 */

const HOUSING   = 'bud-1'
const FOOD      = 'bud-2'
const TRANSPORT = 'bud-3'
const SHOPPING  = 'bud-6'
const UTILITIES = 'bud-7'

test.describe('Budgets', { tag: '@regression' }, () => {
  test.describe('list', () => {
    test.beforeEach(async ({ budgetsPage }) => {
      await budgetsPage.goto()
    })

    test('shows every seeded budget with a progress bar', async ({ budgetsPage }) => {
      await expect(budgetsPage.cards).toHaveCount(SEED.budgets)
      await expect(budgetsPage.page.locator('[data-testid^="budget-progress-"]')).toHaveCount(SEED.budgets)
      await expect(budgetsPage.root).toContainText(`${SEED.budgets} budgets set · December 2024`)
    })

    test('card shows spent vs limit and the overspend', async ({ budgetsPage }) => {
      const food = budgetsPage.card(FOOD)
      await expect(food).toContainText('$310 / $300')
      await expect(food).toContainText('Over by $10')
      await expect(food).toContainText('103% used')
    })

    test('card shows the remaining amount when under the limit', async ({ budgetsPage }) => {
      await expect(budgetsPage.card(TRANSPORT)).toContainText('$73 remaining')
      await expect(budgetsPage.status(TRANSPORT)).toBeHidden()
    })

    test('progress bar is capped at 100% when overspent', async ({ budgetsPage }) => {
      await expect(budgetsPage.card(SHOPPING)).toContainText('215% used')
      await expect(budgetsPage.progressFill(SHOPPING)).toHaveAttribute('style', /width: 100%/)
    })

    test('flags budgets that are over or near their limit', async ({ budgetsPage }) => {
      await expect(budgetsPage.status(FOOD)).toHaveText('Over budget')
      await expect(budgetsPage.status(SHOPPING)).toHaveText('Over budget')
      await expect(budgetsPage.status(HOUSING)).toHaveText('Near limit')
      await expect(budgetsPage.status(UTILITIES)).toHaveText('Near limit')
    })

    test('alert banner counts the exceeded budgets', async ({ budgetsPage }) => {
      await expect(budgetsPage.alertBanner).toContainText('2 budgets exceeded this month')
    })
  })

  // Boundary-value analysis around the 80% ("Near limit") and 100% ("Over budget") thresholds.
  test.describe('status thresholds', () => {
    const thresholds = [
      { spent: 80,  status: 'Near limit' },
      { spent: 100, status: 'Near limit' },
      { spent: 101, status: 'Over budget' },
    ]

    for (const { spent, status } of thresholds) {
      test.describe(`at ${spent}% of the limit`, () => {
        const budget = buildBudget({ categoryId: categoryId('Transport'), limit: 100 })
        test.use({ appState: { budgets: [budget], transactions: [buildTransaction({ categoryId: budget.categoryId, amount: -spent })] } })

        test(`shows "${status}"`, async ({ budgetsPage }) => {
          await budgetsPage.goto()
          await expect(budgetsPage.card(budget.id)).toContainText(`${spent}% used`)
          await expect(budgetsPage.status(budget.id)).toHaveText(status)
        })
      })
    }

    test.describe('at 79% of the limit', () => {
      const budget = buildBudget({ categoryId: categoryId('Transport'), limit: 100 })
      test.use({ appState: { budgets: [budget], transactions: [buildTransaction({ categoryId: budget.categoryId, amount: -79 })] } })

      test('shows no status badge', async ({ budgetsPage }) => {
        await budgetsPage.goto()
        await expect(budgetsPage.card(budget.id)).toContainText('79% used')
        await expect(budgetsPage.status(budget.id)).toBeHidden()
      })
    })

    test.describe('when income is recorded in the category', () => {
      const budget = buildBudget({ categoryId: categoryId('Transport'), limit: 100 })
      test.use({ appState: { budgets: [budget], transactions: [buildTransaction({ categoryId: budget.categoryId, amount: 500, type: 'income' })] } })

      test('only expenses count towards the budget', async ({ budgetsPage }) => {
        await budgetsPage.goto()
        await expect(budgetsPage.card(budget.id)).toContainText('$0 / $100')
      })
    })
  })

  test.describe('add', () => {
    test.beforeEach(async ({ budgetsPage }) => {
      await budgetsPage.goto()
      await budgetsPage.openAddModal()
    })

    test('Cancel closes the modal without saving', async ({ budgetsPage }) => {
      await budgetsPage.modal.fill({ name: 'Never saved', limit: 50 })
      await budgetsPage.modal.cancelButton.click()
      await budgetsPage.modal.expectClosed()
      await expect(budgetsPage.cards).toHaveCount(SEED.budgets)
    })

    const invalidForms = [
      { scenario: 'name is empty',     data: { limit: 100 },               field: 'name',  error: 'Name is required' },
      { scenario: 'name is blank',     data: { name: '  ', limit: 100 },   field: 'name',  error: 'Name is required' },
      { scenario: 'limit is empty',    data: { name: 'Test' },             field: 'limit', error: 'Enter a valid limit' },
      { scenario: 'limit is zero',     data: { name: 'Test', limit: 0 },   field: 'limit', error: 'Enter a valid limit' },
      { scenario: 'limit is negative', data: { name: 'Test', limit: -50 }, field: 'limit', error: 'Enter a valid limit' },
    ] as const

    for (const { scenario, data, field, error } of invalidForms) {
      test(`rejects the form when ${scenario}`, async ({ budgetsPage }) => {
        await budgetsPage.modal.fill(data)
        await budgetsPage.modal.save()
        await budgetsPage.modal.expectFieldError(field, error)
      })
    }

    test('new budget tracks existing spending in its category', async ({ budgetsPage }) => {
      await budgetsPage.modal.fill({ name: 'Fun money', category: 'Entertainment', limit: 50 })
      await budgetsPage.modal.save()
      await budgetsPage.modal.expectClosed()

      await expect(budgetsPage.cards).toHaveCount(SEED.budgets + 1)
      const card = budgetsPage.cardByName('Fun money')
      await expect(card).toContainText('$61 / $50')
      await expect(card).toContainText('Over budget')
      await expect(budgetsPage.alertBanner).toContainText('3 budgets exceeded')
    })

    test('new budget persists after a reload', async ({ budgetsPage }) => {
      await budgetsPage.modal.fill({ name: 'Persistent budget', limit: 150, period: 'weekly' })
      await budgetsPage.modal.save()
      await budgetsPage.modal.expectClosed()

      await budgetsPage.page.reload()
      await expect(budgetsPage.cardByName('Persistent budget')).toContainText('weekly')
    })
  })

  test.describe('edit', () => {
    test.beforeEach(async ({ budgetsPage }) => {
      await budgetsPage.goto()
    })

    test('modal opens pre-filled with the budget', async ({ budgetsPage }) => {
      await budgetsPage.openEdit(HOUSING)
      await expect(budgetsPage.modal.title).toHaveText('Edit budget')
      await expect(budgetsPage.modal.name).toHaveValue('Housing')
      await expect(budgetsPage.modal.limit).toHaveValue('2200')
      await expect(budgetsPage.modal.period).toHaveValue('monthly')
    })

    test('raising the limit clears the over-budget status', async ({ budgetsPage }) => {
      await budgetsPage.openEdit(FOOD)
      await budgetsPage.modal.fill({ limit: 500 })
      await budgetsPage.modal.save()
      await budgetsPage.modal.expectClosed()

      await expect(budgetsPage.card(FOOD)).toContainText('$310 / $500')
      await expect(budgetsPage.status(FOOD)).toBeHidden()
      await expect(budgetsPage.alertBanner).toContainText('1 budget exceeded')
    })
  })

  test.describe('delete', () => {
    test.beforeEach(async ({ budgetsPage }) => {
      await budgetsPage.goto()
    })

    test('asks for confirmation; Cancel keeps the budget', async ({ budgetsPage }) => {
      await budgetsPage.requestDelete(UTILITIES)
      await expect(budgetsPage.deleteDialog.root).toContainText('Delete budget?')
      await budgetsPage.deleteDialog.cancel()
      await expect(budgetsPage.card(UTILITIES)).toBeVisible()
    })

    test('confirming removes the budget', async ({ budgetsPage }) => {
      await budgetsPage.deleteBudget(UTILITIES)
      await expect(budgetsPage.card(UTILITIES)).toBeHidden()
      await expect(budgetsPage.cards).toHaveCount(SEED.budgets - 1)
    })

    test('deleting every exceeded budget removes the alert banner', async ({ budgetsPage }) => {
      await budgetsPage.deleteBudget(FOOD)
      await budgetsPage.deleteBudget(SHOPPING)
      await expect(budgetsPage.alertBanner).toBeHidden()
    })
  })

  test.describe('with no budgets', () => {
    test.use({ appState: { budgets: [] } })

    test('shows the empty state with a call to action', async ({ budgetsPage }) => {
      await budgetsPage.goto()
      await expect(budgetsPage.emptyState).toContainText('No budgets set')
      await expect(budgetsPage.alertBanner).toBeHidden()

      await budgetsPage.emptyState.getByRole('button', { name: 'Add budget' }).click()
      await expect(budgetsPage.modal.root).toBeVisible()
    })
  })
})
