import { useState, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCredits } from './useCredits'
import { supabase } from '@/lib/supabase'
import { parseCommand } from '@/lib/ai/claude-service'
import type { CommandType } from '@/lib/types/credits'

export interface AICommandOptions {
  clientId?: string
  context?: any
  stream?: boolean
}

export interface AICommandResult {
  success: boolean
  commandId?: string
  result?: string
  creditsUsed?: number
  creditsRemaining?: number
  error?: string
}

export function useAI() {
  const { user, agency } = useAuth()
  const { canExecuteCommand, refreshCredits } = useCredits()
  const [isExecuting, setIsExecuting] = useState(false)
  const [commandHistory, setCommandHistory] = useState<AICommandResult[]>([])

  const executeCommand = useCallback(async (
    command: string,
    options: AICommandOptions = {}
  ): Promise<AICommandResult> => {
    if (!user || !agency) {
      return { success: false, error: 'Not authenticated' }
    }

    // Parse command to check if we can afford it
    const { type } = parseCommand(command)
    if (!canExecuteCommand(type)) {
      return { 
        success: false, 
        error: 'Insufficient credits for this command type' 
      }
    }

    setIsExecuting(true)

    try {
      const response = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          command,
          agencyId: agency.id,
          clientId: options.clientId,
          stream: options.stream,
          context: options.context
        })
      })

      if (options.stream && response.ok) {
        // Handle streaming response
        return {
          success: true,
          result: 'Streaming response started'
        }
      }

      const data = await response.json()

      if (!response.ok) {
        const result = { 
          success: false, 
          error: data.error || 'Command execution failed' 
        }
        setCommandHistory(prev => [...prev, result])
        return result
      }

      // Refresh credits after successful execution
      await refreshCredits()

      const result = {
        success: true,
        commandId: data.commandId,
        result: data.result,
        creditsUsed: data.creditsUsed,
        creditsRemaining: data.creditsRemaining
      }

      setCommandHistory(prev => [...prev, result])
      return result

    } catch (error) {
      console.error('AI command error:', error)
      const result = { 
        success: false, 
        error: 'Failed to execute command' 
      }
      setCommandHistory(prev => [...prev, result])
      return result
    } finally {
      setIsExecuting(false)
    }
  }, [user, agency, canExecuteCommand, refreshCredits])

  const streamCommand = useCallback(async (
    command: string,
    options: AICommandOptions = {},
    onChunk: (chunk: string) => void
  ): Promise<AICommandResult> => {
    if (!user || !agency) {
      return { success: false, error: 'Not authenticated' }
    }

    const { type } = parseCommand(command)
    if (!canExecuteCommand(type)) {
      return { 
        success: false, 
        error: 'Insufficient credits for this command type' 
      }
    }

    setIsExecuting(true)

    try {
      const response = await fetch('/api/ai/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          command,
          agencyId: agency.id,
          clientId: options.clientId,
          stream: true,
          context: options.context
        })
      })

      if (!response.ok) {
        const data = await response.json()
        return { 
          success: false, 
          error: data.error || 'Stream failed' 
        }
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let fullResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          fullResponse += chunk
          onChunk(chunk)
        }
      }

      // Refresh credits after streaming completes
      await refreshCredits()

      return {
        success: true,
        result: fullResponse
      }

    } catch (error) {
      console.error('Stream error:', error)
      return { 
        success: false, 
        error: 'Stream failed' 
      }
    } finally {
      setIsExecuting(false)
    }
  }, [user, agency, canExecuteCommand, refreshCredits])

  const getCommandStatus = useCallback(async (commandId: string) => {
    if (!user) return null

    try {
      const response = await fetch(`/api/ai/execute?commandId=${commandId}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      })

      if (!response.ok) return null
      return await response.json()
    } catch (error) {
      console.error('Failed to get command status:', error)
      return null
    }
  }, [user])

  const predictCommandType = useCallback((command: string): CommandType => {
    return parseCommand(command).type
  }, [])

  return {
    executeCommand,
    streamCommand,
    getCommandStatus,
    predictCommandType,
    isExecuting,
    commandHistory
  }
}