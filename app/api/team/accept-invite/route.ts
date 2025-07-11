import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json()

    if (!token || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Decode invitation token
    let invitation
    try {
      invitation = JSON.parse(atob(token))
    } catch {
      return NextResponse.json(
        { error: 'Invalid invitation token' }, 
        { status: 400 }
      )
    }

    // Check if invitation is expired (7 days)
    const expirationTime = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
    if (Date.now() - invitation.timestamp > expirationTime) {
      return NextResponse.json(
        { error: 'Invitation has expired' }, 
        { status: 400 }
      )
    }

    // Verify user email matches invitation
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()

    if (!profile || profile.email !== invitation.email) {
      return NextResponse.json(
        { error: 'Email mismatch' }, 
        { status: 400 }
      )
    }

    // Check if already a team member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('user_id', userId)
      .eq('agency_id', invitation.agencyId)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a team member' }, 
        { status: 400 }
      )
    }

    // Add user to team
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .insert({
        agency_id: invitation.agencyId,
        user_id: userId,
        role: invitation.role,
        invited_by: invitation.invitedBy,
        accepted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (teamError) {
      console.error('Failed to add team member:', teamError)
      return NextResponse.json(
        { error: 'Failed to accept invitation' }, 
        { status: 500 }
      )
    }

    // Update user's profile with agency_id
    await supabase
      .from('profiles')
      .update({ agency_id: invitation.agencyId })
      .eq('id', userId)

    return NextResponse.json({ 
      success: true, 
      teamMember,
      agencyId: invitation.agencyId
    })

  } catch (error) {
    console.error('Accept invite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}