import { User } from '@supabase/supabase-js'

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'
export type AgencyPlan = 'freelancer' | 'agency' | 'scale' | 'enterprise'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  company_name: string | null
  industry: string | null
  role: string | null
  agency_id: string | null
  preferences: Record<string, any>
  subscription_tier: string
  created_at: string
  updated_at: string
}

export interface Agency {
  id: string
  name: string
  owner_id: string
  plan: AgencyPlan
  credits_total: number
  credits_used: number
  white_label_settings: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
    custom_domain?: string
  }
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  agency_id: string
  user_id: string
  role: UserRole
  permissions: Record<string, boolean>
  invited_by: string | null
  invited_at: string
  accepted_at: string | null
  user?: Profile
}

export interface Client {
  id: string
  agency_id: string
  name: string
  industry: string | null
  branding: {
    logo_url?: string
    colors?: Record<string, string>
    fonts?: Record<string, string>
    brand_voice?: string
  }
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Credits {
  id: string
  user_id: string
  agency_id: string
  total_credits: number
  used_credits: number
  rollover_credits: number
  reset_date: string
  created_at: string
  updated_at: string
}

export interface AuthUser extends User {
  profile?: Profile
  agency?: Agency
  teamRole?: UserRole
  credits?: Credits
}

export interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  agency: Agency | null
  clients: Client[]
  teamMembers: TeamMember[]
  isLoading: boolean
  isAuthenticated: boolean
  userRole: UserRole | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updateAgency: (updates: Partial<Agency>) => Promise<void>
  switchClient: (clientId: string) => void
  currentClient: Client | null
  canAccess: (resource: string, action: string) => boolean
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: ['*'], // All permissions
  admin: [
    'clients.create',
    'clients.read',
    'clients.update',
    'clients.delete',
    'team.read',
    'team.invite',
    'funnels.create',
    'funnels.read',
    'funnels.update',
    'funnels.delete',
    'campaigns.create',
    'campaigns.read',
    'campaigns.update',
    'campaigns.delete',
    'leads.create',
    'leads.read',
    'leads.update',
    'leads.delete',
    'ai.use',
    'templates.create',
    'templates.read',
    'templates.update',
    'templates.delete'
  ],
  member: [
    'clients.read',
    'team.read',
    'funnels.create',
    'funnels.read',
    'funnels.update',
    'campaigns.create',
    'campaigns.read',
    'campaigns.update',
    'leads.create',
    'leads.read',
    'leads.update',
    'ai.use',
    'templates.read'
  ],
  viewer: [
    'clients.read',
    'team.read',
    'funnels.read',
    'campaigns.read',
    'leads.read',
    'templates.read'
  ]
}