"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { ScrollArea } from "../components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { PanelLeft, Send, Paperclip, ChevronDown } from "lucide-react"
import { useChat } from "./chat-provider"
import { MessageBubble } from "./message-bubble"
import { cn } from "../lib/utils"
import { FileUpload } from "./FileUpload"

interface ChatAreaProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState("GPT-4")
  const { currentConversation, addMessage, isLoading } = useChat()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<any[]>([])

  const handleSend = () => {
    if (input.trim()) {
      addMessage(input.trim(), "user")
      setInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentConversation?.messages.length, isLoading])

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!sidebarOpen && (
          <Button onClick={onToggleSidebar} variant="ghost" size="icon" className="text-foreground hover:bg-muted">
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:bg-muted">
              {selectedModel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedModel("GPT-4")}>GPT-4</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedModel("GPT-3.5")}>GPT-3.5</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedModel("Claude")}>Claude</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        {currentConversation?.messages.length === 0 || !currentConversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p>Start a conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {currentConversation.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold text-sm">
                  AI
                </div>
                <div className="flex-1">
                  <div className="bg-card rounded-lg p-4 text-card-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-current rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end gap-2 bg-input rounded-lg border border-border p-2">
              <FileUpload
                attachedFiles={attachedFiles}
                onFileAttach={(file) => setAttachedFiles((prev) => [...prev, file])}
                onFileRemove={(fileId) => setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId))}
              />

              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message ChatGPT..."
                className="flex-1 min-h-[24px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                rows={1}
              />

              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                variant="default"
                className="rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center mt-2">
            ChatGPT can make mistakes. Check important info.
          </div>
        </div>
      </div>
    </div>
  )
}
