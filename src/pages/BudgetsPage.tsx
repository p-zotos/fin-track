import { useState } from 'react'
import { getBudgetSpending, saveBudget, deleteBudget, getFlags } from '../data/store.js'
import { CATEGORIES } from '../data/seed.js'

const fmt = (n: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const uid = (): string => 'bud-' + Date.now()
const cat = (id: string) => CATEGORIES.find(c => c.id === id)

type BudgetForm = { name: string; categoryId: string; limit: string | number; period: string }
type BudgetErrors = { name?: string; limit?: string }
type BudgetModalMode = 'add' | 'edit' | null

const EMPTY: BudgetForm = { name: '', categoryId: 'cat-2', limit: '', period: 'monthly' }

export default function BudgetsPage() {
  const flags   = getFlags()
  const [budgets, setBudgets] = useState(() => getBudgetSpending(2024, 12))
  const [modal,   setModal]   = useState<BudgetModalMode>(null)
  const [editing, setEditing] = useState<ReturnType<typeof getBudgetSpending>[number] | null>(null)
  const [form,    setForm]    = useState<BudgetForm>(EMPTY)
  const [errors,  setErrors]  = useState<BudgetErrors>({})
  const [deleteCf,setDeleteCf]= useState<string | null>(null)

  const refresh = () => setBudgets(getBudgetSpending(2024, 12))
  const f = (k: keyof BudgetForm, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  const openAdd = () => { setForm(EMPTY); setErrors({}); setEditing(null); setModal('add') }
  const openEdit = (b: ReturnType<typeof getBudgetSpending>[number]) => {
    setForm({ name: b.name, categoryId: b.categoryId, limit: b.limit, period: b.period })
    setErrors({}); setEditing(b); setModal('edit')
  }

  const validate = (): BudgetErrors => {
    const e: BudgetErrors = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.limit || isNaN(parseFloat(String(form.limit))) || parseFloat(String(form.limit)) <= 0) e.limit = 'Enter a valid limit'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    saveBudget({ ...form, limit: parseFloat(String(form.limit)), id: editing?.id || uid() })
    refresh(); setModal(null)
  }

  const handleDelete = (id: string) => { deleteBudget(id); refresh(); setDeleteCf(null) }

  const overBudget = budgets.filter(b => b.percent > 100)

  const barColor = (pct: number): string => {
    if (pct >= 100) return 'var(--red)'
    if (pct >= 80)  return 'var(--amber)'
    return 'var(--green)'
  }

  return (
    <div className="fade-in" data-testid="budgets-page">
      {/* Alert banner */}
      {flags.showBudgetAlerts && overBudget.length > 0 && (
        <div className="alert alert-warning mb-6" data-testid="budgets-alert-banner">
          <span>⚠</span>
          <span>
            <strong>{overBudget.length} budget{overBudget.length > 1 ? 's' : ''} exceeded</strong> this month.
            Review your spending below.
          </span>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} set · December 2024
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd} data-testid="btn-add-budget">
          + Add budget
        </button>
      </div>

      {/* Budget cards */}
      {budgets.length === 0 ? (
        <div className="empty-state" data-testid="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No budgets set</h3>
          <p>Create your first budget to start tracking spending against limits.</p>
          <button className="btn btn-primary mt-4" onClick={openAdd}>Add budget</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} data-testid="budgets-list">
          {budgets.map(b => {
            const c   = cat(b.categoryId)
            const pct = Math.min(b.percent, 100)
            const over = b.percent > 100
            const warn = b.percent >= 80 && !over
            return (
              <div key={b.id} className="card" data-testid={`budget-card-${b.id}`}
                style={{ borderColor: over ? 'rgba(255,107,107,0.25)' : warn ? 'rgba(255,212,59,0.2)' : 'var(--border)' }}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 22 }}>{c?.icon}</span>
                    <div>
                      <div style={{ fontWeight: 500 }}>{b.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>{b.period}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                        <span style={{ color: barColor(b.percent), fontWeight: 500 }}>{fmt(b.spent)}</span>
                        <span style={{ color: 'var(--text-3)' }}> / {fmt(b.limit)}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 2 }}>
                        {over
                          ? <span style={{ color: 'var(--red)' }}>Over by {fmt(b.spent - b.limit)}</span>
                          : <span>{fmt(b.limit - b.spent)} remaining</span>
                        }
                      </div>
                    </div>
                    {(over || warn) && (
                      <span className={`badge ${over ? 'badge-expense' : 'badge-warning'}`} data-testid={`budget-status-${b.id}`}>
                        {over ? 'Over budget' : 'Near limit'}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button className="btn btn-sm" onClick={() => openEdit(b)} data-testid={`btn-edit-budget-${b.id}`}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => setDeleteCf(b.id)} data-testid={`btn-delete-budget-${b.id}`}>Del</button>
                    </div>
                  </div>
                </div>
                <div className="progress-bar" data-testid={`budget-progress-${b.id}`}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor(b.percent) }}/>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 4, textAlign: 'right' }}>
                  {b.percent}% used
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" data-testid="budget-modal">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? 'Add budget' : 'Edit budget'}</div>
              <button className="btn btn-sm btn-icon" onClick={() => setModal(null)} data-testid="btn-close-budget-modal">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field">
                <label>Budget name *</label>
                <input type="text" value={form.name} onChange={e => f('name', e.target.value)}
                  className={errors.name ? 'error' : ''} data-testid="modal-input-budget-name" placeholder="e.g. Groceries"/>
                {errors.name && <span className="field-error" data-testid="error-budget-name">{errors.name}</span>}
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Category</label>
                  <select value={form.categoryId} onChange={e => f('categoryId', e.target.value)} data-testid="modal-select-budget-category">
                    {CATEGORIES.filter(c => c.id !== 'cat-7').map(c =>
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    )}
                  </select>
                </div>
                <div className="field">
                  <label>Period</label>
                  <select value={form.period} onChange={e => f('period', e.target.value)} data-testid="modal-select-budget-period">
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Spending limit ($) *</label>
                <input type="number" min="1" step="1" value={form.limit} onChange={e => f('limit', e.target.value)}
                  className={errors.limit ? 'error' : ''} data-testid="modal-input-budget-limit" placeholder="0"/>
                {errors.limit && <span className="field-error" data-testid="error-budget-limit">{errors.limit}</span>}
              </div>
              <div className="flex gap-3 justify-between mt-2">
                <button className="btn" onClick={() => setModal(null)} data-testid="btn-cancel-budget-modal">Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} data-testid="btn-save-budget">
                  {modal === 'add' ? 'Add budget' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteCf && (
        <div className="modal-overlay" data-testid="delete-budget-modal">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header"><div className="modal-title">Delete budget?</div></div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-2)', marginBottom: '22px' }}>This cannot be undone.</p>
            <div className="flex gap-3 justify-between">
              <button className="btn" onClick={() => setDeleteCf(null)} data-testid="btn-cancel-delete-budget">Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteCf)} data-testid="btn-confirm-delete-budget">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
