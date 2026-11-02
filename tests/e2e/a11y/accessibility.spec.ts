import { test, expect } from '../../fixtures/index.js'
import { DEMO_CREDENTIALS } from '../../data/test-data.js'
import { appUrl } from '../../utils/constants.js'
import { BUGS, knownBug } from '../../utils/known-bugs.js'

/**
 * ACCESSIBILITY — WCAG 2.1 AA
 *
 * Automated: axe-core scan of every page and modal. Critical/serious violations fail the test,
 * except those already reported (passed as `knownIssues`) — so any *new* violation still fails.
 * Manual-style: labels, keyboard operation and ARIA state that axe cannot judge on its own.
 */

const SHELL_ISSUES = { 'color-contrast': BUGS.colorContrast }

test.describe('Accessibility', { tag: '@a11y' }, () => {
  test.describe('axe scan', () => {
    test.describe('logged out', () => {
      test.use({ appState: { authenticated: false } })

      test('login page', async ({ loginPage, a11y }) => {
        await loginPage.goto()
        await a11y.expectNoViolations({ knownIssues: SHELL_ISSUES })
      })

      test('login page with a validation error', async ({ loginPage, a11y }) => {
        await loginPage.goto()
        await loginPage.submitButton.click()
        await loginPage.expectError('Email is required')
        await a11y.expectNoViolations({ knownIssues: SHELL_ISSUES })
      })
    })

    test('dashboard', async ({ dashboardPage, a11y }) => {
      await dashboardPage.goto()
      await a11y.expectNoViolations({
        knownIssues: {
          ...SHELL_ISSUES,
          'svg-img-alt':                BUGS.chartTextAlt,
          'scrollable-region-focusable': BUGS.mobileTableKeys,   // mobile viewports only
        },
      })
    })

    test('transactions page', async ({ transactionsPage, a11y }) => {
      await transactionsPage.goto()
      await a11y.expectNoViolations({ knownIssues: { ...SHELL_ISSUES, 'select-name': BUGS.unlabelledFields } })
    })

    test('transaction modal', async ({ transactionsPage, a11y }) => {
      await transactionsPage.goto()
      await transactionsPage.openAddModal()
      await a11y.expectNoViolations({ include: '[data-testid="transaction-modal"]', knownIssues: SHELL_ISSUES })
    })

    test('budgets page', async ({ budgetsPage, a11y }) => {
      await budgetsPage.goto()
      await a11y.expectNoViolations({ knownIssues: SHELL_ISSUES })
    })

    test('budget modal', async ({ budgetsPage, a11y }) => {
      await budgetsPage.goto()
      await budgetsPage.openAddModal()
      await a11y.expectNoViolations({ include: '[data-testid="budget-modal"]', knownIssues: { ...SHELL_ISSUES, 'select-name': BUGS.unlabelledFields } })
    })
  })

  test.describe('labels', () => {
    test('transaction form fields are labelled', async ({ transactionsPage }) => {
      await transactionsPage.goto()
      await transactionsPage.openAddModal()
      const { modal } = transactionsPage
      for (const field of [modal.description, modal.amount, modal.type, modal.date, modal.category, modal.note]) {
        await expect(field).toBeVisible()
      }
    })

    test.fail('budget form fields are labelled', knownBug(BUGS.unlabelledFields), async ({ budgetsPage }) => {
      await budgetsPage.goto()
      await budgetsPage.openAddModal()
      await expect(budgetsPage.modal.root.getByLabel('Budget name')).toBeVisible()
      await expect(budgetsPage.modal.root.getByLabel('Spending limit')).toBeVisible()
    })

    test('QA controls toggle has an accessible name and expanded state', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      const toggle = dashboardPage.page.getByRole('button', { name: 'Toggle QA test controls' })
      await expect(toggle).toHaveAttribute('aria-expanded', 'false')
      await toggle.click()
      await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    })
  })

  test.describe('keyboard', () => {
    test.describe('logged out', () => {
      test.use({ appState: { authenticated: false } })

      test('user can log in with the keyboard only', async ({ page, loginPage }) => {
        await loginPage.goto()
        await page.keyboard.press('Tab')
        await expect(loginPage.emailInput).toBeFocused()
        await page.keyboard.type(DEMO_CREDENTIALS.email)
        await page.keyboard.press('Tab')
        await expect(loginPage.passwordInput).toBeFocused()
        await page.keyboard.type(DEMO_CREDENTIALS.password)
        await page.keyboard.press('Enter')
        await expect(page).toHaveURL(appUrl('dashboard'))
      })

      test('validation errors are announced to screen readers', async ({ loginPage }) => {
        await loginPage.goto()
        await loginPage.submitButton.click()
        await expect(loginPage.page.getByRole('alert')).toHaveText('Email is required')
      })
    })

    test('sidebar links can be activated with Enter', async ({ page, dashboardPage, transactionsPage }) => {
      await dashboardPage.goto()
      await dashboardPage.sidebar.link('transactions').focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(appUrl('transactions'))
      await transactionsPage.expectLoaded()
    })

    test.fail('Escape closes the transaction modal', knownBug(BUGS.modalSemantics), async ({ page, transactionsPage }) => {
      await transactionsPage.goto()
      await transactionsPage.openAddModal()
      await page.keyboard.press('Escape')
      await transactionsPage.modal.expectClosed()
    })

    test.fail('modals are exposed as dialogs', knownBug(BUGS.modalSemantics), async ({ page, transactionsPage }) => {
      await transactionsPage.goto()
      await transactionsPage.openAddModal()
      await expect(page.getByRole('dialog', { name: 'Add transaction' })).toBeVisible()
    })
  })
})
