import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserRole } from '@/lib/supabase-helpers'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, role, agencyId } = await request.json()

    // Get the current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user can invite team members
    const userRole = await getUserRole(user.id, agencyId)
    if (!userRole || (userRole !== 'owner' && userRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get agency details
    const { data: agency } = await supabase
      .from('agencies')
      .select('name')
      .eq('id', agencyId)
      .single()

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Check if user already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      // Check if already a team member
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', existingProfile.id)
        .eq('agency_id', agencyId)
        .single()

      if (existingMember) {
        return NextResponse.json(
          { error: 'User is already a team member' }, 
          { status: 400 }
        )
      }

      // Add existing user to team
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .insert({
          agency_id: agencyId,
          user_id: existingProfile.id,
          role,
          invited_by: user.id,
          accepted_at: new Date().toISOString()
        })
        .select()
        .single()

      if (teamError) {
        return NextResponse.json(
          { error: 'Failed to add team member' }, 
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true, 
        teamMember,
        message: 'User added to team' 
      })
    }

    // Create invitation token
    const invitationToken = btoa(JSON.stringify({
      email,
      agencyId,
      role,
      invitedBy: user.id,
      timestamp: Date.now()
    }))

    // Send invitation email
    const { error: emailError } = await resend.emails.send({
      from: 'Vibe31 <team@vibe31.com>',
      to: email,
      subject: `You've been invited to join ${agency.name} on Vibe31`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">You're invited to Vibe31!</h1>
          <p>You've been invited to join <strong>${agency.name}</strong> as a <strong>${role}</strong>.</p>
          <p>Vibe31 is an AI-powered agency transformation platform that helps agencies 10x their output without hiring.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite?token=${invitationToken}" 
               style="background-color: #000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This invitation will expire in 7 days. If you have any questions, please contact the person who invited you.
          </p>
        </div>
      `
    })

    if (emailError) {
      console.error('Failed to send invitation email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send invitation email' }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      invitationSent: true
    })

  } catch (error) {
    console.error('Team invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}