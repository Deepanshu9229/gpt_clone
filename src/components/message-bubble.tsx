"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Copy, ThumbsUp, ThumbsDown, Edit3 } from "lucide-react"
import { cn } from "../lib/utils"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  attachments?: any[]
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)
  const isUser = message.role === "user"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className={cn("flex gap-4", isUser ? "justify-end" : "justify-start")}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm flex-shrink-0">
          AI
        </div>
      )}

      <div className={cn("flex-1 max-w-3xl", isUser && "flex justify-end")}>
        <div
          className={cn(
            "rounded-lg p-4 text-sm leading-relaxed",
            isUser ? "bg-accent text-accent-foreground ml-12" : "bg-card text-card-foreground",
          )}
        >
          {isEditing ? (
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className={cn(
                "w-full resize-none bg-transparent outline-none",
                isUser ? "text-accent-foreground" : "text-card-foreground",
              )}
              rows={3}
            />
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}
          
          <div className="flex items-center justify-between mt-2 text-xs opacity-60">
            <span>{formatTime(message.timestamp)}</span>
            
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 animate-in fade-in-0 duration-200 opacity-100">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyToClipboard} 
                  className="h-6 px-2 text-xs hover:bg-muted"
                >
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </Button>

                {!isUser && (
                  <>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-muted">
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-muted">
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </>
                )}

                {isUser && !isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs hover:bg-muted"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}

                {isUser && isEditing && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-muted"
                      onClick={() => {
                        // Note: updateMessage function removed as it's not available in chat context
                        setIsEditing(false)
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs hover:bg-muted"
                      onClick={() => {
                        setDraft(message.content)
                        setIsEditing(false)
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Show attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border/20">
              <div className="text-xs text-muted-foreground">
                {message.attachments.length} attachment(s)
              </div>
            </div>
          )}
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold text-sm flex-shrink-0">
          U
        </div>
      )}
    </div>
  )
}