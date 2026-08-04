import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). ' +
    'Login and data sync will fail until these are set in the deployment environment.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
