import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { 
  AuthContextType, 
  AuthUser, 
  Profile, 
  Agency, 
  Client, 
  TeamMember,
  UserRole
} from '@/lib/types/auth'
import { ROLE_PERMISSIONS } from '@/lib/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
        setAgency(null)
        setClients([])
        setTeamMembers([])
        setCurrentClient(null)
        setUserRole(null)
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  async function loadUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) {
        setIsLoading(false)
        return
      }

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (!profileData) {
        setIsLoading(false)
        return
      }

      setProfile(profileData)

      // Load agency
      let agencyData = null
      if (profileData.agency_id) {
        const { data } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', profileData.agency_id)
          .single()
        
        agencyData = data
        if (agencyData) {
          setAgency(agencyData)

          // Load clients
          const { data: clientsData } = await supabase
            .from('clients')
            .select('*')
            .eq('agency_id', agencyData.id)
            .order('name')

          setClients(clientsData || [])

          // Load team members
          const { data: teamData } = await supabase
            .from('team_members')
            .select(`
              *,
              user:profiles!team_members_user_id_fkey(*)
            `)
            .eq('agency_id', agencyData.id)

          setTeamMembers(teamData || [])

          // Determine user role
          if (agencyData.owner_id === authUser.id) {
            setUserRole('owner')
          } else {
            const teamMember = teamData?.find(tm => tm.user_id === authUser.id)
            setUserRole(teamMember?.role || null)
          }
        }
      }

      // Load credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      setUser({
        ...authUser,
        profile: profileData,
        agency: agencyData || undefined,
        teamRole: userRole || undefined,
        credits: creditsData || undefined
      })
    } catch (error) {
      console.error('Error loading user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    await loadUser()
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    router.push('/')
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    setProfile(data)
    await loadUser()
  }

  const updateAgency = async (updates: Partial<Agency>) => {
    if (!agency || userRole !== 'owner') {
      throw new Error('Unauthorized')
    }

    const { data, error } = await supabase
      .from('agencies')
      .update(updates)
      .eq('id', agency.id)
      .select()
      .single()

    if (error) throw error
    setAgency(data)
  }

  const switchClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId)
    setCurrentClient(client || null)
  }

  const canAccess = (resource: string, action: string) => {
    if (!userRole) return false
    
    const permissions = ROLE_PERMISSIONS[userRole]
    const permission = `${resource}.${action}`
    
    return permissions.includes('*') || permissions.includes(permission)
  }

  const value: AuthContextType = {
    user,
    profile,
    agency,
    clients,
    teamMembers,
    isLoading,
    isAuthenticated: !!user,
    userRole,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updateAgency,
    switchClient,
    currentClient,
    canAccess
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper hook for requiring authentication
export function useRequireAuth(redirectUrl = '/auth/login') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectUrl)
    }
  }, [user, isLoading, router, redirectUrl])

  return { user, isLoading }
}

// Helper hook for requiring specific role
export function useRequireRole(requiredRole: UserRole | UserRole[], redirectUrl = '/dashboard') {
  const { userRole, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && userRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
      if (!roles.includes(userRole)) {
        router.push(redirectUrl)
      }
    }
  }, [userRole, isLoading, router, redirectUrl, requiredRole])

  return { userRole, isLoading }
}