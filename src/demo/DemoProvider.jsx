import { createContext, useContext, useEffect, useState } from 'react'

// Which of the two roles the app is being *viewed* as. This demo has no
// accounts, so anyone can open it, and this switch is what lets one visitor see
// both the contributor side and the reviewer side without needing two logins.
// The choice is remembered in localStorage.

const DemoContext = createContext(null)

const VIEW_KEY = 'rubric-studio:view'

export function DemoProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem(VIEW_KEY) === 'reviewer'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, isAdmin ? 'reviewer' : 'contributor')
    } catch {
      // Storage unavailable — the choice just will not survive a reload.
    }
  }, [isAdmin])

  return (
    <DemoContext.Provider value={{ isAdmin, setIsAdmin }}>{children}</DemoContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within a DemoProvider')
  return ctx
}
