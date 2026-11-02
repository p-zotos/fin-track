import type { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage.js'
import { Sidebar } from './components/Sidebar.js'
import { QaControls } from './components/QaControls.js'

/** A page rendered inside the authenticated layout: sidebar, page header and QA controls. */
export abstract class AppShellPage extends BasePage {
  readonly sidebar:    Sidebar
  readonly qaControls: QaControls
  readonly pageTitle:  Locator

  constructor(page: Page, path: string, rootTestId: string) {
    super(page, path, rootTestId)
    this.sidebar    = new Sidebar(page)
    this.qaControls = new QaControls(page)
    this.pageTitle  = page.getByRole('banner').locator('.page-title')
  }
}
