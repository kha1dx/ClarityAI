import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ConversationMessage } from '@/lib/types'

export interface ChatMessage extends ConversationMessage {
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  isTyping?: boolean
  reactions?: string[]
  isStarred?: boolean
}

export interface ChatConversation {
  id: string
  title: string
  user_id: string
  category?: string
  created_at: string
  updated_at: string
  conversation_data: ConversationMessage[]
  generated_prompt?: string | null
  is_template?: boolean
  unreadCount: number
  isStarred: boolean
  isArchived: boolean
  lastMessage?: ChatMessage
  tags: string[]
}

export interface UIState {
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  searchQuery: string
  activeTab: 'all' | 'archived' | 'starred'
  isMobile: boolean
  isTyping: boolean
  typingUsers: string[]
}

interface ChatStore {
  // Core state
  conversations: ChatConversation[]
  activeConversationId: string | null
  messages: Record<string, ChatMessage[]>
  uiState: UIState
  
  // Loading states
  isLoadingConversations: boolean
  isLoadingMessages: boolean
  isSendingMessage: boolean
  
  // Actions
  setConversations: (conversations: ChatConversation[]) => void
  setActiveConversation: (id: string | null) => void
  loadMessagesForConversation: (conversationId: string) => Promise<void>
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void
  setMessages: (conversationId: string, messages: ChatMessage[]) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  starMessage: (conversationId: string, messageId: string) => void
  
  // Conversation actions
  createConversation: (conversation: ChatConversation) => void
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void
  deleteConversation: (id: string) => void
  starConversation: (id: string) => void
  archiveConversation: (id: string) => void
  markAsRead: (id: string) => void
  
  // UI actions
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: 'all' | 'archived' | 'starred') => void
  setIsMobile: (isMobile: boolean) => void
  setTyping: (isTyping: boolean, users?: string[]) => void
  
  // Computed getters
  getActiveConversation: () => ChatConversation | null
  getActiveMessages: () => ChatMessage[]
  getFilteredConversations: () => ChatConversation[]
  
  // Loading states
  setLoadingConversations: (loading: boolean) => void
  setLoadingMessages: (loading: boolean) => void
  setSendingMessage: (sending: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      activeConversationId: null,
      messages: {},
      uiState: {
        leftSidebarOpen: true,
        rightSidebarOpen: true,
        searchQuery: '',
        activeTab: 'all',
        isMobile: false,
        isTyping: false,
        typingUsers: []
      },
      
      isLoadingConversations: false,
      isLoadingMessages: false,
      isSendingMessage: false,
      
      // Actions
      setConversations: (conversations) => set({ conversations }),
      
      // Load messages for active conversation when it changes
      loadMessagesForConversation: async (conversationId: string) => {
        const state = get()
        if (state.messages[conversationId]) {
          // Messages already loaded for this conversation
          return
        }
        
        state.setLoadingMessages(true)
        try {
          const response = await fetch(`/api/conversations/${conversationId}/messages`)
          const data = await response.json()
          
          if (data.success && data.data) {
            const chatMessages = data.data.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: msg.created_at || msg.timestamp,
              status: 'sent' as const
            }))
            state.setMessages(conversationId, chatMessages)
          } else {
            state.setMessages(conversationId, [])
          }
        } catch (error) {
          console.error('Error loading messages:', error)
          state.setMessages(conversationId, [])
        } finally {
          state.setLoadingMessages(false)
        }
      },
      
      setActiveConversation: (id) => {
        const state = get()
        set({ 
          activeConversationId: id,
          uiState: { 
            ...state.uiState,
            // Auto-collapse sidebars on mobile when selecting conversation
            leftSidebarOpen: state.uiState.isMobile ? false : state.uiState.leftSidebarOpen
          }
        })
        
        // Auto-load messages for the selected conversation
        if (id && !state.messages[id]) {
          state.loadMessagesForConversation(id)
        }
      },
      
      addMessage: (conversationId, message) => set((state) => {
        const currentMessages = state.messages[conversationId] || []
        const newMessages = {
          ...state.messages,
          [conversationId]: [...currentMessages, message]
        }
        
        // Update conversation's last message and unread count
        const conversations = state.conversations.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: message,
              unreadCount: message.role === 'assistant' ? conv.unreadCount + 1 : conv.unreadCount,
              updated_at: message.timestamp
            }
          }
          return conv
        })
        
        return {
          messages: newMessages,
          conversations
        }
      }),
      
      updateMessage: (conversationId, messageId, updates) => set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(msg =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ) || []
        }
      })),

      setMessages: (conversationId, messages) => set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages
        }
      })),
      
      deleteMessage: (conversationId, messageId) => set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.filter(msg => msg.id !== messageId) || []
        }
      })),
      
      starMessage: (conversationId, messageId) => set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId]?.map(msg =>
            msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
          ) || []
        }
      })),
      
      createConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations]
      })),
      
      updateConversation: async (id, updates) => {
        // Get current user ID from existing conversation
        const currentConv = get().conversations.find(conv => conv.id === id)
        if (!currentConv || !currentConv.user_id) {
          console.error('Cannot update conversation: no user ID found')
          return
        }
        const userId = currentConv.user_id
        
        // Optimistic update - update local state immediately
        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, ...updates } : conv
          )
        }))

        try {
          // Make API call to persist the changes
          const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
          })

          if (!response.ok) {
            throw new Error('Failed to update conversation')
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to update conversation')
          }

          // Update with server response to ensure consistency
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === id ? { ...conv, ...result.data } : conv
            )
          }))
        } catch (error) {
          console.error('Error updating conversation:', error)
          
          // Rollback optimistic update on error
          set((state) => ({
            conversations: state.conversations.map(conv => {
              if (conv.id === id) {
                // Remove the optimistic updates by reverting each key
                const reverted = { ...conv }
                Object.keys(updates).forEach(key => {
                  // This is a simple revert - in a real app you'd want to store the previous state
                  if (key === 'title') reverted.title = 'Failed to update'
                  if (key === 'isStarred') reverted.isStarred = !updates.isStarred
                  if (key === 'isArchived') reverted.isArchived = !updates.isArchived
                })
                return reverted
              }
              return conv
            })
          }))
          
          // Could also show a toast notification here
          console.warn('Failed to update conversation, changes reverted')
        }
      },
      
      deleteConversation: async (id) => {
        // Get current user ID from existing conversation
        const currentConv = get().conversations.find(conv => conv.id === id)
        if (!currentConv || !currentConv.user_id) {
          console.error('Cannot delete conversation: no user ID found')
          return
        }
        const userId = currentConv.user_id
        
        // Store the conversation for potential rollback
        const conversationToDelete = get().conversations.find(conv => conv.id === id)
        const messagesToRestore = get().messages[id] || []
        
        // Optimistic update - remove from local state immediately
        set((state) => {
          const { [id]: deleted, ...remainingMessages } = state.messages
          return {
            conversations: state.conversations.filter(conv => conv.id !== id),
            messages: remainingMessages,
            activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
          }
        })

        try {
          // Make API call to delete on server
          const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            throw new Error('Failed to delete conversation')
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to delete conversation')
          }

          // Successfully deleted, no need to update state (already removed optimistically)
        } catch (error) {
          console.error('Error deleting conversation:', error)
          
          // Rollback optimistic delete on error
          if (conversationToDelete) {
            set((state) => ({
              conversations: [...state.conversations, conversationToDelete].sort((a, b) => 
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              ),
              messages: {
                ...state.messages,
                [id]: messagesToRestore
              },
              activeConversationId: state.activeConversationId || id
            }))
          }
          
          // Could also show a toast notification here
          console.warn('Failed to delete conversation, changes reverted')
        }
      },
      
      starConversation: async (id) => {
        // Get current user ID from existing conversation
        const currentConv = get().conversations.find(conv => conv.id === id)
        if (!currentConv || !currentConv.user_id) {
          console.error('Cannot star conversation: no user ID found')
          return
        }
        const userId = currentConv.user_id
        
        // Get current state to determine the new starred state
        const newIsStarred = !currentConv?.isStarred
        
        // Optimistic update - update local state immediately
        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, isStarred: newIsStarred } : conv
          )
        }))

        try {
          // Make API call to persist the star/unstar using the main conversation endpoint
          const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_starred: newIsStarred })
          })

          if (!response.ok) {
            throw new Error('Failed to star/unstar conversation')
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to star/unstar conversation')
          }

          // Update with server response to ensure consistency, mapping database fields to frontend fields
          const updatedConv = result.data
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === id ? { 
                ...conv, 
                isStarred: updatedConv.is_starred,
                isArchived: updatedConv.is_archived,
                updated_at: updatedConv.updated_at
              } : conv
            )
          }))
        } catch (error) {
          console.error('Error starring conversation:', error)
          
          // Rollback optimistic update on error
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === id ? { ...conv, isStarred: !newIsStarred } : conv
            )
          }))
          
          // Could also show a toast notification here
          console.warn('Failed to star/unstar conversation, changes reverted')
        }
      },
      
      archiveConversation: async (id) => {
        // Get current user ID from existing conversation
        const currentConv = get().conversations.find(conv => conv.id === id)
        if (!currentConv || !currentConv.user_id) {
          console.error('Cannot archive conversation: no user ID found')
          return
        }
        const userId = currentConv.user_id
        
        // Get current state to determine the new archived state
        const newIsArchived = !currentConv?.isArchived
        
        // Optimistic update - update local state immediately
        set((state) => ({
          conversations: state.conversations.map(conv =>
            conv.id === id ? { ...conv, isArchived: newIsArchived } : conv
          )
        }))

        try {
          // Make API call to persist the archive/unarchive using the main conversation endpoint
          const response = await fetch(`/api/conversations/${id}?userId=${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ is_archived: newIsArchived })
          })

          if (!response.ok) {
            throw new Error('Failed to archive/unarchive conversation')
          }

          const result = await response.json()
          if (!result.success) {
            throw new Error(result.error?.message || 'Failed to archive/unarchive conversation')
          }

          // Update with server response to ensure consistency, mapping database fields to frontend fields
          const updatedConv = result.data
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === id ? { 
                ...conv, 
                isStarred: updatedConv.is_starred,
                isArchived: updatedConv.is_archived,
                updated_at: updatedConv.updated_at
              } : conv
            )
          }))
        } catch (error) {
          console.error('Error archiving conversation:', error)
          
          // Rollback optimistic update on error
          set((state) => ({
            conversations: state.conversations.map(conv =>
              conv.id === id ? { ...conv, isArchived: !newIsArchived } : conv
            )
          }))
          
          // Could also show a toast notification here
          console.warn('Failed to archive/unarchive conversation, changes reverted')
        }
      },
      
      markAsRead: (id) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, unreadCount: 0 } : conv
        )
      })),
      
      // UI actions
      toggleLeftSidebar: () => set((state) => ({
        uiState: {
          ...state.uiState,
          leftSidebarOpen: !state.uiState.leftSidebarOpen
        }
      })),
      
      toggleRightSidebar: () => set((state) => ({
        uiState: {
          ...state.uiState,
          rightSidebarOpen: !state.uiState.rightSidebarOpen
        }
      })),
      
      setSearchQuery: (query) => set((state) => ({
        uiState: { ...state.uiState, searchQuery: query }
      })),
      
      setActiveTab: (tab) => set((state) => ({
        uiState: { ...state.uiState, activeTab: tab }
      })),
      
      setIsMobile: (isMobile) => set((state) => ({
        uiState: { 
          ...state.uiState, 
          isMobile,
          // Auto-adjust sidebars for mobile
          rightSidebarOpen: isMobile ? false : state.uiState.rightSidebarOpen
        }
      })),
      
      setTyping: (isTyping, users = []) => set((state) => ({
        uiState: {
          ...state.uiState,
          isTyping,
          typingUsers: users
        }
      })),
      
      // Loading states
      setLoadingConversations: (loading) => set({ isLoadingConversations: loading }),
      setLoadingMessages: (loading) => set({ isLoadingMessages: loading }),
      setSendingMessage: (sending) => set({ isSendingMessage: sending }),
      
      // Computed getters
      getActiveConversation: () => {
        const state = get()
        return state.conversations.find(conv => conv.id === state.activeConversationId) || null
      },
      
      getActiveMessages: () => {
        const state = get()
        return state.activeConversationId ? state.messages[state.activeConversationId] || [] : []
      },
      
      getFilteredConversations: () => {
        const state = get()
        const { searchQuery, activeTab } = state.uiState
        
        let filtered = state.conversations
        
        // Filter by tab
        switch (activeTab) {
          case 'archived':
            filtered = filtered.filter(conv => conv.isArchived)
            break
          case 'starred':
            filtered = filtered.filter(conv => conv.isStarred)
            break
          case 'all':
          default:
            filtered = filtered.filter(conv => !conv.isArchived)
            break
        }
        
        // Filter by search query
        if (searchQuery && searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(conv =>
            conv.title.toLowerCase().includes(query) ||
            conv.lastMessage?.content.toLowerCase().includes(query) ||
            conv.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }
        
        // Sort by last message time
        return filtered.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        uiState: {
          // Don't persist leftSidebarOpen - always start with true for desktop
          rightSidebarOpen: state.uiState.rightSidebarOpen,
          activeTab: state.uiState.activeTab
        }
      })
    }
  )
)