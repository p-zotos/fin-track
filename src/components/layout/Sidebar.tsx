import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard',     icon: ChartIcon },
  { to: '/transactions', label: 'Transactions',  icon: ListIcon },
  { to: '/budgets',      label: 'Budgets',       icon: BudgetIcon },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar" data-testid="sidebar">
      <div className="sidebar-logo">
        <div className="wordmark">Fin<span>Track</span></div>
      </div>

      <nav className="sidebar-nav" data-testid="sidebar-nav">
        <span className="nav-section-label">Menu</span>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`nav-${label.toLowerCase()}`}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon className="icon" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-chip" data-testid="user-chip">
          <div className="avatar">{user?.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="user-email" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-sm"
            data-testid="btn-logout"
            style={{ padding: '4px 8px', fontSize: '11px', flexShrink: 0 }}
            title="Sign out"
          >
            Out
          </button>
        </div>
      </div>
    </aside>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="10" width="3" height="7" rx="1"/>
      <rect x="8.5" y="6" width="3" height="11" rx="1"/>
      <rect x="14" y="3" width="3" height="14" rx="1"/>
    </svg>
  )
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 5h14M3 10h14M3 15h8" strokeLinecap="round"/>
    </svg>
  )
}

function BudgetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="7"/>
      <path d="M10 6v4l3 2" strokeLinecap="round"/>
    </svg>
  )
}
