"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Loader2, ImageIcon, FileText, Reply, MoreVertical } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

// Virtual scrolling configuration
const ITEM_HEIGHT = 80 // Approximate height of each message
const BUFFER_SIZE = 5 // Extra items to render outside viewport
const WINDOW_SIZE = 50 // Maximum messages to keep in memory

// Memoized message component for performance
const MessageItem = React.memo(({ message, isVisible, onReply, onMore }) => {
  if (!isVisible) {
    return <div style={{ height: ITEM_HEIGHT }} /> // Placeholder for virtual scrolling
  }

  const formatTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
  }

  const renderAttachment = (attachment) => {
    if (attachment.type === 'image') {
      return (
        <div className="mt-2">
          <img 
            src={attachment.url} 
            alt={attachment.filename}
            className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
            loading="lazy"
          />
        </div>
      )
    }
    
    if (attachment.type === 'file') {
      return (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-sm">{attachment.filename}</span>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="flex gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={message.sender.icon} />
        <AvatarFallback>
          {message.sender.name?.charAt(0)?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{message.sender.name}</span>
          <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
          {message.isEdited && (
            <span className="text-xs text-gray-400">(edited)</span>
          )}
        </div>
        
        {message.replyTo && (
          <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-sm border-l-2 border-blue-500">
            <div className="text-xs text-gray-500 mb-1">
              Replying to {message.replyTo.sender}
            </div>
            <div className="text-gray-700 dark:text-gray-300 truncate">
              {message.replyTo.content}
            </div>
          </div>
        )}
        
        <div className="text-gray-900 dark:text-gray-100">
          {message.type === 'text' && (
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}
          
          {message.attachments?.map((attachment, index) => (
            <div key={index}>
              {renderAttachment(attachment)}
            </div>
          ))}
        </div>
        
        {message.reactions?.length > 0 && (
          <div className="flex gap-1 mt-2">
            {message.reactions.map((reaction, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
              >
                {reaction.emoji} {reaction.count}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(message)}
            className="h-6 px-2 text-xs"
          >
            <Reply className="w-3 h-3 mr-1" />
            Reply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onMore(message)}
            className="h-6 px-2 text-xs"
          >
            <MoreVertical className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
})

MessageItem.displayName = 'MessageItem'

export default function VirtualizedMessageList({ 
  messages, 
  loading, 
  isLoadingMore, 
  hasMore, 
  onLoadMore,
  onReply,
  onMore 
}) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const [isNearTop, setIsNearTop] = useState(false)
  const [isNearBottom, setIsNearBottom] = useState(false)

  // Calculate visible range for virtual scrolling
  const visibleRange = useMemo(() => {
    if (!containerHeight || messages.length === 0) {
      return { start: 0, end: 0 }
    }

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE)
    const endIndex = Math.min(
      messages.length - 1,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER_SIZE
    )

    return { start: startIndex, end: endIndex }
  }, [scrollTop, containerHeight, messages.length])

  // Message windowing - only keep a subset of messages in memory
  const windowedMessages = useMemo(() => {
    if (messages.length <= WINDOW_SIZE) {
      return messages
    }

    // Keep messages around the visible range
    const windowStart = Math.max(0, visibleRange.start - WINDOW_SIZE / 2)
    const windowEnd = Math.min(messages.length - 1, visibleRange.end + WINDOW_SIZE / 2)
    
    return messages.slice(windowStart, windowEnd + 1)
  }, [messages, visibleRange])

  // Handle scroll events
  const handleScroll = useCallback((e) => {
    const container = e.target
    const newScrollTop = container.scrollTop
    const newScrollHeight = container.scrollHeight
    const newClientHeight = container.clientHeight

    setScrollTop(newScrollTop)
    setContainerHeight(newClientHeight)

    // Check if near top for loading more messages
    const nearTop = newScrollTop < 100
    setIsNearTop(nearTop)

    // Check if near bottom for auto-scroll behavior
    const nearBottom = newScrollTop + newClientHeight > newScrollHeight - 100
    setIsNearBottom(nearBottom)

    // Load more messages when near top
    if (nearTop && hasMore && !loading && !isLoadingMore) {
      onLoadMore()
    }
  }, [hasMore, loading, isLoadingMore, onLoadMore])

  // Auto-scroll to bottom for new messages
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [])

  // Scroll to bottom when new messages arrive (if user was at bottom)
  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom()
    }
  }, [messages.length, isNearBottom, scrollToBottom])

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  // Calculate total height for virtual scrolling
  const totalHeight = messages.length * ITEM_HEIGHT
  const offsetY = visibleRange.start * ITEM_HEIGHT

  return (
    <div className="flex flex-col h-full">
      {/* Loading indicator at top */}
      {isLoadingMore && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}

      {/* Virtual scrolling container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Virtual scrolling spacer */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
            }}
          >
            {windowedMessages.map((message, index) => {
              const globalIndex = visibleRange.start + index
              const isVisible = globalIndex >= visibleRange.start && globalIndex <= visibleRange.end
              
              return (
                <div
                  key={message.id}
                  style={{ height: ITEM_HEIGHT }}
                  className="group"
                >
                  <MessageItem
                    message={message}
                    isVisible={isVisible}
                    onReply={onReply}
                    onMore={onMore}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Loading indicator at bottom */}
      {loading && (
        <div className="flex justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  )
}
