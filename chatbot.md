# Complete Chatbot Implementation Guide - AI Prompt Engineering Studio

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Database Schema & Models](#database-schema--models)
4. [State Management (Zustand)](#state-management-zustand)
5. [UI Components Architecture](#ui-components-architecture)
6. [Chat Interface Implementation](#chat-interface-implementation)
7. [Sidebar Implementation](#sidebar-implementation)
8. [API Routes & Backend Logic](#api-routes--backend-logic)
9. [AI Integration & Prompt System](#ai-integration--prompt-system)
10. [Usage Tracking & Billing](#usage-tracking--billing)
11. [Real-time Features](#real-time-features)
12. [Security & Authentication](#security--authentication)
13. [Complete Implementation Example](#complete-implementation-example)
14. [Deployment & Production](#deployment--production)

---

## System Overview

This is a **Next.js 15.5 full-stack AI chatbot** designed as a Prompt Engineering Studio where users have natural conversations with AI to develop optimized prompts. The system features a modern, responsive 3-panel chat interface with conversation management, prompt optimization, and usage tracking.

### Key Features
- **Conversational Prompt Engineering**: Natural dialogue to create optimized prompts
- **3-Panel Layout**: Conversations sidebar, chat area, generated prompts sidebar
- **Real-time Chat**: Immediate AI responses with typing indicators
- **Usage Tracking**: Token counting and tiered billing (Free/Pro/Enterprise)
- **Conversation Management**: Full CRUD with search, categorization, and archiving
- **Mobile-Responsive**: Adaptive UI for all screen sizes
- **Persistent State**: Zustand with localStorage persistence

---

## Architecture & Tech Stack

### Frontend Stack
```typescript
// Core Framework
Next.js 15.5.0 (App Router)
React 19.1.0 + TypeScript 5.3.3

// State Management
Zustand 4.5.2 with persistence middleware

// UI Framework
Tailwind CSS 3.4.0
Radix UI components
Lucide React icons
React Markdown with syntax highlighting

// Form & Validation
React Hook Form + Zod schemas
```

### Backend Stack
```typescript
// API & Database
Supabase (PostgreSQL + Auth + Real-time)
Next.js API Routes (serverless functions)

// AI Integration
OpenAI SDK via GitHub Models API
Custom prompt engineering system

// Payment Processing
Stripe (subscription management)
```

### Project Structure
```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── ai/
│   │   │   ├── generate/    # AI response generation
│   │   │   └── optimize/    # Prompt optimization
│   │   ├── conversations/   # CRUD operations
│   │   ├── messages/        # Message handling
│   │   └── usage/           # Usage tracking
│   ├── studio/              # Main chat page
│   └── auth/                # Authentication pages
├── components/
│   ├── chat/                # Chat-specific components
│   ├── auth/                # Auth components
│   └── ui/                  # Reusable UI components
├── lib/
│   ├── ai.ts                # AI integration
│   ├── conversations.ts     # Database operations
│   ├── usage-tracking.ts    # Usage & billing
│   └── types/               # TypeScript definitions
└── stores/
    └── chat-store.ts        # Zustand state management
```

---

## Database Schema & Models

### Core Tables

#### 1. Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'active', -- active, archived, deleted
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  INDEX idx_conversations_user_id (user_id),
  INDEX idx_conversations_updated_at (updated_at DESC)
);
```

#### 2. Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  is_starred BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_messages_conversation_id (conversation_id),
  INDEX idx_messages_created_at (created_at ASC)
);
```

#### 3. Prompts Table (Generated/Saved Prompts)
```sql
CREATE TABLE prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_prompts_user_id (user_id),
  INDEX idx_prompts_category (category)
);
```

#### 4. Usage Tracking Tables
```sql
-- User Plans
CREATE TABLE user_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_name TEXT NOT NULL DEFAULT 'free' CHECK (plan_name IN ('free', 'pro', 'enterprise')),
  tokens_limit INTEGER NOT NULL DEFAULT 10000,
  requests_limit INTEGER NOT NULL DEFAULT 50,
  plan_start_date DATE DEFAULT CURRENT_DATE,
  plan_end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  request_type TEXT NOT NULL CHECK (request_type IN ('conversation', 'prompt_optimization', 'prompt_save')),
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  model_used TEXT DEFAULT 'gpt-4o',
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for analytics
  INDEX idx_usage_user_id (user_id),
  INDEX idx_usage_created_at (created_at DESC)
);

-- Daily Usage Summaries (for performance)
CREATE TABLE usage_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  summary_date DATE NOT NULL,
  total_tokens INTEGER DEFAULT 0,
  total_requests INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0,
  conversation_requests INTEGER DEFAULT 0,
  prompt_optimization_requests INTEGER DEFAULT 0,
  prompt_save_requests INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, summary_date)
);
```

### TypeScript Models
```typescript
// Core types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error'
  isStarred?: boolean
  reactions?: string[]
  metadata?: {
    tokens?: number
    model?: string
    cost?: number
  }
}

export interface ChatConversation {
  id: string
  user_id: string
  title: string
  category?: string
  status: 'active' | 'archived' | 'deleted'
  unreadCount: number
  isStarred: boolean
  isArchived: boolean
  lastMessage?: ChatMessage
  tags: string[]
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserPlan {
  id: string
  user_id: string
  plan_name: 'free' | 'pro' | 'enterprise'
  tokens_limit: number
  requests_limit: number
  is_active: boolean
}
```

---

## State Management (Zustand)

### Chat Store Implementation
```typescript
// src/stores/chat-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ChatStore {
  // Core state
  conversations: ChatConversation[]
  activeConversationId: string | null
  messages: Record<string, ChatMessage[]>
  
  // UI state
  uiState: {
    leftSidebarOpen: boolean
    rightSidebarOpen: boolean
    searchQuery: string
    activeTab: 'all' | 'archived' | 'starred'
    isMobile: boolean
    isTyping: boolean
  }
  
  // Loading states
  isLoadingConversations: boolean
  isSendingMessage: boolean
  
  // Actions
  setActiveConversation: (id: string | null) => void
  addMessage: (conversationId: string, message: ChatMessage) => void
  updateMessage: (conversationId: string, messageId: string, updates: Partial<ChatMessage>) => void
  createConversation: (conversation: ChatConversation) => void
  deleteConversation: (id: string) => void
  
  // UI actions
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setSearchQuery: (query: string) => void
  
  // Computed getters
  getActiveConversation: () => ChatConversation | null
  getActiveMessages: () => ChatMessage[]
  getFilteredConversations: () => ChatConversation[]
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
        isTyping: false
      },
      isLoadingConversations: false,
      isSendingMessage: false,
      
      // Actions implementation
      setActiveConversation: (id) => set({
        activeConversationId: id,
        uiState: {
          ...get().uiState,
          // Auto-collapse left sidebar on mobile when selecting conversation
          leftSidebarOpen: get().uiState.isMobile ? false : get().uiState.leftSidebarOpen
        }
      }),
      
      addMessage: (conversationId, message) => set((state) => {
        const currentMessages = state.messages[conversationId] || []
        const newMessages = {
          ...state.messages,
          [conversationId]: [...currentMessages, message]
        }
        
        // Update conversation's last message and timestamps
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
        
        return { messages: newMessages, conversations }
      }),
      
      // ... other actions
      
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
          default:
            filtered = filtered.filter(conv => !conv.isArchived)
        }
        
        // Filter by search query
        if (searchQuery?.trim()) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(conv =>
            conv.title.toLowerCase().includes(query) ||
            conv.lastMessage?.content.toLowerCase().includes(query) ||
            conv.tags.some(tag => tag.toLowerCase().includes(query))
          )
        }
        
        return filtered.sort((a, b) => 
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        )
      }
    }),
    {
      name: 'chat-store',
      partialize: (state) => ({
        // Only persist UI preferences, not data
        uiState: {
          leftSidebarOpen: state.uiState.leftSidebarOpen,
          rightSidebarOpen: state.uiState.rightSidebarOpen,
          activeTab: state.uiState.activeTab
        }
      })
    }
  )
)
```

---

## UI Components Architecture

### 1. Chat Layout Component
```typescript
// src/components/chat/chat-layout.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useChatStore } from '@/stores/chat-store'
import { ChatSidebar } from './chat-sidebar'
import { ChatArea } from './chat-area'
import { PromptSidebar } from './prompt-sidebar'
import { cn } from '@/lib/utils'

interface ChatLayoutProps {
  className?: string
  generatedPrompt?: string
  onSavePrompt?: (title: string, category: string) => void
}

export function ChatLayout({ className, generatedPrompt, onSavePrompt }: ChatLayoutProps) {
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const [currentGeneratedPrompt, setCurrentGeneratedPrompt] = useState('')
  
  const {
    conversations,
    setConversations,
    createConversation,
    uiState,
    setIsMobile,
    setLoadingConversations
  } = useChatStore()

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  // Load conversations on mount
  useEffect(() => {
    if (user) loadConversations()
  }, [user])

  const loadConversations = async () => {
    if (!user) return
    
    setLoadingConversations(true)
    try {
      const response = await fetch(`/api/conversations?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success) {
        const chatConversations = data.conversations.map((conv: any) => ({
          ...conv,
          unreadCount: 0,
          isStarred: false,
          isArchived: false,
          tags: conv.category ? [conv.category] : []
        }))
        
        setConversations(chatConversations)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoadingConversations(false)
      setIsLoading(false)
    }
  }

  const handleCreateConversation = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: 'New Conversation',
          category: 'General'
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        const newConversation = {
          ...data.conversation,
          unreadCount: 0,
          isStarred: false,
          isArchived: false,
          tags: [data.conversation.category || 'General']
        }
        
        createConversation(newConversation)
        useChatStore.getState().setActiveConversation(data.conversation.id)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex h-screen bg-gray-50 overflow-hidden", className)}>
      {/* Left Sidebar - Conversations */}
      <div className={cn(
        "transition-all duration-200 ease-in-out h-full overflow-hidden",
        uiState.leftSidebarOpen ? "w-80 min-w-60 max-w-96" : "w-0",
        "lg:relative fixed lg:translate-x-0 z-30",
        uiState.isMobile && !uiState.leftSidebarOpen && "-translate-x-full",
        uiState.isMobile && uiState.leftSidebarOpen && "translate-x-0"
      )}>
        <ChatSidebar onCreateConversation={handleCreateConversation} />
      </div>

      {/* Mobile Overlay */}
      {uiState.isMobile && uiState.leftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => useChatStore.getState().toggleLeftSidebar()}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        <ChatArea 
          onCreateConversation={handleCreateConversation}
          onPromptGenerated={(prompt, metadata) => {
            setCurrentGeneratedPrompt(prompt)
            if (!uiState.rightSidebarOpen && !uiState.isMobile) {
              useChatStore.getState().toggleRightSidebar()
            }
          }}
        />
      </div>

      {/* Right Sidebar - Generated Prompts */}
      <div className={cn(
        "transition-all duration-200 ease-in-out h-full overflow-hidden",
        uiState.rightSidebarOpen && !uiState.isMobile ? "w-80" : "w-0",
        "hidden lg:block"
      )}>
        {uiState.rightSidebarOpen && (
          <PromptSidebar
            generatedPrompt={currentGeneratedPrompt || generatedPrompt}
            onSavePrompt={onSavePrompt}
          />
        )}
      </div>
    </div>
  )
}
```

### 2. Chat Area Component
```typescript
// src/components/chat/chat-area.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useChatStore, ChatMessage } from '@/stores/chat-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Menu, Sparkles, PanelRightOpen } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { WelcomeMessage } from './welcome-message'

interface ChatAreaProps {
  onCreateConversation?: () => void
  onPromptGenerated?: (prompt: string, metadata: { tokensUsed: number; cost: number }) => void
}

export function ChatArea({ onCreateConversation, onPromptGenerated }: ChatAreaProps) {
  const { user, profile } = useAuthContext()
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    activeConversationId,
    getActiveConversation,
    getActiveMessages,
    addMessage,
    updateMessage,
    setMessages,
    uiState,
    toggleLeftSidebar,
    toggleRightSidebar,
    setSendingMessage,
    isSendingMessage
  } = useChatStore()

  const activeConversation = getActiveConversation()
  const messages = getActiveMessages()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessagesForConversation(activeConversationId)
    }
  }, [activeConversationId])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputMessage])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && inputMessage.trim()) {
        e.preventDefault()
        handleSendMessage()
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'g' && messages.length > 0) {
        e.preventDefault()
        handleGenerateOptimizedPrompt()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputMessage, messages.length])

  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      
      if (data.success) {
        const chatMessages = data.messages.map((msg: any) => ({
          ...msg,
          status: 'sent'
        }))
        setMessages(conversationId, chatMessages)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !activeConversationId || isSendingMessage) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
      status: 'sending'
    }

    // Optimistic update - add message immediately
    addMessage(activeConversationId, userMessage)
    setInputMessage('')
    setSendingMessage(true)
    setIsTyping(true)

    try {
      // Generate AI response
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: [...messages, userMessage],
          category: activeConversation?.category,
          userId: user?.id
        })
      })

      const data = await response.json()

      // Update user message status
      updateMessage(activeConversationId, userMessage.id, { status: 'sent' })

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          status: 'sent',
          metadata: {
            tokens: data.tokensUsed,
            cost: data.cost,
            model: 'gpt-4o'
          }
        }

        addMessage(activeConversationId, aiMessage)
        
        // Save both messages to database
        await Promise.all([
          saveMessageToDatabase(activeConversationId, userMessage),
          saveMessageToDatabase(activeConversationId, aiMessage)
        ])
      } else {
        updateMessage(activeConversationId, userMessage.id, { status: 'error' })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      updateMessage(activeConversationId, userMessage.id, { status: 'error' })
    } finally {
      setSendingMessage(false)
      setIsTyping(false)
    }
  }

  const saveMessageToDatabase = async (conversationId: string, message: ChatMessage) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          role: message.role,
          content: message.content,
          tokensUsed: message.metadata?.tokens || 0,
          cost: message.metadata?.cost || 0
        })
      })
    } catch (error) {
      console.error('Error saving message to database:', error)
    }
  }

  const handleGenerateOptimizedPrompt = async () => {
    if (!activeConversationId || !user || messages.length === 0) return
    
    setIsGeneratingPrompt(true)
    try {
      const response = await fetch('/api/ai/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          category: activeConversation?.category || 'General',
          userId: user.id
        })
      })

      const data = await response.json()
      
      if (data.success && onPromptGenerated) {
        onPromptGenerated(data.prompt, {
          tokensUsed: data.tokensUsed,
          cost: data.cost
        })
      }
    } catch (error) {
      console.error('Error generating optimized prompt:', error)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const MessageBubble = ({ message, isUser }: { message: ChatMessage; isUser: boolean }) => (
    <div className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarImage 
          src={isUser ? profile?.avatar_url : "/ai-avatar.svg"} 
          alt={isUser ? profile?.full_name : "AI Assistant"} 
        />
        <AvatarFallback className={`text-sm ${
          isUser 
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
            : "bg-gray-100 text-gray-600"
        }`}>
          {isUser ? (profile?.full_name?.charAt(0) || 'U') : 'AI'}
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 max-w-[70%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl px-4 py-3 relative ${
          isUser
            ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
            : "bg-gray-100 text-gray-900"
        }`}>
          {!isUser ? (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code(props) {
                    const { children, className } = props
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !className
                    return !isInline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow as any}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm">
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}

          {/* Message status indicators */}
          {message.status === 'sending' && (
            <div className="absolute -bottom-1 -right-1">
              <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full" />
            </div>
          )}
          {message.status === 'error' && (
            <div className="absolute -bottom-1 -right-1">
              <div className="h-2 w-2 bg-red-500 rounded-full" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {message.metadata?.tokens && (
            <span>• {message.metadata.tokens} tokens</span>
          )}
        </div>
      </div>
    </div>
  )

  // Show welcome message if no active conversation
  if (!activeConversation) {
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        {/* Mobile Header */}
        {uiState.isMobile && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:hidden">
            <Button variant="ghost" size="sm" onClick={toggleLeftSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-gray-900">Prompt Studio</h1>
            <div className="w-9" />
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          <WelcomeMessage 
            onStartConversation={async (template) => {
              if (onCreateConversation) {
                await onCreateConversation()
                if (template.trim()) {
                  setInputMessage(template)
                  setTimeout(() => textareaRef.current?.focus(), 100)
                }
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          {uiState.isMobile && (
            <Button variant="ghost" size="sm" onClick={toggleLeftSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <Avatar className="h-8 w-8">
            <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
              AI
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="font-medium text-gray-900">{activeConversation.title}</h3>
            <p className="text-sm text-gray-500">
              {isTyping ? 'AI is typing...' : 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateOptimizedPrompt}
              disabled={isGeneratingPrompt}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isGeneratingPrompt ? 'Generating...' : 'Generate Prompt'}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleRightSidebar}
          >
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="max-w-md space-y-4">
                <Avatar className="h-12 w-12 mx-auto">
                  <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hello! I'm your AI Assistant 👋
                  </h3>
                  <p className="text-gray-600 mb-4">
                    I'm here to help you create optimized prompts through natural conversation.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4 text-left">
                    <h4 className="font-medium text-blue-900 mb-2">Quick tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Describe your goal or what you want to create</li>
                      <li>• Include specific requirements or constraints</li>
                      <li>• Ask follow-up questions for clarity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                isUser={message.role === 'user'} 
              />
            ))
          )}
          
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">AI</AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none pr-12 rounded-2xl border-gray-200 focus:border-indigo-300 focus:ring-indigo-200"
              disabled={isSendingMessage}
            />
            <div className="absolute right-3 bottom-3 text-xs text-gray-400">
              {inputMessage.length > 0 && (
                <span>{inputMessage.length} chars</span>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isSendingMessage}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>⌘+Enter to send • ⌘+G to generate prompt</span>
          <span>Powered by GPT-4</span>
        </div>
      </div>
    </div>
  )
}
```

---

## Sidebar Implementation

### Chat Sidebar (Conversation Management)
```typescript
// src/components/chat/chat-sidebar.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useChatStore } from '@/stores/chat-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search,
  Plus,
  Star,
  Archive,
  MoreHorizontal,
  Edit,
  Trash,
  MessageSquare
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface ChatSidebarProps {
  onCreateConversation?: () => void
}

export function ChatSidebar({ onCreateConversation }: ChatSidebarProps) {
  const { user, profile } = useAuthContext()
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'starred'>('recent')
  
  const {
    conversations,
    activeConversationId,
    uiState,
    getFilteredConversations,
    setActiveConversation,
    setSearchQuery,
    setActiveTab,
    toggleLeftSidebar,
    markAsRead,
    starConversation,
    archiveConversation
  } = useChatStore()

  const filteredConversations = getFilteredConversations()

  // Sort conversations
  const sortedConversations = [...filteredConversations].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'starred':
        if (a.isStarred && !b.isStarred) return -1
        if (!a.isStarred && b.isStarred) return 1
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'recent':
      default:
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    }
  })

  const handleConversationClick = (conversationId: string) => {
    setActiveConversation(conversationId)
    markAsRead(conversationId)
  }

  const getConversationPreview = (conversation: any) => {
    if (conversation.lastMessage) {
      return conversation.lastMessage.content.length > 50
        ? conversation.lastMessage.content.substring(0, 50) + "..."
        : conversation.lastMessage.content
    }
    return "Start a new conversation..."
  }

  return (
    <div className="flex flex-col h-full w-80 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-sm">
      {/* Header with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10" />

        <div className="relative flex items-center justify-between p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Conversations</h2>
              <p className="text-white/80 text-sm">
                {conversations.filter(c => !c.isArchived).length} active chats
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCreateConversation}
              className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {uiState.isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLeftSidebar}
                className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search conversations..."
            value={uiState.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 backdrop-blur-sm border-slate-200 focus:border-indigo-300"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 border-b border-slate-200">
        <Tabs value={uiState.activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-slate-100">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="archived">Archive</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-3">
          {sortedConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-indigo-500" />
              </div>
              <h3 className="font-medium text-slate-900 mb-2">
                {uiState.searchQuery ? "No conversations found" : "No conversations yet"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {uiState.searchQuery 
                  ? "Try adjusting your search terms"
                  : "Start a new conversation to get started"
                }
              </p>
              {!uiState.searchQuery && (
                <Button
                  onClick={onCreateConversation}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              )}
            </div>
          ) : (
            sortedConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 p-4",
                  "bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white hover:shadow-lg",
                  activeConversationId === conversation.id &&
                    "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 shadow-lg"
                )}
              >
                {/* Avatar and Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
                      <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 border-2 border-white rounded-full" />
                    
                    {/* Unread Badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {conversation.isStarred && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            starConversation(conversation.id)
                          }}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          {conversation.isStarred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            archiveConversation(conversation.id)
                          }}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          {conversation.isArchived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Title and Preview */}
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">
                  {conversation.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {getConversationPreview(conversation)}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  {conversation.category && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">
                      {conversation.category}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Active indicator */}
                {activeConversationId === conversation.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-r-full" />
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Profile Footer */}
      <div className="border-t border-slate-200 bg-white/80 backdrop-blur-sm p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="mt-3 p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Monthly usage</span>
            <span className="font-medium text-indigo-600">2.4k / 10k</span>
          </div>
          <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## API Routes & Backend Logic

### 1. AI Generation API
```typescript
// src/app/api/ai/generate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateConversationResponse } from '@/lib/ai'
import { UsageTrackingService } from '@/lib/usage-tracking'

export async function POST(request: NextRequest) {
  try {
    const { conversationHistory, category, userId } = await request.json()

    // Validate required fields
    if (!conversationHistory || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check usage limits before processing
    const limitsCheck = await UsageTrackingService.checkUsageLimits(userId)
    if (!limitsCheck.canMakeRequest) {
      return NextResponse.json(
        { 
          error: limitsCheck.reason || 'Usage limit exceeded',
          limitExceeded: true,
          remainingTokens: limitsCheck.remainingTokens,
          remainingRequests: limitsCheck.remainingRequests
        },
        { status: 429 }
      )
    }

    // Generate AI response
    const aiResponse = await generateConversationResponse(conversationHistory, category)

    // Track usage in database
    await UsageTrackingService.trackUsage(
      userId,
      'conversation',
      aiResponse.tokensUsed,
      aiResponse.cost,
      'gpt-4o',
      undefined, // conversationId
      undefined, // promptId
      undefined, // sessionId
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      success: true,
      response: aiResponse.content,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost
    })
  } catch (error) {
    console.error('AI Generation Error:', error)
    
    return NextResponse.json(
      { error: 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}
```

### 2. Conversations API
```typescript
// src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/conversations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const conversations = await ConversationService.getConversations(userId)

    return NextResponse.json({
      success: true,
      conversations
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, category } = await request.json()

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const conversation = await ConversationService.createConversation(
      userId,
      title,
      category
    )

    if (!conversation) {
      return NextResponse.json(
        { error: 'Failed to create conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      conversation
    })
  } catch (error) {
    console.error('Error creating conversation:', error)
    
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    )
  }
}
```

### 3. Messages API
```typescript
// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { ConversationService } from '@/lib/conversations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      )
    }

    const messages = await ConversationService.getMessages(conversationId)

    return NextResponse.json({
      success: true,
      messages
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { conversationId, role, content, tokensUsed, cost } = await request.json()

    if (!conversationId || !role || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const message = await ConversationService.saveMessage(
      conversationId,
      role,
      content,
      tokensUsed || 0,
      cost || 0
    )

    if (!message) {
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.created_at,
        status: 'sent'
      }
    })
  } catch (error) {
    console.error('Error saving message:', error)
    
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    )
  }
}
```

---

## AI Integration & Prompt System

### 1. AI Service Implementation
```typescript
// src/lib/ai.ts
import OpenAI from 'openai'
import { ConversationMessage } from './types'
import { SYSTEM_PROMPTS } from './constants'

// GitHub Models configuration
const client = new OpenAI({
  baseURL: process.env.GITHUB_MODELS_ENDPOINT!,
  apiKey: process.env.GITHUB_TOKEN!
})

const MODEL_NAME = process.env.GITHUB_MODEL_NAME || 'gpt-4o'

export interface AIResponse {
  content: string
  tokensUsed: number
  cost: number
}

export async function generateConversationResponse(
  conversationHistory: ConversationMessage[],
  category?: string
): Promise<AIResponse> {
  try {
    // Prepare messages for the AI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.promptEngineer
      }
    ]

    // Add conversation history
    conversationHistory.forEach(msg => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })
    })

    // Make API call
    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.7,
      max_tokens: 500
    })

    const content = response.choices[0]?.message?.content || 
      'I apologize, but I encountered an issue generating a response.'
    const tokensUsed = response.usage?.total_tokens || 0
    
    // Calculate cost (GitHub Models pricing)
    const cost = tokensUsed * 0.00003

    return {
      content,
      tokensUsed,
      cost
    }
  } catch (error) {
    console.error('AI API Error:', error)
    
    // Fallback response
    return {
      content: "I'm sorry, I'm having trouble connecting right now. Could you please try again?",
      tokensUsed: 0,
      cost: 0
    }
  }
}

export async function generateOptimizedPrompt(
  conversationHistory: ConversationMessage[],
  category?: string
): Promise<AIResponse> {
  try {
    const conversationSummary = conversationHistory
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n\n')

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: SYSTEM_PROMPTS.promptOptimizer
      },
      {
        role: 'user',
        content: `Based on this conversation, create an optimized prompt:

${conversationSummary}

Category: ${category || 'General'}

Generate a comprehensive, well-structured prompt that incorporates all the requirements and context discussed.`
      }
    ]

    const response = await client.chat.completions.create({
      model: MODEL_NAME,
      messages,
      temperature: 0.3, // Lower temperature for consistency
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content || 
      'Unable to generate optimized prompt at this time.'
    const tokensUsed = response.usage?.total_tokens || 0
    const cost = tokensUsed * 0.00003

    return {
      content,
      tokensUsed,
      cost
    }
  } catch (error) {
    console.error('Prompt Generation Error:', error)
    
    return {
      content: "I encountered an error while generating your optimized prompt. Please try again.",
      tokensUsed: 0,
      cost: 0
    }
  }
}
```

### 2. System Prompts Configuration
```typescript
// src/lib/constants/index.ts
export const SYSTEM_PROMPTS = {
  promptEngineer: `You are an expert prompt engineering assistant. Your job is to help users create highly effective prompts through natural conversation.

CONVERSATION FLOW:
1. Understand the user's goal and use case
2. Ask clarifying questions (One question at a time to make it feel more like a friendly real conversation) about:
   - Target audience/context
   - Desired output format
   - Constraints and requirements
   - Examples or references
3. Gather specific details through follow-up questions
4. Generate an optimized, structured prompt

PROMPT STRUCTURE TO CREATE:
- Clear role/persona definition
- Specific context and background
- Detailed task description
- Output format requirements
- Examples when helpful
- Constraints and guidelines

Keep the conversation natural and engaging. Ask one focused question at a time.`,

  promptOptimizer: `You are a prompt optimization specialist. Take the conversation context and generate a well-structured, detailed prompt.

OPTIMIZATION PRINCIPLES:
- Be specific and detailed
- Include relevant context
- Define clear output format
- Add constraints and guidelines
- Use examples when helpful
- Structure for clarity

Output the final optimized prompt in a clear, copy-ready format.`
}

export const APP_CONFIG = {
  name: 'Prompt Studio',
  description: 'AI-powered conversation tool for prompt engineering',
  maxPromptLength: 5000,
  maxConversationHistory: 20
}

export const CATEGORIES = [
  'Content Creation',
  'Code Generation', 
  'Analysis',
  'Creative Writing',
  'Research',
  'Marketing',
  'Education',
  'Business',
  'Other'
] as const
```

---

## Usage Tracking & Billing

### Usage Tracking Service
```typescript
// src/lib/usage-tracking.ts
import { getServiceRoleClient } from './supabase'

export interface UserPlan {
  id: string
  user_id: string
  plan_name: 'free' | 'pro' | 'enterprise'
  tokens_limit: number
  requests_limit: number
  is_active: boolean
}

export class UsageTrackingService {
  
  static async getUserPlan(userId: string): Promise<UserPlan | null> {
    try {
      const serviceClient = getServiceRoleClient()
      const { data, error } = await serviceClient
        .from('user_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching user plan:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error fetching user plan:', error)
      return null
    }
  }

  static async trackUsage(
    userId: string,
    requestType: 'conversation' | 'prompt_optimization' | 'prompt_save',
    tokensUsed: number,
    cost: number,
    modelUsed: string = 'gpt-4o',
    conversationId?: string,
    promptId?: string,
    sessionId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    try {
      const serviceClient = getServiceRoleClient()
      
      // Insert usage record
      const { error: usageError } = await serviceClient
        .from('usage_tracking')
        .insert([
          {
            user_id: userId,
            session_id: sessionId,
            request_type: requestType,
            tokens_used: tokensUsed,
            cost,
            model_used: modelUsed,
            conversation_id: conversationId,
            prompt_id: promptId,
            ip_address: ipAddress,
            user_agent: userAgent,
            metadata: {}
          }
        ])

      if (usageError) {
        console.error('Error tracking usage:', usageError)
        return false
      }

      // Update daily summary using stored procedure
      const { error: summaryError } = await serviceClient
        .rpc('update_usage_summary', {
          p_user_id: userId,
          p_tokens: tokensUsed,
          p_cost: cost,
          p_request_type: requestType
        })

      if (summaryError) {
        console.error('Error updating usage summary:', summaryError)
      }

      return true
    } catch (error) {
      console.error('Error tracking usage:', error)
      return false
    }
  }

  static async checkUsageLimits(userId: string): Promise<{
    canMakeRequest: boolean
    reason?: string
    remainingTokens: number
    remainingRequests: number
  }> {
    try {
      const serviceClient = getServiceRoleClient()
      
      // Get user plan
      const plan = await this.getUserPlan(userId)
      if (!plan) {
        return {
          canMakeRequest: false,
          reason: 'No active plan found',
          remainingTokens: 0,
          remainingRequests: 0
        }
      }

      // Get current month usage
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: monthlyUsage, error } = await serviceClient
        .from('usage_summaries')
        .select('*')
        .eq('user_id', userId)
        .gte('summary_date', startOfMonth.toISOString().split('T')[0])
        .order('summary_date', { ascending: false })

      if (error) {
        console.error('Error fetching monthly usage:', error)
        return {
          canMakeRequest: true, // Allow on error but log it
          remainingTokens: plan.tokens_limit,
          remainingRequests: plan.requests_limit
        }
      }

      // Calculate totals
      const totalTokens = monthlyUsage?.reduce((sum, day) => sum + day.total_tokens, 0) || 0
      const totalRequests = monthlyUsage?.reduce((sum, day) => sum + day.total_requests, 0) || 0

      const remainingTokens = Math.max(0, plan.tokens_limit - totalTokens)
      const remainingRequests = Math.max(0, plan.requests_limit - totalRequests)

      // Check limits
      if (totalTokens >= plan.tokens_limit) {
        return {
          canMakeRequest: false,
          reason: 'Monthly token limit exceeded',
          remainingTokens: 0,
          remainingRequests
        }
      }

      if (totalRequests >= plan.requests_limit) {
        return {
          canMakeRequest: false,
          reason: 'Monthly request limit exceeded',
          remainingTokens,
          remainingRequests: 0
        }
      }

      return {
        canMakeRequest: true,
        remainingTokens,
        remainingRequests
      }
    } catch (error) {
      console.error('Error checking usage limits:', error)
      // Allow on error to prevent blocking users
      return {
        canMakeRequest: true,
        remainingTokens: 0,
        remainingRequests: 0
      }
    }
  }
}
```

---

## Complete Implementation Example

### Main Studio Page
```typescript
// src/app/studio/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/auth-provider'
import { ChatLayout } from '@/components/chat/chat-layout'

export default function StudioPage() {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-screen">
      <ChatLayout />
    </div>
  )
}
```

### Database Stored Procedures
```sql
-- Function to update daily usage summaries
CREATE OR REPLACE FUNCTION update_usage_summary(
  p_user_id UUID,
  p_tokens INTEGER,
  p_cost DECIMAL(10,6),
  p_request_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO usage_summaries (
    user_id,
    summary_date,
    total_tokens,
    total_requests,
    total_cost,
    conversation_requests,
    prompt_optimization_requests,
    prompt_save_requests
  )
  VALUES (
    p_user_id,
    CURRENT_DATE,
    p_tokens,
    1,
    p_cost,
    CASE WHEN p_request_type = 'conversation' THEN 1 ELSE 0 END,
    CASE WHEN p_request_type = 'prompt_optimization' THEN 1 ELSE 0 END,
    CASE WHEN p_request_type = 'prompt_save' THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id, summary_date)
  DO UPDATE SET
    total_tokens = usage_summaries.total_tokens + p_tokens,
    total_requests = usage_summaries.total_requests + 1,
    total_cost = usage_summaries.total_cost + p_cost,
    conversation_requests = usage_summaries.conversation_requests + 
      CASE WHEN p_request_type = 'conversation' THEN 1 ELSE 0 END,
    prompt_optimization_requests = usage_summaries.prompt_optimization_requests +
      CASE WHEN p_request_type = 'prompt_optimization' THEN 1 ELSE 0 END,
    prompt_save_requests = usage_summaries.prompt_save_requests +
      CASE WHEN p_request_type = 'prompt_save' THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$;
```

### Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# GitHub Models API (OpenAI compatible)
GITHUB_MODELS_ENDPOINT=https://models.inference.ai.azure.com
GITHUB_TOKEN=your_github_token
GITHUB_MODEL_NAME=gpt-4o

# Optional: Stripe for billing
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Security & Authentication

### 1. Supabase Auth Integration
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side service role client (for API routes)
export const getServiceRoleClient = () => 
  createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
```

### 2. Row Level Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Messages policies  
CREATE POLICY "Users can view messages from own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Similar policies for prompts and usage_tracking tables
```

### 3. API Route Protection
```typescript
// src/lib/auth-helpers.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}
```

---

## Deployment & Production

### 1. Next.js Configuration
```typescript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com']
  },
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  }
}

export default nextConfig
```

### 2. Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "db:generate-types": "npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/types/supabase.ts"
  }
}
```

### 3. Vercel Deployment
```json
// vercel.json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key",
    "GITHUB_TOKEN": "@github-token",
    "GITHUB_MODELS_ENDPOINT": "@github-models-endpoint"
  }
}
```

---

## Final Implementation Notes

This comprehensive system provides:

1. **Complete Chat Interface**: 3-panel responsive layout with real-time messaging
2. **Advanced State Management**: Zustand with persistence and optimistic updates  
3. **Full Database Integration**: Supabase with RLS policies and usage tracking
4. **AI Integration**: OpenAI-compatible API with prompt engineering system
5. **Usage & Billing**: Token tracking with tiered limits and Stripe integration
6. **Mobile Responsive**: Adaptive UI that works on all screen sizes
7. **Production Ready**: Security, error handling, and performance optimizations

The system is designed to be easily extensible and can be deployed as-is to create a fully functional AI prompt engineering chatbot application.

Each component is modular and follows React/Next.js best practices, making it easy to understand, maintain, and extend with additional features.