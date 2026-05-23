// Seed data for the QA Finance Dashboard demo app
// This is the single source of truth for all demo data.
// The TestControls panel can reset the app to this state at any time.

export const DEMO_USER = {
  id: 'user-001',
  name: 'Alex Morgan',
  email: 'alex@fintrack.demo',
  password: 'demo1234',
  avatar: 'AM',
  currency: 'USD',
  memberSince: '2022-01-15'
}

export const CATEGORIES = [
  { id: 'cat-1', name: 'Housing',       icon: '🏠', color: '#5C6BC0' },
  { id: 'cat-2', name: 'Food',          icon: '🍔', color: '#EF5350' },
  { id: 'cat-3', name: 'Transport',     icon: '🚗', color: '#26A69A' },
  { id: 'cat-4', name: 'Entertainment', icon: '🎬', color: '#AB47BC' },
  { id: 'cat-5', name: 'Healthcare',    icon: '💊', color: '#42A5F5' },
  { id: 'cat-6', name: 'Shopping',      icon: '🛍️', color: '#FF7043' },
  { id: 'cat-7', name: 'Income',        icon: '💰', color: '#66BB6A' },
  { id: 'cat-8', name: 'Utilities',     icon: '⚡', color: '#FFA726' },
  { id: 'cat-9', name: 'Savings',       icon: '🏦', color: '#78909C' },
]

export const SEED_TRANSACTIONS = [
  // --- December 2024 ---
  { id: 'txn-001', date: '2024-12-01', description: 'Monthly Rent',         amount: -2200, categoryId: 'cat-1', type: 'expense', note: '' },
  { id: 'txn-002', date: '2024-12-02', description: 'Salary Deposit',       amount: 5800,  categoryId: 'cat-7', type: 'income',  note: 'Net salary December' },
  { id: 'txn-003', date: '2024-12-03', description: 'Whole Foods Market',   amount: -134,  categoryId: 'cat-2', type: 'expense', note: '' },
  { id: 'txn-004', date: '2024-12-05', description: 'Uber Ride',            amount: -22,   categoryId: 'cat-3', type: 'expense', note: '' },
  { id: 'txn-005', date: '2024-12-07', description: 'Netflix',              amount: -18,   categoryId: 'cat-4', type: 'expense', note: 'Monthly subscription' },
  { id: 'txn-006', date: '2024-12-08', description: 'Pharmacy',             amount: -47,   categoryId: 'cat-5', type: 'expense', note: '' },
  { id: 'txn-007', date: '2024-12-10', description: 'Amazon Purchase',      amount: -89,   categoryId: 'cat-6', type: 'expense', note: 'Household items' },
  { id: 'txn-008', date: '2024-12-12', description: 'Electric Bill',        amount: -110,  categoryId: 'cat-8', type: 'expense', note: '' },
  { id: 'txn-009', date: '2024-12-14', description: 'Freelance Payment',    amount: 950,   categoryId: 'cat-7', type: 'income',  note: 'Client project' },
  { id: 'txn-010', date: '2024-12-15', description: 'Spotify',              amount: -11,   categoryId: 'cat-4', type: 'expense', note: '' },
  { id: 'txn-011', date: '2024-12-17', description: 'Grocery Store',        amount: -98,   categoryId: 'cat-2', type: 'expense', note: '' },
  { id: 'txn-012', date: '2024-12-19', description: 'Gas Station',          amount: -55,   categoryId: 'cat-3', type: 'expense', note: '' },
  { id: 'txn-013', date: '2024-12-20', description: 'Christmas Shopping',   amount: -340,  categoryId: 'cat-6', type: 'expense', note: 'Gifts' },
  { id: 'txn-014', date: '2024-12-22', description: 'Restaurant Dinner',    amount: -78,   categoryId: 'cat-2', type: 'expense', note: 'Holiday dinner' },
  { id: 'txn-015', date: '2024-12-26', description: 'Savings Transfer',     amount: -500,  categoryId: 'cat-9', type: 'expense', note: 'Emergency fund' },
  { id: 'txn-016', date: '2024-12-28', description: 'Internet Bill',        amount: -65,   categoryId: 'cat-8', type: 'expense', note: '' },
  { id: 'txn-017', date: '2024-12-30', description: 'Movie Tickets',        amount: -32,   categoryId: 'cat-4', type: 'expense', note: '' },

  // --- November 2024 ---
  { id: 'txn-018', date: '2024-11-01', description: 'Monthly Rent',         amount: -2200, categoryId: 'cat-1', type: 'expense', note: '' },
  { id: 'txn-019', date: '2024-11-02', description: 'Salary Deposit',       amount: 5800,  categoryId: 'cat-7', type: 'income',  note: 'Net salary November' },
  { id: 'txn-020', date: '2024-11-04', description: 'Grocery Store',        amount: -112,  categoryId: 'cat-2', type: 'expense', note: '' },
  { id: 'txn-021', date: '2024-11-06', description: 'Bus Pass',             amount: -90,   categoryId: 'cat-3', type: 'expense', note: 'Monthly transit' },
  { id: 'txn-022', date: '2024-11-09', description: 'Doctor Visit',         amount: -150,  categoryId: 'cat-5', type: 'expense', note: 'Copay' },
  { id: 'txn-023', date: '2024-11-11', description: 'Netflix',              amount: -18,   categoryId: 'cat-4', type: 'expense', note: '' },
  { id: 'txn-024', date: '2024-11-13', description: 'Electric Bill',        amount: -95,   categoryId: 'cat-8', type: 'expense', note: '' },
  { id: 'txn-025', date: '2024-11-15', description: 'Freelance Payment',    amount: 1200,  categoryId: 'cat-7', type: 'income',  note: 'Design project' },
  { id: 'txn-026', date: '2024-11-18', description: 'Clothing Store',       amount: -145,  categoryId: 'cat-6', type: 'expense', note: '' },
  { id: 'txn-027', date: '2024-11-20', description: 'Spotify',              amount: -11,   categoryId: 'cat-4', type: 'expense', note: '' },
  { id: 'txn-028', date: '2024-11-22', description: 'Grocery Store',        amount: -87,   categoryId: 'cat-2', type: 'expense', note: '' },
  { id: 'txn-029', date: '2024-11-25', description: 'Savings Transfer',     amount: -400,  categoryId: 'cat-9', type: 'expense', note: '' },
  { id: 'txn-030', date: '2024-11-28', description: 'Black Friday Shopping',amount: -280,  categoryId: 'cat-6', type: 'expense', note: '' },
  { id: 'txn-031', date: '2024-11-29', description: 'Internet Bill',        amount: -65,   categoryId: 'cat-8', type: 'expense', note: '' },

  // --- October 2024 ---
  { id: 'txn-032', date: '2024-10-01', description: 'Monthly Rent',         amount: -2200, categoryId: 'cat-1', type: 'expense', note: '' },
  { id: 'txn-033', date: '2024-10-02', description: 'Salary Deposit',       amount: 5800,  categoryId: 'cat-7', type: 'income',  note: 'Net salary October' },
  { id: 'txn-034', date: '2024-10-05', description: 'Grocery Store',        amount: -103,  categoryId: 'cat-2', type: 'expense', note: '' },
  { id: 'txn-035', date: '2024-10-08', description: 'Gas Station',          amount: -60,   categoryId: 'cat-3', type: 'expense', note: '' },
  { id: 'txn-036', date: '2024-10-10', description: 'Concert Tickets',      amount: -120,  categoryId: 'cat-4', type: 'expense', note: '' },
  { id: 'txn-037', date: '2024-10-12', description: 'Netflix',              amount: -18,   categoryId: 'cat-4', type: 'expense', note: '' },
  { id: 'txn-038', date: '2024-10-14', description: 'Electric Bill',        amount: -88,   categoryId: 'cat-8', type: 'expense', note: '' },
  { id: 'txn-039', date: '2024-10-16', description: 'Pharmacy',             amount: -35,   categoryId: 'cat-5', type: 'expense', note: '' },
  { id: 'txn-040', date: '2024-10-18', description: 'Freelance Payment',    amount: 750,   categoryId: 'cat-7', type: 'income',  note: 'Consulting' },
  { id: 'txn-041', date: '2024-10-20', description: 'Amazon Purchase',      amount: -67,   categoryId: 'cat-6', type: 'expense', note: '' },
  { id: 'txn-042', date: '2024-10-22', description: 'Spotify',              amount: -11,   categoryId: 'cat-4', type: 'expense', note: '' },
  { id: 'txn-043', date: '2024-10-24', description: 'Grocery Store',        amount: -94,   categoryId: 'cat-2', type: 'expense', note: '' },
  { id: 'txn-044', date: '2024-10-26', description: 'Savings Transfer',     amount: -500,  categoryId: 'cat-9', type: 'expense', note: '' },
  { id: 'txn-045', date: '2024-10-29', description: 'Internet Bill',        amount: -65,   categoryId: 'cat-8', type: 'expense', note: '' },
]

export const SEED_BUDGETS = [
  { id: 'bud-1', categoryId: 'cat-1', name: 'Housing',       limit: 2200, period: 'monthly' },
  { id: 'bud-2', categoryId: 'cat-2', name: 'Food',          limit: 300,  period: 'monthly' },
  { id: 'bud-3', categoryId: 'cat-3', name: 'Transport',     limit: 150,  period: 'monthly' },
  { id: 'bud-4', categoryId: 'cat-4', name: 'Entertainment', limit: 80,   period: 'monthly' },
  { id: 'bud-5', categoryId: 'cat-5', name: 'Healthcare',    limit: 100,  period: 'monthly' },
  { id: 'bud-6', categoryId: 'cat-6', name: 'Shopping',      limit: 200,  period: 'monthly' },
  { id: 'bud-7', categoryId: 'cat-8', name: 'Utilities',     limit: 180,  period: 'monthly' },
]

export const FEATURE_FLAGS = {
  showBudgetAlerts: true,
  showSpendingInsights: true,
  enableDarkMode: true,
  showExportButton: false,     // intentionally off — for A/B testing demos
  showAIInsights: false,       // future feature — for testing "feature not released"
}
