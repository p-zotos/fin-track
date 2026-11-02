import { defineConfig, devices } from '@playwright/test'
import { AUTH_FILE } from './tests/utils/constants.js'

const isCI     = !!process.env['CI']
const PORT     = 5173
const BASE_URL = `http://localhost:${PORT}/fin-track/`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // CI: each shard writes a blob report; the workflow merges them into one HTML report.
  reporter: isCI
    ? [['blob'], ['github'], ['list']]
    : [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['allure-playwright', { resultsDir: 'allure-results' }],
        ['list'],
      ],

  use: {
    baseURL: BASE_URL,
    // Deterministic environment: dates and currency render the same on every machine.
    // Timezone-sensitive behaviour is tested explicitly with test.use({ timezoneId }).
    locale:     'en-US',
    timezoneId: 'UTC',
    trace:      'on-first-retry',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },

  projects: [
    // Logs in once through the UI; every other project reuses the saved session.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    // CI tests the production build — the artefact that gets deployed. Locally, the dev server.
    command: isCI
      ? `npm run preview -- --port ${PORT} --strictPort`
      : `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
})
