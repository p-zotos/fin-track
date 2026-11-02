import { type Page, type Locator, expect } from '@playwright/test'

/** A "Delete …?" confirmation modal. */
export class ConfirmDialog {
  readonly root:          Locator
  readonly confirmButton: Locator
  readonly cancelButton:  Locator

  constructor(page: Page, rootTestId: string) {
    this.root          = page.getByTestId(rootTestId)
    this.confirmButton = this.root.getByRole('button', { name: 'Delete' })
    this.cancelButton  = this.root.getByRole('button', { name: 'Cancel' })
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click()
    await expect(this.root).toBeHidden()
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click()
    await expect(this.root).toBeHidden()
  }
}
