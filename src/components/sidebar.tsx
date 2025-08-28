"use client"

import { Button } from "../components/ui/button"
import { ScrollArea } from "../components/ui/scroll-area"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Plus, PanelLeft, Settings, LogOut, MessageSquare, Trash2, AlertCircle, MoreVertical } from "lucide-react"
import { UserButton, useUser, SignInButton, SignUpButton } from "@clerk/nextjs"
import { useChat } from "./chat-provider"
import { cn } from "../lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { 
    conversations, 
    currentConversation, 
    createNewConversation, 
    selectConversation, 
    deleteConversation,
    error,
    isLoading
  } = useChat()
  const { user, isSignedIn } = useUser()

  const handleDeleteConversation = async (conversationId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      await deleteConversation(conversationId)
    }
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isOpen ? "w-80" : "w-0 overflow-hidden",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <Button
          onClick={onToggle}
          variant="ghost"
          size="icon"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <PanelLeft className="h-5 w-5" />
        </Button>
        <Button
          onClick={createNewConversation}
          disabled={isLoading}
          className="flex items-center gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {isLoading ? 'Creating...' : 'New Chat'}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Conversations */}
      <ScrollArea className="flex-1 min-h-0 p-2">
        <div className="space-y-1">
          {conversations.length === 0 && isSignedIn ? (
            <div className="p-4 text-center text-sidebar-foreground/60 text-sm">
              No conversations yet. Start by creating a new chat!
            </div>
          ) : (
            conversations.map((conversation) => (
              <div key={conversation.id} className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-start text-left h-auto p-3 text-sidebar-foreground hover:bg-sidebar-accent",
                    currentConversation?.id === conversation.id && "bg-sidebar-accent",
                  )}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-medium">{conversation.title}</div>
                    <div className="text-xs text-sidebar-foreground/60">
                      {conversation.createdAt.toLocaleDateString()} • {conversation.messages.length} messages
                    </div>
                  </div>
                </Button>

                {/* 3-dot menu for per-chat actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center size-9 rounded-md text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent flex-shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      title="Chat options"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem
                      className="text-sm text-red-600 focus:text-red-600"
                      onSelect={() => {
                        if (window.confirm('Delete this conversation?')) {
                          deleteConversation(conversation.id)
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <UserButton 
                appearance={{ 
                  elements: { 
                    avatarBox: "h-8 w-8",
                    userButtonPopover: "z-50"
                  } 
                }} 
                afterSignOutUrl="/" 
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-sidebar-foreground">
                  {user?.firstName || user?.username || 'User'}
                </div>
                <div className="text-xs text-sidebar-foreground/60 truncate">
                  {user?.emailAddresses?.[0]?.emailAddress || ''}
                </div>
              </div>
            </>
          ) : (
            <div className="flex w-full flex-col gap-2">
              <div className="text-center text-xs text-sidebar-foreground/60 mb-2">
                Sign in to save your conversations
              </div>
              <div className="flex gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="flex-1 text-xs">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="default" size="sm" className="flex-1 text-xs">
                    Sign Up
                  </Button>
                </SignUpButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}