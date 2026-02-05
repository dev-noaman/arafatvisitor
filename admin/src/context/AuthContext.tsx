import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react'
import { User, LoginResponse, LoginCredentials } from '@/types'
import { post, setAuthToken, removeAuthToken } from '@/services/api'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  autoLogin: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    const storedUser = localStorage.getItem('admin_user')

    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
        setAuthToken(storedToken)
      } catch (error) {
        console.error('Failed to restore session:', error)
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await post<LoginResponse>('/auth/login', credentials)

      // Handle both response formats
      const loginData = (response as any).data || response
      const authToken = loginData.token
      const authUser = loginData.user

      if (!authToken || !authUser) {
        throw new Error('Invalid login response')
      }

      setAuthToken(authToken)
      setToken(authToken)
      setUser(authUser)

      // Store in localStorage
      localStorage.setItem('admin_token', authToken)
      localStorage.setItem('admin_user', JSON.stringify(authUser))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const autoLogin = useCallback(async (jwtToken: string) => {
    setIsLoading(true)
    try {
      // Decode the JWT payload (base64url decode the middle part)
      const parts = jwtToken.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }

      // Decode base64url to base64, then decode
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
      const decoded = JSON.parse(atob(payload))

      // Extract user info from JWT payload
      const authUser: User = {
        id: String(decoded.sub),
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        role: decoded.role as User['role'],
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        throw new Error('Token has expired')
      }

      setAuthToken(jwtToken)
      setToken(jwtToken)
      setUser(authUser)

      // Store in localStorage
      localStorage.setItem('admin_token', jwtToken)
      localStorage.setItem('admin_user', JSON.stringify(authUser))
    } catch (error) {
      console.error('Auto-login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    removeAuthToken()
    setToken(null)
    setUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }, [])

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    autoLogin,
    logout,
  }), [user, token, isLoading, login, autoLogin, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
