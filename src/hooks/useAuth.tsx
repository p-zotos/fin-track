import { createContext, useContext, useState, useEffect } from 'react'
import { getSession, login as storeLogin, logout as storeLogout, DEMO_USER } from '../data/store.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = getSession()
    setSession(s)
    setLoading(false)
  }, [])

  const login = (email, password) => {
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
  return useContext(AuthContext)
}
