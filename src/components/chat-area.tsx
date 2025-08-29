"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "../components/ui/button"
import { Textarea } from "../components/ui/textarea"
import { ScrollArea } from "../components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { PanelLeft, Send, ChevronDown, AlertTriangle } from "lucide-react"
import { useChat } from "./chat-provider"
import { MessageBubble } from "./message-bubble"
import { FileUpload } from "./FileUpload"
import { AI_MODELS, type AIModelId } from "@/lib/ai-config"

interface ChatAreaProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ChatArea({ sidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [selectedModel, setSelectedModel] = useState<AIModelId>("llama3-8b")
  const { 
    currentConversation, 
    addMessage, 
    isLoading, 
    error,
    createNewConversation
  } = useChat()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<any[]>([])

  const handleSend = async () => {
    if (input.trim() && !isLoading) {
      const message = input.trim()
      setInput("")
      setAttachedFiles([])
      
      try {
        await addMessage(message, attachedFiles, selectedModel)
      } catch (error) {
        console.error('Failed to send message:', error)
      }
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
  }, [currentConversation?.messages, isLoading])

  const handleCreateConversation = () => {
    createNewConversation(selectedModel)
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!sidebarOpen && (
          <Button onClick={onToggleSidebar} variant="ghost" size="icon">
            <PanelLeft className="h-5 w-5" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              {AI_MODELS[selectedModel]?.name || selectedModel}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(AI_MODELS).map(([modelId, model]) => (
              <DropdownMenuItem 
                key={modelId} 
                onClick={() => setSelectedModel(modelId as AIModelId)}
                className="flex flex-col items-start"
              >
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.description}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border-b border-destructive/20">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0 p-4">
        {!currentConversation || currentConversation.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
              <p>Start a conversation by typing a message below.</p>
              {!currentConversation && (
                <Button 
                  onClick={handleCreateConversation} 
                  className="mt-4"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Start New Chat'}
                </Button>
              )}
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
      {currentConversation && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <FileUpload 
              attachedFiles={attachedFiles}
              onFileAttach={(file) => setAttachedFiles(prev => [...prev, file])}
              onFileRemove={(fileId) => setAttachedFiles(prev => prev.filter(f => f.id !== fileId))}
            />
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 min-h-[60px] resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={!input.trim() || isLoading}
              size="icon"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {attachedFiles.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div key={index} className="text-xs bg-muted px-2 py-1 rounded">
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}