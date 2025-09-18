import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"

export function useChat() {
  const { data: session } = useSession()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  // Fetch user's chats
  const fetchChats = useCallback(async (page = 1) => {
    if (!session?.user?.email) {
      console.log('No session email, skipping fetch chats');
      return;
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chats?page=${page}&limit=15`)
      
      const data = await response.json()

      if (data.success) {
        // Sort chats by lastActivity (newest first)
        const sortedChats = data.chats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
        
        if (page === 1) {
          setChats(sortedChats)
        } else {
          setChats(prev => [...prev, ...sortedChats])
        }
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || "Failed to fetch chats")
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  // Create a new chat
  const createChat = useCallback(async (type, participantIds, name = null, description = null) => {
    if (!session?.user?.email) throw new Error("Not authenticated")

    try {
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          participantIds,
          name,
          description,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh chats to include the new one
        await fetchChats(1)
        return data.chat
      } else {
        throw new Error(data.error || "Failed to create chat")
      }
    } catch (error) {
      console.error("Error creating chat:", error)
      throw error
    }
  }, [session, fetchChats])

  // Start a chat with a friend
  const startChatWithFriend = useCallback(async (friendId) => {
    if (!session?.user?.email) throw new Error("Not authenticated")

    try {
      const response = await fetch("/api/chats/start-with-friend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ friendId }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh chats to include the new/existing one
        await fetchChats(1)
        return {
          chat: data.chat,
          isNewChat: data.isNewChat,
          message: data.message,
        }
      } else {
        throw new Error(data.error || "Failed to start chat with friend")
      }
    } catch (error) {
      console.error("Error starting chat with friend:", error)
      throw error
    }
  }, [session, fetchChats])

  // Load more chats
  const loadMoreChats = useCallback(() => {
    if (pagination?.hasMore && !loading) {
      fetchChats(pagination.currentPage + 1)
    }
  }, [pagination, loading, fetchChats])

  // Update a specific chat when a new message arrives
  const updateChatWithNewMessage = useCallback((chatId, newMessage) => {
    setChats(prevChats => {
      const updatedChats = prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            lastMessage: {
              content: newMessage.content,
              sender: newMessage.sender?.name || "Unknown",
              senderEmail: newMessage.sender?.email || "",
              createdAt: newMessage.createdAt,
              type: newMessage.type,
              attachments: newMessage.attachments || [],
              isCurrentUser: newMessage.sender?.email === session?.user?.email,
            },
            lastActivity: newMessage.createdAt,
          }
        }
        return chat
      })
      
      // Sort by lastActivity to maintain proper order
      return updatedChats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    })
  }, [session?.user?.email])

  // Initial load
  useEffect(() => {
    if (session?.user?.email) {
      fetchChats(1)
    }
  }, [session, fetchChats])

  return {
    chats,
    loading,
    error,
    pagination,
    fetchChats,
    createChat,
    startChatWithFriend,
    loadMoreChats,
    updateChatWithNewMessage,
    refetch: () => fetchChats(1),
  }
}

export function useChatMessages(chatId, onNewMessage = null) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [eventSource, setEventSource] = useState(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const messagesEndRef = useRef(null)
  const scrollPositionRef = useRef(null)
  const isInitialLoad = useRef(true)
  const shouldScrollToBottom = useRef(false)
  const isUserAtBottom = useRef(true)
  const isLoadingMoreMessages = useRef(false)

  // Fetch messages for a chat with simple page-based pagination
  const fetchMessages = useCallback(async (page = 1, append = false) => {
    if (!session?.user?.email || !chatId) return

    if (append) {
      setIsLoadingMore(true)
      isLoadingMoreMessages.current = true
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const url = new URL(`/api/chats/${chatId}/messages`, window.location.origin)
      url.searchParams.set("page", page.toString())
      url.searchParams.set("limit", "20")

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        if (append) {
          // For infinite scroll - prepend older messages with deduplication
          setMessages(prev => {
            const existingIds = new Set(prev.map(msg => msg.id))
            const newMessages = data.messages.filter(msg => !existingIds.has(msg.id))
            return [...newMessages, ...prev]
          })
          setCurrentPage(page)
          // Don't scroll to bottom when loading more messages
        } else {
          // Initial load or refresh
          setMessages(data.messages)
          setCurrentPage(1)
          // Mark that we should scroll to bottom after initial load
          shouldScrollToBottom.current = true
        }
        setHasMore(data.pagination.hasMore)
      } else {
        throw new Error(data.error || "Failed to fetch messages")
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      setError(error.message)
    } finally {
      if (append) {
        setIsLoadingMore(false)
        // Reset the loading more flag after a short delay to allow scroll position to stabilize
        setTimeout(() => {
          isLoadingMoreMessages.current = false
        }, 500)
      } else {
        setLoading(false)
      }
    }
  }, [session, chatId])

  // Check if user is at the bottom of the chat
  const checkIfAtBottom = useCallback(() => {
    const container = messagesEndRef.current?.parentElement
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      const isNearBottom = scrollTop + clientHeight > scrollHeight - 100
      isUserAtBottom.current = isNearBottom
      return isNearBottom
    }
    return true
  }, [])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      try {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
        isUserAtBottom.current = true
      } catch (error) {
        // Fallback for older browsers
        messagesEndRef.current.scrollIntoView(false)
        isUserAtBottom.current = true
      }
    }
  }, [])

  // Send a message with optimistic updates
  const sendMessage = useCallback(async (content, type = "text", attachments = [], replyTo = null) => {
    if (!session?.user?.email || !chatId) throw new Error("Not authenticated or no chat selected")

    // Create optimistic message with temporary ID
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const optimisticMessage = {
      id: tempId,
      content,
      type,
      attachments,
      replyTo,
      sender: {
        email: session.user.email,
        name: session.user.name || session.user.email,
        icon: session.user.icon || null,
        bonsai: session.user.bonsai || null
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true, // Flag to show loading state
      isFailed: false
    }

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage])
    
    // Scroll to bottom immediately for optimistic message
    setTimeout(() => {
      scrollToBottom()
    }, 50)

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
          replyTo,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Replace optimistic message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...data.message, isOptimistic: false }
            : msg
        ))
        
        // Update chat list with new message
        if (onNewMessage) {
          onNewMessage(chatId, data.message)
        }
        
        return data.message
      } else {
        // Mark message as failed
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, isOptimistic: false, isFailed: true }
            : msg
        ))
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, isOptimistic: false, isFailed: true }
          : msg
      ))
      console.error("Error sending message:", error)
      throw error
    }
  }, [session, chatId, onNewMessage, scrollToBottom])

  // Mark message as seen
  const markMessageAsSeen = useCallback(async (messageId) => {
    if (!session?.user?.email || !chatId || !messageId) return

    try {
      const response = await fetch(`/api/chats/${chatId}/messages/${messageId}/seen`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      
      if (data.success) {
        // Update the message in local state to reflect seen status
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { 
                ...msg, 
                seenBy: [...(msg.seenBy || []), { 
                  user: session.user.id, 
                  readAt: new Date().toISOString() 
                }] 
              }
            : msg
        ))
      }
    } catch (error) {
      console.error("Error marking message as seen:", error)
    }
  }, [session, chatId])

  // Mark latest message as seen when chat is opened
  useEffect(() => {
    if (messages.length > 0 && session?.user?.email) {
      const latestMessage = messages[messages.length - 1]
      
      // Only mark as seen if it's not from the current user
      if (latestMessage.sender.email !== session.user.email) {
        // Check if already seen by current user
        const alreadySeen = latestMessage.seenBy?.some(
          seen => seen.user === session.user.id
        )
        
        if (!alreadySeen) {
          markMessageAsSeen(latestMessage.id)
        }
      }
    }
  }, [messages, session, markMessageAsSeen])

  // Handle message reactions
  const handleReaction = useCallback(async (messageId, emoji) => {
    if (!session?.user?.email || !chatId || !messageId || !emoji) return

    try {
      const response = await fetch(`/api/chats/${chatId}/messages/${messageId}/react`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emoji }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Update the message reactions in local state
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        ))
      }
    } catch (error) {
      console.error("Error updating reaction:", error)
    }
  }, [session, chatId])

  // Send typing indicator
  const sendTypingIndicator = useCallback(async (isTyping) => {
    if (!session?.user?.email || !chatId) return

    try {
      await fetch(`/api/chats/${chatId}/typing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isTyping }),
      })
    } catch (error) {
      console.error("Error sending typing indicator:", error)
    }
  }, [session, chatId])

  // Load more messages (infinite scroll) with page-based pagination
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading && !isLoadingMore) {
      fetchMessages(currentPage + 1, true)
    }
  }, [hasMore, loading, isLoadingMore, currentPage, fetchMessages])

  // Set up real-time connection with reconnection logic
  useEffect(() => {
    if (!session?.user?.email || !chatId) return

    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    let reconnectTimer = null

    const connectSSE = () => {
      console.log(`Connecting to SSE for chat ${chatId}...`)
      const source = new EventSource(`/api/chats/stream?chatId=${chatId}`)

      source.onopen = () => {
        console.log("SSE connection opened")
        reconnectAttempts = 0 // Reset on successful connection
      }

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case "connected":
              console.log("Connected to chat stream")
              break
            case "ping":
              // Handle ping messages to keep connection alive
              break
            case "new_message":
              setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const messageExists = prev.some(msg => msg.id === data.message.id)
                if (messageExists) {
                  return prev
                }
                console.log("Received new message via SSE:", data.message.id)
                return [...prev, data.message]
              })
              
              // Update chat list with new message
              if (onNewMessage) {
                onNewMessage(chatId, data.message)
              }
              
              // Only scroll to bottom for received messages if user is at the bottom
              const wasAtBottom = checkIfAtBottom()
              if (wasAtBottom && !isLoadingMoreMessages.current) {
                setTimeout(() => {
                  scrollToBottom()
                }, 100)
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
              // Handle typing indicators (you can implement UI for this)
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
        source.close()
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts) * 1000 // 1s, 2s, 4s, 8s, 16s
          console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
          
          reconnectTimer = setTimeout(() => {
            reconnectAttempts++
            connectSSE()
          }, delay)
        } else {
          console.error("Max reconnection attempts reached. SSE connection failed.")
          // Fallback: refresh messages periodically
          setInterval(() => {
            console.log("Fallback: Refreshing messages due to SSE failure")
            fetchMessages(1)
          }, 10000) // Refresh every 10 seconds as fallback
        }
      }

      setEventSource(source)
      return source
    }

    const source = connectSSE()

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (source) {
        source.close()
      }
      setEventSource(null)
    }
  }, [session, chatId, onNewMessage, scrollToBottom, checkIfAtBottom, fetchMessages])

  // Initial load
  useEffect(() => {
    if (chatId) {
      setMessages([])
      setHasMore(true)
      setCurrentPage(1)
      isInitialLoad.current = true
      shouldScrollToBottom.current = false
      isUserAtBottom.current = true // Reset to bottom when switching chats
      isLoadingMoreMessages.current = false
      previousMessageCount.current = 0 // Reset message count for new chat
      fetchMessages(1)
    }
  }, [chatId, fetchMessages])

  // Auto-scroll to bottom when switching chats (initial load)
  useEffect(() => {
    if (shouldScrollToBottom.current && messages.length > 0 && !loading && !isLoadingMore) {
      setTimeout(() => {
        scrollToBottom()
        shouldScrollToBottom.current = false
        isInitialLoad.current = false
      }, 200)
    }
  }, [messages.length, loading, isLoadingMore, scrollToBottom])

  // No need for separate reset effect since it's handled in the auto-scroll effect above

  // Auto-scroll to bottom when NEW messages arrive (not when loading more old messages)
  const previousMessageCount = useRef(0)
  
  useEffect(() => {
    // Only check for new messages if we're not currently loading more old messages
    if (messages.length > 0 && !isLoadingMore && !loading && !isInitialLoad.current) {
      const container = messagesEndRef.current?.parentElement
      if (container && messages.length > previousMessageCount.current) {
        // Check if user is at the bottom before deciding to scroll
        const wasAtBottom = checkIfAtBottom()
        
        // Only auto-scroll if:
        // 1. User was at the bottom (wants to see new messages), OR
        // 2. We're not in the middle of loading more messages (to avoid interrupting scroll-up behavior)
        if (wasAtBottom && !isLoadingMoreMessages.current) {
          setTimeout(() => {
            scrollToBottom()
          }, 50)
        }
      }
    }
    
    // Update the previous message count
    previousMessageCount.current = messages.length
  }, [messages.length, scrollToBottom, isLoadingMore, loading, checkIfAtBottom])



  // Add scroll listener to track user position
  useEffect(() => {
    const container = messagesEndRef.current?.parentElement
    if (container) {
      const handleScroll = () => {
        // Don't update position tracking while loading more messages
        if (!isLoadingMoreMessages.current) {
          checkIfAtBottom()
        }
      }
      
      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [checkIfAtBottom])

  return {
    messages,
    loading,
    error,
    hasMore,
    isLoadingMore,
    messagesEndRef,
    fetchMessages,
    sendMessage,
    sendTypingIndicator,
    loadMoreMessages,
    scrollToBottom,
    markMessageAsSeen,
    handleReaction,
    refetch: () => fetchMessages(1),
  }
}

export function useChatImageUpload() {
  const { data: session } = useSession()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadImage = useCallback(async (file) => {
    if (!session?.user?.email) throw new Error("Not authenticated")
    if (!file) throw new Error("No file provided")

    setUploading(true)
    setProgress(0)

    try {
      // Get presigned URL
      const presignResponse = await fetch("/api/chats/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      })

      const presignData = await presignResponse.json()

      if (!presignData.success) {
        throw new Error(presignData.error || "Failed to get upload URL")
      }

      // Upload to S3
      const uploadResponse = await fetch(presignData.presignedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to S3")
      }

      setProgress(100)

      return {
        url: presignData.fileUrl,
        filename: file.name,
        size: file.size,
        type: "image",
        mimeType: file.type,
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      throw error
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }, [session])

  return {
    uploadImage,
    uploading,
    progress,
  }
}
