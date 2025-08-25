'use client'

import { useState, useEffect } from 'react'
import { useConversationStore } from '@/stores/conversation-store'
import type { PromptConversation } from '@/lib/types'

interface ConversationSidebarProps {
  currentConversationId?: string | null
  onSelectConversation: (conversation: PromptConversation) => void
  onNewConversation: () => void
  userId: string
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  userId
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { 
    conversations, 
    loadConversations, 
    deleteConversation,
    isLoading,
    error 
  } = useConversationStore()

  useEffect(() => {
    if (userId) {
      loadConversations(userId)
    }
  }, [userId, loadConversations])

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async (conversationId: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(conversationId)
      } catch (error) {
        console.error('Failed to delete conversation:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return 'Today'
    } else if (diffInDays === 1) {
      return 'Yesterday'
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <button
            onClick={onNewConversation}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg 
            className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading conversations...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm text-gray-600">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Start a new conversation to get began'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group relative ${
                  conversation.id === currentConversationId ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-medium truncate ${
                      conversation.id === currentConversationId ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {conversation.title}
                    </h3>
                    <p className={`text-xs mt-1 ${
                      conversation.id === currentConversationId ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {formatDate(conversation.updated_at)}
                    </p>
                    {conversation.conversation_data && conversation.conversation_data.length > 0 && (
                      <p className={`text-xs mt-1 truncate ${
                        conversation.id === currentConversationId ? 'text-blue-500' : 'text-gray-500'
                      }`}>
                        {conversation.conversation_data.length} message{conversation.conversation_data.length !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(conversation.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-600 transition-all"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}