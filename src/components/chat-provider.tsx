"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useUser } from "@clerk/nextjs"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  attachments?: any[]
  edited?: boolean
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
  model?: string
  local?: boolean
}

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  addMessage: (content: string, role: "user" | "assistant", attachments?: any[]) => Promise<void>
  createNewConversation: () => Promise<void>
  selectConversation: (id: string) => void
  updateMessage: (messageId: string, newContent: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  updateConversationTitle: (id: string, title: string) => Promise<void>
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load conversations on mount and when user changes
  useEffect(() => {
    if (isSignedIn) {
      loadConversations()
    } else {
      setConversations([])
      setCurrentConversation(null)
    }
  }, [isSignedIn, user])

  const clearError = () => setError(null)

  const loadConversations = async () => {
    try {
      setError(null)
      const response = await fetch('/api/conversations')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        let transformedConversations = []
        
        if (data.conversations && data.conversations.length > 0) {
          transformedConversations = data.conversations.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }))
          }))
        } else if (data.offline) {
          // MongoDB not available, create a default conversation for offline mode
          const defaultConversation: Conversation = {
            id: Date.now().toString(),
            title: "New Chat (Offline Mode)",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            model: 'gpt-4',
            local: true
          }
          transformedConversations = [defaultConversation]
        }
        
        setConversations(transformedConversations)
        
        // If no current conversation is selected, select the first one
        if (!currentConversation && transformedConversations.length > 0) {
          setCurrentConversation(transformedConversations[0])
        }
      } else {
        throw new Error(data.error || 'Failed to load conversations')
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
      // Create a default conversation on error for offline mode
      const defaultConversation: Conversation = {
        id: Date.now().toString(),
        title: "New Chat (Offline Mode)",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'gpt-4',
        local: true
      }
      setConversations([defaultConversation])
      setCurrentConversation(defaultConversation)
    }
  }

  const createNewConversation = async () => {
    try {
      setError(null)
      setIsLoading(true)
      
      if (!isSignedIn) {
        // For non-signed-in users, create a local conversation
        const localConversation: Conversation = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          model: 'gpt-4',
          local: true
        }
        setConversations(prev => [localConversation, ...prev])
        setCurrentConversation(localConversation)
        return
      }

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: 'New Chat', 
          model: 'gpt-4',
          messages: []
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success && data.conversation) {
        const newConversation: Conversation = {
          ...data.conversation,
          createdAt: new Date(data.conversation.createdAt),
          updatedAt: new Date(data.conversation.updatedAt),
          messages: [],
          local: data.local || false
        }
        
        // If offline mode, update the title to indicate it's offline
        if (data.offline) {
          newConversation.title = "New Chat (Offline Mode)"
          newConversation.local = true
        }
        
        setConversations(prev => [newConversation, ...prev])
        setCurrentConversation(newConversation)
      } else {
        throw new Error(data.error || 'Failed to create conversation')
      }
    } catch (error) {
      console.error('Failed to create conversation:', error)
      // Create a local conversation on error
      const localConversation: Conversation = {
        id: Date.now().toString(),
        title: "New Chat",
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'gpt-4',
        local: true
      }
      setConversations(prev => [localConversation, ...prev])
      setCurrentConversation(localConversation)
    } finally {
      setIsLoading(false)
    }
  }

  const addMessage = async (content: string, role: "user" | "assistant", attachments: any[] = []) => {
    try {
      setError(null)
      
      if (!currentConversation) {
        await createNewConversation()
        // Wait a bit for the conversation to be created
        await new Promise(resolve => setTimeout(resolve, 100))
        return addMessage(content, role, attachments)
      }

      const newMessage: Message = {
        id: Date.now().toString(),
        content,
        role,
        timestamp: new Date(),
        attachments,
        edited: false
      }

      // Update local state immediately for better UX (optimistic update)
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, newMessage],
        title: currentConversation.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : currentConversation.title,
        updatedAt: new Date()
      }

      setCurrentConversation(updatedConversation)
      setConversations(prev => 
        prev.map(conv => 
          conv.id === currentConversation.id ? updatedConversation : conv
        )
      )

      // Only try to save to database if signed in and not a local conversation
      if (isSignedIn && !currentConversation.local) {
        try {
          const response = await fetch(`/api/conversations/${currentConversation.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content, role, attachments }),
          })

          if (response.ok) {
            const data = await response.json()
            
            if (data.success && data.conversation) {
              // Update with server response
              const serverConversation: Conversation = {
                ...data.conversation,
                createdAt: new Date(data.conversation.createdAt),
                updatedAt: new Date(data.conversation.updatedAt),
                messages: data.conversation.messages.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                }))
              }
              setCurrentConversation(serverConversation)
              setConversations(prev => 
                prev.map(conv => 
                  conv.id === serverConversation.id ? serverConversation : conv
                )
              )
            }
          }
        } catch (dbError) {
          console.error('Failed to save to database, keeping local:', dbError)
          // Keep the local conversation, just mark it as local
          updatedConversation.local = true
          setCurrentConversation(updatedConversation)
          setConversations(prev => 
            prev.map(conv => 
              conv.id === currentConversation.id ? updatedConversation : conv
            )
          )
        }
      }

      // Simulate AI response for user messages
      if (role === "user") {
        setIsLoading(true)
        setTimeout(async () => {
          try {
            await addMessage(
              "I'm a ChatGPT clone interface. This is a simulated response to demonstrate the UI functionality. In a real implementation, this would be replaced with actual AI responses.",
              "assistant"
            )
          } catch (error) {
            console.error('Failed to add AI response:', error)
            setError('Failed to generate AI response')
          } finally {
            setIsLoading(false)
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to add message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
      setIsLoading(false)
      
      // Revert optimistic update on error
      if (currentConversation) {
        const revertedConversation = {
          ...currentConversation,
          messages: currentConversation.messages.slice(0, -1),
          updatedAt: new Date()
        }
        setCurrentConversation(revertedConversation)
        setConversations(prev => 
          prev.map(conv => 
            conv.id === currentConversation.id ? revertedConversation : conv
          )
        )
      }
    }
  }

  const selectConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
      setError(null)
    }
  }

  const updateMessage = async (messageId: string, newContent: string) => {
    try {
      setError(null)
      
      if (!currentConversation) return

      // Update local state immediately (optimistic update)
      const updatedMessages = currentConversation.messages.map(msg =>
        msg.id === messageId ? { ...msg, content: newContent, edited: true } : msg
      )
      
      const updatedConversation = {
        ...currentConversation,
        messages: updatedMessages,
        updatedAt: new Date()
      }

      setCurrentConversation(updatedConversation)
      setConversations(prev =>
        prev.map(conv =>
          conv.id === currentConversation.id ? updatedConversation : conv
        )
      )

      // Only try to save to database if signed in and not a local conversation
      if (isSignedIn && !currentConversation.local) {
        try {
          const response = await fetch(`/api/conversations/${currentConversation.id}/messages`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messageId, content: newContent }),
          })

          if (response.ok) {
            const data = await response.json()
            
            if (data.success && data.conversation) {
              // Update with server response
              const serverConversation: Conversation = {
                ...data.conversation,
                createdAt: new Date(data.conversation.createdAt),
                updatedAt: new Date(data.conversation.updatedAt),
                messages: data.conversation.messages.map((msg: any) => ({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                }))
              }
              setCurrentConversation(serverConversation)
              setConversations(prev => 
                prev.map(conv => 
                  conv.id === serverConversation.id ? serverConversation : conv
                )
              )
            }
          }
        } catch (dbError) {
          console.error('Failed to save to database, keeping local:', dbError)
          // Keep the local conversation, just mark it as local
          updatedConversation.local = true
          setCurrentConversation(updatedConversation)
          setConversations(prev => 
            prev.map(conv => 
              conv.id === currentConversation.id ? updatedConversation : conv
            )
          )
        }
      }
    } catch (error) {
      console.error('Failed to update message:', error)
      setError(error instanceof Error ? error.message : 'Failed to update message')
      
      // Revert optimistic update on error
      if (currentConversation) {
        const revertedConversation = {
          ...currentConversation,
          messages: currentConversation.messages.map(msg =>
            msg.id === messageId ? { ...msg, content: msg.content, edited: false } : msg
          ),
          updatedAt: new Date()
        }
        setCurrentConversation(revertedConversation)
        setConversations(prev =>
          prev.map(conv =>
            conv.id === currentConversation.id ? revertedConversation : conv
          )
        )
      }
    }
  }

  const deleteConversation = async (id: string) => {
    // Store current state for potential rollback
    const originalConversations = [...conversations]
    const originalCurrent = currentConversation
    
    try {
      setError(null)
      
      // Update local state immediately (optimistic update)
      setConversations(prev => prev.filter(c => c.id !== id))
      
      if (currentConversation?.id === id) {
        const remaining = conversations.filter(c => c.id !== id)
        setCurrentConversation(remaining.length > 0 ? remaining[0] : null)
      }

      // Only try to delete from database if signed in and not a local conversation
      const conversation = conversations.find(c => c.id === id)
      if (isSignedIn && conversation && !conversation.local) {
        try {
          const response = await fetch(`/api/conversations/${id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to delete conversation')
          }
        } catch (dbError) {
          console.error('Failed to delete from database:', dbError)
          // Keep the local deletion, just log the error
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete conversation')
      
      // Revert optimistic update on error
      setConversations(originalConversations)
      setCurrentConversation(originalCurrent)
    }
  }

  const updateConversationTitle = async (id: string, title: string) => {
    // Store original title for potential rollback
    const originalConversations = [...conversations]
    const originalCurrent = currentConversation
    
    try {
      setError(null)
      
      // Update local state immediately (optimistic update)
      setConversations(prev =>
        prev.map(conv =>
          conv.id === id ? { ...conv, title, updatedAt: new Date() } : conv
        )
      )

      if (currentConversation?.id === id) {
        setCurrentConversation(prev => 
          prev ? { ...prev, title, updatedAt: new Date() } : prev
        )
      }

      // Only try to save to database if signed in and not a local conversation
      const conversation = conversations.find(c => c.id === id)
      if (isSignedIn && conversation && !conversation.local) {
        try {
          const response = await fetch(`/api/conversations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          
          if (!data.success) {
            throw new Error(data.error || 'Failed to update conversation title')
          }
        } catch (dbError) {
          console.error('Failed to save to database:', dbError)
          // Keep the local update, just log the error
        }
      }
    } catch (error) {
      console.error('Failed to update conversation title:', error)
      setError(error instanceof Error ? error.message : 'Failed to update conversation title')
      
      // Revert optimistic update on error
      setConversations(originalConversations)
      setCurrentConversation(originalCurrent)
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
        updateMessage,
        deleteConversation,
        updateConversationTitle,
        isLoading,
        error,
        clearError,
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