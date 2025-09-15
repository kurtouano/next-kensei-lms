"use client"

import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react"
import { useSession } from "next-auth/react"
import { Send, ImageIcon, Paperclip, MoreVertical, Smile, Loader2, User, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { useChat, useChatMessages } from "@/hooks/useChat"
import { uploadChatImage, uploadChatAttachment } from "@/lib/chatFileUpload"
import GroupInviteModal from "./GroupInviteModal"
import MessageItem from "./MessageItem"
import LazyAvatar from "./LazyAvatar"
import EmojiPicker from "./EmojiPicker"

// Lazy load the CreateGroupChatModal
const CreateGroupChatModal = lazy(() => import("./CreateGroupChatModal"))

export default function ChatInterface() {
  const { data: session } = useSession()
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef(null)
  const generalFileInputRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const messageInputRef = useRef(null)
  const scrollPositionRef = useRef(null)

  // Chat hooks
  const { chats, loading: chatsLoading, error: chatsError, pagination, loadMoreChats, updateChatWithNewMessage, refetch: refetchChats } = useChat()
  const { 
    messages, 
    loading: messagesLoading, 
    isLoadingMore,
    messagesEndRef, 
    sendMessage, 
    sendTypingIndicator,
    loadMoreMessages,
    hasMore 
  } = useChatMessages(selectedChatId, updateChatWithNewMessage)
  const [uploading, setUploading] = useState(false)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiButtonRef = useRef(null)
  const sidebarRef = useRef(null)
  const isLoadingMoreChats = useRef(false)
  const [messageHeight, setMessageHeight] = useState(40) // Initial height for textarea
  const [fileErrorPopup, setFileErrorPopup] = useState(null) // For file upload error popup


  // Auto-select first chat
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id)
    }
  }, [chats, selectedChatId])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      
      // If user scrolled to top and there are more messages
      if (scrollTop === 0 && hasMore && !messagesLoading && !isLoadingMore) {
        // Store current scroll position before loading more
        scrollPositionRef.current = {
          scrollHeight,
          scrollTop
        }
        loadMoreMessages()
      }
    }
  }, [hasMore, messagesLoading, isLoadingMore, loadMoreMessages])

  // Handle sidebar scroll for infinite loading
  const handleSidebarScroll = useCallback(() => {
    if (sidebarRef.current && pagination?.hasMore && !chatsLoading && !isLoadingMoreChats.current) {
      const { scrollTop, scrollHeight, clientHeight } = sidebarRef.current
      
      // If user scrolled to bottom and there are more chats
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        isLoadingMoreChats.current = true
        loadMoreChats()
      }
    }
  }, [pagination?.hasMore, chatsLoading, loadMoreChats])

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Attach sidebar scroll listener
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (sidebar) {
      sidebar.addEventListener("scroll", handleSidebarScroll)
      return () => sidebar.removeEventListener("scroll", handleSidebarScroll)
    }
  }, [handleSidebarScroll])

  // Reset loading flag when chats loading is complete
  useEffect(() => {
    if (!chatsLoading) {
      isLoadingMoreChats.current = false
    }
  }, [chatsLoading])

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && scrollPositionRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const { scrollHeight: oldScrollHeight } = scrollPositionRef.current
      const newScrollHeight = container.scrollHeight
      const heightDifference = newScrollHeight - oldScrollHeight
      
      // Restore scroll position by adjusting for the new content height
      // Add a small offset to account for multiple messages being loaded
      container.scrollTop = heightDifference + 50
      scrollPositionRef.current = null
    }
  }, [isLoadingMore, messages])

  // Handle sending messages with optimistic updates
  const handleSendMessage = async () => {
    const messageText = messageInputRef.current?.value?.trim()
    if (!messageText || !selectedChatId) return

    // Clear input immediately for fast UX
    if (messageInputRef.current) {
      messageInputRef.current.value = ""
      messageInputRef.current.style.height = '40px' // Reset height
    }
    setMessage("")
    setMessageHeight(40) // Reset height state

    try {
      // Send message optimistically (shows instantly, loads in background)
      await sendMessage(messageText)
    } catch (error) {
      console.error("Failed to send message:", error)
      // Don't show alert for better UX - the message will show as failed
    }
  }

  // Optimized message change handler - direct state update
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120) // Min 40px, max 120px
    textarea.style.height = `${newHeight}px`
    setMessageHeight(newHeight)
  }, [])

  // Handle key press with useCallback to prevent re-renders
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
    // Allow Shift+Enter for new lines (default textarea behavior)
  }, [handleSendMessage])

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    if (messageInputRef.current) {
      const textarea = messageInputRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentMessage = message
      const newMessage = currentMessage.slice(0, start) + emoji + currentMessage.slice(end)
      
      setMessage(newMessage)
      
      // Update the textarea value and cursor position
      textarea.value = newMessage
      textarea.setSelectionRange(start + emoji.length, start + emoji.length)
      
      // Trigger auto-resize
      textarea.style.height = 'auto'
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 120)
      textarea.style.height = `${newHeight}px`
      setMessageHeight(newHeight)
    }
  }, [message])

  // Typing indicator disabled to prevent UI delays
  // useEffect(() => {
  //   if (!selectedChatId) return
  //   // Typing indicator temporarily disabled to fix typing delays
  // }, [message, selectedChatId, sendTypingIndicator])

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!selectedChatId || uploading) return

    try {
      setUploading(true)
      console.log("Uploading image with compression...")
      
      const result = await uploadChatImage(file)
      
      // Send message with image attachment
      await sendMessage("", "image", [{
        url: result.url,
        filename: result.metadata.originalFilename,
        size: result.metadata.compressedSize || result.metadata.originalSize,
        type: "image",
        mimeType: result.metadata.contentType,
        compressionStats: result.metadata.compressionRatio ? {
          originalSize: result.metadata.originalSize,
          compressedSize: result.metadata.compressedSize,
          compressionRatio: result.metadata.compressionRatio
        } : null
      }])
      
      console.log("✅ Image uploaded and message sent successfully")
    } catch (error) {
      console.error("Failed to upload image:", error)
      setFileErrorPopup({
        title: "Upload failed",
        description: `Failed to upload image: ${error.message}`
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate that it's actually an image file
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
      
      if (allowedImageTypes.includes(file.type)) {
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxSize) {
          setFileErrorPopup({
            title: "Image too large",
            description: `Maximum size is 10MB. Your image is ${(file.size / 1024 / 1024).toFixed(1)}MB`
          })
          e.target.value = ""
          return
        }
        handleImageUpload(file)
      } else {
        setFileErrorPopup({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, WebP, GIF, or SVG)"
        })
        // Reset the input
        e.target.value = ""
      }
    }
  }

  // Handle general file selection
  const handleGeneralFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedChatId || uploading) return

    // Client-side validation (exclude images since there's a dedicated image button)
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf']
    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg']
    const allowedSpreadsheetTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
    const allowedTypes = [...allowedDocumentTypes, ...allowedAudioTypes, ...allowedSpreadsheetTypes]
    
    if (!allowedTypes.includes(file.type)) {
      setFileErrorPopup({
        title: "File type not supported",
        description: "Please select: Documents (PDF, DOC, DOCX, TXT), Audio (MP3, WAV, M4A, OGG), or Spreadsheets (XLS, XLSX, CSV). Use the image button for photos."
      })
      e.target.value = ""
      return
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setFileErrorPopup({
        title: "File too large",
        description: `Maximum size is 10MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB`
      })
      e.target.value = ""
      return
    }

    try {
      setUploading(true)
      console.log("Uploading general file...")
      
      // Determine file type for proper categorization
      let detectedFileType = 'general' // default
      let messageAttachmentType = 'general' // for the message attachment
      
      if (allowedDocumentTypes.includes(file.type)) {
        detectedFileType = 'document'
        messageAttachmentType = 'document'
      } else if (allowedAudioTypes.includes(file.type)) {
        detectedFileType = 'audio'
        messageAttachmentType = 'file' // Map audio to 'file' for message schema
      } else if (allowedSpreadsheetTypes.includes(file.type)) {
        detectedFileType = 'spreadsheet'
        messageAttachmentType = 'file' // Map spreadsheet to 'file' for message schema
      }
      
      const result = await uploadChatAttachment(file, detectedFileType)
      
      // Send message with file attachment
      const attachmentData = {
        url: result.url,
        filename: result.metadata.originalFilename,
        size: result.metadata.originalSize,
        type: messageAttachmentType, // Use the message-compatible type
        mimeType: result.metadata.contentType
      }
      
      console.log("Sending message with attachment:", attachmentData)
      await sendMessage("", "attachment", [attachmentData])
      
      console.log("✅ File uploaded and message sent successfully")
    } catch (error) {
      console.error("Failed to upload file:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        file: file.name,
        fileType: file.type,
        detectedFileType: detectedFileType || 'unknown',
        messageAttachmentType: messageAttachmentType || 'unknown'
      })
      setFileErrorPopup({
        title: "Upload failed",
        description: `Failed to upload file: ${error.message}`
      })
    } finally {
      setUploading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  // Render user avatar
  const renderAvatar = (user) => {
    if (user.icon === "bonsai" && user.bonsai) {
      return (
        <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-full border border-[#4a7c59]">
          <BonsaiSVG 
            level={user.bonsai.level || 1}
            treeColor={user.bonsai.customization?.foliageColor || '#77DD82'} 
            potColor={user.bonsai.customization?.potColor || '#FD9475'} 
            selectedEyes={user.bonsai.customization?.eyes || 'default_eyes'}
            selectedMouth={user.bonsai.customization?.mouth || 'default_mouth'}
            selectedPotStyle={user.bonsai.customization?.potStyle || 'default_pot'}
            selectedGroundStyle={user.bonsai.customization?.groundStyle || 'default_ground'}
            decorations={user.bonsai.customization?.decorations ? Object.values(user.bonsai.customization.decorations).filter(Boolean) : []}
            zoomed={true}
          />
        </div>
      )
    } else if (user.icon && user.icon.startsWith("http")) {
      return (
        <img 
          src={user.icon} 
          alt={user.name} 
          className="h-full w-full object-cover rounded-full"
        />
      )
    }
    
    return (
      <div className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-sm font-medium">
        {user.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    )
  }

  // Format timestamp for display (show actual time, not relative)
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    
    // Check if it's the same day
    const isSameDay = date.toDateString() === now.toDateString()
    
    if (isSameDay) {
      // Show time for same day (e.g., "6:39 PM")
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    } else {
      // Show date and time for different days (e.g., "Dec 25, 6:39 PM")
      return date.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + 
             date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
    }
  }

  // Format full timestamp for tooltip
  const formatFullTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Check if we should show timestamp between messages
  const shouldShowTimestamp = (currentMessage, previousMessage) => {
    if (!previousMessage) return true // Show timestamp for first message
    
    const currentTime = new Date(currentMessage.createdAt)
    const previousTime = new Date(previousMessage.createdAt)
    const diffInMinutes = Math.floor((currentTime - previousTime) / (1000 * 60))
    
    // Show timestamp if more than 15 minutes have passed OR it's a different day
    const isDifferentDay = currentTime.toDateString() !== previousTime.toDateString()
    return diffInMinutes >= 15 || isDifferentDay
  }

  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-gray-50 min-h-[85vh]">
      <div className="container mx-auto px-4 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          <div className="lg:col-span-1">
          {/* Chat List Sidebar */}
          <Card className="h-[calc(100vh-11rem)] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-[#2c3e2d]">Messages</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateGroupModal(true)}
                    className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                    title="Create Group Chat"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3"
                  />
                </div>
              </div>

              <div ref={sidebarRef} className="flex-1 overflow-y-auto overflow-x-hidden">
                {chatsError ? (
                  <div className="p-4 text-center">
                    <p className="text-red-500 text-sm">Error loading chats</p>
                    <p className="text-gray-500 text-xs mt-1">{chatsError}</p>
                  </div>
                ) : filteredChats.length === 0 ? (
                  <div className="p-4 text-center">
                    <p className="text-gray-500 text-sm">No chats yet</p>
                    <p className="text-gray-400 text-xs mt-1">Start a conversation with a friend!</p>
                  </div>
                ) : (
                  <>
                    {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChatId === chat.id ? "bg-[#eef2eb] border-l-4 border-l-[#4a7c59]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {chat.type === "group" ? (
                            <div className="w-10 h-10">
                              {(chat.avatar && chat.avatar !== null) ? (
                                <img 
                                  src={chat.avatar} 
                                  alt={chat.name} 
                                  className="h-full w-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-sm font-medium"
                                style={{ display: (chat.avatar && chat.avatar !== null) ? 'none' : 'flex' }}
                              >
                                {chat.name?.charAt(0)?.toUpperCase() || "G"}
                              </div>
                            </div>
                          ) : (
                            <LazyAvatar 
                              user={{ 
                                id: chat.participants?.[0]?.id, 
                                icon: chat.avatar, 
                                name: chat.name 
                              }} 
                              size="w-10 h-10" 
                            />
                          )}
                          {chat.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <h3 className="font-medium text-sm text-[#2c3e2d] truncate">
                                {chat.name}
                              </h3>
                              {chat.type === "group" && (
                                <Users className="h-3 w-3 text-[#4a7c59] flex-shrink-0 ml-1" />
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {chat.lastMessage?.createdAt && new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage ? (
                              <>
                                {chat.lastMessage.isCurrentUser && "You: "}
                                {(() => {
                                  if (chat.lastMessage.type === "image") {
                                    return "sent an image"
                                  } else if (chat.lastMessage.type === "attachment" || chat.lastMessage.type === "file") {
                                    // Check attachment type for more specific message
                                    const attachment = chat.lastMessage.attachments?.[0]
                                    if (attachment?.mimeType) {
                                      if (attachment.mimeType.startsWith('audio/')) {
                                        return "sent an audio file"
                                      } else if (attachment.mimeType === 'application/pdf') {
                                        return "sent a PDF"
                                      } else if (attachment.mimeType.includes('document') || attachment.mimeType.includes('word')) {
                                        return "sent a document"
                                      } else if (attachment.mimeType.includes('excel') || attachment.mimeType.includes('spreadsheet') || attachment.mimeType.includes('csv')) {
                                        return "sent a spreadsheet"
                                      } else if (attachment.mimeType.startsWith('image/')) {
                                        return "sent an image"
                                      } else {
                                        return "sent a file"
                                      }
                                    }
                                    return "sent an attachment"
                                  } else {
                                    return chat.lastMessage.content || "sent a message"
                                  }
                                })()}
                              </>
                            ) : "No messages yet"}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="bg-[#4a7c59] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    ))}
                    
                    {/* Skeleton Loading for More Chats */}
                    {chats.length > 0 && pagination?.hasMore && (
                      <>
                        {[...Array(3)].map((_, index) => (
                          <div key={`skeleton-${index}`} className="p-4 border-b">
                            <div className="flex items-center gap-3 animate-pulse">
                              {/* Avatar skeleton */}
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                  {/* Name skeleton */}
                                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                                  {/* Time skeleton */}
                                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                                </div>
                                {/* Message skeleton */}
                                <div className="h-3 bg-gray-200 rounded w-32"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
          </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[calc(100vh-11rem)] flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10">
                          {selectedChat.type === "group" ? (
                            <div className="h-full w-full relative">
                              {(selectedChat.avatar && selectedChat.avatar !== null) ? (
                                <img 
                                  src={selectedChat.avatar} 
                                  alt={selectedChat.name} 
                                  className="h-full w-full object-cover rounded-full"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div 
                                className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-sm font-medium"
                                style={{ display: (selectedChat.avatar && selectedChat.avatar !== null) ? 'none' : 'flex' }}
                              >
                                {selectedChat.name?.charAt(0)?.toUpperCase() || "G"}
                              </div>
                            </div>
                          ) : (
                            renderAvatar({ icon: selectedChat.avatar, bonsai: selectedChat.bonsai, name: selectedChat.name })
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#2c3e2d]">{selectedChat.name}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedChat.type === "group"
                              ? `${selectedChat.participants?.length || 0} members`
                              : selectedChat.isOnline
                                ? "Online"
                                : "Last seen recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedChat.type === "group" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowInviteModal(true)}
                            title="Invite to Group"
                            className="text-[#4a7c59] hover:text-[#3a6147] hover:bg-[#eef2eb]"
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        )}
                        {selectedChat.type === "direct" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              // Get the other participant's user ID for direct chats
                              if (Array.isArray(selectedChat.participants)) {
                                const otherParticipant = selectedChat.participants.find(
                                  (p) => p._id?.toString() !== session?.user?.id?.toString()
                                )
                                
                                if (otherParticipant?._id) {
                                  const profileUrl = `/users/${otherParticipant._id}`
                                  window.open(profileUrl, '_blank')
                                }
                              }
                            }}
                            title="View Profile"
                          >
                            <User className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 bg-gray-50 scroll-smooth"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {messagesLoading && messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="mb-4">
                          <div className="w-16 h-16 rounded-full bg-[#eef2eb] flex items-center justify-center mb-4">
                            {selectedChat.type === "group" ? (
                              <div className="h-full w-full relative">
                                {(selectedChat.avatar && selectedChat.avatar !== null) ? (
                                  <img 
                                    src={selectedChat.avatar} 
                                    alt={selectedChat.name} 
                                    className="h-full w-full object-cover rounded-full"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling.style.display = 'flex';
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="h-full w-full rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-lg font-medium"
                                  style={{ display: (selectedChat.avatar && selectedChat.avatar !== null) ? 'none' : 'flex' }}
                                >
                                  {selectedChat.name?.charAt(0)?.toUpperCase() || "G"}
                                </div>
                              </div>
                            ) : (
                              renderAvatar({ icon: selectedChat.avatar, bonsai: selectedChat.bonsai, name: selectedChat.name })
                            )}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-[#2c3e2d] mb-2">
                          Start a conversation with {selectedChat.name}
                        </h3>
                        <p className="text-[#5c6d5e] mb-4">
                          Send a message to begin your chat
                        </p>
                        <div className="text-sm text-[#5c6d5e]">
                          Type your message below to get started
                        </div>
                      </div>
                    ) : (
                      <>
                        {hasMore && (
                          <div className="text-center py-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={loadMoreMessages}
                              disabled={isLoadingMore}
                              className="transition-all duration-200 hover:bg-gray-100"
                            >
                              {isLoadingMore ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading older messages...
                                </>
                              ) : (
                                "Load more messages"
                              )}
                            </Button>
                          </div>
                        )}
                        {messages.map((msg, index) => {
                          const previousMessage = index > 0 ? messages[index - 1] : null
                          
                          return (
                            <MessageItem
                              key={msg.id}
                              message={msg}
                              previousMessage={previousMessage}
                              session={session}
                              formatTimestamp={formatTimestamp}
                              formatFullTimestamp={formatFullTimestamp}
                              shouldShowTimestamp={shouldShowTimestamp}
                            />
                          )
                        })}
                        <div ref={messagesEndRef} className="h-1" />
                        
                        {/* Loading indicator for new messages */}
                        {messagesLoading && messages.length > 0 && (
                          <div className="flex justify-center py-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Loading new messages...
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white relative">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generalFileInputRef.current?.click()}
                        className="text-gray-500 hover:text-[#4a7c59]"
                        title="Attach file"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-[#4a7c59]"
                        disabled={uploading}
                        title="Attach image"
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                      </Button>
                      <Button
                        ref={emojiButtonRef}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`text-gray-500 hover:text-[#4a7c59] ${showEmojiPicker ? 'bg-[#eef2eb] text-[#4a7c59]' : ''}`}
                        title="Add emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      <textarea
                        ref={messageInputRef}
                        onKeyDown={handleKeyPress}
                        onChange={handleMessageChange}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:border-[#2646248a] disabled:bg-gray-100 disabled:cursor-not-allowed resize-none overflow-hidden break-words overflow-wrap-anywhere whitespace-pre-wrap"
                        style={{ height: `${messageHeight}px`, wordBreak: 'break-word', overflowWrap: 'anywhere' }}
                        disabled={uploading}
                        autoComplete="off"
                        autoFocus={false}
                        rows={1}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        className="bg-[#4a7c59] hover:bg-[#3a6147]"
                        disabled={uploading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/svg+xml"
                    />
                    <input
                      ref={generalFileInputRef}
                      type="file"
                      onChange={handleGeneralFileChange}
                      className="hidden"
                      accept="*/*"
                    />
                    
                    {/* Emoji Picker */}
                    <EmojiPicker
                      isOpen={showEmojiPicker}
                      onClose={() => setShowEmojiPicker(false)}
                      onEmojiSelect={handleEmojiSelect}
                      emojiButtonRef={emojiButtonRef}
                    />
                  </div>
                  
                  {/* File Error Modal */}
                  {fileErrorPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {fileErrorPopup.title}
                          </h3>
                          <button
                            onClick={() => setFileErrorPopup(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-gray-600 mb-6">
                          {fileErrorPopup.description}
                        </p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => setFileErrorPopup(null)}
                            className="bg-[#4a7c59] hover:bg-[#3a6147] text-white px-6 py-2 rounded-md transition-colors"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Select a chat to start messaging</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateGroupModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#4a7c59]" />
              <span className="text-[#2c3e2d]">Loading...</span>
            </div>
          </div>
        }>
          <CreateGroupChatModal
            isOpen={showCreateGroupModal}
            onClose={() => setShowCreateGroupModal(false)}
            onGroupCreated={(group) => {
              console.log('Group created:', group)
              refetchChats() // Refresh the chat list
              setSelectedChatId(group.id)
              setShowCreateGroupModal(false)
            }}
          />
        </Suspense>
      )}
      
      <GroupInviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        chat={selectedChat}
      />
    </div>
  )
}
