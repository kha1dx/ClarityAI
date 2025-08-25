import { getServiceRoleClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'
import type { 
  Conversation, 
  ConversationInsert, 
  ConversationUpdate,
  Message,
  MessageInsert,
  ConversationWithMessages
} from '@/lib/types'

const supabase = getServiceRoleClient()

export interface ConversationSearchOptions {
  query?: string
  tags?: string[]
  isStarred?: boolean
  isArchived?: boolean
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'updated_at' | 'last_message_at' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export interface ConversationStats {
  totalConversations: number
  totalMessages: number
  totalTokensUsed: number
  totalCost: number
  starredConversations: number
  archivedConversations: number
}

export interface ConversationSummary {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  last_message_at: string
  message_count: number
  is_starred: boolean
  is_archived: boolean
  tags: string[]
  metadata: Json
  last_message_content?: string
  last_message_role?: 'user' | 'assistant'
  total_tokens_used: number
  total_cost: number
}

export class EnhancedConversationService {
  // Enhanced conversation retrieval with filtering and search
  static async getConversationsWithFilters(
    userId: string, 
    options: ConversationSearchOptions = {}
  ): Promise<ConversationSummary[]> {
    try {
      let query = supabase
        .from('conversation_summaries')
        .select('*')
        .eq('user_id', userId)

      // Apply filters
      if (options.isStarred !== undefined) {
        query = query.eq('is_starred', options.isStarred)
      }

      if (options.isArchived !== undefined) {
        query = query.eq('is_archived', options.isArchived)
      }

      if (options.tags && options.tags.length > 0) {
        query = query.overlaps('tags', options.tags)
      }

      // Apply sorting
      const sortBy = options.sortBy || 'last_message_at'
      const sortOrder = options.sortOrder || 'desc'
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })

      // Apply pagination
      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching conversations with filters:', error)
        throw new Error(`Failed to fetch conversations: ${error.message}`)
      }

      return data as ConversationSummary[]
    } catch (error) {
      console.error('Error in getConversationsWithFilters:', error)
      throw error
    }
  }

  // Search conversations by content
  static async searchConversations(
    userId: string,
    searchQuery: string,
    limit = 20,
    offset = 0
  ) {
    try {
      const { data, error } = await supabase.rpc('search_conversations', {
        user_id_param: userId,
        search_query: searchQuery,
        limit_param: limit,
        offset_param: offset
      })

      if (error) {
        console.error('Error searching conversations:', error)
        throw new Error(`Failed to search conversations: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in searchConversations:', error)
      throw error
    }
  }

  // Get conversation statistics
  static async getConversationStats(userId: string): Promise<ConversationStats> {
    try {
      const { data, error } = await supabase.rpc('get_conversation_stats', {
        user_id_param: userId
      })

      if (error) {
        console.error('Error fetching conversation stats:', error)
        throw new Error(`Failed to fetch conversation stats: ${error.message}`)
      }

      const stats = data?.[0]
      return {
        totalConversations: stats?.total_conversations || 0,
        totalMessages: stats?.total_messages || 0,
        totalTokensUsed: stats?.total_tokens_used || 0,
        totalCost: parseFloat(stats?.total_cost || '0'),
        starredConversations: stats?.starred_conversations || 0,
        archivedConversations: stats?.archived_conversations || 0
      }
    } catch (error) {
      console.error('Error in getConversationStats:', error)
      throw error
    }
  }

  // Star/unstar conversation
  static async toggleConversationStar(
    conversationId: string, 
    userId: string, 
    isStarred: boolean
  ): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ is_starred: isStarred, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error toggling conversation star:', error)
        throw new Error(`Failed to ${isStarred ? 'star' : 'unstar'} conversation: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in toggleConversationStar:', error)
      throw error
    }
  }

  // Archive/unarchive conversation
  static async toggleConversationArchive(
    conversationId: string, 
    userId: string, 
    isArchived: boolean
  ): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ is_archived: isArchived, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error toggling conversation archive:', error)
        throw new Error(`Failed to ${isArchived ? 'archive' : 'unarchive'} conversation: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in toggleConversationArchive:', error)
      throw error
    }
  }

  // Update conversation tags
  static async updateConversationTags(
    conversationId: string, 
    userId: string, 
    tags: string[]
  ): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ tags, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating conversation tags:', error)
        throw new Error(`Failed to update conversation tags: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in updateConversationTags:', error)
      throw error
    }
  }

  // Update conversation metadata
  static async updateConversationMetadata(
    conversationId: string, 
    userId: string, 
    metadata: Json
  ): Promise<Conversation> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ metadata, updated_at: new Date().toISOString() })
        .eq('id', conversationId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating conversation metadata:', error)
        throw new Error(`Failed to update conversation metadata: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in updateConversationMetadata:', error)
      throw error
    }
  }

  // Enhanced message saving with token tracking
  static async saveMessageWithTracking(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    tokensUsed = 0,
    cost = 0.0,
    metadata: Json = null
  ): Promise<Message> {
    try {
      const messageData: MessageInsert = {
        conversation_id: conversationId,
        role,
        content,
        tokens_used: tokensUsed,
        cost,
        metadata,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single()

      if (error) {
        console.error('Error saving message with tracking:', error)
        throw new Error(`Failed to save message: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in saveMessageWithTracking:', error)
      throw error
    }
  }

  // Get messages with pagination and filtering
  static async getMessagesWithPagination(
    conversationId: string,
    limit = 50,
    offset = 0,
    orderBy: 'created_at' | 'tokens_used' | 'cost' = 'created_at',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order(orderBy, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching messages with pagination:', error)
        throw new Error(`Failed to fetch messages: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in getMessagesWithPagination:', error)
      throw error
    }
  }

  // Get conversation usage analytics
  static async getConversationUsageAnalytics(
    conversationId: string,
    userId: string
  ) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('tokens_used, cost, created_at, role')
        .eq('conversation_id', conversationId)
        .eq('conversations.user_id', userId)

      if (error) {
        console.error('Error fetching usage analytics:', error)
        throw new Error(`Failed to fetch usage analytics: ${error.message}`)
      }

      // Calculate analytics
      const analytics = {
        totalTokens: data.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0),
        totalCost: data.reduce((sum, msg) => sum + (msg.cost || 0), 0),
        messageCount: data.length,
        userMessages: data.filter(msg => msg.role === 'user').length,
        assistantMessages: data.filter(msg => msg.role === 'assistant').length,
        averageTokensPerMessage: data.length > 0 ? 
          data.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) / data.length : 0,
        averageCostPerMessage: data.length > 0 ? 
          data.reduce((sum, msg) => sum + (msg.cost || 0), 0) / data.length : 0,
        tokensOverTime: data.map(msg => ({
          date: msg.created_at,
          tokens: msg.tokens_used || 0,
          role: msg.role
        })),
        costOverTime: data.map(msg => ({
          date: msg.created_at,
          cost: msg.cost || 0,
          role: msg.role
        }))
      }

      return analytics
    } catch (error) {
      console.error('Error in getConversationUsageAnalytics:', error)
      throw error
    }
  }

  // Bulk operations for conversations
  static async bulkUpdateConversations(
    conversationIds: string[],
    userId: string,
    updates: Partial<ConversationUpdate>
  ): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .in('id', conversationIds)
        .select()

      if (error) {
        console.error('Error bulk updating conversations:', error)
        throw new Error(`Failed to bulk update conversations: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error in bulkUpdateConversations:', error)
      throw error
    }
  }

  // Get popular tags for a user
  static async getUserTags(userId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('tags')
        .eq('user_id', userId)
        .not('tags', 'is', null)

      if (error) {
        console.error('Error fetching user tags:', error)
        throw new Error(`Failed to fetch user tags: ${error.message}`)
      }

      // Flatten and count tags
      const tagCounts: Record<string, number> = {}
      data.forEach(conversation => {
        if (conversation.tags && Array.isArray(conversation.tags)) {
          conversation.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1
          })
        }
      })

      // Sort by usage count and return top tags
      return Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }))
    } catch (error) {
      console.error('Error in getUserTags:', error)
      throw error
    }
  }
}

// Export both services for backward compatibility
export { ConversationService } from './conversation-service'
export { EnhancedConversationService as ConversationServiceV2 }