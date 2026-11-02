import { readFileSync } from 'node:fs'
import { test as base, type BrowserContextOptions } from '@playwright/test'
import { FEATURE_FLAGS } from '../../src/data/seed.js'
import { STORAGE_KEYS } from '../utils/constants.js'
import type { Budget, FeatureFlags, Transaction } from '../data/test-data.js'

/**
 * Declarative app state for a test.
 *
 * The app keeps everything in localStorage, so instead of clicking through the UI to
 * arrange a scenario, a test declares the state it needs and it is written into the
 * browser context's storageState before the first page loads:
 *
 *   test.use({ appState: { authenticated: false } })            // logged-out visitor
 *   test.use({ appState: { budgets: [] } })                       // empty state
 *   test.use({ appState: { flags: { showAIInsights: true } } })   // feature flag on
 *
 * Anything not declared falls back to the app's own seed data.
 */
export interface AppState {
  /** `false` starts logged out. Default: the project's saved session (logged in). */
  authenticated?: boolean
  transactions?:  Transaction[]
  budgets?:       Budget[]
  /** Merged over the app's default flags. */
  flags?:         Partial<FeatureFlags>
}

type StorageState = Exclude<BrowserContextOptions['storageState'], string | undefined>

export const test = base.extend<{ appState: AppState }>({
  appState: [{}, { option: true }],

  storageState: async ({ storageState, appState, baseURL }, use) => {
    const state  = loadStorageState(storageState)
    const origin = new URL(baseURL!).origin
    const local  = new Map<string, string>(
      state.origins.find(o => o.origin === origin)?.localStorage.map(({ name, value }) => [name, value]),
    )

    if (appState.authenticated === false) local.delete(STORAGE_KEYS.auth)
    if (appState.transactions) local.set(STORAGE_KEYS.transactions, JSON.stringify(appState.transactions))
    if (appState.budgets)      local.set(STORAGE_KEYS.budgets,      JSON.stringify(appState.budgets))
    if (appState.flags)        local.set(STORAGE_KEYS.flags,        JSON.stringify({ ...FEATURE_FLAGS, ...appState.flags }))

    await use({
      cookies: state.cookies,
      origins: [
        ...state.origins.filter(o => o.origin !== origin),
        { origin, localStorage: [...local].map(([name, value]) => ({ name, value })) },
      ],
    })
  },
})

function loadStorageState(value: BrowserContextOptions['storageState']): StorageState {
  if (typeof value === 'string') return JSON.parse(readFileSync(value, 'utf8')) as StorageState
  return value ?? { cookies: [], origins: [] }
}
