import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface PurchaseRequest {
  packageType: 'starter' | 'pro' | 'business'
}

const PACKAGES = {
  starter: { credits: 50, price: 5 },
  pro: { credits: 200, price: 15 },
  business: { credits: 500, price: 30 }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { packageType } = await request.json() as PurchaseRequest

  if (!packageType || !PACKAGES[packageType]) {
    return NextResponse.json({ error: 'Invalid package type' }, { status: 400 })
  }

  const selectedPackage = PACKAGES[packageType]

  // In a real implementation, you would:
  // 1. Create a payment intent with Stripe
  // 2. Process the payment
  // 3. On successful payment, add credits

  // For now, we'll simulate a successful purchase
  try {
    // Get current credits
    const { data: currentCredits, error: fetchError } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Update total credits
    const { data: updatedCredits, error: updateError } = await supabase
      .from('credits')
      .update({
        total_credits: currentCredits.total_credits + selectedPackage.credits
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // In a real app, you would return a Stripe checkout URL
    return NextResponse.json({
      success: true,
      credits: updatedCredits,
      message: `Successfully added ${selectedPackage.credits} credits to your account!`
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to process purchase' 
    }, { status: 500 })
  }
}