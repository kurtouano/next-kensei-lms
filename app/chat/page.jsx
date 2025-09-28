"use client"

import dynamic from 'next/dynamic'
import { ChatInterfaceSkeleton } from '@/components/ChatSkeleton'

// Lazy load the heavy ChatInterface component
const ChatInterface = dynamic(() => import("./components/ChatInterface"), {
  loading: () => <ChatInterfaceSkeleton />,
  ssr: false // Chat is interactive and user-specific
})

export default function ChatPage() {
  return <ChatInterface />
}
