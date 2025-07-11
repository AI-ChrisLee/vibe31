'use client'

import { User, Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  creditsUsed?: number
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-black text-white" : "bg-gray-100 text-gray-600"
        )}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn("flex-1", isUser ? "text-right" : "text-left")}>
        <div
          className={cn(
            "inline-block px-4 py-2 rounded-2xl max-w-[80%]",
            isUser
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-900"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span>{format(message.timestamp, 'HH:mm')}</span>
          {message.creditsUsed && (
            <span>• {message.creditsUsed} credits</span>
          )}
        </div>
      </div>
    </div>
  )
}