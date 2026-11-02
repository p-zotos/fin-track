import { CATEGORIES, DEMO_USER, FEATURE_FLAGS, SEED_BUDGETS, SEED_TRANSACTIONS } from '../../src/data/seed.js'

export type Transaction  = (typeof SEED_TRANSACTIONS)[number]
export type Budget       = (typeof SEED_BUDGETS)[number]
export type FeatureFlags = typeof FEATURE_FLAGS
export type FlagName     = keyof FeatureFlags

export interface Credentials {
  email:    string
  password: string
}

export const DEMO_CREDENTIALS: Credentials = { email: DEMO_USER.email, password: DEMO_USER.password }

export const DEMO_PROFILE = { name: DEMO_USER.name, email: DEMO_USER.email }

/** Sizes of the seed data set the app starts with. */
export const SEED = {
  transactions: SEED_TRANSACTIONS.length,
  budgets:      SEED_BUDGETS.length,
} as const

/**
 * Expected dashboard figures for the app's "current month" (December 2024),
 * calculated by hand from seed.ts — an independent oracle, not a copy of the app's logic.
 */
export const DECEMBER_2024 = {
  balance:  '$9,487',
  income:   '$6,750',
  expenses: '$3,799',
  net:      '$2,951',
} as const

export function categoryId(name: string): string {
  const category = CATEGORIES.find(c => c.name === name)
  if (!category) throw new Error(`Unknown category "${name}"`)
  return category.id
}

let sequence = 0

/** Test-data builder: a valid December 2024 expense unless overridden. */
export function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
  sequence += 1
  const amount = overrides.amount ?? -50
  return {
    id:          `txn-test-${sequence}`,
    date:        '2024-12-15',
    description: `Test transaction ${sequence}`,
    amount,
    categoryId:  categoryId('Food'),
    type:        amount < 0 ? 'expense' : 'income',
    note:        '',
    ...overrides,
  }
}

/** Test-data builder: a monthly budget, Food category, $100 limit unless overridden. */
export function buildBudget(overrides: Partial<Budget> = {}): Budget {
  sequence += 1
  return {
    id:         `bud-test-${sequence}`,
    categoryId: categoryId('Food'),
    name:       `Test budget ${sequence}`,
    limit:      100,
    period:     'monthly',
    ...overrides,
  }
}
