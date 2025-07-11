export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: {
          id: string
          name: string
          owner_id: string
          plan: 'freelancer' | 'agency' | 'scale' | 'enterprise'
          credits_total: number
          credits_used: number
          white_label_settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          plan?: 'freelancer' | 'agency' | 'scale' | 'enterprise'
          credits_total?: number
          credits_used?: number
          white_label_settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          plan?: 'freelancer' | 'agency' | 'scale' | 'enterprise'
          credits_total?: number
          credits_used?: number
          white_label_settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          agency_id: string
          name: string
          industry: string | null
          branding: Json
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          agency_id: string
          name: string
          industry?: string | null
          branding?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          agency_id?: string
          name?: string
          industry?: string | null
          branding?: Json
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          company_name: string | null
          industry: string | null
          role: string | null
          agency_id: string | null
          preferences: Json
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role?: string | null
          agency_id?: string | null
          preferences?: Json
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          company_name?: string | null
          industry?: string | null
          role?: string | null
          agency_id?: string | null
          preferences?: Json
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      credits: {
        Row: {
          id: string
          user_id: string
          agency_id: string | null
          total_credits: number
          used_credits: number
          rollover_credits: number
          reset_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          agency_id?: string | null
          total_credits?: number
          used_credits?: number
          rollover_credits?: number
          reset_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          agency_id?: string | null
          total_credits?: number
          used_credits?: number
          rollover_credits?: number
          reset_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          agency_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          permissions: Json
          invited_by: string | null
          invited_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          agency_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          agency_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          permissions?: Json
          invited_by?: string | null
          invited_at?: string
          accepted_at?: string | null
        }
      }
      ai_commands: {
        Row: {
          id: string
          agency_id: string
          client_id: string | null
          user_id: string
          command: string
          command_type: 'simple' | 'content' | 'complex' | 'bulk'
          credits_used: number
          result: Json
          status: 'pending' | 'processing' | 'completed' | 'failed'
          error_message: string | null
          executed_at: string
          completed_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          agency_id: string
          client_id?: string | null
          user_id: string
          command: string
          command_type: 'simple' | 'content' | 'complex' | 'bulk'
          credits_used: number
          result?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          executed_at?: string
          completed_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          agency_id?: string
          client_id?: string | null
          user_id?: string
          command?: string
          command_type?: 'simple' | 'content' | 'complex' | 'bulk'
          credits_used?: number
          result?: Json
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          error_message?: string | null
          executed_at?: string
          completed_at?: string | null
          metadata?: Json
        }
      }
      waitlist: {
        Row: {
          id: string
          email: string
          created_at: string
          position: number
          status: 'pending' | 'approved' | 'rejected' | 'converted' | null
          referral_code: string | null
          interested_features: string[] | null
          metadata: Json
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          position?: number
          status?: 'pending' | 'approved' | 'rejected' | 'converted' | null
          referral_code?: string | null
          interested_features?: string[] | null
          metadata?: Json
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          position?: number
          status?: 'pending' | 'approved' | 'rejected' | 'converted' | null
          referral_code?: string | null
          interested_features?: string[] | null
          metadata?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_waitlist_position: {
        Args: { email_input: string }
        Returns: number
      }
      get_referral_stats: {
        Args: { code: string }
        Returns: {
          total_referrals: number
          approved_referrals: number
          pending_referrals: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}