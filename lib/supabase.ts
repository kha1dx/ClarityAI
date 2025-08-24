import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

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
  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured')
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Legacy admin client for backward compatibility
export const supabaseAdmin = getServiceRoleClient()

// Helper function to get the current user's profile
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

// Helper function to create a new conversation
export async function createConversation(title: string, userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      title,
      user_id: userId
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to add a message to a conversation
export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role,
      content
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to save prompt result
export async function savePromptResult(
  conversationId: string,
  generatedPrompt: string,
  metadata?: any
) {
  const { data, error } = await supabase
    .from('prompt_results')
    .insert({
      conversation_id: conversationId,
      generated_prompt: generatedPrompt,
      metadata
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Helper function to get conversation with messages
export async function getConversationWithMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq('id', conversationId)
    .single()

  if (error) throw error
  return data
}

// Helper function to get user's conversations
export async function getUserConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      messages (
        id,
        role,
        content,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}