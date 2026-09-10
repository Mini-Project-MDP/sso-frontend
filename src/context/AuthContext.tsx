import React, { createContext, useContext, useEffect, useState } from 'react'
import type { SSOUser } from '../types/sso'
import { ssoService } from '../services/ssoService'

interface AuthContextType {
  user: SSOUser | null
  sessionToken: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (user: SSOUser, sessionToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SSOUser | null>(() => {
    const savedUser = localStorage.getItem('sso_user')
    return savedUser ? JSON.parse(savedUser) : null
  })
  const [sessionToken, setSessionToken] = useState<string | null>(() =>
    localStorage.getItem('sso_session_token')
  )
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const login = (newUser: SSOUser, token: string) => {
    setUser(newUser)
    setSessionToken(token)
    localStorage.setItem('sso_user', JSON.stringify(newUser))
    localStorage.setItem('sso_session_token', token)
  }

  const logout = async () => {
    if (sessionToken) {
      try {
        await ssoService.logout(sessionToken)
      } catch (e) {
        console.error('Logout error:', e)
      }
    }
    setUser(null)
    setSessionToken(null)
    localStorage.removeItem('sso_user')
    localStorage.removeItem('sso_session_token')
    localStorage.removeItem('sso_access_token')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        sessionToken,
        isAuthenticated: !!user,
        isAdmin: !!user?.is_master,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
