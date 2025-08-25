'use client'

import { useState } from 'react'

interface SavedPrompt {
  id: string
  title: string
  content: string
  created_at: string
  category?: string
}

interface PromptSidebarProps {
  currentPrompt?: string | null
  savedPrompts?: SavedPrompt[]
  onSavePrompt?: (prompt: string) => void
  isGeneratingPrompt?: boolean
}

export default function PromptSidebar({
  currentPrompt,
  savedPrompts = [],
  onSavePrompt,
  isGeneratingPrompt = false
}: PromptSidebarProps) {
  const [activeTab, setActiveTab] = useState<'current' | 'saved'>('current')
  const [searchQuery, setSearchQuery] = useState('')
  const [savePromptTitle, setSavePromptTitle] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const filteredSavedPrompts = savedPrompts.filter(prompt =>
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleSavePrompt = () => {
    if (currentPrompt && savePromptTitle.trim() && onSavePrompt) {
      onSavePrompt(currentPrompt)
      setSavePromptTitle('')
      setShowSaveDialog(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Prompts</h2>
          {currentPrompt && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
              disabled={!currentPrompt}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Save
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'current'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Generated
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'saved'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Saved ({savedPrompts.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'current' ? (
          <div className="p-4">
            {isGeneratingPrompt ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Generating your optimized prompt...</p>
              </div>
            ) : currentPrompt ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Generated Prompt</h3>
                  <button
                    onClick={() => copyToClipboard(currentPrompt)}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                    {currentPrompt}
                  </pre>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(currentPrompt)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                  >
                    Copy Prompt
                  </button>
                  <button
                    onClick={() => setShowSaveDialog(true)}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
                  >
                    Save Prompt
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">No prompt generated yet</p>
                <p className="text-xs text-gray-500">
                  Chat with the assistant to generate your optimized prompt
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            {/* Search for saved prompts */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search saved prompts..."
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

            {/* Saved prompts list */}
            {filteredSavedPrompts.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">
                  {searchQuery ? 'No prompts found' : 'No saved prompts yet'}
                </p>
                <p className="text-xs text-gray-500">
                  {searchQuery ? 'Try a different search term' : 'Generate and save prompts to build your library'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSavedPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                        {prompt.title}
                      </h4>
                      <button
                        onClick={() => copyToClipboard(prompt.content)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-all"
                        title="Copy prompt"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-2">
                      Saved {formatDate(prompt.created_at)}
                    </p>
                    
                    <div className="bg-gray-50 rounded p-2 border">
                      <p className="text-xs text-gray-700 line-clamp-3 font-mono">
                        {prompt.content.substring(0, 150)}
                        {prompt.content.length > 150 ? '...' : ''}
                      </p>
                    </div>
                    
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => copyToClipboard(prompt.content)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Prompt</h3>
            
            <div className="mb-4">
              <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt Title
              </label>
              <input
                id="prompt-title"
                type="text"
                value={savePromptTitle}
                onChange={(e) => setSavePromptTitle(e.target.value)}
                placeholder="Enter a title for your prompt..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false)
                  setSavePromptTitle('')
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePrompt}
                disabled={!savePromptTitle.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Prompt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}