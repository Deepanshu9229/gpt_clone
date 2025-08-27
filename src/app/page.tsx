"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatArea } from "@/components/chat-area"
import { ChatProvider } from "@/components/chat-provider"

export const dynamic = "force-dynamic"

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <ChatProvider>
      <div className="flex h-screen min-h-0 bg-background text-foreground">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <ChatArea sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      </div>
    </ChatProvider>
  )
}
