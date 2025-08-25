import type { Database } from './database'

// Enhanced database types that extend the base types with new features
export interface EnhancedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      conversations: {
        Row: Database['public']['Tables']['conversations']['Row'] & {
          metadata?: Record<string, any> | null
          tags?: string[] | null
          is_archived?: boolean
          is_starred?: boolean
          message_count?: number
          last_message_at?: string
        }
        Insert: Database['public']['Tables']['conversations']['Insert'] & {
          metadata?: Record<string, any> | null
          tags?: string[] | null
          is_archived?: boolean
          is_starred?: boolean
          message_count?: number
          last_message_at?: string
        }
        Update: Database['public']['Tables']['conversations']['Update'] & {
          metadata?: Record<string, any> | null
          tags?: string[] | null
          is_archived?: boolean
          is_starred?: boolean
          message_count?: number
          last_message_at?: string
        }
      }
      messages: {
        Row: Database['public']['Tables']['messages']['Row'] & {
          metadata?: Record<string, any> | null
          tokens_used?: number
          cost?: number
        }
        Insert: Database['public']['Tables']['messages']['Insert'] & {
          metadata?: Record<string, any> | null
          tokens_used?: number
          cost?: number
        }
        Update: Database['public']['Tables']['messages']['Update'] & {
          metadata?: Record<string, any> | null
          tokens_used?: number
          cost?: number
        }
      }
    }
    Views: Database['public']['Views'] & {
      conversation_summaries: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
          last_message_at: string
          message_count: number
          is_starred: boolean
          is_archived: boolean
          tags: string[] | null
          metadata: Record<string, any> | null
          last_message_content: string | null
          last_message_role: 'user' | 'assistant' | null
          total_tokens_used: number
          total_cost: number
        }
      }
    }
    Functions: Database['public']['Functions'] & {
      get_conversation_stats: {
        Args: {
          user_id_param: string
        }
        Returns: {
          total_conversations: number
          total_messages: number
          total_tokens_used: number
          total_cost: number
          starred_conversations: number
          archived_conversations: number
        }[]
      }
      search_conversations: {
        Args: {
          user_id_param: string
          search_query: string
          limit_param?: number
          offset_param?: number
        }
        Returns: {
          id: string
          title: string
          created_at: string
          last_message_at: string
          message_count: number
          relevance_score: number
        }[]
      }
    }
  }
}

// Enhanced type exports
export type EnhancedConversation = EnhancedDatabase['public']['Tables']['conversations']['Row']
export type EnhancedConversationInsert = EnhancedDatabase['public']['Tables']['conversations']['Insert']
export type EnhancedConversationUpdate = EnhancedDatabase['public']['Tables']['conversations']['Update']

export type EnhancedMessage = EnhancedDatabase['public']['Tables']['messages']['Row']
export type EnhancedMessageInsert = EnhancedDatabase['public']['Tables']['messages']['Insert']
export type EnhancedMessageUpdate = EnhancedDatabase['public']['Tables']['messages']['Update']

export type ConversationSummaryView = EnhancedDatabase['public']['Views']['conversation_summaries']['Row']

// Extended conversation interfaces
export interface ConversationWithEnhancedMessages extends EnhancedConversation {
  messages: EnhancedMessage[]
}

export interface EnhancedConversationComplete extends EnhancedConversation {
  messages: EnhancedMessage[]
  summary: ConversationSummaryView
  analytics?: {
    totalTokens: number
    totalCost: number
    averageTokensPerMessage: number
    averageCostPerMessage: number
    messagesByRole: Record<'user' | 'assistant', number>
  }
}

// Search and filter interfaces
export interface ConversationSearchResult {
  id: string
  title: string
  created_at: string
  last_message_at: string
  message_count: number
  relevance_score: number
  snippet?: string
}

export interface ConversationFilters {
  tags?: string[]
  isStarred?: boolean
  isArchived?: boolean
  dateRange?: {
    start: string
    end: string
  }
  minMessages?: number
  maxMessages?: number
  minTokens?: number
  maxTokens?: number
  minCost?: number
  maxCost?: number
}

// Analytics interfaces
export interface ConversationAnalytics {
  totalTokens: number
  totalCost: number
  messageCount: number
  userMessages: number
  assistantMessages: number
  averageTokensPerMessage: number
  averageCostPerMessage: number
  tokensOverTime: Array<{
    date: string
    tokens: number
    role: 'user' | 'assistant'
  }>
  costOverTime: Array<{
    date: string
    cost: number
    role: 'user' | 'assistant'
  }>
}

export interface UserUsageStats {
  totalConversations: number
  totalMessages: number
  totalTokensUsed: number
  totalCost: number
  starredConversations: number
  archivedConversations: number
  averageMessagesPerConversation: number
  averageTokensPerConversation: number
  averageCostPerConversation: number
  mostUsedTags: Array<{
    tag: string
    count: number
  }>
  dailyUsage: Array<{
    date: string
    conversations: number
    messages: number
    tokens: number
    cost: number
  }>
}

// API response interfaces for enhanced endpoints
export interface EnhancedAPIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  meta?: {
    total?: number
    limit?: number
    offset?: number
    hasMore?: boolean
    filters?: ConversationFilters
    sorting?: {
      field: string
      order: 'asc' | 'desc'
    }
  }
}

// Bulk operation interfaces
export interface BulkOperationRequest {
  userId: string
  operation: 'bulk_update' | 'star' | 'unstar' | 'archive' | 'unarchive' | 'delete' | 'tag'
  conversationIds: string[]
  updates?: Partial<EnhancedConversationUpdate>
  tags?: string[]
}

export interface BulkOperationResponse {
  success: boolean
  data: {
    affected: number
    results: EnhancedConversation[]
    errors: Array<{
      id: string
      error: string
    }>
  }
  meta: {
    operation: string
    totalRequested: number
    totalSuccessful: number
    totalFailed: number
  }
}

// Export original database types for backward compatibility
export type * from './database'