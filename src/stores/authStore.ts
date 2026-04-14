import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isAdmin: boolean
  isLoading: boolean
  setSession: (session: Session | null) => void
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
  handleSessionExpiry: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAdmin: false,
  isLoading: true,

  setSession: (session) => {
    const isAdmin = session?.user?.user_metadata?.role === 'admin'
    set({ session, user: session?.user ?? null, isAdmin })
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    get().setSession(data.session)
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, isAdmin: false })
  },

  handleSessionExpiry: () => {
    set({ user: null, session: null, isAdmin: false })
    if (typeof window !== 'undefined') {
      window.location.href = '/login?expired=1'
    }
  },

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    get().setSession(session)
    set({ isLoading: false })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
        get().setSession(session)
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, session: null, isAdmin: false })
      }
    })
    return () => subscription.unsubscribe()
  },
}))
