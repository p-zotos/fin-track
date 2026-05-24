export interface Credentials {
  email: string
  password: string
}

export interface TransactionData {
  description: string
  amount: string
  type: 'income' | 'expense'
  note?: string
}

export interface BudgetData {
  name: string
  limit: string
  categoryId?: string
  period?: 'monthly' | 'weekly' | 'yearly'
}

export const DEMO_CREDENTIALS: Credentials = {
  email:    'alex@fintrack.demo',
  password: 'demo1234',
}

export const WRONG_CREDENTIALS: Credentials = {
  email:    'wrong@example.com',
  password: 'wrongpass',
}

export const ROUTES = {
  login:        '/login',
  dashboard:    '/dashboard',
  transactions: '/transactions',
  budgets:      '/budgets',
} as const

export const TEST_TRANSACTION: TransactionData = {
  description: 'QA Test Transaction',
  amount:      '42.50',
  type:        'expense',
  note:        'Created by automated test',
}

export const TEST_BUDGET: BudgetData = {
  name:  'QA Test Budget',
  limit: '250',
}

/** Seed transaction IDs we can rely on always being present after a reset */
export const SEED_TXN_IDS = {
  first:  'txn-001',
  income: 'txn-002',
} as const