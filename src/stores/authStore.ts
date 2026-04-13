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

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    get().setSession(session)
    set({ isLoading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      get().setSession(session)
    })
  },
}))
