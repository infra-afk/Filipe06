import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authLogin, authLogout, getToken, getUser } from '../lib/auth'

interface User {
  id: string
  email: string
  full_name?: string
  role?: 'admin' | 'analista' | 'visualizador' | 'solicitante'
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token) {
      const u = getUser()
      setUser(u)
    }
    setLoading(false)
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    try {
      const { user } = await authLogin(email, password)
      setUser(user)
      return null
    } catch (err: any) {
      return err.message
    }
  }

  async function signOut() {
    await authLogout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
