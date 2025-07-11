import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { supabase } from '@/lib/supabase'
import type { 
  CreditUsageSummary, 
  CommandType, 
  CreditTransaction 
} from '@/lib/types/credits'
import { 
  getCreditsForCommand, 
  canAffordCommand,
  getCreditWarningThreshold,
  getCreditDangerThreshold 
} from '@/lib/types/credits'

interface UseCreditsReturn {
  credits: {
    total: number
    used: number
    remaining: number
    percentage: number
  } | null
  isLoading: boolean
  error: string | null
  canExecuteCommand: (commandType: CommandType) => boolean
  deductCredits: (command: string, commandType: CommandType, clientId?: string) => Promise<{
    success: boolean
    commandId?: string
    error?: string
    isOverage?: boolean
  }>
  refreshCredits: () => Promise<void>
  creditStatus: 'good' | 'warning' | 'danger' | 'overage'
}

export function useCredits(): UseCreditsReturn {
  const { agency, user } = useAuth()
  const [credits, setCredits] = useState<UseCreditsReturn['credits']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async () => {
    if (!agency) {
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('credits_total, credits_used')
        .eq('id', agency.id)
        .single()

      if (error) throw error

      const remaining = Math.max(0, data.credits_total - data.credits_used)
      const percentage = (data.credits_used / data.credits_total) * 100

      setCredits({
        total: data.credits_total,
        used: data.credits_used,
        remaining,
        percentage
      })
    } catch (err) {
      console.error('Failed to fetch credits:', err)
      setError('Failed to load credit information')
    } finally {
      setIsLoading(false)
    }
  }, [agency])

  useEffect(() => {
    fetchCredits()

    // Subscribe to credit changes
    if (agency) {
      const subscription = supabase
        .channel(`agency-credits:${agency.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'agencies',
            filter: `id=eq.${agency.id}`
          },
          (payload) => {
            const { credits_total, credits_used } = payload.new as any
            const remaining = Math.max(0, credits_total - credits_used)
            const percentage = (credits_used / credits_total) * 100

            setCredits({
              total: credits_total,
              used: credits_used,
              remaining,
              percentage
            })
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [agency, fetchCredits])

  const canExecuteCommand = useCallback((commandType: CommandType): boolean => {
    if (!credits) return false
    if (agency?.plan === 'enterprise') return true // Unlimited credits
    return canAffordCommand(credits.remaining, commandType)
  }, [credits, agency])

  const deductCredits = useCallback(async (
    command: string, 
    commandType: CommandType, 
    clientId?: string
  ) => {
    if (!agency || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const response = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          agencyId: agency.id,
          clientId,
          command,
          commandType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to deduct credits',
          isOverage: response.status === 402
        }
      }

      // Refresh credits after deduction
      await fetchCredits()

      return {
        success: true,
        commandId: data.command_id
      }
    } catch (err) {
      console.error('Credit deduction error:', err)
      return {
        success: false,
        error: 'Failed to process credit deduction'
      }
    }
  }, [agency, user, fetchCredits])

  const creditStatus = credits ? (
    credits.remaining === 0 ? 'overage' :
    credits.used >= getCreditDangerThreshold(credits.total) ? 'danger' :
    credits.used >= getCreditWarningThreshold(credits.total) ? 'warning' :
    'good'
  ) : 'good'

  return {
    credits,
    isLoading,
    error,
    canExecuteCommand,
    deductCredits,
    refreshCredits: fetchCredits,
    creditStatus
  }
}

// Hook for credit usage analytics
export function useCreditUsage(
  agencyId?: string,
  startDate?: Date,
  endDate?: Date
) {
  const { user } = useAuth()
  const [usage, setUsage] = useState<CreditUsageSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!agencyId || !user) {
      setIsLoading(false)
      return
    }

    const fetchUsage = async () => {
      try {
        const params = new URLSearchParams({
          agencyId,
          ...(startDate && { startDate: startDate.toISOString() }),
          ...(endDate && { endDate: endDate.toISOString() })
        })

        const response = await fetch(`/api/credits/usage?${params}`, {
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          }
        })

        if (!response.ok) {
          throw new Error('Failed to fetch usage data')
        }

        const data = await response.json()
        setUsage(data)
      } catch (err) {
        console.error('Failed to fetch credit usage:', err)
        setError('Failed to load usage data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsage()
  }, [agencyId, startDate, endDate, user])

  return { usage, isLoading, error }
}

// Hook for credit transactions
export function useCreditTransactions(agencyId?: string, limit = 10) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!agencyId || !user) {
      setIsLoading(false)
      return
    }

    const fetchTransactions = async () => {
      try {
        // In a real implementation, this would fetch from a transactions table
        // For now, we'll fetch recent AI commands as a proxy
        const { data, error } = await supabase
          .from('ai_commands')
          .select('*')
          .eq('agency_id', agencyId)
          .eq('status', 'completed')
          .order('executed_at', { ascending: false })
          .limit(limit)

        if (error) throw error

        // Transform to transaction format
        const txns: CreditTransaction[] = data.map(cmd => ({
          id: cmd.id,
          agency_id: cmd.agency_id,
          user_id: cmd.user_id,
          amount: -cmd.credits_used, // Negative for usage
          balance_after: 0, // Would need to calculate
          type: 'usage' as const,
          description: cmd.command,
          metadata: {
            command_id: cmd.id,
            command_type: cmd.command_type,
            client_id: cmd.client_id
          },
          created_at: cmd.executed_at
        }))

        setTransactions(txns)
      } catch (err) {
        console.error('Failed to fetch transactions:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTransactions()
  }, [agencyId, user, limit])

  return { transactions, isLoading }
}