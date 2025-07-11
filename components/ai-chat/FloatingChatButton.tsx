'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingChatButtonProps {
  onClick: () => void
  isOpen: boolean
  unreadCount?: number
}

export function FloatingChatButton({ onClick, isOpen, unreadCount = 0 }: FloatingChatButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (unreadCount > 0 && !isOpen) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [unreadCount, isOpen])

  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-14 h-14 rounded-full",
        "bg-black",
        "text-white shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-200",
        "hover:scale-110 hover:shadow-xl",
        "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
        isAnimating && "animate-pulse"
      )}
      aria-label={isOpen ? "Close chat" : "Open chat"}
    >
      {isOpen ? (
        <X className="w-6 h-6" />
      ) : (
        <>
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </>
      )}
    </button>
  )
}