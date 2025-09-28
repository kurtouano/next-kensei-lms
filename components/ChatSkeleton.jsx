import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

// Skeleton for individual chat item in sidebar
export function ChatItemSkeleton() {
  return (
    <div className="p-3 sm:p-4 border-b">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Skeleton for chat list sidebar
export function ChatListSkeleton({ count = 6 }) {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 flex-1" />
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
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-3 w-20" />
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
      <div className="flex items-center gap-2">
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="flex-1 h-10 rounded" />
        <Skeleton className="w-8 h-8 rounded" />
        <Skeleton className="w-16 h-10 rounded" />
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
              <ChatListSkeleton />
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
