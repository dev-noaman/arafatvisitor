import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginResponse, LoginCredentials } from '@/types'
import { post, setAuthToken, removeAuthToken } from '@/services/api'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
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

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await post<LoginResponse>('/auth/login', credentials)

      // Handle both response formats
      const loginData = (response as any).data || response
      const token = loginData.token
      const user = loginData.user

      if (!token || !user) {
        throw new Error('Invalid login response')
      }

      setAuthToken(token)
      setToken(token)
      setUser(user)

      // Store in localStorage
      localStorage.setItem('admin_token', token)
      localStorage.setItem('admin_user', JSON.stringify(user))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    removeAuthToken()
    setToken(null)
    setUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
