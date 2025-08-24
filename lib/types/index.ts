// Re-export database types
export type { 
  Database, 
  Profile, 
  ProfileInsert, 
  ProfileUpdate,
  Conversation,
  ConversationInsert,
  ConversationUpdate,
  Message,
  MessageInsert,
  MessageUpdate,
  PromptResult,
  PromptResultInsert,
  PromptResultUpdate,
  MessageRole,
  ConversationWithMessages,
  ConversationWithPromptResults,
  ConversationComplete,
  ProfileWithConversations
} from '@/types/database'

// Enhanced conversation message interface
export interface ConversationMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  tokens_used?: number
  cost?: number
  is_starred?: boolean
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  isTyping?: boolean
  reactions?: string[]
}

// Extended prompt conversation interface
export interface PromptConversation {
  id: string
  user_id: string
  title: string
  conversation_data: ConversationMessage[]
  generated_prompt?: string
  category?: string
  tags?: string[]
  is_template: boolean
  created_at: string
  updated_at: string
  unreadCount?: number
  isStarred?: boolean
  isArchived?: boolean
  lastMessage?: ConversationMessage
}

// Chat message interface extending the base message
export interface ChatMessage extends ConversationMessage {
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  isTyping?: boolean
  reactions?: string[]
  isStarred?: boolean
}

// Chat conversation interface extending the base conversation
export interface ChatConversation extends Conversation {
  messages?: ChatMessage[]
  unreadCount?: number
  isStarred?: boolean
  isArchived?: boolean
  lastMessage?: ChatMessage
  tags?: string[]
}

// Usage tracking interfaces
export interface UsageLog {
  id: string
  user_id: string
  action: string
  tokens_used: number
  cost: number
  timestamp: string
  metadata?: Record<string, any>
}

export interface UsageLimit {
  id: string
  user_id: string
  limit_type: 'requests' | 'tokens' | 'cost'
  limit_value: number
  current_usage: number
  period: 'daily' | 'weekly' | 'monthly'
  reset_at: string
}

// Prompt template interfaces
export interface PromptTemplate {
  id: string
  user_id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  is_public: boolean
  usage_count: number
  created_at: string
  updated_at: string
}

// AI optimization interfaces
export interface PromptOptimizationRequest {
  conversation_history: ConversationMessage[]
  user_id: string
  optimization_type?: 'clarity' | 'effectiveness' | 'conciseness'
}

export interface PromptOptimizationResponse {
  original_prompt: string
  optimized_prompt: string
  improvements: string[]
  confidence_score: number
  tokens_used: number
  cost: number
}

// Subscription and billing interfaces
export interface SubscriptionTier {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  limits: {
    requests_per_month: number
    tokens_per_month: number
    conversations: number
  }
}

// API response interfaces
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    details?: any
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
    has_more?: boolean
  }
}

// AI service interfaces
export interface AIModelConfig {
  model: string
  temperature: number
  max_tokens: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface AIUsageStats {
  tokens_used: number
  estimated_cost: number
  model_used: string
  processing_time_ms: number
}

// UI State interface
export interface UIState {
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  isSettingsOpen: boolean
  searchQuery: string
  activeTab: string
  isLoading: boolean
  error: string | null
}

// Store interfaces for Zustand
export interface ChatStore {
  // State
  conversations: ChatConversation[]
  messages: Record<string, ChatMessage[]>
  currentConversationId: string | null
  uiState: UIState
  
  // Actions
  addConversation: (conversation: ChatConversation) => void
  updateConversation: (id: string, updates: Partial<ChatConversation>) => void
  deleteConversation: (id: string) => void
  setCurrentConversation: (id: string | null) => void
  
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void
  deleteMessage: (conversationId: string, messageId: string) => void
  
  toggleSidebar: () => void
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export interface ConversationStore {
  // State
  conversations: PromptConversation[]
  currentConversation: PromptConversation | null
  isLoading: boolean
  error: string | null
  
  // Actions
  loadConversations: (userId: string) => Promise<void>
  createConversation: (title: string, userId: string) => Promise<PromptConversation>
  updateConversation: (id: string, updates: Partial<PromptConversation>) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  setCurrentConversation: (conversation: PromptConversation | null) => void
  
  addMessage: (conversationId: string, message: ConversationMessage) => void
  generateResponse: (conversationId: string, userMessage: string) => Promise<void>
  optimizePrompt: (conversationId: string) => Promise<string>
}

// Validation schemas (types for runtime validation)
export interface CreateConversationRequest {
  title: string
  userId: string
  category?: string
}

export interface CreateMessageRequest {
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  tokensUsed?: number
  cost?: number
}

export interface GenerateAIRequest {
  conversationHistory: ConversationMessage[]
  userId: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface OptimizePromptRequest {
  conversationHistory: ConversationMessage[]
  userId: string
  optimizationType?: 'clarity' | 'effectiveness' | 'conciseness'
}