import { test, expect } from '../../fixtures/index.js'
import { DEMO_CREDENTIALS, DEMO_PROFILE } from '../../data/test-data.js'
import { appUrl, type AppRoute } from '../../utils/constants.js'

/**
 * REGRESSION — Authentication
 * Login validation, protected routes, session lifecycle.
 */

test.describe('Authentication', { tag: '@regression' }, () => {
  test.describe('login form validation', () => {
    test.use({ appState: { authenticated: false } })

    test.beforeEach(async ({ loginPage }) => {
      await loginPage.goto()
    })

    const invalidLogins = [
      { scenario: 'both fields are empty',        email: '',                       password: '',              error: 'Email is required' },
      { scenario: 'email is empty',               email: '',                       password: 'demo1234',      error: 'Email is required' },
      { scenario: 'password is empty',            email: DEMO_CREDENTIALS.email,   password: '',              error: 'Password is required' },
      { scenario: 'password is wrong',            email: DEMO_CREDENTIALS.email,   password: 'wrongpassword', error: 'Invalid email or password' },
      { scenario: 'email is not registered',      email: 'notauser@example.com',   password: 'demo1234',      error: 'Invalid email or password' },
    ]

    for (const { scenario, email, password, error } of invalidLogins) {
      test(`shows "${error}" when ${scenario}`, async ({ loginPage }) => {
        await loginPage.login({ email, password })
        await loginPage.expectError(error)
        await expect(loginPage.page).toHaveURL(appUrl('login'))
      })
    }

    test('error message follows the current validation state', async ({ loginPage }) => {
      await loginPage.submitButton.click()
      await loginPage.expectError('Email is required')

      await loginPage.emailInput.fill(DEMO_CREDENTIALS.email)
      await loginPage.submitButton.click()
      await loginPage.expectError('Password is required')
    })

    test('submit button shows a disabled loading state while signing in', async ({ loginPage }) => {
      await loginPage.login(DEMO_CREDENTIALS)
      await expect(loginPage.submitButton).toHaveText('Signing in…')
      await expect(loginPage.submitButton).toBeDisabled()
      await expect(loginPage.page).toHaveURL(appUrl('dashboard'))
    })
  })

  test.describe('protected routes', () => {
    test.use({ appState: { authenticated: false } })

    const protectedRoutes: AppRoute[] = ['dashboard', 'transactions', 'budgets']

    for (const route of protectedRoutes) {
      test(`redirects a visitor from /${route} to /login`, async ({ page }) => {
        await page.goto(route)
        await expect(page).toHaveURL(appUrl('login'))
      })
    }

    test('redirects a visitor from the app root to /login', async ({ page }) => {
      await page.goto('')
      await expect(page).toHaveURL(appUrl('login'))
    })

    test('redirects an unknown route to /login', async ({ page }) => {
      await page.goto('does-not-exist')
      await expect(page).toHaveURL(appUrl('login'))
    })
  })

  test.describe('session', () => {
    test('a logged-in user visiting /login is sent to the dashboard', async ({ page, dashboardPage }) => {
      await page.goto('login')
      await expect(page).toHaveURL(appUrl('dashboard'))
      await dashboardPage.expectLoaded()
    })

    test('session survives a page reload', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await dashboardPage.page.reload()
      await dashboardPage.expectLoaded()
      await expect(dashboardPage.page).toHaveURL(appUrl('dashboard'))
    })

    test('sidebar shows the signed-in user', async ({ dashboardPage }) => {
      await dashboardPage.goto()
      await expect(dashboardPage.sidebar.userChip).toContainText(DEMO_PROFILE.name)
      await expect(dashboardPage.sidebar.userChip).toContainText(DEMO_PROFILE.email)
    })

    test('after logout, protected pages are no longer reachable', async ({ page, dashboardPage, loginPage }) => {
      await dashboardPage.goto()
      await dashboardPage.sidebar.logout()

      await page.goBack()
      await expect(page, 'browser Back must not reveal the dashboard').toHaveURL(appUrl('login'))

      await page.goto('transactions')
      await expect(page).toHaveURL(appUrl('login'))
      await loginPage.expectLoaded()
    })
  })
})
