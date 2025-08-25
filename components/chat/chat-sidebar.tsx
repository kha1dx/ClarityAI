'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Star, 
  Archive, 
  Trash2, 
  Edit3, 
  MoreHorizontal,
  Clock,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore } from '@/stores/chat-store'
import { formatDistanceToNow } from 'date-fns'

interface ChatSidebarProps {
  onCreateConversation: () => void
}

export function ChatSidebar({ onCreateConversation }: ChatSidebarProps) {
  const {
    conversations,
    activeConversationId,
    messages,
    createConversation,
    setActiveConversation,
    deleteConversation,
    updateConversation,
    starConversation,
    archiveConversation
  } = useChatStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; id: string | null; title: string }>({
    open: false,
    id: null,
    title: ''
  })

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    messages[conv.id]?.some(msg => 
      msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleNewChat = () => {
    onCreateConversation()
  }

  const handleRename = () => {
    if (renameDialog.id) {
      updateConversation(renameDialog.id, { title: renameDialog.title })
    }
    setRenameDialog({ open: false, id: null, title: '' })
  }

  const openRenameDialog = (id: string, currentTitle: string) => {
    setRenameDialog({ open: true, id, title: currentTitle })
  }

  const getMessagePreview = (conversationId: string) => {
    const convMessages = messages[conversationId] || []
    if (convMessages.length === 0) return 'No messages yet'
    
    const lastMessage = convMessages[convMessages.length - 1]
    if (!lastMessage || !lastMessage.content) return 'No messages yet'
    
    return lastMessage.content.length > 60 
      ? lastMessage.content.substring(0, 60) + '...'
      : lastMessage.content
  }

  const getMessageCount = (conversationId: string) => {
    return messages[conversationId]?.length || 0
  }

  return (
    <>
      <div className="flex flex-col h-full bg-white border-r border-gray-200 w-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              Conversations
            </h2>
            <Button
              onClick={handleNewChat}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Start a new conversation to begin
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  const isActive = conversation.id === activeConversationId
                  const messageCount = getMessageCount(conversation.id)
                  const preview = getMessagePreview(conversation.id)
                  
                  return (
                    <div
                      key={conversation.id}
                      className={cn(
                        "group relative rounded-lg p-3 cursor-pointer transition-all",
                        "hover:bg-gray-50 border border-transparent",
                        isActive && "bg-indigo-50 border-indigo-200 shadow-sm"
                      )}
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={cn(
                              "font-medium text-sm truncate",
                              isActive ? "text-indigo-900" : "text-gray-900"
                            )}>
                              {conversation.title}
                            </h3>
                            {conversation.isStarred && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                            {conversation.generated_prompt && (
                              <Sparkles className="h-3 w-3 text-purple-500" />
                            )}
                          </div>
                          
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {preview}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              {conversation.updated_at ? formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true }) : 'Just now'}
                            </div>
                            
                            {messageCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                {messageCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                openRenameDialog(conversation.id, conversation.title)
                              }}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                starConversation(conversation.id)
                              }}
                            >
                              <Star className={cn(
                                "h-4 w-4 mr-2",
                                conversation.isStarred && "fill-yellow-500 text-yellow-500"
                              )} />
                              {conversation.isStarred ? 'Unstar' : 'Star'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                archiveConversation(conversation.id)
                              }}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <Separator className="my-1" />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteConversation(conversation.id)
                              }}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialog.open} onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter new title..."
              value={renameDialog.title}
              onChange={(e) => setRenameDialog({ ...renameDialog, title: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialog({ open: false, id: null, title: '' })}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}