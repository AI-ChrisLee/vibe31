'use client'

import { useState } from 'react'
import { useAI } from '@/hooks/useAI'
import { useCredits } from '@/hooks/useCredits'
import { parseCommand } from '@/lib/ai/claude-service'
import { CREDIT_COSTS } from '@/lib/types/credits'
import { Send, Sparkles, AlertCircle } from 'lucide-react'

interface AICommandInputProps {
  clientId?: string
  onResult?: (result: string) => void
  placeholder?: string
}

export function AICommandInput({ 
  clientId, 
  onResult,
  placeholder = "Ask me anything..."
}: AICommandInputProps) {
  const [command, setCommand] = useState('')
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const { executeCommand, streamCommand, isExecuting, predictCommandType } = useAI()
  const { credits, canExecuteCommand } = useCredits()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || isExecuting) return

    setError('')
    setResult('')

    // Check if we can afford the command
    const commandType = predictCommandType(command)
    if (!canExecuteCommand(commandType)) {
      setError(`Insufficient credits. This ${commandType} command requires ${CREDIT_COSTS[commandType].credits} credits.`)
      return
    }

    try {
      // Stream the response
      let fullResponse = ''
      const response = await streamCommand(
        command,
        { clientId },
        (chunk) => {
          fullResponse += chunk
          setResult(fullResponse)
          onResult?.(fullResponse)
        }
      )

      if (!response.success) {
        setError(response.error || 'Command failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  const commandType = command ? predictCommandType(command) : 'simple'
  const creditCost = CREDIT_COSTS[commandType].credits

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder={placeholder}
            disabled={isExecuting}
            className="w-full px-4 py-3 pr-32 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {command && (
              <span className="text-xs text-gray-500">
                {creditCost} credit{creditCost !== 1 ? 's' : ''}
              </span>
            )}
            <button
              type="submit"
              disabled={!command.trim() || isExecuting || !canExecuteCommand(commandType)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isExecuting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {result && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">AI Response</span>
          </div>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans">{result}</pre>
          </div>
        </div>
      )}

      {credits && (
        <div className="text-xs text-gray-500 text-right">
          {credits.remaining} credits remaining
        </div>
      )}
    </div>
  )
}