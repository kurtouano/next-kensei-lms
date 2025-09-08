"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Send, ImageIcon, Paperclip, MoreVertical, Smile, Loader2, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { useChat, useChatMessages } from "@/hooks/useChat"
import { uploadChatImage, uploadChatAttachment } from "@/lib/chatFileUpload"

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
  const { chats, loading: chatsLoading, error: chatsError, loadMoreChats, updateChatWithNewMessage } = useChat()
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
  const [sending, setSending] = useState(false)

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

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Restore scroll position after loading more messages
  useEffect(() => {
    if (!isLoadingMore && scrollPositionRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current
      const { scrollHeight: oldScrollHeight } = scrollPositionRef.current
      const newScrollHeight = container.scrollHeight
      const heightDifference = newScrollHeight - oldScrollHeight
      
      // Restore scroll position by adjusting for the new content height
      container.scrollTop = heightDifference
      scrollPositionRef.current = null
    }
  }, [isLoadingMore, messages])

  // Handle sending messages
  const handleSendMessage = async () => {
    const messageText = messageInputRef.current?.value?.trim()
    if (!messageText || !selectedChatId || sending) return

    try {
      setSending(true)
      await sendMessage(messageText)
      if (messageInputRef.current) {
        messageInputRef.current.value = ""
      }
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
    }
  }

  // Optimized message change handler - direct state update
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value)
  }, [])

  // Handle key press with useCallback to prevent re-renders
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  // Typing indicator disabled to prevent UI delays
  // useEffect(() => {
  //   if (!selectedChatId) return
  //   // Typing indicator temporarily disabled to fix typing delays
  // }, [message, selectedChatId, sendTypingIndicator])

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!selectedChatId || uploading || sending) return

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
      alert(`Failed to upload image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate that it's actually an image file
      if (file.type.startsWith("image/")) {
        handleImageUpload(file)
      } else {
        alert("Please select an image file (PNG, JPG, GIF, WebP, or SVG)")
        // Reset the input
        e.target.value = ""
      }
    }
  }

  // Handle general file selection
  const handleGeneralFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file || !selectedChatId || uploading || sending) return

    try {
      setUploading(true)
      console.log("Uploading general file...")
      
      const result = await uploadChatAttachment(file)
      
      // Send message with file attachment
      await sendMessage("", "attachment", [{
        url: result.url,
        filename: result.metadata.originalFilename,
        size: result.metadata.originalSize,
        type: result.metadata.fileType,
        mimeType: result.metadata.contentType
      }])
      
      console.log("✅ File uploaded and message sent successfully")
    } catch (error) {
      console.error("Failed to upload file:", error)
      alert(`Failed to upload file: ${error.message}`)
    } finally {
      setUploading(false)
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
          <Card className="h-full flex flex-col">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-[#2c3e2d] mb-3">Messages</h2>
                <div className="relative">
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto h-[calc(100vh-12rem)]">
                {chatsLoading ? (
                  <div className="p-4">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </div>
                ) : chatsError ? (
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
                  filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChatId === chat.id ? "bg-[#eef2eb] border-l-4 border-l-[#4a7c59]" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10">
                            {renderAvatar({ icon: chat.avatar, bonsai: chat.bonsai, name: chat.name })}
                          </div>
                          {chat.isOnline && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-sm text-[#2c3e2d] truncate">
                              {chat.name}
                              {chat.type === "group" && (
                                <span className="text-xs text-gray-500 ml-1">({chat.participants})</span>
                              )}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {chat.lastMessage?.createdAt && new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {chat.lastMessage?.content || "No messages yet"}
                          </p>
                        </div>
                        {chat.unreadCount > 0 && (
                          <div className="bg-[#4a7c59] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
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
                          {renderAvatar({ icon: selectedChat.avatar, bonsai: selectedChat.bonsai, name: selectedChat.name })}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#2c3e2d]">{selectedChat.name}</h3>
                          <p className="text-sm text-gray-500">
                            {selectedChat.type === "group"
                              ? `${selectedChat.participants} members`
                              : selectedChat.isOnline
                                ? "Online"
                                : "Last seen recently"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // Get the other participant's user ID for direct chats
                            if (selectedChat.type === "direct" && Array.isArray(selectedChat.participants)) {
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
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-scroll overflow-x-hidden p-4 space-y-4 bg-gray-50"
                  >
                    {messagesLoading && messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="mb-4">
                          <div className="w-16 h-16 rounded-full bg-[#eef2eb] flex items-center justify-center mb-4">
                            {renderAvatar({ icon: selectedChat.avatar, bonsai: selectedChat.bonsai, name: selectedChat.name })}
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
                            >
                              {isLoadingMore ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Loading...
                                </>
                              ) : (
                                "Load more messages"
                              )}
                            </Button>
                          </div>
                        )}
                        {messages.map((msg, index) => {
                          const previousMessage = index > 0 ? messages[index - 1] : null
                          const showTimestamp = shouldShowTimestamp(msg, previousMessage)
                          
                          return (
                            <div key={msg.id}>
                              {/* Show timestamp if there's a significant time gap */}
                              {showTimestamp && (
                                <div className="flex justify-center my-4">
                                  <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                                    {formatTimestamp(msg.createdAt)}
                                  </div>
                                </div>
                              )}
                              
                              <div className={`flex gap-3 ${msg.sender.email === session?.user?.email ? "flex-row-reverse" : ""}`}>
                                <div className="w-8 h-8">
                                  {renderAvatar(msg.sender)}
                                </div>
                                <div className={`max-w-[70%] min-w-0 ${msg.sender.email === session?.user?.email ? "text-right" : ""}`}>
                                  {msg.sender.email !== session?.user?.email && (
                                    <p className="text-sm font-medium text-[#2c3e2d] mb-1">{msg.sender.name}</p>
                                  )}
                                  <div
                                    className={`rounded-lg px-4 py-2 group relative ${
                                      msg.sender.email === session?.user?.email 
                                        ? "bg-[#4a7c59] text-white" 
                                        : "bg-white text-gray-900 border"
                                    }`}
                                    title={formatFullTimestamp(msg.createdAt)}
                                  >
                                    {msg.type === "image" && msg.attachments?.length > 0 && (
                                      <div className="mb-2">
                                        <img
                                          src={msg.attachments[0].url}
                                          alt="Shared image"
                                          className="rounded max-w-full h-auto cursor-pointer"
                                          onClick={() => window.open(msg.attachments[0].url, '_blank')}
                                        />
                                      </div>
                                    )}
                                    
                                    {msg.type === "attachment" && msg.attachments?.length > 0 && (
                                      <div className="mb-2">
                                        {msg.attachments.map((attachment, index) => (
                                          <div
                                            key={index}
                                            className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                                            onClick={() => window.open(attachment.url, '_blank')}
                                          >
                                            <div className="flex-shrink-0">
                                              {attachment.type === "image" ? (
                                                <img
                                                  src={attachment.url}
                                                  alt={attachment.filename}
                                                  className="w-10 h-10 object-cover rounded border border-gray-200"
                                                />
                                              ) : attachment.type === "document" ? (
                                                <div className="w-10 h-10 bg-orange-50 border border-orange-200 rounded flex items-center justify-center">
                                                  <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
                                                  </svg>
                                                </div>
                                              ) : (
                                                <div className="w-10 h-10 bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
                                                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                                                  </svg>
                                                </div>
                                              )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">
                                                {attachment.filename}
                                              </p>
                                              <p className="text-xs text-gray-500">
                                                {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {attachment.type}
                                              </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    
                                    {msg.content && <p className="text-sm">{msg.content}</p>}
                                    
                                    {/* Hover timestamp tooltip */}
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                      {formatFullTimestamp(msg.createdAt)}
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t bg-white">
                    <div className="flex items-center gap-2">
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
                      <input
                        ref={messageInputRef}
                        type="text"
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={uploading || sending}
                        autoComplete="off"
                        autoFocus={false}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        className="bg-[#4a7c59] hover:bg-[#3a6147]"
                        disabled={uploading || sending}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
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
                  </div>
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
    </div>
  )
}
