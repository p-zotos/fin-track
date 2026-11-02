/** Saved session for the logged-in demo user, written once by auth.setup.ts. */
export const AUTH_FILE = 'tests/.auth/user.json'

/** The app is served under a sub-path (GitHub Pages). */
export const APP_BASE_PATH = '/fin-track/'

/** localStorage keys the app persists its state under (mirrors src/data/store.ts). */
export const STORAGE_KEYS = {
  transactions: 'fintrack_transactions',
  budgets:      'fintrack_budgets',
  auth:         'fintrack_auth',
  flags:        'fintrack_flags',
} as const

export type AppRoute = 'login' | 'dashboard' | 'transactions' | 'budgets'

/**
 * Exact URL matcher for an app route, including the base path.
 * A loose `/\/transactions/` would also match `localhost:5173/transactions` (a 404 outside the base path).
 */
export const appUrl = (route: AppRoute): RegExp => new RegExp(`${APP_BASE_PATH}${route}/?$`)
