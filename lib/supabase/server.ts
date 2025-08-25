import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-anon-key'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-service-key'

const isDummy = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (isDummy) {
  console.warn('⚠️  Supabase environment variables not configured - using fallback storage')
}

// Server-side Supabase client for API routes
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Server-side Supabase client for server components
export const createServerComponentSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Service role client for admin operations
export const getServiceRoleClient = () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not configured - operations will use fallback storage')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Default server client instance for convenience
export const supabaseServer = createServerSupabaseClient()
export const supabaseAdmin = getServiceRoleClient()