import React, { createContext, useContext, useState, useEffect } from 'react'
import { useData } from './DataContext'

interface User {
  id: string
  email: string
  name: string
  role: 'proprietaire' | 'gestionnaire' | 'locataire'
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users } = useData()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('mhimmo-current-user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      // Verify user still exists in users list
      const existingUser = users.find(u => u.id === userData.id)
      if (existingUser) {
        setUser(existingUser)
      } else {
        localStorage.removeItem('mhimmo-current-user')
      }
    }
    setLoading(false)
  }, [users])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Find user by email
    const foundUser = users.find(u => u.email === email)
    
    if (!foundUser) {
      return false
    }

    // Simple password validation (in real app, this would be properly secured)
    const validCredentials = [
      { email: 'admin@mhimmo.com', password: 'admin123' },
      { email: 'marie.dubois@mhimmo.com', password: 'manager123' },
      { email: 'jean.dupont@email.com', password: 'tenant123' },
      { email: 'sophie.martin@email.com', password: 'tenant123' }
    ]

    const isValidCredential = validCredentials.some(
      cred => cred.email === email && cred.password === password
    )

    if (isValidCredential) {
      const userSession = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role
      }
      setUser(userSession)
      localStorage.setItem('mhimmo-current-user', JSON.stringify(userSession))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mhimmo-current-user')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}