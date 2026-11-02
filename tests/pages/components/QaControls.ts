import { type Page, type Locator, expect } from '@playwright/test'
import type { FlagName } from '../../data/test-data.js'

/** The floating "QA CONTROLS" panel: runtime feature flags and seed-data reset. */
export class QaControls {
  readonly page:        Page
  readonly toggle:      Locator
  readonly panel:       Locator
  readonly resetButton: Locator

  constructor(page: Page) {
    this.page        = page
    this.toggle      = page.getByTestId('btn-test-controls-toggle')
    this.panel       = page.getByTestId('test-controls-panel')
    this.resetButton = page.getByTestId('btn-reset-data')
  }

  flag(name: FlagName): Locator {
    return this.panel.getByTestId(`flag-${name}`)
  }

  async open(): Promise<void> {
    if (!(await this.panel.isVisible())) await this.toggle.click()
    await expect(this.panel).toBeVisible()
  }

  async close(): Promise<void> {
    if (await this.panel.isVisible()) await this.toggle.click()
    await expect(this.panel).toBeHidden()
  }

  /** Idempotent: sets the flag to the wanted state rather than blindly toggling it. */
  async setFlag(name: FlagName, enabled: boolean): Promise<void> {
    await this.open()
    const checkbox = this.flag(name)
    // The checkbox is visually hidden behind a styled switch; users click the switch (its <label>).
    if ((await checkbox.isChecked()) !== enabled) await checkbox.locator('xpath=..').click()
    await expect(checkbox).toBeChecked({ checked: enabled })
  }

  /** Resets all data and flags to the seed state. The app reloads the page afterwards. */
  async resetData(): Promise<void> {
    await this.open()
    const reload = this.page.waitForEvent('load')
    await this.resetButton.click()
    await reload
  }
}
