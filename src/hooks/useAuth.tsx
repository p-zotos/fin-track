import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { getSession, login as storeLogin, logout as storeLogout, DEMO_USER } from '../data/store.js'

type AuthContextType = {
  session: unknown
  user: typeof DEMO_USER | null
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    setSession(s)
    setLoading(false)
  }, [])

  const login = (email: string, password: string) => {
    const result = storeLogin(email, password)
    if (result.success) setSession(getSession())
    return result
  }

  const logout = () => {
    storeLogout()
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, user: session ? DEMO_USER : null, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
