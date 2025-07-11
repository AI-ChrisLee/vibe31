'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface AIContextType {
  isOpen: boolean
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  unreadCount: number
  incrementUnread: () => void
  resetUnread: () => void
  currentPage: string
  getSuggestions: () => string[]
}

const AIContext = createContext<AIContextType | undefined>(undefined)

const PAGE_SUGGESTIONS: Record<string, string[]> = {
  '/dashboard': [
    "Show me my client revenue this month",
    "Create a new funnel for all fitness clients",
    "Generate weekly reports for all clients",
    "What tasks do I have pending?"
  ],
  '/clients': [
    "Add a new client",
    "Show me clients by industry",
    "Which clients need attention?",
    "Create email campaigns for all clients"
  ],
  '/funnels': [
    "Create a product launch funnel",
    "Build a webinar registration page",
    "Set up a lead magnet funnel",
    "Clone successful funnel to other clients"
  ],
  '/crm': [
    "Show me hot leads across all clients",
    "Move qualified leads to proposal",
    "Which deals are closing this week?",
    "Score leads by engagement"
  ]
}

export function AIProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true) // Start open so it's visible
  const [unreadCount, setUnreadCount] = useState(0)

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const openChat = useCallback(() => {
    setIsOpen(true)
    setUnreadCount(0)
  }, [])

  const closeChat = useCallback(() => {
    setIsOpen(false)
  }, [])

  const incrementUnread = useCallback(() => {
    if (!isOpen) {
      setUnreadCount(prev => prev + 1)
    }
  }, [isOpen])

  const resetUnread = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const getSuggestions = useCallback(() => {
    const basePath = pathname.split('/')[1]
    const key = basePath ? `/${basePath}` : '/dashboard'
    return PAGE_SUGGESTIONS[key] || PAGE_SUGGESTIONS['/dashboard']
  }, [pathname])

  const value = {
    isOpen,
    toggleChat,
    openChat,
    closeChat,
    unreadCount,
    incrementUnread,
    resetUnread,
    currentPage: pathname,
    getSuggestions
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const context = useContext(AIContext)
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider')
  }
  return context
}