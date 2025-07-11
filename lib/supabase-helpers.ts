import { supabase } from './supabase'
import type { Profile, Agency, Client, TeamMember } from './types/auth'

// Helper to get current user's profile with agency
export async function getCurrentProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      agency:agencies(*)
    `)
    .eq('id', user.id)
    .single()

  return profile
}

// Helper to get user's role in their agency
export async function getUserRole(userId: string, agencyId: string) {
  // Check if user is agency owner
  const { data: agency } = await supabase
    .from('agencies')
    .select('owner_id')
    .eq('id', agencyId)
    .single()

  if (agency?.owner_id === userId) {
    return 'owner'
  }

  // Check team member role
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', userId)
    .eq('agency_id', agencyId)
    .single()

  return teamMember?.role || null
}

// Helper to check if user can perform action
export async function canUserPerform(
  userId: string, 
  agencyId: string, 
  resource: string, 
  action: string
) {
  const role = await getUserRole(userId, agencyId)
  if (!role) return false

  // Import dynamically to avoid circular dependency
  const { ROLE_PERMISSIONS } = await import('./types/auth')
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
  const permission = `${resource}.${action}`

  return permissions.includes('*') || permissions.includes(permission)
}

// Helper to get agency with all related data
export async function getAgencyWithRelations(agencyId: string) {
  const { data } = await supabase
    .from('agencies')
    .select(`
      *,
      clients(*),
      team_members(
        *,
        user:profiles(*)
      )
    `)
    .eq('id', agencyId)
    .single()

  return data
}

// Helper to create a new client
export async function createClient(agencyId: string, clientData: Partial<Client>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const canCreate = await canUserPerform(user.id, agencyId, 'clients', 'create')
  if (!canCreate) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('clients')
    .insert({
      agency_id: agencyId,
      ...clientData
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper to invite team member
export async function inviteTeamMember(
  agencyId: string, 
  email: string, 
  role: TeamMember['role']
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const canInvite = await canUserPerform(user.id, agencyId, 'team', 'invite')
  if (!canInvite) throw new Error('Unauthorized')

  // Check if user exists
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (existingUser) {
    // User exists, add them to team
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        agency_id: agencyId,
        user_id: existingUser.id,
        role,
        invited_by: user.id,
        accepted_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  } else {
    // User doesn't exist, create invitation
    // This would typically send an email invitation
    // For now, we'll just return a placeholder
    return {
      email,
      role,
      status: 'pending_signup'
    }
  }
}

// Helper to get agency credits summary
export async function getAgencyCredits(agencyId: string) {
  const { data: agency } = await supabase
    .from('agencies')
    .select('credits_total, credits_used')
    .eq('id', agencyId)
    .single()

  if (!agency) return null

  return {
    total: agency.credits_total,
    used: agency.credits_used,
    remaining: agency.credits_total - agency.credits_used,
    percentage: (agency.credits_used / agency.credits_total) * 100
  }
}

// Helper to track AI command
export async function trackAICommand(
  agencyId: string,
  clientId: string | null,
  command: string,
  commandType: 'simple' | 'content' | 'complex' | 'bulk',
  creditsUsed: number
) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('ai_commands')
    .insert({
      agency_id: agencyId,
      client_id: clientId,
      user_id: user.id,
      command,
      command_type: commandType,
      credits_used: creditsUsed,
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper to update AI command status
export async function updateAICommandStatus(
  commandId: string,
  status: 'processing' | 'completed' | 'failed',
  result?: any,
  errorMessage?: string
) {
  const updates: any = {
    status,
    ...(status === 'completed' && { completed_at: new Date().toISOString(), result }),
    ...(status === 'failed' && { error_message: errorMessage })
  }

  const { data, error } = await supabase
    .from('ai_commands')
    .update(updates)
    .eq('id', commandId)
    .select()
    .single()

  if (error) throw error
  return data
}