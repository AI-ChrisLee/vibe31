import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  const formData = await request.formData()
  const email = String(formData.get('email'))
  const password = String(formData.get('password'))
  const fullName = String(formData.get('fullName') || '')
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/signup?error=Could not create user`,
      {
        status: 301,
      }
    )
  }

  // User record and credits will be created automatically by database trigger

  return NextResponse.redirect(
    `${requestUrl.origin}/login?message=Check your email to confirm your account`,
    {
      status: 301,
    }
  )
}