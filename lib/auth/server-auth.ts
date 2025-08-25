import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

export interface AuthError {
  message: string
  code?: string
}

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

/**
 * Get the authenticated user from the request headers
 * This utility extracts the JWT token from the Authorization header and validates it
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authorization = request.headers.get('authorization')
    if (!authorization) {
      return {
        user: null,
        error: { message: 'Authorization header is required', code: 'MISSING_AUTH' }
      }
    }

    // Extract the token from "Bearer <token>"
    const token = authorization.replace('Bearer ', '')
    if (!token) {
      return {
        user: null,
        error: { message: 'Invalid authorization format', code: 'INVALID_AUTH_FORMAT' }
      }
    }

    // Set the session with the token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error) {
      return {
        user: null,
        error: { message: error.message, code: error.message }
      }
    }

    if (!user) {
      return {
        user: null,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' }
      }
    }

    return {
      user,
      error: null
    }
  } catch (error) {
    return {
      user: null,
      error: { 
        message: error instanceof Error ? error.message : 'Authentication failed',
        code: 'AUTH_ERROR'
      }
    }
  }
}

/**
 * Alternative method using session from cookies (for browser-based requests)
 */
export async function getAuthenticatedUserFromSession(request: NextRequest): Promise<AuthResult> {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get session from cookies (Next.js automatically handles this)
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return {
        user: null,
        error: { message: sessionError.message, code: sessionError.message }
      }
    }

    if (!session || !session.user) {
      return {
        user: null,
        error: { message: 'No active session found', code: 'NO_SESSION' }
      }
    }

    return {
      user: session.user,
      error: null
    }
  } catch (error) {
    return {
      user: null,
      error: { 
        message: error instanceof Error ? error.message : 'Session validation failed',
        code: 'SESSION_ERROR'
      }
    }
  }
}

/**
 * Get user ID from request - tries both authorization header and session
 */
export async function getUserIdFromRequest(request: NextRequest): Promise<string | null> {
  // First try to get from authorization header
  const authResult = await getAuthenticatedUser(request)
  if (authResult.user) {
    return authResult.user.id
  }

  // Fallback to session-based authentication
  const sessionResult = await getAuthenticatedUserFromSession(request)
  if (sessionResult.user) {
    return sessionResult.user.id
  }

  // Last fallback - check query params (for compatibility with existing client code)
  const { searchParams } = new URL(request.url)
  const userIdFromParams = searchParams.get('userId')
  
  if (userIdFromParams) {
    // Note: This should be validated against the session in production
    console.warn('Using userId from query params - this should be replaced with proper auth')
    return userIdFromParams
  }

  return null
}

/**
 * Middleware-style auth check that returns user or throws error
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const authResult = await getAuthenticatedUser(request)
  
  if (!authResult.user) {
    throw new Error(authResult.error?.message || 'Authentication required')
  }

  return authResult.user
}