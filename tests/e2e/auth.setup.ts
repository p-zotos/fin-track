import { test as setup, expect } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage.js'
import { DEMO_CREDENTIALS } from '../data/test-data.js'
import { AUTH_FILE, appUrl } from '../utils/constants.js'

/**
 * Logs in once through the real UI and saves the session.
 * Every browser project reuses it via `storageState`, so specs start already authenticated.
 */
setup('authenticate as the demo user', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(DEMO_CREDENTIALS)

  await expect(page).toHaveURL(appUrl('dashboard'))
  await expect(page.getByTestId('dashboard-page')).toBeVisible()

  await page.context().storageState({ path: AUTH_FILE })
})
