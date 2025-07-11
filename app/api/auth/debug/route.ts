import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    return NextResponse.json({
      hasUser: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      error: error?.message || null,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check auth',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}