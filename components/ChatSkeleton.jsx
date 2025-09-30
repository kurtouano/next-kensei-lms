import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, ImageIcon, Paperclip, Smile } from "lucide-react"

// Skeleton for individual chat item in sidebar
export function ChatItemSkeleton() {
  return (
    <div className="p-3 sm:p-4 border-b">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
        </div>
        <div className="flex-1 min-w-0 max-w-[180px] sm:max-w-none">
          <div className="flex items-center justify-between mb-1">
            <div className="min-w-0 flex-1 flex items-center gap-1">
              <Skeleton className="h-4 w-24 truncate" />
              <Skeleton className="h-3 w-3 rounded flex-shrink-0" />
            </div>
            <Skeleton className="h-3 w-12 flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32 truncate" />
            <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for chat list items only (without header and search)
export function ChatListSkeleton({ count = 6 }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {Array.from({ length: count }).map((_, i) => (
        <ChatItemSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton for complete chat list sidebar (with header and search)
export function ChatListSidebarSkeleton({ count = 6 }) {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        {/* Messages Header - Static */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        
        {/* Search Bar - Mixed Static and Skeleton */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent text-sm bg-white"
              disabled
            />
          </div>
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: count }).map((_, i) => (
          <ChatItemSkeleton key={i} />
        ))}
      </div>
    </Card>
  )
}

// Skeleton for individual message
export function MessageSkeleton({ isOwn = false }) {
  return (
    <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
      <div className={`max-w-[70%] ${isOwn ? "text-right" : ""}`}>
        <Skeleton className={`h-10 ${isOwn ? "w-48" : "w-32"} rounded-lg`} />
        <Skeleton className="h-3 w-16 mt-1" />
      </div>
    </div>
  )
}

// Skeleton for chat messages area
export function ChatMessagesSkeleton({ count = 8 }) {
  return (
    <div className="flex-1 overflow-y-auto p-1 sm:p-2 space-y-3 sm:space-y-4 bg-gray-50">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} isOwn={i % 3 === 0} />
      ))}
    </div>
  )
}

// Skeleton for chat header
export function ChatHeaderSkeleton() {
  return (
    <div className="p-3 sm:p-4 border-b bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="min-w-0 flex-1 max-w-[200px] sm:max-w-none">
            <Skeleton className="h-5 w-32 mb-1 truncate" />
            <Skeleton className="h-3 w-20 truncate" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for message input area
export function MessageInputSkeleton() {
  return (
    <div className="p-3 sm:p-4 border-t bg-white">
      <div className="flex items-center min-w-0">
        <div className="flex items-center gap-1 sm:gap-6 flex-shrink-0">
          {/* Paperclip icon - Static */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-[#4a7c59] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[32px] flex-shrink-0 p-0"
            disabled
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {/* Image icon - Static */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-[#4a7c59] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[32px] flex-shrink-0 p-0"
            disabled
            title="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          {/* Emoji icon - Static */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-[#4a7c59] min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[32px] flex-shrink-0 p-0"
            disabled
            title="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="ml-1 sm:ml-3 flex-1 flex items-center gap-1 sm:gap-2 min-w-0">
          {/* Message input - Static */}
          <textarea
            placeholder="Type a message..."
            className="flex-1 px-3 py-1.5 sm:py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#2646248a] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none overflow-hidden break-words overflow-wrap-anywhere whitespace-pre-wrap text-base sm:text-sm min-w-0"
            disabled
            autoComplete="off"
            autoFocus={false}
            rows={1}
            style={{ height: '32px', wordBreak: 'break-word', overflowWrap: 'anywhere' }}
          />
          
          {/* Send button - Static */}
          <Button 
            className="bg-[#4a7c59] hover:bg-[#3a6147] h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 p-0 ml-1"
            disabled
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main chat interface skeleton
export function ChatInterfaceSkeleton() {
  return (
    <div className="bg-gray-50 overflow-x-hidden flex flex-col">
      <div className="flex-1 flex items-center justify-center lg:py-4">
        <div className="w-full max-w-[86rem] mx-auto">
          <div className="flex h-[calc(100vh-8.4rem)] lg:h-[calc(100vh-11rem)]">
            {/* Chat List Sidebar Skeleton */}
            <div className="hidden lg:block lg:relative lg:w-1/4">
              <ChatListSidebarSkeleton />
            </div>

            {/* Chat Area Skeleton */}
            <div className="flex-1 lg:w-3/4">
              <Card className="h-full flex flex-col">
                <ChatHeaderSkeleton />
                <ChatMessagesSkeleton />
                <MessageInputSkeleton />
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile-friendly chat interface skeleton
export function MobileChatInterfaceSkeleton() {
  return (
    <div className="bg-gray-50 overflow-x-hidden flex flex-col h-screen">
      {/* Mobile Header */}
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded" />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-1 sm:p-2 space-y-3 sm:space-y-4 bg-gray-50">
        {Array.from({ length: 8 }).map((_, i) => (
          <MessageSkeleton key={i} isOwn={i % 3 === 0} />
        ))}
      </div>

      {/* Message Input */}
      <MessageInputSkeleton />
    </div>
  )
}

// Skeleton for loading more chats
export function LoadingMoreChatsSkeleton() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <ChatItemSkeleton key={`loading-${index}`} />
      ))}
    </>
  )
}

// Skeleton for loading more messages
export function LoadingMoreMessagesSkeleton() {
  return (
    <div className="flex justify-center py-2">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  )
}
