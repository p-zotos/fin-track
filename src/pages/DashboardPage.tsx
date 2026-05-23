import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getTransactions, getMonthlyStats, getBudgetSpending, getAccountBalance, getFlags } from '../data/store.js'
import { CATEGORIES } from '../data/seed.js'
import { format } from 'date-fns'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const cat = (id) => CATEGORIES.find(c => c.id === id)

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function DashboardPage() {
  const now      = new Date()
  const year     = now.getFullYear()
  const month    = now.getMonth() + 1
  const [flags, setFlags] = useState(getFlags())

  useEffect(() => {
    const handler = () => setFlags(getFlags())
    window.addEventListener('fintrack:flags-changed', handler)
    return () => window.removeEventListener('fintrack:flags-changed', handler)
  }, [])

  const balance  = getAccountBalance()
  const monthly  = getMonthlyStats(2024, 12)
  const budgets  = getBudgetSpending(2024, 12)
  const recent   = getTransactions().slice(0, 6)

  // Build last-6-months chart data
  const chartData = [10,11,12].map(m => {
    const yr = m <= 12 ? 2024 : 2025
    const s  = getMonthlyStats(yr, m > 12 ? m - 12 : m)
    return { month: MONTHS[m - 1], income: s.income, expenses: s.expenses }
  })

  // Category spending pie data for current month
  const pieData = CATEGORIES
    .filter(c => c.id !== 'cat-7' && c.id !== 'cat-9')
    .map(c => {
      const spent = monthly.transactions
        .filter(t => t.categoryId === c.id && t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0)
      return { name: c.name, value: spent, color: c.color }
    })
    .filter(d => d.value > 0)

  const overBudget = budgets.filter(b => b.percent > 100)

  return (
    <div className="fade-in" data-testid="dashboard-page">

      {/* Budget alerts banner */}
      {flags.showBudgetAlerts && overBudget.length > 0 && (
        <div className="alert alert-warning mb-6" data-testid="budget-alert-banner">
          <span>⚠</span>
          <span>
            <strong>{overBudget.length} budget{overBudget.length > 1 ? 's' : ''} exceeded</strong> this month:{' '}
            {overBudget.map(b => b.name).join(', ')}
          </span>
        </div>
      )}

      {/* Stat cards */}
      <div className="stat-grid mb-6" data-testid="stat-grid">
        <div className="card card-sm" data-testid="stat-balance">
          <div className="card-label">Total balance</div>
          <div className="card-value mono" style={{ color: balance >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmt(balance)}
          </div>
          <div className="card-sub">All time</div>
        </div>
        <div className="card card-sm" data-testid="stat-income">
          <div className="card-label">Income · Dec</div>
          <div className="card-value mono" style={{ color: 'var(--green)' }}>{fmt(monthly.income)}</div>
          <div className="card-sub">This month</div>
        </div>
        <div className="card card-sm" data-testid="stat-expenses">
          <div className="card-label">Expenses · Dec</div>
          <div className="card-value mono" style={{ color: 'var(--red)' }}>{fmt(monthly.expenses)}</div>
          <div className="card-sub">This month</div>
        </div>
        <div className="card card-sm" data-testid="stat-net">
          <div className="card-label">Net · Dec</div>
          <div className="card-value mono" style={{ color: monthly.net >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {fmt(monthly.net)}
          </div>
          <div className="card-sub">Income minus expenses</div>
        </div>
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 380px' }}>
        {/* Income vs Expenses chart */}
        <div className="card" data-testid="chart-income-expenses">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="card-label">Income vs Expenses</div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>Last 3 months</div>
            </div>
            <div className="flex gap-3" style={{ fontSize: '12px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }}/>Income
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', display: 'inline-block' }}/>Expenses
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barGap={4}>
              <XAxis dataKey="month" tick={{ fill: '#9896a4', fontSize: 12 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill: '#9896a4', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`}/>
              <Tooltip
                contentStyle={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#f0efe8' }}
                formatter={(v, n) => [fmt(v), n === 'income' ? 'Income' : 'Expenses']}
              />
              <Bar dataKey="income"   fill="#69db7c" radius={[4,4,0,0]}/>
              <Bar dataKey="expenses" fill="#ff6b6b" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending pie */}
        <div className="card" data-testid="chart-spending-breakdown">
          <div className="card-label mb-4">Spending breakdown · Dec</div>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={60} dataKey="value" strokeWidth={0}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
              {pieData.map((d, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block', flexShrink: 0 }}/>
                    {d.name}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights (feature flag) */}
      {flags.showAIInsights && (
        <div className="card mb-6" data-testid="ai-insights-panel" style={{ borderColor: 'rgba(200,240,110,0.2)' }}>
          <div className="card-label" style={{ color: 'var(--accent)' }}>AI Insights</div>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: 6 }}>
            Based on your spending patterns, you could save ~$180/month by reducing Entertainment and Shopping.
          </p>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card" data-testid="recent-transactions">
        <div className="flex justify-between items-center mb-4">
          <div className="card-label" style={{ marginBottom: 0 }}>Recent transactions</div>
          <a href="/transactions" style={{ fontSize: '12px', color: 'var(--accent)' }}>View all →</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(txn => {
                const c = cat(txn.categoryId)
                return (
                  <tr key={txn.id} data-testid={`txn-row-${txn.id}`}>
                    <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                      {format(new Date(txn.date), 'MMM d')}
                    </td>
                    <td style={{ fontWeight: 500 }}>{txn.description}</td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)' }}>
                        <span>{c?.icon}</span>{c?.name}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`amount ${txn.amount > 0 ? 'positive' : 'negative'}`}>
                        {txn.amount > 0 ? '+' : ''}{fmt(txn.amount)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
