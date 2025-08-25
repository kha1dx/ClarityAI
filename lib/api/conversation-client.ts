/**
 * Enhanced Conversation API Client
 * Provides a comprehensive interface for all conversation-related API operations
 * with proper TypeScript types, error handling, and response caching
 */

import type {
  Conversation,
  ConversationInsert,
  Message,
  MessageInsert,
  ConversationWithMessages,
  APIResponse
} from '@/lib/types'

import type {
  EnhancedConversation,
  ConversationSummaryView,
  ConversationAnalytics,
  UserUsageStats,
  BulkOperationRequest,
  BulkOperationResponse,
  ConversationFilters,
  ConversationSearchResult
} from '@/types/enhanced-database'

export interface ConversationListOptions {
  query?: string
  tags?: string[]
  isStarred?: boolean
  isArchived?: boolean
  limit?: number
  offset?: number
  sortBy?: 'created_at' | 'updated_at' | 'last_message_at' | 'title'
  sortOrder?: 'asc' | 'desc'
}

export class ConversationAPIClient {
  private baseUrl: string

  constructor(baseUrl = '/api/conversations') {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${url}:`, error)
      throw error
    }
  }

  // Basic CRUD operations
  async getConversations(userId: string, options?: ConversationListOptions): Promise<APIResponse<ConversationSummaryView[]>> {
    const params = new URLSearchParams({ userId })
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.set(key, value.join(','))
          } else {
            params.set(key, String(value))
          }
        }
      })
    }

    return this.request<ConversationSummaryView[]>(`/enhanced?${params.toString()}`)
  }

  async getConversation(conversationId: string, userId: string): Promise<APIResponse<ConversationWithMessages>> {
    const params = new URLSearchParams({ userId })
    return this.request<ConversationWithMessages>(`/${conversationId}?${params.toString()}`)
  }

  async createConversation(userId: string, title: string, category?: string): Promise<APIResponse<Conversation>> {
    return this.request<Conversation>('/', {
      method: 'POST',
      body: JSON.stringify({ userId, title, category })
    })
  }

  async updateConversation(conversationId: string, userId: string, title: string): Promise<APIResponse<Conversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<Conversation>(`/${conversationId}?${params.toString()}`, {
      method: 'PUT',
      body: JSON.stringify({ title })
    })
  }

  async deleteConversation(conversationId: string, userId: string): Promise<APIResponse<{ message: string }>> {
    const params = new URLSearchParams({ userId })
    return this.request<{ message: string }>(`/${conversationId}?${params.toString()}`, {
      method: 'DELETE'
    })
  }

  // Message operations
  async getMessages(conversationId: string): Promise<APIResponse<Message[]>> {
    return this.request<Message[]>(`/${conversationId}/messages`)
  }

  async createMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string,
    tokensUsed = 0,
    cost = 0
  ): Promise<APIResponse<Message>> {
    return this.request<Message>(`/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ role, content, tokensUsed, cost })
    })
  }

  // Enhanced operations
  async searchConversations(
    userId: string,
    query: string,
    limit = 20,
    offset = 0
  ): Promise<APIResponse<ConversationSearchResult[]>> {
    const params = new URLSearchParams({
      userId,
      query,
      limit: String(limit),
      offset: String(offset)
    })
    
    return this.request<ConversationSearchResult[]>(`/enhanced?${params.toString()}`)
  }

  async starConversation(conversationId: string, userId: string): Promise<APIResponse<EnhancedConversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<EnhancedConversation>(`/${conversationId}/star?${params.toString()}`, {
      method: 'POST'
    })
  }

  async unstarConversation(conversationId: string, userId: string): Promise<APIResponse<EnhancedConversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<EnhancedConversation>(`/${conversationId}/star?${params.toString()}`, {
      method: 'DELETE'
    })
  }

  async archiveConversation(conversationId: string, userId: string): Promise<APIResponse<EnhancedConversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<EnhancedConversation>(`/${conversationId}/archive?${params.toString()}`, {
      method: 'POST'
    })
  }

  async unarchiveConversation(conversationId: string, userId: string): Promise<APIResponse<EnhancedConversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<EnhancedConversation>(`/${conversationId}/archive?${params.toString()}`, {
      method: 'DELETE'
    })
  }

  async updateConversationTags(
    conversationId: string,
    userId: string,
    tags: string[]
  ): Promise<APIResponse<EnhancedConversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<EnhancedConversation>(`/${conversationId}/tags?${params.toString()}`, {
      method: 'PUT',
      body: JSON.stringify({ tags })
    })
  }

  async addConversationTags(
    conversationId: string,
    userId: string,
    tags: string[]
  ): Promise<APIResponse<EnhancedConversation>> {
    const params = new URLSearchParams({ userId })
    return this.request<EnhancedConversation>(`/${conversationId}/tags?${params.toString()}`, {
      method: 'POST',
      body: JSON.stringify({ tags })
    })
  }

  // Analytics and statistics
  async getConversationAnalytics(
    conversationId: string,
    userId: string
  ): Promise<APIResponse<ConversationAnalytics>> {
    const params = new URLSearchParams({ userId })
    return this.request<ConversationAnalytics>(`/${conversationId}/analytics?${params.toString()}`)
  }

  async getConversationStats(userId: string): Promise<APIResponse<UserUsageStats>> {
    const params = new URLSearchParams({ userId })
    return this.request<UserUsageStats>(`/stats?${params.toString()}`)
  }

  async getUserTags(userId: string, limit = 20): Promise<APIResponse<Array<{ tag: string; count: number }>>> {
    const params = new URLSearchParams({ userId, limit: String(limit) })
    return this.request<Array<{ tag: string; count: number }>>(`/tags?${params.toString()}`)
  }

  // Bulk operations
  async bulkUpdateConversations(
    userId: string,
    operation: BulkOperationRequest['operation'],
    conversationIds: string[],
    updates?: any
  ): Promise<BulkOperationResponse> {
    return this.request<BulkOperationResponse>('/enhanced', {
      method: 'PATCH',
      body: JSON.stringify({
        userId,
        operation,
        conversationIds,
        updates
      })
    }) as Promise<BulkOperationResponse>
  }

  // Convenience methods
  async bulkStarConversations(userId: string, conversationIds: string[]): Promise<BulkOperationResponse> {
    return this.bulkUpdateConversations(userId, 'star', conversationIds)
  }

  async bulkUnstarConversations(userId: string, conversationIds: string[]): Promise<BulkOperationResponse> {
    return this.bulkUpdateConversations(userId, 'unstar', conversationIds)
  }

  async bulkArchiveConversations(userId: string, conversationIds: string[]): Promise<BulkOperationResponse> {
    return this.bulkUpdateConversations(userId, 'archive', conversationIds)
  }

  async bulkUnarchiveConversations(userId: string, conversationIds: string[]): Promise<BulkOperationResponse> {
    return this.bulkUpdateConversations(userId, 'unarchive', conversationIds)
  }

  // Helper methods for common filtering scenarios
  async getStarredConversations(userId: string, options?: Omit<ConversationListOptions, 'isStarred'>): Promise<APIResponse<ConversationSummaryView[]>> {
    return this.getConversations(userId, { ...options, isStarred: true })
  }

  async getArchivedConversations(userId: string, options?: Omit<ConversationListOptions, 'isArchived'>): Promise<APIResponse<ConversationSummaryView[]>> {
    return this.getConversations(userId, { ...options, isArchived: true })
  }

  async getActiveConversations(userId: string, options?: Omit<ConversationListOptions, 'isArchived'>): Promise<APIResponse<ConversationSummaryView[]>> {
    return this.getConversations(userId, { ...options, isArchived: false })
  }

  async getConversationsByTag(userId: string, tags: string[], options?: Omit<ConversationListOptions, 'tags'>): Promise<APIResponse<ConversationSummaryView[]>> {
    return this.getConversations(userId, { ...options, tags })
  }
}

// Export a default instance
export const conversationAPI = new ConversationAPIClient()

// Export class for custom instances
export default ConversationAPIClient