import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { getCreditsForCommand, canAffordCommand } from '@/lib/types/credits'
import type { CommandType } from '@/lib/types/credits'

export async function POST(request: NextRequest) {
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

    const { 
      agencyId, 
      clientId, 
      command, 
      commandType,
      metadata = {}
    }: {
      agencyId: string
      clientId?: string
      command: string
      commandType: CommandType
      metadata?: Record<string, any>
    } = await request.json()

    // Validate required fields
    if (!agencyId || !command || !commandType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get credits needed
    const creditsNeeded = getCreditsForCommand(commandType)

    // Check agency credits
    const { data: agency } = await supabase
      .from('agencies')
      .select('credits_total, credits_used, plan')
      .eq('id', agencyId)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const availableCredits = agency.credits_total - agency.credits_used

    // For non-enterprise plans, check if they have enough credits
    if (agency.plan !== 'enterprise' && !canAffordCommand(availableCredits, commandType)) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditsNeeded,
        available: availableCredits,
        overage: true
      }, { status: 402 }) // Payment Required
    }

    // Use admin client to bypass RLS for credit operations
    if (!supabaseAdmin) {
      return NextResponse.json({ 
        error: 'Service configuration error' 
      }, { status: 500 })
    }
    
    // Start transaction
    const { data: aiCommand, error: commandError } = await supabaseAdmin
      .from('ai_commands')
      .insert({
        agency_id: agencyId,
        client_id: clientId,
        user_id: user.id,
        command,
        command_type: commandType,
        credits_used: creditsNeeded,
        status: 'pending',
        metadata
      })
      .select()
      .single()

    if (commandError) {
      console.error('Failed to create AI command:', commandError)
      return NextResponse.json({ error: 'Failed to track command' }, { status: 500 })
    }

    // Note: The actual credit deduction happens via database trigger
    // when the command status is updated to 'completed'

    return NextResponse.json({
      success: true,
      command_id: aiCommand.id,
      credits_deducted: creditsNeeded,
      remaining_credits: Math.max(0, availableCredits - creditsNeeded),
      is_overage: availableCredits < creditsNeeded
    })

  } catch (error) {
    console.error('Credit deduction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}