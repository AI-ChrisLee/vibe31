'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Loader2, Sparkles, ChevronLeft, ChevronRight, MessageSquare, 
  History, Paperclip, Globe, Building2, Send, X, Plus, Filter, ArrowUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ChatMessage } from './ChatMessage'
import { useAuth } from '@/components/providers/AuthProvider'
import { useAI } from './AIProvider'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  creditsUsed?: number
  target?: string
}

interface ChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const { agency, clients } = useAuth()
  const { getSuggestions } = useAI()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat')
  const [target, setTarget] = useState<'all' | string>('all')
  const [attachments, setAttachments] = useState<File[]>([])
  const [showTargetMenu, setShowTargetMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      target
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: input,
          context: {
            page: window.location.pathname,
            agencyId: agency?.id,
            target,
            clientId: target !== 'all' ? target : undefined
          }
        })
      })

      if (!response.ok) throw new Error('Failed to send message')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                assistantMessage.content += data.content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessage.id 
                      ? { ...msg, content: assistantMessage.content }
                      : msg
                  )
                )
              }
              if (data.creditsUsed) {
                assistantMessage.creditsUsed = data.creditsUsed
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      setAttachments([])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  if (!isOpen) {
    return (
      <div className="w-12 h-screen bg-white border-r flex items-center justify-center flex-shrink-0">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open chat"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="w-[400px] h-screen bg-white border-r flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-black">Vibe31.com</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab(activeTab === 'chat' ? 'history' : 'chat')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={activeTab === 'chat' ? 'Show history' : 'Show chat'}
            >
              <History className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Minimize chat"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex border-t">
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors",
              activeTab === 'chat' 
                ? "text-black border-b-2 border-black" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors",
              activeTab === 'history' 
                ? "text-black border-b-2 border-black" 
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <History className="w-4 h-4" />
            History
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'chat' ? (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">How can I help you today?</h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  I can help you manage clients, create content, build funnels, and more.
                </p>
                {/* Suggestions */}
                <div className="w-full space-y-2">
                  {getSuggestions().slice(0, 4).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-gray-500 mt-4">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="border-t px-4 py-2">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4">
            <div className="relative bg-gray-50 rounded-2xl border border-gray-200">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="How can I help you today?"
                className="w-full bg-transparent text-black placeholder-gray-500 text-sm px-4 py-3 pr-24 focus:outline-none"
              />
              
              {/* Action buttons */}
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {/* Attachment button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"
                  title="Attach file"
                >
                  <Plus className="w-4 h-4" />
                </button>
                
                {/* Target selector as icon */}
                <button
                  onClick={() => setShowTargetMenu(!showTargetMenu)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors relative"
                  title="Select target"
                >
                  <Filter className="w-4 h-4" />
                  {target !== 'all' && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-black rounded-full"></span>
                  )}
                </button>
                
                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-1.5 bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-full mr-1"
                  title="Send message"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
              
              {/* Target menu dropdown */}
              {showTargetMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                  <button
                    onClick={() => {
                      setTarget('all')
                      setShowTargetMenu(false)
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                      target === 'all' ? "bg-gray-100 text-black" : "text-gray-600 hover:text-black hover:bg-gray-50"
                    )}
                  >
                    <Globe className="w-4 h-4" />
                    All Clients
                  </button>
                  {clients?.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => {
                        setTarget(client.id)
                        setShowTargetMenu(false)
                      }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                        target === client.id ? "bg-gray-100 text-black" : "text-gray-600 hover:text-black hover:bg-gray-50"
                      )}
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">{client.name}</span>
                    </button>
                  ))}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </>
      ) : (
        /* History tab */
        <div className="flex-1 p-4">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <h3 className="font-medium text-black mb-2">Recent Conversations</h3>
              <p className="text-gray-500">Your chat history will appear here.</p>
            </div>
            {/* TODO: Add actual history items */}
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                  <p className="text-sm font-medium">Conversation {i}</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}