import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: credits, error } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If no credits record exists, create one with initial credits
  if (!credits) {
    const { data: newCredits, error: createError } = await supabase
      .from('credits')
      .insert({
        user_id: user.id,
        total_credits: 31,
        used_credits: 0,
        rollover_credits: 0,
        reset_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString()
      })
      .select()
      .single()

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    return NextResponse.json(newCredits)
  }

  // Check if reset date has passed and reset credits if needed
  const resetDate = new Date(credits.reset_date)
  const now = new Date()
  
  if (now >= resetDate) {
    // Calculate rollover (unused credits from previous month, max 31)
    const unusedCredits = credits.total_credits - credits.used_credits
    const rollover = Math.min(Math.max(unusedCredits, 0), 31)
    
    const { data: updatedCredits, error: updateError } = await supabase
      .from('credits')
      .update({
        total_credits: 31,
        used_credits: 0,
        rollover_credits: rollover,
        reset_date: new Date(now.setMonth(now.getMonth() + 1)).toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(updatedCredits)
  }

  return NextResponse.json(credits)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { creditsToUse } = await request.json()

  if (!creditsToUse || creditsToUse < 1) {
    return NextResponse.json({ error: 'Invalid credits amount' }, { status: 400 })
  }

  // Get current credits
  const { data: credits, error: fetchError } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const availableCredits = (credits.total_credits + credits.rollover_credits) - credits.used_credits

  if (availableCredits < creditsToUse) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 })
  }

  // Update used credits
  const { data: updatedCredits, error: updateError } = await supabase
    .from('credits')
    .update({
      used_credits: credits.used_credits + creditsToUse
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json(updatedCredits)
}