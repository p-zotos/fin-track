import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email)    return setError('Email is required')
    if (!password) return setError('Password is required')

    setLoading(true)
    await new Promise(r => setTimeout(r, 400)) // simulate network
    const result = login(email, password)
    setLoading(false)

    if (result.success) navigate('/dashboard')
    else setError(result.error)
  }

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-card fade-in">
        <div className="login-logo">Fin<span>Track</span></div>
        <p className="login-sub">Sign in to your account</p>

        {error && (
          <div className="alert alert-error mb-4" role="alert" data-testid="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate data-testid="login-form">
          <div className="field mb-4">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              data-testid="input-email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alex@fintrack.demo"
              className={error && !email ? 'error' : ''}
              autoComplete="email"
            />
          </div>

          <div className="field mb-4">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              data-testid="input-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className={error && !password ? 'error' : ''}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
            data-testid="btn-login"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="divider" />
        <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '6px' }}>Demo credentials</p>
          <p style={{ fontSize: '12.5px', color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
            alex@fintrack.demo / demo1234
          </p>
        </div>
      </div>
    </div>
  )
}
