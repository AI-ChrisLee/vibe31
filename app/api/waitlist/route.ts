import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Helper function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }
  
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email(),
  interestedFeatures: z.array(z.string()).optional().default([]),
  referralCode: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await req.json()
    
    // Validate input
    const { email, interestedFeatures, referralCode } = waitlistSchema.parse(body)
    
    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('id')
      .eq('email', email)
      .single()
    
    if (existing) {
      return NextResponse.json(
        { message: 'Email already on waitlist' },
        { status: 400 }
      )
    }
    
    // Prepare metadata
    const metadata: any = {}
    if (referralCode) {
      // Check if referral code exists
      const { data: referrer } = await supabase
        .from('waitlist')
        .select('id')
        .eq('referral_code', referralCode)
        .single()
      
      if (referrer) {
        metadata.referred_by = referralCode
      }
    }
    
    // Insert new waitlist entry
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email,
        interested_features: interestedFeatures,
        metadata,
      })
      .select('position, referral_code')
      .single()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to join waitlist' },
        { status: 500 }
      )
    }
    
    // TODO: Send welcome email with position and referral code
    // await sendWelcomeEmail(email, data.position, data.referral_code)
    
    return NextResponse.json({
      position: data.position,
      referralCode: data.referral_code,
      message: 'Successfully joined waitlist',
    })
    
  } catch (error) {
    console.error('Waitlist signup error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input', errors: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    // Check for admin authentication (basic auth for now)
    const authHeader = req.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get query params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const status = searchParams.get('status') || undefined
    
    // Build query
    let query = supabase
      .from('waitlist')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { message: 'Failed to fetch waitlist' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
    
  } catch (error) {
    console.error('Waitlist fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}