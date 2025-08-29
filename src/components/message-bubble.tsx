"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { Copy, ThumbsUp, ThumbsDown, Edit3, FileText, Image, File, X } from "lucide-react"
import { cn } from "../lib/utils"
import { useChat } from "./chat-provider"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  attachments?: any[]
  edited?: boolean
  editHistory?: Array<{ content: string; timestamp: Date }>
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)
  const [isSaving, setIsSaving] = useState(false)
  const isUser = message.role === "user"
  const { editMessage } = useChat()

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleSave = async () => {
    if (draft.trim() === message.content) {
      setIsEditing(false)
      return
    }

    try {
      setIsSaving(true)
      await editMessage(message.id, draft.trim())
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save message:', error)
      // Revert to original content on error
      setDraft(message.content)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setDraft(message.content)
    setIsEditing(false)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />
    if (fileType.includes('word') || fileType.includes('document')) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  const getFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
            <div className="space-y-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className={cn(
                  "w-full resize-none bg-transparent outline-none border border-border/20 rounded",
                  isUser ? "text-accent-foreground" : "text-card-foreground",
                )}
                rows={3}
                placeholder="Edit your message..."
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || draft.trim() === message.content}
                  className="h-7 px-3 text-xs"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="h-7 px-3 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.edited && (
                <div className="text-xs text-muted-foreground italic">
                  (edited)
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-2 text-xs opacity-60">
            <span>{formatTime(message.timestamp)}</span>
            
            {showActions && !isEditing && (
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

                {isUser && (
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
              </div>
            )}
          </div>

          {/* Enhanced file attachments display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/20">
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                    {getFileIcon(attachment.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{attachment.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {getFileSize(attachment.size)} • {attachment.type}
                      </div>
                    </div>
                    {attachment.extractedText && (
                      <div className="text-xs text-muted-foreground max-w-xs truncate">
                        {attachment.extractedText.slice(0, 50)}...
                      </div>
                    )}
                  </div>
                ))}
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