import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"

// Configuration for message windowing and pagination
const MESSAGES_PER_PAGE = 20
const MAX_MESSAGES_IN_MEMORY = 100 // Keep only 100 messages in memory
const CLEANUP_THRESHOLD = 150 // Clean up when we have more than 150 messages

export function useOptimizedChatMessages(chatId, onNewMessage = null) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [eventSource, setEventSource] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [oldestCursor, setOldestCursor] = useState(null)
  const [newestCursor, setNewestCursor] = useState(null)
  
  // Refs for maintaining scroll position
  const messagesEndRef = useRef(null)
  const scrollPositionRef = useRef(null)
  const isInitialLoad = useRef(true)

  // Clean up old messages to prevent memory issues
  const cleanupOldMessages = useCallback((currentMessages) => {
    if (currentMessages.length <= MAX_MESSAGES_IN_MEMORY) {
      return currentMessages
    }

    // Keep the most recent messages and some older ones for context
    const recentMessages = currentMessages.slice(-MAX_MESSAGES_IN_MEMORY)
    console.log(`Cleaned up messages: kept ${recentMessages.length} out of ${currentMessages.length}`)
    
    return recentMessages
  }, [])

  // Fetch messages with cursor-based pagination
  const fetchMessages = useCallback(async (cursor = null, direction = 'before') => {
    if (!session?.user?.email || !chatId) return

    const isAppending = cursor !== null
    if (isAppending) {
      setIsLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const url = new URL(`/api/chats/${chatId}/messages`, window.location.origin)
      
      // Use cursor-based pagination instead of offset
      if (cursor) {
        url.searchParams.set("cursor", cursor)
        url.searchParams.set("direction", direction)
      }
      url.searchParams.set("limit", MESSAGES_PER_PAGE)

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        if (isAppending) {
          // For infinite scroll - prepend older messages
          const newMessages = [...data.messages, ...messages]
          const cleanedMessages = cleanupOldMessages(newMessages)
          setMessages(cleanedMessages)
        } else {
          // Initial load or refresh
          const cleanedMessages = cleanupOldMessages(data.messages)
          setMessages(cleanedMessages)
          isInitialLoad.current = false
        }
        
        setHasMore(data.pagination.hasMore)
        setOldestCursor(data.pagination.oldestCursor)
        setNewestCursor(data.pagination.newestCursor)
      } else {
        throw new Error(data.error || "Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError(error.message)
    } finally {
      if (isAppending) {
        setIsLoadingMore(false)
      } else {
        setLoading(false)
      }
    }
  }, [session, chatId, messages, cleanupOldMessages])

  // Send a message
  const sendMessage = useCallback(async (content, type = "text", attachments = []) => {
    if (!session?.user?.email || !chatId) return

    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          type,
          attachments,
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || "Failed to send message")
      }

      // Add message to local state immediately for better UX
      setMessages(prev => {
        const newMessages = [...prev, data.message]
        return cleanupOldMessages(newMessages)
      })

      return data.message
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }, [session, chatId, cleanupOldMessages])

  // Load more messages (older ones)
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading && !isLoadingMore && oldestCursor) {
      // Store current scroll position before loading more
      if (messagesEndRef.current) {
        const container = messagesEndRef.current.parentElement
        if (container) {
          scrollPositionRef.current = {
            scrollHeight: container.scrollHeight,
            scrollTop: container.scrollTop
          }
        }
      }
      
      fetchMessages(oldestCursor, 'before')
    }
  }, [hasMore, loading, isLoadingMore, oldestCursor, fetchMessages])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Set up real-time connection with optimized message handling
  useEffect(() => {
    if (!session?.user?.email || !chatId) return

    const source = new EventSource(`/api/chats/stream?chatId=${chatId}`)

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        switch (data.type) {
          case "connected":
            console.log("Connected to chat stream")
            break
          case "new_message":
            setMessages(prev => {
              const newMessages = [...prev, data.message]
              const cleanedMessages = cleanupOldMessages(newMessages)
              return cleanedMessages
            })
            
            // Update chat list with new message
            if (onNewMessage) {
              onNewMessage(chatId, data.message)
            }
            break
          case "message_edited":
            setMessages(prev => 
              prev.map(msg => 
                msg.id === data.messageId 
                  ? { ...msg, content: data.updatedContent, isEdited: true }
                  : msg
              )
            )
            break
          case "message_deleted":
            setMessages(prev => prev.filter(msg => msg.id !== data.messageId))
            break
          case "typing":
            // Handle typing indicators
            console.log("User typing:", data)
            break
          default:
            console.log("Unknown event type:", data.type)
        }
      } catch (error) {
        console.error("Error parsing SSE data:", error)
      }
    }

    source.onerror = (error) => {
      console.error("SSE error:", error)
    }

    setEventSource(source)

    return () => {
      source.close()
      setEventSource(null)
    }
  }, [session, chatId, onNewMessage, cleanupOldMessages])

  // Initial load
  useEffect(() => {
    if (chatId) {
      setMessages([])
      setHasMore(true)
      setOldestCursor(null)
      setNewestCursor(null)
      fetchMessages()
    }
  }, [chatId, fetchMessages])

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && scrollPositionRef.current && messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement
      if (container) {
        const { scrollHeight: oldScrollHeight } = scrollPositionRef.current
        const newScrollHeight = container.scrollHeight
        const heightDifference = newScrollHeight - oldScrollHeight
        
        // Restore scroll position by adjusting for the new content height
        container.scrollTop = heightDifference
        scrollPositionRef.current = null
      }
    }
  }, [isLoadingMore, messages])

  // Auto-scroll to bottom when new messages arrive (only on initial load)
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom()
        isInitialLoad.current = false
      }, 100)
    }
  }, [messages.length, scrollToBottom])

  return {
    messages,
    loading,
    error,
    hasMore,
    isLoadingMore,
    messagesEndRef,
    sendMessage,
    loadMoreMessages,
    scrollToBottom,
    // Additional optimized methods
    refreshMessages: () => fetchMessages(),
    clearMessages: () => setMessages([]),
    messageCount: messages.length,
  }
}
