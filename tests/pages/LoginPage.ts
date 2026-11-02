import { type Page, type Locator, expect } from '@playwright/test'
import { BasePage } from './BasePage.js'
import type { Credentials } from '../data/test-data.js'

export class LoginPage extends BasePage {
  readonly form:          Locator
  readonly emailInput:    Locator
  readonly passwordInput: Locator
  readonly submitButton:  Locator
  readonly errorAlert:    Locator

  constructor(page: Page) {
    super(page, 'login', 'login-page')
    this.form          = page.getByTestId('login-form')
    this.emailInput    = page.getByLabel('Email address')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton  = page.getByTestId('btn-login')
    this.errorAlert    = page.getByRole('alert')
  }

  async login({ email, password }: Credentials): Promise<void> {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorAlert).toHaveText(message)
  }
}
