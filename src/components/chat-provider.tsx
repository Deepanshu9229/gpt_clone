"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  attachments?: any[]
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  addMessage: (content: string, attachments?: any[]) => Promise<void>
  createNewConversation: () => Promise<void>
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversations when user changes
  useEffect(() => {
    if (isSignedIn) {
      loadConversations()
    } else {
      setConversations([])
      setCurrentConversation(null)
    }
  }, [isSignedIn, user?.id])

  const loadConversations = async () => {
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      
      if (data.success && data.conversations) {
        const transformedConversations = data.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        
        setConversations(transformedConversations)
        
        if (!currentConversation && transformedConversations.length > 0) {
          setCurrentConversation(transformedConversations[0])
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      setError('Failed to load conversations')
    }
  }

  const createNewConversation = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      })

      const data = await response.json()
      
      if (data.success && data.conversation) {
        const newConversation: Conversation = {
          ...data.conversation,
          createdAt: new Date(data.conversation.createdAt),
          updatedAt: new Date(data.conversation.updatedAt),
          messages: []
        }
        
        setConversations(prev => [newConversation, ...prev])
        setCurrentConversation(newConversation)
      } else {
        throw new Error(data.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
      setError('Failed to create new conversation')
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = async (content: string, attachments: any[] = []) => {
    if (!currentConversation) {
      await createNewConversation()
      setTimeout(() => addMessage(content, attachments), 500)
      return
    }

    try {
      setError(null)
      
      // Create and add user message to UI
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
        attachments
      }

      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        updatedAt: new Date(),
        title: currentConversation.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : currentConversation.title
      }

      setCurrentConversation(updatedConversation)
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        )
      )

      // Save to database
      const response = await fetch(`/api/conversations/${currentConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user', attachments }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          // Add AI response after 1 second
          setTimeout(() => addAIResponse(currentConversation.id), 1000)
        }
      }
    } catch (error) {
      console.error('Failed to add message:', error)
      setError('Failed to send message')
    }
  }

  const addAIResponse = async (conversationId: string) => {
    try {
      setIsLoading(true)
      
      const aiContent = "I'm a ChatGPT clone. This is a simulated AI response. In a real implementation, this would connect to an actual AI service like OpenAI's API."
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: aiContent, role: 'assistant' }),
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.conversation) {
          const updatedConversation: Conversation = {
            ...data.conversation,
            createdAt: new Date(data.conversation.createdAt),
            updatedAt: new Date(data.conversation.updatedAt),
            messages: data.conversation.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }
          
          setCurrentConversation(updatedConversation)
          setConversations(prev => 
            prev.map(conv => 
              conv.id === updatedConversation.id ? updatedConversation : conv
            )
          )
        }
      }
    } catch (error) {
      console.error('Failed to add AI response:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
      setError(null)
    }
  }

  const deleteConversation = async (id: string) => {
    try {
      setError(null)
      
      // Remove from UI immediately
      setConversations(prev => prev.filter(c => c.id !== id))
      
      if (currentConversation?.id === id) {
        const remaining = conversations.filter(c => c.id !== id)
        setCurrentConversation(remaining.length > 0 ? remaining[0] : null)
      }

      // Delete from database
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

    } catch (error) {
      console.error('Failed to delete conversation:', error)
      setError('Failed to delete conversation')
      // Reload conversations to restore state
      loadConversations()
    }
  }

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        addMessage,
        createNewConversation,
        selectConversation,
        deleteConversation,
        isLoading,
        error,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}