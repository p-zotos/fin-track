import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Reset the app to seed data via the QA Controls panel.
 * Use this in beforeEach when a test needs a clean, known state.
 */
export async function resetSeedData(page: Page): Promise<void> {
  const toggle = page.getByTestId('btn-test-controls-toggle')
  await toggle.click()
  await expect(page.getByTestId('test-controls-panel')).toBeVisible()

  await page.getByTestId('btn-reset-data').click()
  await page.waitForURL(/\/(dashboard|transactions|budgets)/)
  await page.waitForLoadState('networkidle')
}

/**
 * Toggle a feature flag via the QA Controls panel.
 * Returns the new state (true = on).
 */
export async function toggleFlag(page: Page, flagKey: string): Promise<boolean> {
  const toggle = page.getByTestId('btn-test-controls-toggle')
  await toggle.click()
  await expect(page.getByTestId('test-controls-panel')).toBeVisible()

  const checkbox = page.getByTestId(`flag-${flagKey}`)
  const wasBefore = await checkbox.isChecked()
  await checkbox.click()
  await expect(checkbox).toBeChecked({ checked: !wasBefore })

  // Close the panel
  await toggle.click()
  return !wasBefore
}

/**
 * Format a number as USD — matches the app's display format.
 */
export function fmtUSD(amount: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: fractionDigits,
  }).format(amount)
}

/**
 * Wait for the page transition animation to settle.
 */
export async function waitForPageTransition(page: Page): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(300)
}

/**
 * Assert that a locator is visible and inside the viewport.
 */
export async function assertVisible(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible()
  await expect(locator).toBeInViewport()
}