import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  ConversationStore, 
  PromptConversation, 
  ConversationMessage,
  APIResponse
} from '@/lib/types'

interface ConversationStoreState extends ConversationStore {}

// API client functions
const apiClient = {
  async fetchConversations(userId: string): Promise<PromptConversation[]> {
    const response = await fetch(`/api/conversations?userId=${userId}`)
    const result: APIResponse<PromptConversation[]> = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to fetch conversations')
    }
    
    return result.data || []
  },

  async createConversation(title: string, userId: string): Promise<PromptConversation> {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, userId })
    })
    
    const result: APIResponse<PromptConversation> = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to create conversation')
    }
    
    return result.data!
  },

  async updateConversation(id: string, updates: Partial<PromptConversation>, userId: string): Promise<PromptConversation> {
    const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    
    const result: APIResponse<PromptConversation> = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to update conversation')
    }
    
    return result.data!
  },

  async deleteConversation(id: string, userId: string): Promise<void> {
    const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
      method: 'DELETE'
    })
    
    const result: APIResponse = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to delete conversation')
    }
  },

  async addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to add message')
    }
    
    return result.data
  },

  async generateResponse(conversationHistory: ConversationMessage[], userId: string) {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationHistory, userId })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to generate response')
    }
    
    return result.data
  },

  async optimizePrompt(conversationHistory: ConversationMessage[], userId: string) {
    const response = await fetch('/api/ai/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationHistory, userId })
    })
    
    const result = await response.json()
    
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to optimize prompt')
    }
    
    return result.data
  }
}

export const useConversationStore = create<ConversationStoreState>()(
  devtools(
    (set, get) => ({
      // State
      conversations: [],
      currentConversation: null,
      isLoading: false,
      error: null,

      // Actions
      loadConversations: async (userId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const conversations = await apiClient.fetchConversations(userId)
          set({ 
            conversations: conversations.map(conv => ({
              ...conv,
              conversation_data: conv.conversation_data || []
            })),
            isLoading: false 
          })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error loading conversations:', error)
          set({ 
            error: errorMessage,
            isLoading: false 
          })
        }
      },

      createConversation: async (title: string, userId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const conversation = await apiClient.createConversation(title, userId)
          const newConversation: PromptConversation = {
            ...conversation,
            conversation_data: [],
            is_template: false
          }
          
          set((state) => ({
            conversations: [newConversation, ...state.conversations],
            currentConversation: newConversation,
            isLoading: false
          }))
          
          return newConversation
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error creating conversation:', error)
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        }
      },

      updateConversation: async (id: string, updates: Partial<PromptConversation>) => {
        set({ error: null })
        
        try {
          // Optimistically update the local state
          set((state) => ({
            conversations: state.conversations.map((conv) =>
              conv.id === id ? { ...conv, ...updates } : conv
            ),
            currentConversation: state.currentConversation?.id === id
              ? { ...state.currentConversation, ...updates }
              : state.currentConversation
          }))

          // Get userId from the conversation or current user context
          const conversation = get().conversations.find(c => c.id === id)
          if (!conversation) {
            throw new Error('Conversation not found')
          }

          // Make API call (for now, we'll assume title updates)
          if (updates.title) {
            await apiClient.updateConversation(id, { title: updates.title }, conversation.user_id)
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error updating conversation:', error)
          
          // Revert optimistic update
          await get().loadConversations(get().conversations.find(c => c.id === id)?.user_id || '')
          
          set({ error: errorMessage })
          throw error
        }
      },

      deleteConversation: async (id: string) => {
        set({ error: null })
        
        try {
          const conversation = get().conversations.find(c => c.id === id)
          if (!conversation) {
            throw new Error('Conversation not found')
          }

          // Optimistically remove from local state
          set((state) => ({
            conversations: state.conversations.filter((conv) => conv.id !== id),
            currentConversation: state.currentConversation?.id === id 
              ? null 
              : state.currentConversation
          }))

          await apiClient.deleteConversation(id, conversation.user_id)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error deleting conversation:', error)
          
          // Reload conversations to revert optimistic update
          const conversation = get().conversations.find(c => c.id === id)
          if (conversation) {
            await get().loadConversations(conversation.user_id)
          }
          
          set({ error: errorMessage })
          throw error
        }
      },

      setCurrentConversation: (conversation: PromptConversation | null) => {
        set({ currentConversation: conversation })
      },

      addMessage: (conversationId: string, message: ConversationMessage) => {
        set((state) => {
          const updatedConversations = state.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                conversation_data: [...conv.conversation_data, message],
                updated_at: new Date().toISOString()
              }
            }
            return conv
          })

          const updatedCurrentConversation = state.currentConversation?.id === conversationId
            ? {
                ...state.currentConversation,
                conversation_data: [...state.currentConversation.conversation_data, message],
                updated_at: new Date().toISOString()
              }
            : state.currentConversation

          return {
            conversations: updatedConversations,
            currentConversation: updatedCurrentConversation
          }
        })
      },

      generateResponse: async (conversationId: string, userMessage: string) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (!conversation) {
          throw new Error('Conversation not found')
        }

        set({ isLoading: true, error: null })

        try {
          // Add user message
          const userMsg: ConversationMessage = {
            id: `msg_${Date.now()}_user`,
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
          }
          
          get().addMessage(conversationId, userMsg)

          // Save user message to backend
          await apiClient.addMessage(conversationId, 'user', userMessage)

          // Generate AI response
          const currentConversation = get().conversations.find(c => c.id === conversationId)
          if (!currentConversation) {
            throw new Error('Conversation not found after adding message')
          }

          const aiResponse = await apiClient.generateResponse(
            currentConversation.conversation_data,
            conversation.user_id
          )

          // Add AI response
          const aiMsg: ConversationMessage = {
            id: `msg_${Date.now()}_ai`,
            role: 'assistant',
            content: aiResponse.content,
            timestamp: new Date().toISOString(),
            tokens_used: aiResponse.usage.tokens_used,
            cost: aiResponse.usage.estimated_cost
          }

          get().addMessage(conversationId, aiMsg)

          // Save AI message to backend
          await apiClient.addMessage(conversationId, 'assistant', aiResponse.content)

          set({ isLoading: false })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error generating response:', error)
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        }
      },

      optimizePrompt: async (conversationId: string) => {
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (!conversation) {
          throw new Error('Conversation not found')
        }

        if (conversation.conversation_data.length === 0) {
          throw new Error('No messages to optimize')
        }

        set({ isLoading: true, error: null })

        try {
          const optimizationResult = await apiClient.optimizePrompt(
            conversation.conversation_data,
            conversation.user_id
          )

          // Update conversation with optimized prompt
          await get().updateConversation(conversationId, {
            generated_prompt: optimizationResult.optimized_prompt
          })

          set({ isLoading: false })
          return optimizationResult.optimized_prompt
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error('Error optimizing prompt:', error)
          set({ 
            error: errorMessage,
            isLoading: false 
          })
          throw error
        }
      }
    }),
    {
      name: 'conversation-store',
      // Only store essential state in localStorage
      partialize: (state) => ({
        currentConversation: state.currentConversation
      })
    }
  )
)

// Selectors for derived state
export const useConversationSelectors = () => {
  const store = useConversationStore()
  
  return {
    // Get conversations by category
    getConversationsByCategory: (category?: string) => {
      const { conversations } = store
      
      if (!category) {
        return conversations
      }
      
      return conversations.filter(conv => conv.category === category)
    },

    // Get conversation stats
    getConversationStats: () => {
      const { conversations } = store
      
      const totalConversations = conversations.length
      const totalMessages = conversations.reduce(
        (total, conv) => total + conv.conversation_data.length, 
        0
      )
      const categorizedConversations = conversations.reduce((acc, conv) => {
        const category = conv.category || 'uncategorized'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return {
        totalConversations,
        totalMessages,
        categorizedConversations
      }
    },

    // Get recent conversations
    getRecentConversations: (limit: number = 5) => {
      const { conversations } = store
      
      return conversations
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, limit)
    },

    // Check if conversation has unsaved changes
    hasUnsavedChanges: (conversationId: string) => {
      // This would compare local state with last saved state
      // For now, return false as we auto-save
      return false
    }
  }
}