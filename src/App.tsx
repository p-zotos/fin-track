import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth, AuthProvider } from './hooks/useAuth.tsx'
import Sidebar from './components/layout/Sidebar.tsx'
import TestControls from './components/shared/TestControls.tsx'
import LoginPage from './pages/LoginPage.tsx'
import DashboardPage from './pages/DashboardPage.tsx'
import TransactionsPage from './pages/TransactionsPage.tsx'
import BudgetsPage from './pages/BudgetsPage.tsx'

function ProtectedLayout() {
  const auth = useAuth()
  if (!auth) return null
  const { session, loading } = auth

  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <header className="page-header">
          <PageTitle />
        </header>
        <main className="page-body">
          <Outlet />
        </main>
      </div>
      <TestControls />
    </div>
  )
}

function RootRedirect() {
  const auth = useAuth()
  if (!auth) return null
  const { session, loading } = auth

  if (loading) return null
  return <Navigate to={session ? '/dashboard' : '/login'} replace />
}

function PageTitle() {
  const path = window.location.pathname
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/transactions': 'Transactions',
    '/budgets': 'Budgets',
  }
  return <span className="page-title">{titles[path] || 'FinTrack'}</span>
}

function PublicRoute({ children }: { children: ReactNode }) {
  const auth = useAuth()
  if (!auth) return null
  const { session, loading } = auth

  if (loading) return null
  if (session) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/fin-track">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard"    element={<DashboardPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/budgets"      element={<BudgetsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
