import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserRole } from '@/lib/supabase-helpers'
import type { CreditUsageSummary, CommandType } from '@/lib/types/credits'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const agencyId = searchParams.get('agencyId')
    const startDate = searchParams.get('startDate') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const endDate = searchParams.get('endDate') || new Date().toISOString()

    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID required' }, { status: 400 })
    }

    // Check user has access to this agency
    const userRole = await getUserRole(user.id, agencyId)
    if (!userRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get agency details and credits
    const { data: agency } = await supabase
      .from('agencies')
      .select('credits_total, credits_used')
      .eq('id', agencyId)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Get AI commands for the period
    const { data: commands } = await supabase
      .from('ai_commands')
      .select(`
        *,
        user:profiles!ai_commands_user_id_fkey(id, full_name, email),
        client:clients(id, name)
      `)
      .eq('agency_id', agencyId)
      .eq('status', 'completed')
      .gte('executed_at', startDate)
      .lte('executed_at', endDate)

    // Calculate usage by type
    const usageByType: Record<CommandType, number> = {
      simple: 0,
      content: 0,
      complex: 0,
      bulk: 0
    }

    const usageByUser: Record<string, { name: string, credits: number }> = {}
    const usageByClient: Record<string, { name: string, credits: number }> = {}
    const dailyUsage: Record<string, number> = {}

    commands?.forEach((command: any) => {
      // By type
      if (command.command_type in usageByType) {
        usageByType[command.command_type as CommandType] += command.credits_used
      }

      // By user
      const userId = command.user_id
      if (!usageByUser[userId]) {
        usageByUser[userId] = {
          name: command.user?.full_name || command.user?.email || 'Unknown',
          credits: 0
        }
      }
      usageByUser[userId].credits += command.credits_used

      // By client
      if (command.client_id && command.client) {
        const clientId = command.client_id
        if (!usageByClient[clientId]) {
          usageByClient[clientId] = {
            name: command.client.name,
            credits: 0
          }
        }
        usageByClient[clientId].credits += command.credits_used
      }

      // Daily usage
      const date = new Date(command.executed_at).toISOString().split('T')[0]
      dailyUsage[date] = (dailyUsage[date] || 0) + command.credits_used
    })

    // Calculate overage
    const overageCredits = Math.max(0, agency.credits_used - agency.credits_total)

    const summary: CreditUsageSummary = {
      agency_id: agencyId,
      period_start: startDate,
      period_end: endDate,
      total_credits: agency.credits_total,
      used_credits: agency.credits_used,
      remaining_credits: Math.max(0, agency.credits_total - agency.credits_used),
      overage_credits: overageCredits,
      usage_by_type: usageByType,
      usage_by_user: Object.entries(usageByUser).map(([user_id, data]) => ({
        user_id,
        user_name: data.name,
        credits_used: data.credits
      })).sort((a, b) => b.credits_used - a.credits_used),
      usage_by_client: Object.entries(usageByClient).map(([client_id, data]) => ({
        client_id,
        client_name: data.name,
        credits_used: data.credits
      })).sort((a, b) => b.credits_used - a.credits_used),
      daily_usage: Object.entries(dailyUsage).map(([date, credits]) => ({
        date,
        credits
      })).sort((a, b) => a.date.localeCompare(b.date))
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Credit usage error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}