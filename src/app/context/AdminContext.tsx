import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AIKeys } from '../utils/aiGenerator'
import { loadAIKeys, saveAIKeys } from '../utils/aiGenerator'

const ADMIN_SESSION_KEY = 'admin-session'
const ADMIN_PASSWORD = 'admin123'   // 可在此修改默认密码（实际项目应哈希存储）

interface AdminContextValue {
  isAdmin: boolean
  login: (password: string) => boolean
  logout: () => void
  aiKeys: AIKeys
  setAIKey: (provider: keyof AIKeys, key: string) => void
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [aiKeys, setAiKeys] = useState<AIKeys>({})

  useEffect(() => {
    // 恢复 session
    const session = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (session === 'true') setIsAdmin(true)
    setAiKeys(loadAIKeys())
  }, [])

  function login(password: string): boolean {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      return true
    }
    return false
  }

  function logout() {
    setIsAdmin(false)
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  }

  function setAIKey(provider: keyof AIKeys, key: string) {
    const updated = { ...aiKeys, [provider]: key }
    setAiKeys(updated)
    saveAIKeys(updated)
  }

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, aiKeys, setAIKey }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider')
  return ctx
}
