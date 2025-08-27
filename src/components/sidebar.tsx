"use client"

import { Button } from "../components/ui/button"
import { ScrollArea } from "../components/ui/scroll-area"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { Plus, PanelLeft, Settings, LogOut, MessageSquare } from "lucide-react"
import { useChat } from "./chat-provider"
import { cn } from "../lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { conversations, currentConversation, createNewConversation, selectConversation, deleteConversation, user, login, logout } = useChat()

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
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
          className="flex items-center gap-2 bg-sidebar-primary hover:bg-sidebar-accent text-sidebar-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div key={conversation.id} className="flex items-center gap-2">
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
                  <div className="text-xs text-sidebar-foreground/60">{conversation.createdAt.toLocaleDateString()}</div>
                </div>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={() => deleteConversation(conversation.id)}
                title="Delete chat"
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start p-2 text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => {
                if (!user) {
                  window.location.href = "/signup"
                }
              }}
            >
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">{user ? user.name[0]?.toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{user ? user.name : 'Guest'}</div>
                <div className="text-xs text-sidebar-foreground/60">{user ? user.email : 'Click to sign up'}</div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {!user ? (
              <DropdownMenuItem
                onClick={() => {
                  // minimal: first click behaves like signup
                  login({ id: Date.now().toString(), name: 'User', email: 'user@example.com' })
                }}
              >
                Sign up / Log in
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { logout(); window.location.href = "/login" }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
