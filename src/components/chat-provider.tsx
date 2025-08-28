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
  model: string
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
      // Clear data for non-signed users
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
          model: conv.model || 'gpt-4',
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }))
        
        setConversations(transformedConversations)
        
        // Select first conversation if none selected
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
          model: data.conversation.model || 'gpt-4',
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
      // Retry after creating conversation
      setTimeout(() => addMessage(content, attachments), 500)
      return
    }

    try {
      setError(null)
      
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content,
        role: "user",
        timestamp: new Date(),
        attachments
      }

      // Update UI immediately
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        updatedAt: new Date(),
        title: currentConversation.messages.length === 0 ? content.slice(0, 30) + (content.length > 30 ? "..." : "") : currentConversation.title,
        model: currentConversation.model || 'gpt-4'
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

      const data = await response.json()
      
      if (data.success && data.conversation) {
        // Merge only new/updated fields to avoid UI flicker
        setConversations(prev => prev.map(conv => {
          if (conv.id !== currentConversation.id) return conv
          const serverMsgs = data.conversation.messages || []
          const merged = {
            ...conv,
            updatedAt: new Date(data.conversation.updatedAt),
            model: data.conversation.model || conv.model || 'gpt-4',
            messages: serverMsgs.length >= conv.messages.length
              ? serverMsgs.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
              : conv.messages
          }
          return merged
        }))
        
        // Add AI response after user message is saved
        setTimeout(() => addAIResponse(updatedConversation), 1000)
      }
    } catch (error) {
      console.error('Failed to add message:', error)
      // Do NOT remove the message from UI; keep local state
      setError('Saved locally. Sync will retry when online.')
    }
  }

  const addAIResponse = async (conversation: Conversation) => {
    try {
      setIsLoading(true)
      
      console.log('🔍 Debugging addAIResponse - conversation:', conversation);
      console.log('🔍 Conversation messages:', conversation.messages);
      console.log('🔍 Messages length:', conversation.messages?.length);
      
      // Get the last user message to send to AI
      console.log('🔍 Filtering messages by role...');
      conversation.messages?.forEach((msg, index) => {
        console.log(`🔍 Message ${index}:`, { role: msg.role, content: msg.content?.substring(0, 50) });
      });
      
      const userMessages = conversation.messages?.filter(msg => msg.role === 'user') || [];
      console.log('🔍 User messages found:', userMessages);
      console.log('🔍 All messages for debugging:', conversation.messages);
      
      if (userMessages.length === 0) {
        console.error('No user messages found in conversation');
        console.error('Available messages:', conversation.messages);
        return;
      }
      
      const lastUserMessage = userMessages[userMessages.length - 1]; // Use last element instead of pop()
      console.log('🔍 Last user message:', lastUserMessage);
      
      if (!lastUserMessage) {
        console.error('No user message found for AI response')
        console.error('Available messages:', conversation.messages);
        return
      }

      console.log('🤖 Calling AI API with:', {
        messages: [{ role: 'user', content: lastUserMessage.content }],
        model: conversation.model || 'gpt-4'
      });

      // Call the AI API endpoint
      const aiResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: lastUserMessage.content }
          ],
          model: conversation.model || 'gpt-4'
        }),
      })

      console.log('🤖 AI API response status:', aiResponse.status, aiResponse.statusText);

      if (!aiResponse.ok) {
        throw new Error(`AI API error: ${aiResponse.status}`)
      }

      // Handle streaming response from AI API
      let aiContent = ''
      const reader = aiResponse.body?.getReader()
      if (!reader) {
        throw new Error('No response body reader available')
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          // Decode the chunk and append to content
          const chunk = new TextDecoder().decode(value)
          aiContent += chunk
          console.log('🤖 Received chunk:', chunk);
        }
      } finally {
        reader.releaseLock()
      }
      
      console.log('🤖 Final AI content:', aiContent);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiContent,
        role: "assistant",
        timestamp: new Date()
      }

      // Save AI response to database
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: aiMessage.content, role: 'assistant' }),
      })

      const data = await response.json()
      
      if (data.success && data.conversation) {
        const updatedConversation: Conversation = {
          ...data.conversation,
          createdAt: new Date(data.conversation.createdAt),
          updatedAt: new Date(data.conversation.updatedAt),
          model: data.conversation.model || conversation.model || 'gpt-4',
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
    } catch (error) {
      console.error('Failed to add AI response:', error)
      // Add a fallback message if AI fails
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting to the AI service right now. Please check your API configuration and try again.",
        role: "assistant",
        timestamp: new Date()
      }
      
      // Update UI with fallback message
      const updatedConversation = {
        ...conversation,
        messages: [...conversation.messages, fallbackMessage],
        updatedAt: new Date(),
        model: conversation.model || 'gpt-4'
      }
      
      setCurrentConversation(updatedConversation)
      setConversations(prev => 
        prev.map(conv => 
          conv.id === updatedConversation.id ? updatedConversation : conv
        )
      )
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
      
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (data.success) {
        setConversations(prev => prev.filter(c => c.id !== id))
        
        if (currentConversation?.id === id) {
          const remaining = conversations.filter(c => c.id !== id)
          setCurrentConversation(remaining.length > 0 ? remaining[0] : null)
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error)
      setError('Failed to delete conversation')
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