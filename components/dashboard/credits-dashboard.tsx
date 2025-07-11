'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CreditCard, TrendingUp, Calendar, Zap } from 'lucide-react'
import { format } from 'date-fns'

interface Credits {
  id: string
  user_id: string
  total_credits: number
  used_credits: number
  rollover_credits: number
  reset_date: string
}

export function CreditsDashboard() {
  const [credits, setCredits] = useState<Credits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCredits()
  }, [])

  async function fetchCredits() {
    try {
      const response = await fetch('/api/credits')
      if (!response.ok) {
        throw new Error('Failed to fetch credits')
      }
      const data = await response.json()
      setCredits(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function handlePurchase(packageType: 'starter' | 'pro' | 'business') {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed')
      }

      // Refresh credits
      await fetchCredits()
      
      // In a real app, this would redirect to Stripe checkout
      alert(data.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !credits) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            {error || 'Failed to load credits'}
          </p>
        </CardContent>
      </Card>
    )
  }

  const availableCredits = (credits.total_credits + credits.rollover_credits) - credits.used_credits
  const usagePercentage = (credits.used_credits / (credits.total_credits + credits.rollover_credits)) * 100
  const resetDate = new Date(credits.reset_date)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Credits Overview</h2>
        <p className="text-muted-foreground">
          Manage and track your AI generation credits
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableCredits}</div>
            <p className="text-xs text-muted-foreground">
              Ready to use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.used_credits}</div>
            <p className="text-xs text-muted-foreground">
              Out of {credits.total_credits + credits.rollover_credits} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rollover Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.rollover_credits}</div>
            <p className="text-xs text-muted-foreground">
              From previous month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reset Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{format(resetDate, 'MMM d')}</div>
            <p className="text-xs text-muted-foreground">
              Next credit reset
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Progress</CardTitle>
          <CardDescription>
            Your credit usage for the current billing period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={usagePercentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {credits.used_credits} credits used
            </span>
            <span className="text-muted-foreground">
              {availableCredits} credits remaining
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Need More Credits?</CardTitle>
          <CardDescription>
            Purchase additional credits or upgrade your plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Starter Pack</h4>
              <p className="text-2xl font-bold">50 Credits</p>
              <p className="text-sm text-muted-foreground">$5</p>
              <Button className="w-full" size="sm" onClick={() => handlePurchase('starter')}>Purchase</Button>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Pro Pack</h4>
              <p className="text-2xl font-bold">200 Credits</p>
              <p className="text-sm text-muted-foreground">$15</p>
              <Badge className="mb-2">Most Popular</Badge>
              <Button className="w-full" size="sm" onClick={() => handlePurchase('pro')}>Purchase</Button>
            </div>
            <div className="border rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Business Pack</h4>
              <p className="text-2xl font-bold">500 Credits</p>
              <p className="text-sm text-muted-foreground">$30</p>
              <Button className="w-full" size="sm" onClick={() => handlePurchase('business')}>Purchase</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}