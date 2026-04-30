import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { io as socketIO } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
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
  socket: Socket | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<string>
  logout: () => void
  updateUserPhoto: (photoUrl: string) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function getTokenExpiry(token: string): number {
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.exp * 1000
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const connectSocket = (token: string) => {
    // Disconnect any existing socket first
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
    const s = socketIO(API_URL, { auth: { token } })
    socketRef.current = s
    setSocket(s)
  }

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    setSocket(null)
  }

  const clearSession = () => {
    clearTimer()
    disconnectSocket()
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    setAccessToken(null)
  }

  const scheduleRefresh = (token: string) => {
    clearTimer()
    try {
      const expiresAt = getTokenExpiry(token)
      const delay = Math.max(0, expiresAt - Date.now() - 60_000)
      timerRef.current = setTimeout(doRefresh, delay)
    } catch {
      timerRef.current = setTimeout(doRefresh, 10 * 60_000)
    }
  }

  const doRefresh = async () => {
    const storedRefresh = localStorage.getItem('refreshToken')
    if (!storedRefresh) { clearSession(); return }

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefresh }),
    })
    if (!res.ok) { clearSession(); return }

    const data = await res.json()
    applyTokens(data.accessToken, data.refreshToken)
  }

  const applyTokens = (token: string, refresh: string) => {
    localStorage.setItem('accessToken', token)
    localStorage.setItem('refreshToken', refresh)
    setAccessToken(token)
    scheduleRefresh(token)
    connectSocket(token)
  }

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
          scheduleRefresh(token)
          connectSocket(token)
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
          applyTokens(newToken, newRefresh)

          const meRes = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${newToken}` },
          })
          if (meRes.ok) {
            const data = await meRes.json()
            setUser(data.user)
            setLoading(false)
            return
          }
        }
      }

      clearSession()
      setLoading(false)
    }

    init()
    return () => {
      clearTimer()
      disconnectSocket()
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    applyTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
  }

  const register = async (email: string, password: string, username: string): Promise<string> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    applyTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data.accessToken
  }

  const logout = () => {
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST' })
    clearSession()
  }

  const updateUserPhoto = (photoUrl: string) => {
    setUser((prev) => (prev ? { ...prev, photoUrl } : prev))
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, socket, login, register, logout, updateUserPhoto }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
