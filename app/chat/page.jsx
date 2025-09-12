"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Lazy load the heavy ChatInterface component
const ChatInterface = dynamic(() => import("./components/ChatInterface"), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#4a7c59]" />
        <p className="text-[#2c3e2d] text-sm">Loading chat...</p>
      </div>
    </div>
  ),
  ssr: false // Chat is interactive and user-specific
})

export default function ChatPage() {
  return <ChatInterface />
}
