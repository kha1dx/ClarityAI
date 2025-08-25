"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Sparkles,
  Hash,
  Inbox,
  StarIcon,
  ArchiveIcon,
  Filter,
  SortDesc,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat-store";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  onCreateConversation: () => void;
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
    archiveConversation,
    uiState,
    setSearchQuery,
    setActiveTab,
    getFilteredConversations,
  } = useChatStore();

  const [renameDialog, setRenameDialog] = useState<{
    open: boolean;
    id: string | null;
    title: string;
  }>({
    open: false,
    id: null,
    title: "",
  });

  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  const filteredConversations = getFilteredConversations();

  const handleNewChat = () => {
    onCreateConversation();
  };

  const handleRename = () => {
    if (renameDialog.id) {
      updateConversation(renameDialog.id, { title: renameDialog.title });
    }
    setRenameDialog({ open: false, id: null, title: "" });
  };

  const openRenameDialog = (id: string, currentTitle: string) => {
    setRenameDialog({ open: true, id, title: currentTitle });
  };

  const getMessagePreview = (conversationId: string) => {
    const convMessages = messages[conversationId] || [];
    if (convMessages.length === 0) return "No messages yet";

    const lastMessage = convMessages[convMessages.length - 1];
    if (!lastMessage || !lastMessage.content) return "No messages yet";

    return lastMessage.content.length > 80
      ? lastMessage.content.substring(0, 80) + "..."
      : lastMessage.content;
  };

  const getMessageCount = (conversationId: string) => {
    return messages[conversationId]?.length || 0;
  };

  const handleContextMenu = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    setContextMenuId(conversationId);
  };

  const tabs = [
    {
      id: "all",
      label: "All Chats",
      icon: Inbox,
      count: conversations.filter((c) => !c.isArchived).length,
    },
    {
      id: "starred",
      label: "Starred",
      icon: StarIcon,
      count: conversations.filter((c) => c.isStarred && !c.isArchived).length,
    },
    {
      id: "archived",
      label: "Archived",
      icon: ArchiveIcon,
      count: conversations.filter((c) => c.isArchived).length,
    },
  ] as const;

  const ConversationCard = ({ conversation }: { conversation: any }) => {
    const isActive = conversation.id === activeConversationId;
    const messageCount = getMessageCount(conversation.id);
    const preview = getMessagePreview(conversation.id);

    return (
      <Card
        className={cn(
          "group relative transition-all duration-200 cursor-pointer hover:shadow-md",
          "border border-border/50 bg-gradient-to-r from-background to-background/80",
          isActive &&
            "ring-2 ring-primary/20 border-primary/30 shadow-md bg-gradient-to-r from-primary/5 to-primary/10"
        )}
        onClick={() => setActiveConversation(conversation.id)}
        onContextMenu={(e) => handleContextMenu(e, conversation.id)}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={cn(
                    "font-semibold text-sm truncate transition-colors",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {conversation.title}
                </h3>
                <div className="flex items-center gap-1">
                  {conversation.isStarred && (
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  )}
                  {conversation.generated_prompt && (
                    <Sparkles className="h-3 w-3 text-purple-500 flex-shrink-0" />
                  )}
                  {conversation.tags?.length > 0 && (
                    <Hash className="h-3 w-3 text-blue-500 flex-shrink-0" />
                  )}
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 transition-all duration-200 rounded-md",
                    "opacity-0 group-hover:opacity-100 hover:bg-muted/80",
                    isActive && "opacity-100 bg-muted/50"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white border border-gray-200 shadow-lg rounded-md"
                sideOffset={5}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    openRenameDialog(conversation.id, conversation.title);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer text-gray-900"
                >
                  <Edit3 className="h-4 w-4 text-gray-700" />
                  <span className="text-gray-900 font-medium">Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    starConversation(conversation.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer text-gray-900"
                >
                  <Star
                    className={cn(
                      "h-4 w-4",
                      conversation.isStarred
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-700"
                    )}
                  />
                  <span className="text-gray-900 font-medium">
                    {conversation.isStarred ? "Unstar" : "Star"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    archiveConversation(conversation.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 cursor-pointer text-gray-900"
                >
                  <Archive className="h-4 w-4 text-gray-700" />
                  <span className="text-gray-900 font-medium">
                    {conversation.isArchived ? "Unarchive" : "Archive"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 my-1" />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 focus:bg-red-50 cursor-pointer text-red-600"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                  <span className="text-red-600 font-medium">Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Preview */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {preview}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {conversation.updated_at
                  ? formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                    })
                  : "Just now"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {conversation.unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-2 text-xs">
                  {conversation.unreadCount}
                </Badge>
              )}
              {messageCount > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {messageCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col h-full bg-background/95 backdrop-blur-sm border-r border-border/50 w-full">
        {/* Header */}
        <div className="p-4 border-b border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground">
                Conversations
              </h2>
            </div>
            <Button
              onClick={handleNewChat}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={uiState.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = uiState.activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200",
                    isActive
                      ? "bg-background text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className="h-4 px-1.5 text-xs"
                    >
                      {tab.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="bg-muted/50 rounded-full p-6 w-fit mx-auto mb-4">
                  {uiState.activeTab === "starred" && (
                    <StarIcon className="h-8 w-8 text-muted-foreground/50" />
                  )}
                  {uiState.activeTab === "archived" && (
                    <ArchiveIcon className="h-8 w-8 text-muted-foreground/50" />
                  )}
                  {uiState.activeTab === "all" && (
                    <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
                  )}
                </div>
                <p className="text-sm font-medium mb-1">
                  {uiState.activeTab === "starred" &&
                    "No starred conversations"}
                  {uiState.activeTab === "archived" &&
                    "No archived conversations"}
                  {uiState.activeTab === "all" && "No conversations yet"}
                </p>
                <p className="text-xs text-muted-foreground/75">
                  {uiState.activeTab === "starred" &&
                    "Star conversations to find them here"}
                  {uiState.activeTab === "archived" &&
                    "Archived conversations will appear here"}
                  {uiState.activeTab === "all" &&
                    "Start a new conversation to begin"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Stats */}
        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{filteredConversations.length} conversations</span>
            <div className="flex items-center gap-2">
              <Filter className="h-3 w-3" />
              <span>{uiState.activeTab}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog
        open={renameDialog.open}
        onOpenChange={(open) => setRenameDialog({ ...renameDialog, open })}
      >
        <DialogContent className="sm:max-w-md bg-white border border-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-semibold text-lg">
              Rename Conversation
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter new title..."
              value={renameDialog.title}
              onChange={(e) =>
                setRenameDialog({ ...renameDialog, title: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              className="bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setRenameDialog({ open: false, id: null, title: "" })
              }
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!renameDialog.title.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
