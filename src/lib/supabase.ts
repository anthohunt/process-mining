import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      researchers: {
        Row: {
          id: string
          user_id: string | null
          full_name: string
          lab: string
          bio: string
          keywords: string[]
          status: 'pending' | 'approved' | 'rejected'
          map_x: number | null
          map_y: number | null
          cluster_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['researchers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['researchers']['Insert']>
      }
      publications: {
        Row: {
          id: string
          researcher_id: string
          title: string
          coauthors: string
          venue: string
          year: number | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['publications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['publications']['Insert']>
      }
      clusters: {
        Row: {
          id: string
          name: string
          color: string
          sub_themes: string[]
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clusters']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clusters']['Insert']>
      }
      similarity_scores: {
        Row: {
          id: string
          researcher_a: string
          researcher_b: string
          score: number
          algorithm: string
          computed_at: string
        }
        Insert: Omit<Database['public']['Tables']['similarity_scores']['Row'], 'id' | 'computed_at'>
        Update: Partial<Database['public']['Tables']['similarity_scores']['Insert']>
      }
      app_settings: {
        Row: { key: string; value: unknown; updated_at: string }
        Insert: Omit<Database['public']['Tables']['app_settings']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['app_settings']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_name: string | null
          action: string
          detail: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      invitations: {
        Row: {
          id: string
          email: string
          role: string
          invited_by: string | null
          accepted: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invitations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['invitations']['Insert']>
      }
    }
  }
}
