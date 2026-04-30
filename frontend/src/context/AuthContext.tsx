import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { API_URL } from '../lib/api'

interface User {
  id: number
  email: string
  username: string
  photoUrl: string | null
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<string>
  logout: () => void
  updateUserPhoto: (photoUrl: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const token = localStorage.getItem('accessToken')
      const refresh = localStorage.getItem('refreshToken')

      if (!token && !refresh) {
        setLoading(false)
        return
      }

      if (token) {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setAccessToken(token)
          setLoading(false)
          return
        }
      }

      if (refresh) {
        const res = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: refresh }),
        })
        if (res.ok) {
          const { accessToken: newToken, refreshToken: newRefresh } = await res.json()
          localStorage.setItem('accessToken', newToken)
          localStorage.setItem('refreshToken', newRefresh)

          const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${newToken}` },
          })
          if (meRes.ok) {
            const data = await meRes.json()
            setUser(data.user)
            setAccessToken(newToken)
            setLoading(false)
            return
          }
        }
      }

      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setLoading(false)
    }

    init()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    setAccessToken(data.accessToken)
  }

  const register = async (email: string, password: string, username: string): Promise<string> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    setUser(data.user)
    setAccessToken(data.accessToken)
    return data.accessToken
  }

  const logout = () => {
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST' })
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setAccessToken(null)
  }

  const updateUserPhoto = (photoUrl: string) => {
    setUser((prev) => (prev ? { ...prev, photoUrl } : prev))
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, updateUserPhoto }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
