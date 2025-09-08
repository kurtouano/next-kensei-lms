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

    console.log('Fetching chats for user:', session.user.email);
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chats?page=${page}&limit=20`)
      console.log('Chats API response status:', response.status);
      
      const data = await response.json()
      console.log('Chats API response data:', data);

      if (data.success) {
        if (page === 1) {
          setChats(data.chats)
        } else {
          setChats(prev => [...prev, ...data.chats])
        }
        setPagination(data.pagination)
        console.log('Successfully loaded chats:', data.chats.length);
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
              createdAt: newMessage.createdAt,
              type: newMessage.type,
            },
            lastActivity: newMessage.createdAt,
          }
        }
        return chat
      })
      
      // Sort by lastActivity to maintain proper order
      return updatedChats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    })
  }, [])

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
  const messagesEndRef = useRef(null)

  // Fetch messages for a chat
  const fetchMessages = useCallback(async (before = null, append = false) => {
    if (!session?.user?.email || !chatId) return

    if (append) {
      setIsLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const url = new URL(`/api/chats/${chatId}/messages`, window.location.origin)
      if (before) url.searchParams.set("before", before)

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        if (append) {
          // For infinite scroll - prepend older messages
          setMessages(prev => [...data.messages, ...prev])
        } else {
          // Initial load or refresh
          setMessages(data.messages)
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
      } else {
        setLoading(false)
      }
    }
  }, [session, chatId])

  // Send a message
  const sendMessage = useCallback(async (content, type = "text", attachments = [], replyTo = null) => {
    if (!session?.user?.email || !chatId) throw new Error("Not authenticated or no chat selected")

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
        // Add message to local state (optimistic update)
        setMessages(prev => [...prev, data.message])
        
        // Update chat list with new message
        if (onNewMessage) {
          onNewMessage(chatId, data.message)
        }
        
        return data.message
      } else {
        throw new Error(data.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }, [session, chatId, onNewMessage])

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

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(() => {
    if (hasMore && !loading && !isLoadingMore && messages.length > 0) {
      const oldestMessage = messages[0]
      fetchMessages(oldestMessage.createdAt, true)
    }
  }, [hasMore, loading, isLoadingMore, messages, fetchMessages])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Set up real-time connection
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
            setMessages(prev => [...prev, data.message])
            
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
    }

    setEventSource(source)

    return () => {
      source.close()
      setEventSource(null)
    }
  }, [session, chatId])

  // Initial load
  useEffect(() => {
    if (chatId) {
      setMessages([])
      setHasMore(true)
      fetchMessages()
    }
  }, [chatId, fetchMessages])

  // Auto-scroll to bottom when new messages arrive
  // Only scroll to bottom for new messages, not when loading more
  useEffect(() => {
    if (!isLoadingMore) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom, isLoadingMore])

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
    refetch: () => fetchMessages(),
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
