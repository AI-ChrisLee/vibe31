import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Temporarily disable middleware to test
  return NextResponse.next()
  
  // try {
  //   // Update user's auth session
  //   return await updateSession(request)
  // } catch (error) {
  //   console.error('Middleware error:', error)
  //   // Return a basic response to prevent the app from crashing
  //   return NextResponse.next()
  // }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}