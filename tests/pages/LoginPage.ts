import { type Page, type Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page:          Page
  readonly root:          Locator
  readonly form:          Locator
  readonly emailInput:    Locator
  readonly passwordInput: Locator
  readonly loginButton:   Locator
  readonly errorAlert:    Locator

  constructor(page: Page) {
    this.page          = page
    this.root          = page.getByTestId('login-page')
    this.form          = page.getByTestId('login-form')
    this.emailInput    = page.getByTestId('input-email')
    this.passwordInput = page.getByTestId('input-password')
    this.loginButton   = page.getByTestId('btn-login')
    this.errorAlert    = page.getByTestId('login-error')
  }

  async goto(): Promise<void> {
    await this.page.goto('login/')
    await expect(this.root).toBeVisible()
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }

  async assertError(message?: string): Promise<void> {
    await expect(this.errorAlert).toBeVisible()
    if (message) await expect(this.errorAlert).toContainText(message)
  }

  async assertLoginButtonDisabled(): Promise<void> {
    await expect(this.loginButton).toBeDisabled()
  }

  async assertLoginButtonEnabled(): Promise<void> {
    await expect(this.loginButton).toBeEnabled()
  }

  async assertRedirectedToDashboard(): Promise<void> {
    await expect(this.page).toHaveURL(/\/dashboard/)
  }
}