import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import playwright from 'eslint-plugin-playwright'

// Lints the test framework. The app under test (src/) is deliberately out of scope.
export default defineConfig([
  { ignores: ['dist/', 'src/', 'playwright-report/', 'test-results/', 'blob-report/', 'allure-results/', 'allure-report/'] },

  {
    files: ['tests/**/*.ts', 'playwright.config.ts'],
    extends: [tseslint.configs.recommended],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      // A missing `await` is the most common cause of flaky Playwright tests.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable':       'error',
    },
  },

  {
    files: ['tests/**/*.ts'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Page-object helpers named expect*() count as assertions.
      'playwright/expect-expect':               ['error', { assertFunctionPatterns: ['^expect[A-Z]', '\\.expect[A-Z]\\w*$'] }],
      'playwright/no-wait-for-timeout':         'error',
      'playwright/no-networkidle':              'error',
      'playwright/no-force-option':             'error',
      'playwright/no-conditional-in-test':      'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-useless-not':              'error',
    },
  },
])
