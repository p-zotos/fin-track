import { type Page, type Locator, expect } from '@playwright/test'

/**
 * Every routed page: a path and a root element whose visibility proves the page rendered.
 *
 * Paths are relative (no leading slash) so they resolve against the `/fin-track/` baseURL —
 * `page.goto('/login')` would escape the base path and hit a 404.
 */
export abstract class BasePage {
  readonly page: Page
  readonly root: Locator
  private readonly path: string

  constructor(page: Page, path: string, rootTestId: string) {
    this.page = page
    this.path = path
    this.root = page.getByTestId(rootTestId)
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path)
    await this.expectLoaded()
  }

  async expectLoaded(): Promise<void> {
    await expect(this.root).toBeVisible()
  }
}
