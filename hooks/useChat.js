import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { uploadChatImage, uploadChatAttachment } from "@/lib/chatFileUpload"

export function useChat() {
  const { data: session } = useSession()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  // Fetch user's chats
  const fetchChats = useCallback(async (page = 1) => {
    if (!session?.user?.email) {
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
              sender: newMessage.sender?.name || "System",
              senderEmail: newMessage.sender?.email || "system@kensei-lms.com",
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

  // Send attachment with optimistic updates
  const sendAttachmentOptimistic = useCallback(async (file, type = "attachment", detectedFileType = "general") => {
    if (!session?.user?.email || !chatId) throw new Error("Not authenticated or no chat selected")

    // Create optimistic message with temporary ID and placeholder attachment
    const tempId = `temp_${Date.now()}_${Math.random()}`
    const optimisticMessage = {
      id: tempId,
      content: "",
      type: type,
      attachments: [{
        url: "", // Empty URL initially
        filename: file.name,
        size: file.size,
        type: detectedFileType,
        mimeType: file.type,
        isUploading: true, // Flag to show upload progress
        tempFile: file // Store file for upload
      }],
      replyTo: null,
      sender: {
        email: session.user.email,
        name: session.user.name || session.user.email,
        icon: session.user.icon || null,
        bonsai: session.user.bonsai || null
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
      isFailed: false
    }

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage])
    
    // Scroll to bottom immediately for optimistic message
    setTimeout(() => {
      scrollToBottom()
    }, 50)

    try {
      // Upload the file first
      let uploadResult
      console.log("Starting file upload...", { type, detectedFileType, fileName: file.name, fileSize: file.size, fileType: file.type })
      
      if (type === "image") {
        console.log("Calling uploadChatImage...")
        try {
          uploadResult = await uploadChatImage(file)
          console.log("uploadChatImage completed:", uploadResult)
        } catch (uploadError) {
          console.error("uploadChatImage failed:", uploadError)
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }
      } else {
        console.log("Calling uploadChatAttachment...")
        try {
          uploadResult = await uploadChatAttachment(file, detectedFileType)
          console.log("uploadChatAttachment completed:", uploadResult)
        } catch (uploadError) {
          console.error("uploadChatAttachment failed:", uploadError)
          throw new Error(`File upload failed: ${uploadError.message}`)
        }
      }
      
      console.log("Upload completed successfully:", uploadResult)

      // Update the optimistic message with real attachment data
      // Map detected file types to valid database enum values
      let mappedType
      if (type === "image") {
        mappedType = "image"
      } else if (detectedFileType === "audio") {
        mappedType = "file"
      } else if (detectedFileType === "spreadsheet") {
        mappedType = "file" // Map spreadsheet to file for database compatibility
      } else if (detectedFileType === "document") {
        mappedType = "document"
      } else {
        mappedType = "general"
      }

      const attachmentData = {
        url: uploadResult.url,
        filename: uploadResult.metadata.originalFilename,
        size: uploadResult.metadata.compressedSize || uploadResult.metadata.originalSize,
        type: mappedType,
        mimeType: uploadResult.metadata.contentType,
        isUploading: false
      }
      
      console.log("Attachment data for API:", attachmentData)

      // Update the message with real attachment data
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, attachments: [attachmentData] }
          : msg
      ))

      // Now send the message to the server
      console.log("Sending message to API...", { content: "", type, attachments: [attachmentData] })
      
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: "", // Empty string for attachment-only messages
          type: type,
          attachments: [attachmentData],
          replyTo: null,
        }),
      })

      console.log("API Response status:", response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`API Error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      
      // Debug logging
      console.log("API Response data:", data)

      if (data.success) {
        // Replace optimistic message with real message
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...data.message, isOptimistic: false, isFailed: false }
            : msg
        ))
        
        // Notify parent component of new message
        if (onNewMessage) {
          onNewMessage(data.message)
        }
      } else {
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, isOptimistic: false, isFailed: true }
          : msg
      ))
      console.error("Error uploading attachment:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        fileName: file?.name,
        fileType: file?.type,
        type,
        detectedFileType
      })
      throw error
    }
  }, [session, chatId, onNewMessage, scrollToBottom])


  // Handle message reactions with debouncing to prevent double-clicks
  const handleReaction = useCallback(async (messageId, emoji) => {
    if (!session?.user?.email || !chatId || !messageId || !emoji) return

    // Find the message to get current reactions
    const currentMessage = messages.find(msg => msg.id === messageId)
    if (!currentMessage) return

    const currentReactions = currentMessage.reactions || []
    const userEmail = session.user.email
    
    // Check if user already reacted with this emoji
    const existingReaction = currentReactions.find(r => r.emoji === emoji && r.user === userEmail)
    
    // Create a unique key for this reaction action to prevent double-processing
    const reactionKey = `${messageId}-${emoji}-${userEmail}`
    
    // Check if this exact reaction is already being processed
    if (window.reactionProcessing && window.reactionProcessing.has(reactionKey)) {
      return // Skip if already processing this exact reaction
    }
    
    // Mark this reaction as being processed
    if (!window.reactionProcessing) {
      window.reactionProcessing = new Set()
    }
    window.reactionProcessing.add(reactionKey)

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
        // Update with real server data
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, reactions: data.reactions }
            : msg
        ))
      } else {
        console.error("Failed to update reaction:", data.error)
      }
    } catch (error) {
      console.error("Error updating reaction:", error)
    } finally {
      // Remove from processing set after a short delay to prevent rapid double-clicks
      setTimeout(() => {
        if (window.reactionProcessing) {
          window.reactionProcessing.delete(reactionKey)
        }
      }, 500) // 500ms debounce
    }
  }, [session, chatId, messages])

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

  // Set up real-time connection with enhanced reconnection logic
  useEffect(() => {
    if (!session?.user?.email || !chatId) {
      return
    }
    
    let reconnectAttempts = 0
    const maxReconnectAttempts = 10 // Increased from 5
    let reconnectTimer = null
    let connectionState = 'disconnected' // 'connecting', 'connected', 'disconnected', 'failed'
    let lastMessageTime = Date.now()
    let heartbeatInterval = null
    let lastKnownMessageCount = 0

    const connectSSE = () => {
      if (connectionState === 'connecting') return // Prevent multiple simultaneous connections
      
      connectionState = 'connecting'
      console.log(`Attempting SSE connection to chat ${chatId} (attempt ${reconnectAttempts + 1})`)
      
      const source = new EventSource(`/api/chats/stream?chatId=${chatId}`)

      source.onopen = () => {
        console.log(`SSE connection established for chat ${chatId}`)
        connectionState = 'connected'
        reconnectAttempts = 0 // Reset on successful connection
        lastMessageTime = Date.now()
        
        // Set up heartbeat monitoring
        heartbeatInterval = setInterval(() => {
          const timeSinceLastMessage = Date.now() - lastMessageTime
          if (timeSinceLastMessage > 60000) { // 60 seconds without any message
            console.log('SSE connection appears stale, reconnecting...')
            source.close()
            connectionState = 'disconnected'
            connectSSE()
          }
          
          // Check for missing messages by comparing with database
          if (messages.length > 0) {
            const currentMessageCount = messages.length
            if (currentMessageCount !== lastKnownMessageCount) {
              lastKnownMessageCount = currentMessageCount
            } else {
              // No new messages received, check if we're missing any
              console.log('🔍 Checking for missing messages...')
              fetchMessages(1).catch(error => {
                console.error('Failed to check for missing messages:', error)
              })
            }
          }
        }, 30000) // Check every 30 seconds
        
        // Log connection status for debugging
        console.log(`Chat ${chatId} SSE connection active. Ready to receive messages.`)
      }

      source.onmessage = (event) => {
        try {
          lastMessageTime = Date.now() // Update last message time
          const data = JSON.parse(event.data)
          
          switch (data.type) {
            case "connected":
              console.log(`SSE connected to chat ${chatId} with connection ID: ${data.connectionId}`)
              break
            case "ping":
            case "health_check":
              // Handle ping/health check messages
              break
            case "new_message":
              console.log('📨 Received new message via SSE:', data.message.id, 'for chat:', chatId)
              setMessages(prev => {
                // Check if message already exists to prevent duplicates
                const messageExists = prev.some(msg => msg.id === data.message.id)
                if (messageExists) {
                  console.log('⚠️ Message already exists, skipping duplicate:', data.message.id)
                  return prev
                }
                
                console.log('✅ Adding new message to chat:', data.message.id)
                return [...prev, data.message]
              })
              
              // Update chat list with new message
              if (onNewMessage) {
                console.log('📋 Updating chat list with new message')
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
            case "reaction_updated":
              console.log('📨 Received reaction update via SSE:', data.messageId)
              setMessages(prev => 
                prev.map(msg => 
                  msg.id === data.messageId 
                    ? { ...msg, reactions: data.reactions }
                    : msg
                )
              )
              break
            case "typing":
              // Handle typing indicators
              break
            default:
              console.log('Unknown SSE message type:', data.type)
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error)
        }
      }

      source.onerror = (error) => {
        console.error("SSE error for chat", chatId, ":", error)
        connectionState = 'disconnected'
        source.close()
        
        if (heartbeatInterval) {
          clearInterval(heartbeatInterval)
          heartbeatInterval = null
        }
        
        // Attempt reconnection with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000) // Max 30 seconds
          console.log(`SSE reconnection scheduled in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)
          
          reconnectTimer = setTimeout(() => {
            reconnectAttempts++
            connectSSE()
          }, delay)
        } else {
          console.error("Max reconnection attempts reached. SSE connection failed for chat", chatId)
          connectionState = 'failed'
          
          // Fallback: refresh messages periodically
          const fallbackInterval = setInterval(() => {
            console.log('Using fallback polling for messages')
            fetchMessages(1)
          }, 15000) // Refresh every 15 seconds as fallback
          
          // Clean up fallback after 5 minutes
          setTimeout(() => {
            clearInterval(fallbackInterval)
          }, 300000)
        }
      }

      setEventSource(source)
      return source
    }

    const source = connectSSE()

    // Add connection validation
    const validateConnection = async () => {
      try {
        const response = await fetch(`/api/chats/debug/connections`)
        const data = await response.json()
        if (data.success) {
          const chatConnections = data.status.connectionsByChat[chatId] || []
          console.log(`🔍 Connection validation for chat ${chatId}:`, chatConnections)
        }
      } catch (error) {
        console.error('Failed to validate connection:', error)
      }
    }

    // Validate connection after 5 seconds
    setTimeout(validateConnection, 5000)

    return () => {
      console.log(`🧹 Cleaning up SSE connection for chat ${chatId}`)
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
      }
      if (heartbeatInterval) {
        clearInterval(heartbeatInterval)
      }
      if (source) {
        source.close()
      }
      setEventSource(null)
      connectionState = 'disconnected'
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
    sendAttachmentOptimistic,
    sendTypingIndicator,
    loadMoreMessages,
    scrollToBottom,
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
