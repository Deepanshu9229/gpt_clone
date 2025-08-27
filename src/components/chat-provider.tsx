"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface User {
  id: string
  name: string
  email: string
}

interface ChatContextType {
  conversations: Conversation[]
  currentConversation: Conversation | null
  addMessage: (content: string, role: "user" | "assistant") => void
  createNewConversation: () => void
  selectConversation: (id: string) => void
  updateMessage: (messageId: string, newContent: string) => void
  deleteConversation: (id: string) => void
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const createNewConversation = () => {
    const local: Conversation = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
    }
    // Optimistic create, then sync with DB
    setConversations((prev) => [local, ...prev])
    setCurrentConversation(local)
    fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: local.title, model: 'gpt-4' }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.conversation?.id) {
          setConversations((prev) =>
            prev.map((c) => (c.id === local.id ? { ...c, id: data.conversation.id } : c)),
          )
          setCurrentConversation((prev) => (prev ? { ...prev, id: data.conversation.id } : prev))
        }
      })
      .catch(() => {
        // leave optimistic state on failure
      })
  }

  const addMessage = async (content: string, role: "user" | "assistant") => {
    if (!currentConversation) {
      createNewConversation()
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role,
      timestamp: new Date(),
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              title: conv.messages.length === 0 ? content.slice(0, 30) + "..." : conv.title,
            }
          : conv,
      ),
    )

    setCurrentConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            title: prev.messages.length === 0 ? content.slice(0, 30) + "..." : prev.title,
          }
        : null,
    )

    // Simulate AI response for user messages
    if (role === "user") {
      setIsLoading(true)
      setTimeout(() => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm a ChatGPT clone interface. This is a simulated response to demonstrate the UI functionality.",
          role: "assistant",
          timestamp: new Date(),
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversation.id ? { ...conv, messages: [...conv.messages, aiResponse] } : conv,
          ),
        )

        setCurrentConversation((prev) =>
          prev
            ? {
                ...prev,
                messages: [...prev.messages, aiResponse],
              }
            : null,
        )

        setIsLoading(false)
      }, 1000)
    }
  }

  const selectConversation = (id: string) => {
    const conversation = conversations.find((conv) => conv.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
    }
  }

  const updateMessage = (messageId: string, newContent: string) => {
    if (!currentConversation) return

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: conv.messages.map((m) =>
                m.id === messageId ? { ...m, content: newContent } : m,
              ),
            }
          : conv,
      ),
    )

    setCurrentConversation((prev) =>
      prev
        ? {
            ...prev,
            messages: prev.messages.map((m) => (m.id === messageId ? { ...m, content: newContent } : m)),
          }
        : null,
    )
  }

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    setCurrentConversation((prev) => {
      if (!prev) return prev
      if (prev.id !== id) return prev
      const remaining = conversations.filter((c) => c.id !== id)
      return remaining.length > 0 ? remaining[0] : null
    })
  }

  const login = (u: User) => setUser(u)
  const logout = () => setUser(null)

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
        user,
        login,
        logout,
        isLoading,
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
