'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthContext } from '@/components/auth/auth-provider'
import { useChatStore, ChatMessage } from '@/stores/chat-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Send, 
  Paperclip, 
  Mic, 
  MoreHorizontal, 
  Copy, 
  RotateCcw, 
  Star, 
  ThumbsUp, 
  ThumbsDown,
  Menu,
  Sparkles,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { WelcomeMessage } from './welcome-message'

interface ChatAreaProps {
  className?: string
  onCreateConversation?: () => void
  onPromptGenerated?: (prompt: string, metadata: { tokensUsed: number; cost: number; category?: string }) => void
}

export function ChatArea({ className, onCreateConversation, onPromptGenerated }: ChatAreaProps) {
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
    starMessage,
    uiState,
    toggleLeftSidebar,
    toggleRightSidebar,
    setSendingMessage,
    isSendingMessage
  } = useChatStore()

  const activeConversation = getActiveConversation()
  const messages = getActiveMessages()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to send message
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        if (inputMessage.trim() && activeConversationId) {
          handleSendMessage()
        }
      }
      
      // Cmd/Ctrl + K to focus message input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        textareaRef.current?.focus()
      }

      // Cmd/Ctrl + G to generate prompt (if messages exist)
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault()
        if (messages.length > 0) {
          handleGenerateOptimizedPrompt()
        }
      }

      // Escape to blur input
      if (e.key === 'Escape') {
        textareaRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputMessage, messages.length, activeConversationId])

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessagesForConversation(activeConversationId)
    }
  }, [activeConversationId])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [inputMessage])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // Convert messages to chat store format and load them
        const chatMessages = data.data.map((msg: any) => ({
          ...msg,
          status: 'sent'
        }))
        setMessages(conversationId, chatMessages)
      } else {
        // Handle case where no messages exist
        setMessages(conversationId, [])
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

    // Add user message to store
    addMessage(activeConversationId, userMessage)
    setInputMessage('')
    setSendingMessage(true)
    setIsTyping(true)

    try {
      // Call AI API - this will integrate with existing API
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
      console.log('AI API Response:', data) // Debug logging

      // Save user message to database
      try {
        await fetch(`/api/conversations/${activeConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: userMessage.content,
            tokensUsed: 0,
            cost: 0
          })
        })
        updateMessage(activeConversationId, userMessage.id, { status: 'sent' })
      } catch (error) {
        console.error('Error saving user message:', error)
      }

      if (data.success) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data?.content || 'Sorry, I couldn\'t generate a response.',
          timestamp: new Date().toISOString(),
          status: 'sent'
        }

        addMessage(activeConversationId, aiMessage)
        
        // Save AI message to database
        try {
          await fetch(`/api/conversations/${activeConversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'assistant',
              content: data.data?.content || 'Sorry, I couldn\'t generate a response.',
              tokensUsed: data.data?.usage?.tokens_used || 0,
              cost: data.data?.usage?.estimated_cost || 0
            })
          })
        } catch (error) {
          console.error('Error saving AI message:', error)
        }
      } else {
        // Handle error
        updateMessage(activeConversationId, userMessage.id, { status: 'error' })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      updateMessage(activeConversationId, userMessage.id, { status: 'error' })
      
      // Add a fallback AI error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date().toISOString(),
        status: 'sent'
      }
      addMessage(activeConversationId, errorMessage)
    } finally {
      setSendingMessage(false)
      setIsTyping(false)
    }
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    // Add toast notification here
  }

  const handleStartConversation = async (template: string) => {
    if (onCreateConversation) {
      onCreateConversation()
    }
    if (template.trim()) {
      setInputMessage(template)
      // Focus the textarea
      setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
    }
  }

  const handleGenerateOptimizedPrompt = async () => {
    if (!activeConversationId || !user) return
    
    const messages = getActiveMessages()
    if (messages.length === 0) return

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
      
      if (data.success && data.data && onPromptGenerated) {
        onPromptGenerated(data.data.optimized_prompt, {
          tokensUsed: data.data.tokens_used,
          cost: data.data.cost,
          category: activeConversation?.category
        })
      } else {
        console.error('Failed to generate optimized prompt:', data.error || 'Unknown error')
      }
    } catch (error) {
      console.error('Error generating optimized prompt:', error)
    } finally {
      setIsGeneratingPrompt(false)
    }
  }

  const formatMessageTime = (timestamp: string) => {
    if (!timestamp) return 'Just now'
    
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      return 'Just now'
    }
    
    return formatDistanceToNow(date, { addSuffix: true })
  }

  const MessageBubble = ({ message, isUser }: { message: ChatMessage; isUser: boolean }) => {
    const [showActions, setShowActions] = useState(false)

    return (
      <div
        className={cn(
          "flex gap-3 group",
          isUser && "flex-row-reverse"
        )}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <Avatar className={cn("h-8 w-8 mt-1 flex-shrink-0", isUser && "order-2")}>
          <AvatarImage 
            src={isUser ? profile?.avatar_url : "/ai-avatar.svg"} 
            alt={isUser ? profile?.full_name : "AI Assistant"} 
          />
          <AvatarFallback className={cn(
            "text-sm font-medium",
            isUser 
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white" 
              : "bg-gradient-to-br from-emerald-400 to-cyan-500 text-white"
          )}>
            {isUser 
              ? (profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U')
              : 'AI'
            }
          </AvatarFallback>
        </Avatar>

        <div className={cn("flex-1 max-w-[70%]", isUser && "flex flex-col items-end")}>
          <div
            className={cn(
              "rounded-2xl px-4 py-3 relative shadow-sm",
              isUser
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                : "bg-white border border-gray-200 text-gray-900"
            )}
          >
            {!isUser ? (
              <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-code:text-gray-800">
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
                          className="!mt-2 !mb-2 !bg-gray-50 !border !border-gray-200 !rounded-md"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-700">
                          {children}
                        </code>
                      )
                    },
                    p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="space-y-1 mb-2">{children}</ul>,
                    li: ({ children }) => <li className="flex items-start"><span className="mr-2 text-emerald-500">•</span><span>{children}</span></li>
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
            )}

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

          <div className={cn(
            "flex items-center gap-2 mt-1 text-xs text-gray-500",
            isUser && "flex-row-reverse"
          )}>
            <span>{formatMessageTime(message.timestamp)}</span>
            
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200"
                  onClick={() => copyMessage(message.content)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {!isUser && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                      onClick={() => {
                        // Regenerate response logic
                      }}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-6 w-6 p-0",
                        message.isStarred ? "text-yellow-500 hover:bg-yellow-100" : "hover:bg-gray-200"
                      )}
                      onClick={async () => {
                        if (!activeConversationId || !user) return
                        
                        // Update local state immediately for better UX
                        starMessage(activeConversationId, message.id)
                        
                        // TODO: Implement message starring API endpoint
                        // Send to API
                        try {
                          // await fetch(`/api/conversations/${activeConversationId}/messages/${message.id}`, {
                          //   method: 'PUT',
                          //   headers: { 'Content-Type': 'application/json' },
                          //   body: JSON.stringify({
                          //     action: message.isStarred ? 'unstar' : 'star'
                          //   })
                          // })
                        } catch (error) {
                          // Revert local state if API call fails
                          starMessage(activeConversationId, message.id)
                          console.error('Failed to star message:', error)
                        }
                      }}
                    >
                      <Star className={cn(
                        "h-3 w-3",
                        message.isStarred && "fill-current"
                      )} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-200"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!activeConversation) {
    return (
      <div className={cn(
        "flex flex-col h-full bg-white overflow-hidden",
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={toggleLeftSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-gray-900">Prompt Studio</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="flex-1 overflow-hidden">
          <WelcomeMessage onStartConversation={handleStartConversation} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-white overflow-hidden",
      className
    )}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={toggleLeftSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          
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
          {activeConversation.category && (
            <Badge variant="outline">{activeConversation.category}</Badge>
          )}
          
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
          
          {/* Right sidebar toggle */}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleRightSidebar}
            title={uiState.rightSidebarOpen ? 'Hide prompt panel' : 'Show prompt panel'}
          >
            {uiState.rightSidebarOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
          
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="p-4 space-y-6">
          {messages.length === 0 && !isTyping ? (
            // Greeting message for empty conversations
            <div className="flex flex-col items-center justify-center h-full py-16 text-center">
              <div className="max-w-md space-y-4">
                <div className="flex items-center justify-center">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="/ai-avatar.svg" alt="AI Assistant" />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      AI
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hello! I&apos;m your AI Assistant 👋
                  </h3>
                  <p className="text-gray-600">
                    I&apos;m here to help you create optimized prompts through natural conversation. 
                    Tell me what you&apos;d like to achieve, and I&apos;ll guide you through the process!
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2">Quick tips to get started:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Describe your goal or what you want to create</li>
                    <li>• Add all the necessary details</li>
                    <li>• Include any specific requirements or constraints</li>
                  </ul>
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
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
              onKeyDown={(e) => {
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
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" disabled={isSendingMessage}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" disabled={isSendingMessage}>
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isSendingMessage}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl h-11 px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>⌘+Enter to send • ⌘+K to focus • ⌘+G to generate prompt</span>
          </div>
          <span>Powered by GPT-4</span>
        </div>
      </div>
    </div>
  )
}