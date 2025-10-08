import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { uploadChatImage, uploadChatAttachment } from "@/lib/chatFileUpload"

// Message queue processor to handle rapid message sequences
class MessageQueue {
  constructor(processCallback) {
    this.queue = []
    this.processing = false
    this.processCallback = processCallback
    this.processTimeout = null
  }

  enqueue(message) {
    this.queue.push(message)
    this.scheduleProcess()
  }

  scheduleProcess() {
    if (this.processTimeout) {
      clearTimeout(this.processTimeout)
    }
    
    // Process messages in batches with a small delay
    this.processTimeout = setTimeout(() => {
      this.processBatch()
    }, 50) // 50ms batching window
  }

  processBatch() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true
    const messagesToProcess = [...this.queue]
    this.queue = []

    // Process all queued messages at once
    this.processCallback(messagesToProcess)
    this.processing = false

    // If more messages were queued during processing, schedule another batch
    if (this.queue.length > 0) {
      this.scheduleProcess()
    }
  }

  clear() {
    this.queue = []
    if (this.processTimeout) {
      clearTimeout(this.processTimeout)
    }
  }
}

export function useChat() {
  const { data: session } = useSession()
  const [chats, setChats] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const retryTimeoutRef = useRef(null)

  // Fetch user's chats
  const fetchChats = useCallback(async (page = 1) => {
    if (!session?.user?.email) {
      return;
    }

    setLoading(true)
    setError(null)
    
    // Reset retry count for new fetch attempts
    if (page === 1) {
      setRetryCount(0)
    }

    try {
      const response = await fetch(`/api/chats?page=${page}&limit=15`)
      
      // Handle HTTP errors (like 500 from database connection issues)
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error("Database connection failed. Please wait while we reconnect...")
        } else if (response.status === 401) {
          throw new Error("Authentication failed. Please log in again.")
        } else {
          throw new Error(`Server error (${response.status}). Please try again.`)
        }
      }
      
      const data = await response.json()

      if (data.success) {
        // Reset retry count on successful fetch
        setRetryCount(0)
        
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
      
      // Auto-retry for database connection failures
      if (error.message.includes("Database connection failed") && retryCount < 3) {
        console.log(`Retrying chat fetch (attempt ${retryCount + 1}/3)...`)
        setRetryCount(prev => prev + 1)
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000 // 1s, 2s, 4s
        
        // Clear any existing timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current)
        }
        
        retryTimeoutRef.current = setTimeout(() => {
          fetchChats(page)
        }, delay)
        return
      }
      
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [session, retryCount])

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [])

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
  
  // Message queue for handling rapid SSE messages
  const messageQueueRef = useRef(null)
  const pendingOptimisticMessages = useRef(new Map()) // Track optimistic messages
  
  // Polling system state
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null)
  const pollingIntervalRef = useRef(null)
  const isPollingRef = useRef(false)

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
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        isUserAtBottom.current = true
      } catch (error) {
        // Fallback for older browsers
        messagesEndRef.current.scrollIntoView(false)
        isUserAtBottom.current = true
      }
    }
  }, [])

  // Polling function to check for new messages
  const pollForNewMessages = useCallback(async () => {
    if (!chatId || !session?.user?.email || isPollingRef.current) return
    
    isPollingRef.current = true
    
    try {
      const url = new URL(`/api/chats/${chatId}/messages/poll`, window.location.origin)
      if (lastMessageTimestamp) {
        url.searchParams.set("since", lastMessageTimestamp)
      }
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.success) {
        setMessages(prev => {
          let hasChanges = false
          let newMessages = [...prev]
          
          // Handle new messages
          if (data.newMessages?.length > 0) {
            // Get existing IDs (excluding optimistic messages)
            const existingIds = new Set(
              prev
                .filter(msg => !msg.isOptimistic) // Don't count optimistic messages
                .map(msg => msg.id)
            )
            
            const filteredNewMessages = data.newMessages.filter(msg => !existingIds.has(msg.id))
            
            if (filteredNewMessages.length > 0) {
              // Update last message timestamp
              const latestMessage = filteredNewMessages[filteredNewMessages.length - 1]
              setLastMessageTimestamp(latestMessage.createdAt)
              
              // Update chat list
              if (onNewMessage && latestMessage.sender?.email !== session.user.email) {
                onNewMessage(chatId, latestMessage)
              }
              
              // Remove any optimistic messages that match the real messages
              // (by content, sender, and timestamp within 10 seconds)
              newMessages = newMessages.filter(msg => {
                if (!msg.isOptimistic) return true // Keep all non-optimistic messages
                
                // Check if this optimistic message matches any incoming real message
                const matchingRealMessage = filteredNewMessages.find(realMsg => 
                  realMsg.sender?.email === msg.sender?.email &&
                  realMsg.content === msg.content &&
                  Math.abs(new Date(realMsg.createdAt) - new Date(msg.createdAt)) < 10000 // 10 second window
                )
                
                if (matchingRealMessage) {
                  // Remove optimistic message from tracking
                  pendingOptimisticMessages.current.delete(msg.id)
                  return false // Remove this optimistic message
                }
                
                return true // Keep optimistic message if no match
              })
              
              // Add new messages and sort
              newMessages = [...newMessages, ...filteredNewMessages]
              newMessages = newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              hasChanges = true
            }
          }
          
          // Handle reaction updates
          if (data.reactionUpdates?.length > 0) {
            data.reactionUpdates.forEach(reactionUpdate => {
              const messageIndex = newMessages.findIndex(msg => msg.id === reactionUpdate.id)
              if (messageIndex !== -1) {
                newMessages[messageIndex] = {
                  ...newMessages[messageIndex],
                  reactions: reactionUpdate.reactions
                }
                hasChanges = true
              }
            })
          }
          
          return hasChanges ? newMessages : prev
        })
        
        // Auto-scroll for new messages
        const wasAtBottom = checkIfAtBottom()
        if (wasAtBottom) {
          setTimeout(() => scrollToBottom(), 100)
        }
      }
    } catch (error) {
      // Handle polling errors silently
    } finally {
      isPollingRef.current = false
    }
  }, [chatId, session, lastMessageTimestamp, onNewMessage, checkIfAtBottom, scrollToBottom])

  // Initialize message queue
  useEffect(() => {
    const processMessageBatch = (messagesToProcess) => {
      setMessages(prevMessages => {
        const existingIds = new Set(prevMessages.map(msg => msg.id))
        const newMessages = [...prevMessages]
        let hasChanges = false

        messagesToProcess.forEach(messageData => {
          const { type, data } = messageData

          switch (type) {
            case "new_message":
              const message = data.message
              
              // Skip if already exists
              if (existingIds.has(message.id)) {
                return
              }

              // Check if this replaces an optimistic message
              const optimisticIndex = newMessages.findIndex(msg => 
                msg.isOptimistic && 
                msg.sender?.email === message.sender?.email &&
                Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 10000 // 10 second window
              )

              if (optimisticIndex !== -1) {
                newMessages[optimisticIndex] = { ...message, isOptimistic: false }
                pendingOptimisticMessages.current.delete(newMessages[optimisticIndex].id)
              } else {
                newMessages.push(message)
                existingIds.add(message.id)
              }
              
              hasChanges = true

              // Update chat list
              if (onNewMessage) {
                onNewMessage(chatId, message)
              }
              break

            case "message_edited":
              const editIndex = newMessages.findIndex(msg => msg.id === data.messageId)
              if (editIndex !== -1) {
                newMessages[editIndex] = { 
                  ...newMessages[editIndex], 
                  content: data.updatedContent, 
                  isEdited: true 
                }
                hasChanges = true
              }
              break

            case "message_deleted":
              const deleteIndex = newMessages.findIndex(msg => msg.id === data.messageId)
              if (deleteIndex !== -1) {
                newMessages.splice(deleteIndex, 1)
                hasChanges = true
              }
              break

            case "reaction_updated":
              const reactionIndex = newMessages.findIndex(msg => msg.id === data.messageId)
              if (reactionIndex !== -1) {
                newMessages[reactionIndex] = {
                  ...newMessages[reactionIndex],
                  reactions: data.reactions
                }
                hasChanges = true
              }
              break
          }
        })

        return hasChanges ? newMessages : prevMessages
      })

      // Handle auto-scroll after batch processing
      const shouldScroll = messagesToProcess.some(msg => 
        msg.type === "new_message" && checkIfAtBottom() && !isLoadingMoreMessages.current
      )

      if (shouldScroll) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            scrollToBottom()
          }, 100)
        })
      }
    }

    messageQueueRef.current = new MessageQueue(processMessageBatch)

    return () => {
      if (messageQueueRef.current) {
        messageQueueRef.current.clear()
      }
    }
  }, [chatId, onNewMessage])

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

  // Enhanced optimistic message sending
  const sendMessage = useCallback(async (content, type = "text", attachments = [], replyTo = null) => {
    if (!session?.user?.email || !chatId) throw new Error("Not authenticated or no chat selected")

    const tempId = `optimistic_${chatId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const optimisticTimestamp = new Date().toISOString()
    
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
      createdAt: optimisticTimestamp,
      isOptimistic: true,
      isFailed: false,
      _tempId: tempId
    }

    // Track optimistic message
    pendingOptimisticMessages.current.set(tempId, optimisticMessage)

    // Add optimistic message immediately with better deduplication
    setMessages(prev => {
      // Check for existing optimistic messages from same user with similar content
      const existingOptimistic = prev.find(msg => 
        msg.isOptimistic && 
        msg.sender?.email === session.user.email &&
        msg.content === content &&
        Math.abs(new Date(msg.createdAt) - new Date(optimisticTimestamp)) < 5000 // 5 second window
      )
      
      if (existingOptimistic) {
        return prev // Don't add duplicate optimistic message
      }
      
      if (prev.some(msg => msg.id === tempId)) {
        return prev // Prevent exact duplicates
      }
      
      return [...prev, optimisticMessage]
    })
    
    setTimeout(scrollToBottom, 50)

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
          _clientTimestamp: optimisticTimestamp,
          _tempId: tempId
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Replace optimistic message with real message
        setMessages(prev => {
          // First, check if the real message already exists (from polling)
          const realMessageExists = prev.find(msg => msg.id === data.message.id)
          if (realMessageExists) {
            // Real message already exists, just remove the optimistic one
            return prev.filter(msg => msg.id !== tempId)
          }
          
          // Find and replace the optimistic message
          const messageIndex = prev.findIndex(msg => msg.id === tempId)
          if (messageIndex !== -1) {
            const newMessages = [...prev]
            newMessages[messageIndex] = { ...data.message, isOptimistic: false }
            return newMessages
          }
          
          // Optimistic message not found, add real message if it doesn't exist
          return [...prev, { ...data.message, isOptimistic: false }]
        })
        
        pendingOptimisticMessages.current.delete(tempId)
        
        if (onNewMessage) {
          onNewMessage(chatId, data.message)
        }
        
        return data.message
      } else {
        // Mark as failed
        setMessages(prev => prev.map(msg => 
          msg.id === tempId 
            ? { ...msg, isOptimistic: false, isFailed: true }
            : msg
        ))
        pendingOptimisticMessages.current.delete(tempId)
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      // Mark as failed
      setMessages(prev => prev.map(msg => 
        msg.id === tempId 
          ? { ...msg, isOptimistic: false, isFailed: true }
          : msg
      ))
      pendingOptimisticMessages.current.delete(tempId)
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


  // Handle message reactions with improved debouncing and error handling
  const handleReaction = useCallback(async (messageId, emoji) => {
    if (!session?.user?.email || !chatId || !messageId || !emoji) return

    // Find the message to get current reactions
    const currentMessage = messages.find(msg => msg.id === messageId)
    if (!currentMessage) return

    const currentReactions = currentMessage.reactions || []
    const userEmail = session.user.email
    
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
        // Show user-friendly error message
        alert(`Failed to update reaction: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Error updating reaction:", error.message)
      // Show user-friendly error message
      alert(`Failed to update reaction: ${error.message}`)
    } finally {
      // Remove from processing set after a short delay to prevent rapid double-clicks
      setTimeout(() => {
        if (window.reactionProcessing) {
          window.reactionProcessing.delete(reactionKey)
        }
      }, 300) // Reduced to 300ms for better responsiveness
    }
  }, [session, chatId, messages])

  // Delete message (admin only)
  const deleteMessage = useCallback(async (messageId) => {
    if (!session?.user?.email || !chatId || !messageId) return

    try {
      const response = await fetch(`/api/chats/${chatId}/messages?messageId=${messageId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      
      if (data.success) {
        // Remove message from local state
        setMessages(prev => prev.filter(msg => msg.id !== messageId))
      } else {
        console.error("Failed to delete message:", data.error)
        throw new Error(data.error || "Failed to delete message")
      }
    } catch (error) {
      console.error("Error deleting message:", error)
      throw error
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

  // Replace SSE with polling system
  useEffect(() => {
    if (!chatId || !session?.user?.email) return
    
    // Set initial timestamp from latest message
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      setLastMessageTimestamp(latestMessage.createdAt)
    }
    
    // Start polling every 3.5 seconds
    pollingIntervalRef.current = setInterval(pollForNewMessages, 4000)
    
    // Initial poll
    setTimeout(pollForNewMessages, 500)
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      isPollingRef.current = false
    }
  }, [chatId, session, pollForNewMessages])

  // Update when messages change to set timestamp
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1]
      if (latestMessage.createdAt > (lastMessageTimestamp || '')) {
        setLastMessageTimestamp(latestMessage.createdAt)
      }
    }
  }, [messages, lastMessageTimestamp])

  // Clear message queue when switching chats
  useEffect(() => {
    if (chatId) {
      setMessages([])
      setHasMore(true)
      setCurrentPage(1)
      isInitialLoad.current = true
      shouldScrollToBottom.current = false
      isUserAtBottom.current = true
      isLoadingMoreMessages.current = false
      
      // Clear optimistic message tracking
      pendingOptimisticMessages.current.clear()
      
      // Clear message queue
      if (messageQueueRef.current) {
        messageQueueRef.current.clear()
      }
      
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
    deleteMessage,
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
