import { useState, useEffect } from 'react'
import { getFlags, setFlag, resetToSeedData } from '../../data/store.js'

export default function TestControls() {
  const [open, setOpen]   = useState(false)
  const [flags, setFlags] = useState<Record<string, boolean>>(getFlags())
  const [reset, setReset] = useState(false)

  useEffect(() => { setFlags(getFlags()) }, [open])

  const toggleFlag = (key: string) => {
    const next = !flags[key]
    setFlag(key, next)
    setFlags((f: Record<string, boolean>) => ({ ...f, [key]: next }))
    window.dispatchEvent(new Event('fintrack:flags-changed'))
  }

  const handleReset = () => {
    resetToSeedData()
    setReset(true)
    setTimeout(() => { setReset(false); window.location.reload() }, 800)
  }

  const FLAG_LABELS = {
    showBudgetAlerts:    'Budget alerts',
    showSpendingInsights:'Spending insights',
    enableDarkMode:      'Dark mode',
    showExportButton:    'Export button (A/B)',
    showAIInsights:      'AI insights (unreleased)',
  }

  return (
    <div className="test-controls" data-testid="test-controls">
      {open && (
        <div className="test-controls-panel" data-testid="test-controls-panel">
          <h4>QA Test Controls</h4>

          <div style={{ marginBottom: '14px' }}>
            {Object.entries(FLAG_LABELS).map(([key, label]) => (
              <div key={key} className="flag-row">
                <span style={{ color: 'var(--text-2)' }}>{label}</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={!!flags[key]}
                    onChange={() => toggleFlag(key)}
                    data-testid={`flag-${key}`}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>
            ))}
          </div>

          <div className="divider" />

          <button
            className="btn btn-danger"
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
            onClick={handleReset}
            data-testid="btn-reset-data"
            disabled={reset}
          >
            {reset ? 'Resetting…' : 'Reset to seed data'}
          </button>

          <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px', textAlign: 'center' }}>
            Reloads the page after reset
          </p>
        </div>
      )}

      <button
        className="test-controls-toggle"
        onClick={() => setOpen(o => !o)}
        data-testid="btn-test-controls-toggle"
        aria-expanded={open}
        aria-label="Toggle QA test controls"
      >
        QA CONTROLS
      </button>
    </div>
  )
}
