import { test as setup, expect } from '@playwright/test'
import { DEMO_CREDENTIALS } from '../utils/constants.ts'

const AUTH_FILE = 'tests/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('login/')
  await expect(page.getByTestId('login-page')).toBeVisible()

  await page.getByTestId('input-email').fill(DEMO_CREDENTIALS.email)
  await page.getByTestId('input-password').fill(DEMO_CREDENTIALS.password)
  await page.getByTestId('btn-login').click()

  // Confirm redirect — verifies auth succeeded
  await expect(page).toHaveURL(/\/dashboard/)
  await expect(page.getByTestId('dashboard-page')).toBeVisible()

  // Persist session for all downstream tests
  await page.context().storageState({ path: AUTH_FILE })
})