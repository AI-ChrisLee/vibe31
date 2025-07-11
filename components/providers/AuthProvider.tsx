'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
  agency_id?: string
  created_at: string
  updated_at: string
}

interface Agency {
  id: string
  name: string
  owner_id: string
  plan: string
  credits_total: number
  credits_used: number
  white_label_settings?: any
  created_at: string
  updated_at: string
}

interface Client {
  id: string
  agency_id: string
  name: string
  industry?: string
  branding?: any
  settings?: any
  created_at: string
}

interface TeamMember {
  id: string
  user_id: string
  agency_id: string
  role: string
  status: string
  invited_by: string
  joined_at?: string
  created_at: string
  profile?: Profile
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  agency: Agency | null
  clients: Client[] | null
  teamMembers: TeamMember[] | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [clients, setClients] = useState<Client[] | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingUserData, setIsLoadingUserData] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      // Only load user data on SIGNED_IN event, not on INITIAL_SESSION
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Don't load user data here as it's already loaded in getSession
      } else if (event === 'SIGNED_OUT') {
        // Clear data on sign out
        setUser(null)
        setProfile(null)
        setAgency(null)
        setClients(null)
        setTeamMembers(null)
        setIsLoading(false)
      } else if (event === 'USER_UPDATED' && session?.user) {
        setUser(session.user)
        loadUserData(session.user.id)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserData = async (userId: string) => {
    if (isLoadingUserData) return
    setIsLoadingUserData(true)
    
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError
      setProfile(profileData)

      // Load agency
      if (profileData.agency_id) {
        console.log('Loading agency for ID:', profileData.agency_id)
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('id', profileData.agency_id)
          .single()

        if (agencyError) {
          console.error('Error loading agency:', agencyError)
          throw agencyError
        }
        console.log('Agency loaded:', agencyData)
        setAgency(agencyData)

        // Load clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('agency_id', profileData.agency_id)
          .order('created_at', { ascending: false })

        if (!clientsError) {
          setClients(clientsData)
        }

        // Load team members - with error handling
        try {
          const { data: teamData, error: teamError } = await supabase
            .from('team_members')
            .select('*')
            .eq('agency_id', profileData.agency_id)

          if (!teamError && teamData) {
            setTeamMembers(teamData)
          } else {
            // Set empty array if error or no data
            setTeamMembers([])
            if (teamError) {
              console.warn('Team members query failed, using empty array:', teamError)
            }
          }
        } catch (e) {
          // Fallback to empty array
          setTeamMembers([])
          console.warn('Failed to load team members:', e)
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
      setIsLoadingUserData(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) return { error }

      // Reload user data
      await loadUserData(user.id)
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const value = {
    user,
    profile,
    agency,
    clients,
    teamMembers,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}