import { useState, useMemo } from 'react'
import { getTransactions, saveTransaction, deleteTransaction } from '../data/store.js'
import { CATEGORIES, SEED_TRANSACTIONS } from '../data/seed.js'
import { format } from 'date-fns'

const fmt = (n: number): string => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(Math.abs(n))
const cat = (id: string) => CATEGORIES.find(c => c.id === id)
const uid = (): string => 'txn-' + Date.now()

type TransactionForm = { description: string; amount: string | number; date: string; categoryId: string; type: string; note: string }
type TransactionErrors = { description?: string; amount?: string; date?: string }
type TransactionModalMode = 'add' | 'edit' | null

const EMPTY_FORM: TransactionForm = { description: '', amount: '', date: format(new Date(), 'yyyy-MM-dd'), categoryId: 'cat-2', type: 'expense', note: '' }

export default function TransactionsPage() {
  const [txns, setTxns]         = useState(getTransactions)
  const [search, setSearch]     = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterType, setFilterType] = useState('')
  const [modal, setModal]       = useState<TransactionModalMode>(null)
  const [editing, setEditing]   = useState<ReturnType<typeof getTransactions>[number] | null>(null)
  const [form, setForm]         = useState<TransactionForm>(EMPTY_FORM)
  const [errors, setErrors]     = useState<TransactionErrors>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const refresh = () => setTxns(getTransactions())

  const filtered = useMemo(() => txns.filter(t => {
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase())
    const matchCat    = !filterCat  || t.categoryId === filterCat
    const matchType   = !filterType || t.type === filterType
    return matchSearch && matchCat && matchType
  }), [txns, search, filterCat, filterType])

  const openAdd = () => {
    setForm(EMPTY_FORM); setErrors({})
    setEditing(null); setModal('add')
  }

  const openEdit = (txn: ReturnType<typeof getTransactions>[number]) => {
    setForm({ ...txn, amount: Math.abs(txn.amount) })
    setErrors({}); setEditing(txn); setModal('edit')
  }

  const validate = (): TransactionErrors => {
    const e: TransactionErrors = {}
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.amount || isNaN(parseFloat(String(form.amount))) || parseFloat(String(form.amount)) <= 0)
      e.amount = 'Enter a valid positive amount'
    if (!form.date) e.date = 'Date is required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)

    const rawAmount = parseFloat(String(form.amount))
    const amount    = form.type === 'expense' ? -rawAmount : rawAmount
    const txn = { ...form, amount, id: editing?.id || uid() }
    saveTransaction(txn)
    refresh()
    setModal(null)
  }

  const handleDelete = (id: string) => {
    deleteTransaction(id)
    refresh()
    setDeleteConfirm(null)
  }

  const f = (k: keyof TransactionForm, v: unknown) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="fade-in" data-testid="transactions-page">
      {/* Filters bar */}
      <div className="flex gap-3 mb-6 items-center" style={{ flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search transactions…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="search-input"
          style={{ flex: '1', minWidth: 180 }}
        />
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} data-testid="filter-category" style={{ width: 160 }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} data-testid="filter-type" style={{ width: 130 }}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd} data-testid="btn-add-transaction">
          + Add transaction
        </button>
      </div>

      {/* Results count */}
      <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '12px' }} data-testid="results-count">
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
        {(search || filterCat || filterType) ? ' matching filters' : ' total'}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" data-testid="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No transactions found</h3>
            <p>Try adjusting your search or filters, or add a new transaction.</p>
            <button className="btn btn-primary mt-4" onClick={openAdd}>Add transaction</button>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(txn => {
                  const c = cat(txn.categoryId)
                  return (
                    <tr key={txn.id} data-testid={`txn-row-${txn.id}`}>
                      <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap', fontSize: '12.5px' }}>
                        {format(new Date(txn.date), 'MMM d, yyyy')}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{txn.description}</div>
                        {txn.note && <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: 2 }}>{txn.note}</div>}
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--text-2)' }}>
                          <span>{c?.icon}</span>{c?.name}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${txn.type}`}>{txn.type}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={`amount ${txn.amount > 0 ? 'positive' : 'negative'}`}>
                          {txn.amount > 0 ? '+' : '−'}${fmt(txn.amount)}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm" onClick={() => openEdit(txn)} data-testid={`btn-edit-${txn.id}`}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirm(txn.id)} data-testid={`btn-delete-${txn.id}`}>Del</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="modal-overlay" data-testid="transaction-modal">
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{modal === 'add' ? 'Add transaction' : 'Edit transaction'}</div>
              <button className="btn btn-sm btn-icon" onClick={() => setModal(null)} data-testid="btn-close-modal">✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="field">
                <label htmlFor="desc">Description *</label>
                <input id="desc" type="text" value={form.description} onChange={e => f('description', e.target.value)}
                  className={errors.description ? 'error' : ''} data-testid="modal-input-description" placeholder="e.g. Grocery Store"/>
                {errors.description && <span className="field-error" data-testid="error-description">{errors.description}</span>}
              </div>

              <div className="grid-2">
                <div className="field">
                  <label htmlFor="amount">Amount *</label>
                  <input id="amount" type="number" min="0.01" step="0.01" value={form.amount}
                    onChange={e => f('amount', e.target.value)} className={errors.amount ? 'error' : ''}
                    data-testid="modal-input-amount" placeholder="0.00"/>
                  {errors.amount && <span className="field-error" data-testid="error-amount">{errors.amount}</span>}
                </div>
                <div className="field">
                  <label htmlFor="type">Type *</label>
                  <select id="type" value={form.type} onChange={e => f('type', e.target.value)} data-testid="modal-select-type">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label htmlFor="date">Date *</label>
                  <input id="date" type="date" value={form.date} onChange={e => f('date', e.target.value)}
                    className={errors.date ? 'error' : ''} data-testid="modal-input-date"/>
                  {errors.date && <span className="field-error" data-testid="error-date">{errors.date}</span>}
                </div>
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select id="category" value={form.categoryId} onChange={e => f('categoryId', e.target.value)} data-testid="modal-select-category">
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="note">Note (optional)</label>
                <input id="note" type="text" value={form.note} onChange={e => f('note', e.target.value)}
                  data-testid="modal-input-note" placeholder="Optional details…"/>
              </div>

              <div className="flex gap-3 justify-between mt-2">
                <button className="btn" onClick={() => setModal(null)} data-testid="btn-cancel-modal">Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} data-testid="btn-save-transaction">
                  {modal === 'add' ? 'Add transaction' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="modal-overlay" data-testid="delete-confirm-modal">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <div className="modal-title">Delete transaction?</div>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-2)', marginBottom: '22px' }}>
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-between">
              <button className="btn" onClick={() => setDeleteConfirm(null)} data-testid="btn-cancel-delete">Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)} data-testid="btn-confirm-delete">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
