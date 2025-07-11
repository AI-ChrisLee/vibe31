'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface ToolsContextType {
  isOpen: boolean
  toggleTools: () => void
  openTools: () => void
  closeTools: () => void
}

const ToolsContext = createContext<ToolsContextType | undefined>(undefined)

export function ToolsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggleTools = () => setIsOpen(prev => !prev)
  const openTools = () => setIsOpen(true)
  const closeTools = () => setIsOpen(false)

  return (
    <ToolsContext.Provider value={{ isOpen, toggleTools, openTools, closeTools }}>
      {children}
    </ToolsContext.Provider>
  )
}

export function useTools() {
  const context = useContext(ToolsContext)
  if (context === undefined) {
    throw new Error('useTools must be used within a ToolsProvider')
  }
  return context
}