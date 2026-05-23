export { DEMO_USER } from './seed.js'
import { SEED_TRANSACTIONS, SEED_BUDGETS, DEMO_USER, FEATURE_FLAGS } from './seed.js'

const STORAGE_KEYS = {
  transactions: 'fintrack_transactions',
  budgets:      'fintrack_budgets',
  user:         'fintrack_user',
  auth:         'fintrack_auth',
  flags:        'fintrack_flags',
}

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Transactions ---
export function getTransactions() {
  return load(STORAGE_KEYS.transactions, SEED_TRANSACTIONS)
}

export function saveTransaction(txn) {
  const all = getTransactions()
  const idx = all.findIndex(t => t.id === txn.id)
  if (idx >= 0) all[idx] = txn
  else all.unshift(txn)
  save(STORAGE_KEYS.transactions, all)
}

export function deleteTransaction(id) {
  const all = getTransactions().filter(t => t.id !== id)
  save(STORAGE_KEYS.transactions, all)
}

// --- Budgets ---
export function getBudgets() {
  return load(STORAGE_KEYS.budgets, SEED_BUDGETS)
}

export function saveBudget(budget) {
  const all = getBudgets()
  const idx = all.findIndex(b => b.id === budget.id)
  if (idx >= 0) all[idx] = budget
  else all.push(budget)
  save(STORAGE_KEYS.budgets, all)
}

export function deleteBudget(id) {
  const all = getBudgets().filter(b => b.id !== id)
  save(STORAGE_KEYS.budgets, all)
}

// --- Auth ---
export function getSession() {
  return load(STORAGE_KEYS.auth, null)
}

export function login(email, password) {
  if (email === DEMO_USER.email && password === DEMO_USER.password) {
    save(STORAGE_KEYS.auth, { userId: DEMO_USER.id, loggedInAt: new Date().toISOString() })
    return { success: true }
  }
  return { success: false, error: 'Invalid email or password' }
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.auth)
}

// --- Feature flags ---
export function getFlags() {
  return load(STORAGE_KEYS.flags, FEATURE_FLAGS)
}

export function setFlag(key, value) {
  const flags = getFlags()
  flags[key] = value
  save(STORAGE_KEYS.flags, flags)
}

// --- Test Controls: reset everything to seed state ---
export function resetToSeedData() {
  save(STORAGE_KEYS.transactions, SEED_TRANSACTIONS)
  save(STORAGE_KEYS.budgets, SEED_BUDGETS)
  save(STORAGE_KEYS.flags, FEATURE_FLAGS)
}

// --- Computed helpers ---
export function getAccountBalance() {
  return getTransactions().reduce((sum, t) => sum + t.amount, 0)
}

export function getMonthlyStats(year, month) {
  const txns = getTransactions().filter(t => {
    const d = new Date(t.date)
    return d.getFullYear() === year && d.getMonth() + 1 === month
  })
  const income   = txns.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = txns.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0)
  return { income, expenses, net: income - expenses, transactions: txns }
}

export function getBudgetSpending(year, month) {
  const { transactions } = getMonthlyStats(year, month)
  return getBudgets().map(budget => {
    const spent = transactions
      .filter(t => t.categoryId === budget.categoryId && t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0)
    return { ...budget, spent, percent: Math.round((spent / budget.limit) * 100) }
  })
}
