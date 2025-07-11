'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/components/providers/AuthProvider'

type Credits = {
  id: string
  user_id: string
  total_credits: number
  used_credits: number
  rollover_credits: number
  reset_date: string
  available_credits: number
}

export function useCredits() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<Credits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setCredits(null)
      setLoading(false)
      return
    }

    const fetchCredits = async () => {
      try {
        const { data, error } = await supabase
          .from('credits')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setCredits({
            ...data,
            available_credits: data.total_credits - data.used_credits + data.rollover_credits,
          })
        }
      } catch (err) {
        console.error('Error fetching credits:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch credits')
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newData = payload.new as Credits
            setCredits({
              ...newData,
              available_credits: newData.total_credits - newData.used_credits + newData.rollover_credits,
            })
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const deductCredits = async (amount: number) => {
    if (!user || !credits) return false

    try {
      const { error } = await supabase
        .from('credits')
        .update({ used_credits: credits.used_credits + amount })
        .eq('user_id', user.id)
        .gte('total_credits - used_credits + rollover_credits', amount)

      if (error) {
        throw error
      }

      return true
    } catch (err) {
      console.error('Error deducting credits:', err)
      return false
    }
  }

  return {
    credits,
    loading,
    error,
    deductCredits,
  }
}