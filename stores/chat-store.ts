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
      
      setActiveConversation: (id) => set({ 
        activeConversationId: id,
        uiState: { 
          ...get().uiState,
          // Auto-collapse sidebars on mobile when selecting conversation
          leftSidebarOpen: get().uiState.isMobile ? false : get().uiState.leftSidebarOpen
        }
      }),
      
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
      
      updateConversation: (id, updates) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, ...updates } : conv
        )
      })),
      
      deleteConversation: (id) => set((state) => {
        const { [id]: deleted, ...remainingMessages } = state.messages
        return {
          conversations: state.conversations.filter(conv => conv.id !== id),
          messages: remainingMessages,
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId
        }
      }),
      
      starConversation: (id) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, isStarred: !conv.isStarred } : conv
        )
      })),
      
      archiveConversation: (id) => set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === id ? { ...conv, isArchived: !conv.isArchived } : conv
        )
      })),
      
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