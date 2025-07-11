import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserRole } from '@/lib/supabase-helpers'
import { CREDIT_PLANS } from '@/lib/types/credits'

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
      creditAmount,
      isOverage = false 
    }: {
      agencyId: string
      creditAmount: number
      isOverage?: boolean
    } = await request.json()

    // Validate input
    if (!agencyId || !creditAmount || creditAmount < 100) {
      return NextResponse.json({ 
        error: 'Invalid credit amount (minimum 100)' 
      }, { status: 400 })
    }

    // Check user can purchase credits for this agency
    const userRole = await getUserRole(user.id, agencyId)
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get agency details
    const { data: agency } = await supabase
      .from('agencies')
      .select('name, plan, credits_total')
      .eq('id', agencyId)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Calculate price based on plan
    const plan = CREDIT_PLANS[agency.plan]
    const pricePerCredit = isOverage ? plan.overage_rate : 0.25
    const totalAmount = creditAmount * pricePerCredit

    // Update credits (in production, this would happen after Stripe payment)
    const newTotal = agency.credits_total + creditAmount
    
    const { error: updateError } = await supabase
      .from('agencies')
      .update({ 
        credits_total: newTotal
      })
      .eq('id', agencyId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      return NextResponse.json(
        { error: 'Failed to add credits' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      creditsAdded: creditAmount,
      newTotal,
      totalCost: totalAmount,
      message: 'Credits added successfully'
    })

  } catch (error) {
    console.error('Credit purchase error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}