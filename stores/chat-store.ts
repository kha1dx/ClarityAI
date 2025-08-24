import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { 
  ChatStore, 
  ChatMessage, 
  ChatConversation, 
  UIState 
} from '@/lib/types'

interface ChatStoreState extends ChatStore {}

const initialUIState: UIState = {
  isSidebarOpen: true,
  isMobileMenuOpen: false,
  isSettingsOpen: false,
  searchQuery: '',
  activeTab: 'all',
  isLoading: false,
  error: null
}

export const useChatStore = create<ChatStoreState>()(
  devtools(
    (set, get) => ({
      // State
      conversations: [],
      messages: {},
      currentConversationId: null,
      uiState: initialUIState,

      // Conversation Actions
      addConversation: (conversation: ChatConversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          messages: {
            ...state.messages,
            [conversation.id]: conversation.messages || []
          }
        }), false, 'addConversation')
      },

      updateConversation: (id: string, updates: Partial<ChatConversation>) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, ...updates } : conv
          )
        }), false, 'updateConversation')
      },

      deleteConversation: (id: string) => {
        set((state) => {
          const newMessages = { ...state.messages }
          delete newMessages[id]
          
          return {
            conversations: state.conversations.filter((conv) => conv.id !== id),
            messages: newMessages,
            currentConversationId: state.currentConversationId === id ? null : state.currentConversationId
          }
        }, false, 'deleteConversation')
      },

      setCurrentConversation: (id: string | null) => {
        set({ currentConversationId: id }, false, 'setCurrentConversation')
      },

      // Message Actions
      addMessage: (conversationId: string, message: ChatMessage) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] || []), message]
          }
        }), false, 'addMessage')

        // Update conversation's last message and unread count
        const conversation = get().conversations.find(c => c.id === conversationId)
        if (conversation) {
          const isCurrentConversation = get().currentConversationId === conversationId
          const unreadIncrement = !isCurrentConversation && message.role === 'assistant' ? 1 : 0
          
          get().updateConversation(conversationId, {
            lastMessage: message,
            unreadCount: (conversation.unreadCount || 0) + unreadIncrement
          })
        }
      },

      updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            )
          }
        }), false, 'updateMessage')
      },

      deleteMessage: (conversationId: string, messageId: string) => {
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: (state.messages[conversationId] || []).filter(
              (msg) => msg.id !== messageId
            )
          }
        }), false, 'deleteMessage')
      },

      // UI Actions
      toggleSidebar: () => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isSidebarOpen: !state.uiState.isSidebarOpen
          }
        }), false, 'toggleSidebar')
      },

      setSearchQuery: (query: string) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            searchQuery: query
          }
        }), false, 'setSearchQuery')
      },

      setActiveTab: (tab: string) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            activeTab: tab
          }
        }), false, 'setActiveTab')
      },

      setLoading: (loading: boolean) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            isLoading: loading
          }
        }), false, 'setLoading')
      },

      setError: (error: string | null) => {
        set((state) => ({
          uiState: {
            ...state.uiState,
            error
          }
        }), false, 'setError')
      }
    }),
    {
      name: 'chat-store',
      // Only store essential state in localStorage
      partialize: (state) => ({
        uiState: {
          isSidebarOpen: state.uiState.isSidebarOpen,
          activeTab: state.uiState.activeTab
        }
      })
    }
  )
)

// Selectors for derived state
export const useChatSelectors = () => {
  const store = useChatStore()
  
  return {
    // Get filtered conversations based on search and active tab
    filteredConversations: () => {
      const { conversations, uiState } = store
      const { searchQuery, activeTab } = uiState
      
      let filtered = conversations
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(conv => 
          conv.title.toLowerCase().includes(query) ||
          (conv.lastMessage?.content.toLowerCase().includes(query))
        )
      }
      
      // Filter by active tab
      switch (activeTab) {
        case 'starred':
          filtered = filtered.filter(conv => conv.isStarred)
          break
        case 'archived':
          filtered = filtered.filter(conv => conv.isArchived)
          break
        case 'unread':
          filtered = filtered.filter(conv => (conv.unreadCount || 0) > 0)
          break
        case 'all':
        default:
          filtered = filtered.filter(conv => !conv.isArchived)
          break
      }
      
      return filtered
    },

    // Get current conversation with messages
    currentConversationWithMessages: () => {
      const { conversations, messages, currentConversationId } = store
      
      if (!currentConversationId) return null
      
      const conversation = conversations.find(c => c.id === currentConversationId)
      if (!conversation) return null
      
      return {
        ...conversation,
        messages: messages[currentConversationId] || []
      }
    },

    // Get total unread count
    totalUnreadCount: () => {
      const { conversations } = store
      return conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0)
    },

    // Get typing indicators for a conversation
    getTypingIndicators: (conversationId: string) => {
      const { messages } = store
      const conversationMessages = messages[conversationId] || []
      return conversationMessages.filter(msg => msg.isTyping)
    }
  }
}