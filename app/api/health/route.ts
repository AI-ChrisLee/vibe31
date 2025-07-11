import { NextResponse } from 'next/server'

export async function GET() {
  const status = {
    status: 'ok',
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      ADMIN_API_KEY: !!process.env.ADMIN_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  }
  
  return NextResponse.json(status)
}