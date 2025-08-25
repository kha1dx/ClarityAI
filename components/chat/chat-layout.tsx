'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useChatStore, ChatMessage } from '@/stores/chat-store'
import { ChatSidebar } from './chat-sidebar'
import { ChatArea } from './chat-area'
import PromptSidebar from './PromptSidebar'
import { cn } from '@/lib/utils'

interface ChatLayoutProps {
  className?: string
  generatedPrompt?: string
  onSavePrompt?: (title: string, category: string) => void
  promptMetadata?: {
    category?: string
    tokensUsed?: number
    estimatedCost?: number
  }
}

export function ChatLayout({
  className,
  generatedPrompt,
  onSavePrompt,
  promptMetadata
}: ChatLayoutProps) {
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const [currentGeneratedPrompt, setCurrentGeneratedPrompt] = useState<string>('')
  const [currentPromptMetadata, setCurrentPromptMetadata] = useState<{
    tokensUsed: number
    cost: number
    category?: string
  } | null>(null)
  
  const {
    conversations,
    setConversations,
    createConversation,
    uiState,
    setIsMobile,
    setLoadingConversations
  } = useChatStore()

  useEffect(() => {
    // Detect mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [setIsMobile])

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return
    
    setLoadingConversations(true)
    try {
      const response = await fetch(`/api/conversations?userId=${user.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Convert API conversations to chat store format
        const chatConversations = data.data.map((conv: any) => ({
          ...conv,
          created_at: conv.created_at || new Date().toISOString(),
          updated_at: conv.updated_at || conv.created_at || new Date().toISOString(),
          unreadCount: 0,
          isStarred: false,
          isArchived: false,
          tags: conv?.category ? [conv.category] : []
        }))
        
        setConversations(chatConversations)
      } else {
        // Handle case where no conversations exist
        setConversations([])
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
      
      if (data.success && data.data) {
        const newConversation = {
          ...data.data,
          created_at: data.data.created_at || new Date().toISOString(),
          updated_at: data.data.updated_at || new Date().toISOString(),
          unreadCount: 0,
          isStarred: false,
          isArchived: false,
          tags: data.data?.category ? [data.data.category] : []
        }
        
        createConversation(newConversation)
        // Auto-select the new conversation and load its messages
        useChatStore.getState().setActiveConversation(data.data.id)
        await loadMessagesForConversation(data.data.id)
      }
    } catch (error) {
      console.error('Error creating conversation:', error)
    }
  }

  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Convert messages to chat store format and load them
        const chatMessages = data.data.map((msg: any) => ({
          ...msg,
          status: 'sent'
        }))
        useChatStore.getState().setMessages(conversationId, chatMessages)
      } else {
        // Handle case where no messages exist for this conversation
        useChatStore.getState().setMessages(conversationId, [])
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handlePromptGenerated = (prompt: string, metadata: { tokensUsed: number; cost: number; category?: string }) => {
    setCurrentGeneratedPrompt(prompt)
    setCurrentPromptMetadata(metadata)
    // Auto-open right sidebar to show the generated prompt
    if (!uiState.rightSidebarOpen && !uiState.isMobile) {
      useChatStore.getState().toggleRightSidebar()
    }
  }

  const handleSaveGeneratedPrompt = async (title: string, category: string) => {
    if (currentGeneratedPrompt && currentPromptMetadata) {
      if (onSavePrompt) {
        await onSavePrompt(title, category)
      }
      // Alternative: directly save the current generated prompt
      if (user) {
        try {
          const response = await fetch('/api/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              title,
              content: currentGeneratedPrompt,
              category,
              conversationId: useChatStore.getState().activeConversationId,
              tokensUsed: currentPromptMetadata.tokensUsed,
              cost: currentPromptMetadata.cost
            })
          })
          const data = await response.json()
          if (data.success) {
            console.log('Prompt saved successfully')
          }
        } catch (error) {
          console.error('Error saving generated prompt:', error)
        }
      }
    }
  }

  if (isLoading) {
    return (
      <div className={cn(
        "flex h-full items-center justify-center bg-gray-50",
        className
      )}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex h-screen bg-gray-50 overflow-hidden text-gray-900", className)}>
      {/* Left Sidebar - Conversations */}
      <div className={cn(
        "transition-all duration-200 ease-in-out h-full overflow-hidden resize-x",
        uiState.leftSidebarOpen ? "w-80 min-w-60 max-w-96" : "w-0",
        "lg:relative fixed lg:translate-x-0 z-30",
        uiState.isMobile && !uiState.leftSidebarOpen && "-translate-x-full",
        uiState.isMobile && uiState.leftSidebarOpen && "translate-x-0"
      )}>
        <ChatSidebar onCreateConversation={handleCreateConversation} />
        {/* Resize handle */}
        {uiState.leftSidebarOpen && !uiState.isMobile && (
          <div className="absolute top-0 right-0 w-1 h-full bg-gray-300 hover:bg-gray-400 cursor-col-resize opacity-0 hover:opacity-100 transition-opacity" />
        )}
      </div>

      {/* Mobile Overlay */}
      {uiState.isMobile && uiState.leftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => useChatStore.getState().toggleLeftSidebar()}
        />
      )}

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col h-full overflow-hidden",
        uiState.isMobile && "relative z-10"
      )}>
        <ChatArea 
          onCreateConversation={handleCreateConversation} 
          onPromptGenerated={handlePromptGenerated}
        />
      </div>

      {/* Right Sidebar - Prompt Output */}
      <div className={cn(
        "transition-all duration-200 ease-in-out h-full overflow-hidden",
        uiState.rightSidebarOpen && !uiState.isMobile ? "w-80" : "w-0",
        "hidden lg:block"
      )}>
        {uiState.rightSidebarOpen && (
          <PromptSidebar
            currentPrompt={currentGeneratedPrompt || generatedPrompt}
            onSavePrompt={(prompt) => {
              if (handleSaveGeneratedPrompt) {
                handleSaveGeneratedPrompt('Generated Prompt', 'General')
              }
            }}
          />
        )}
      </div>

      {/* Mobile Right Sidebar */}
      {uiState.isMobile && (
        <div className={cn(
          "fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform duration-200 ease-in-out z-40",
          uiState.rightSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <PromptSidebar
            currentPrompt={currentGeneratedPrompt || generatedPrompt}
            onSavePrompt={(prompt) => {
              if (handleSaveGeneratedPrompt) {
                handleSaveGeneratedPrompt('Generated Prompt', 'General')
              }
            }}
          />
        </div>
      )}

      {/* Mobile Right Sidebar Overlay */}
      {uiState.isMobile && uiState.rightSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => useChatStore.getState().toggleRightSidebar()}
        />
      )}
    </div>
  )
}