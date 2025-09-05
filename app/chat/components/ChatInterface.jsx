"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Send, ImageIcon, Paperclip, MoreVertical, Smile, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { useChat, useChatMessages, useChatImageUpload } from "@/hooks/useChat"

export default function ChatInterface() {
  const { data: session } = useSession()
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const fileInputRef = useRef(null)
  const messagesContainerRef = useRef(null)

  // Chat hooks
  const { chats, loading: chatsLoading, error: chatsError, loadMoreChats } = useChat()
  const { 
    messages, 
    loading: messagesLoading, 
    messagesEndRef, 
    sendMessage, 
    sendTypingIndicator,
    loadMoreMessages,
    hasMore 
  } = useChatMessages(selectedChatId)
  const { uploadImage, uploading } = useChatImageUpload()

  // Auto-select first chat
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id)
    }
  }, [chats, selectedChatId])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop } = messagesContainerRef.current
      
      // If user scrolled to top and there are more messages
      if (scrollTop === 0 && hasMore && !messagesLoading) {
        loadMoreMessages()
      }
    }
  }, [hasMore, messagesLoading, loadMoreMessages])

  // Attach scroll listener
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  // Handle sending messages
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatId) return

    try {
      await sendMessage(message.trim())
      setMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
      alert("Failed to send message")
    }
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle typing indicator
  useEffect(() => {
    if (!message || !selectedChatId) return

    const timeoutId = setTimeout(() => {
      sendTypingIndicator(false)
    }, 2000)

    sendTypingIndicator(true)

    return () => clearTimeout(timeoutId)
  }, [message, selectedChatId, sendTypingIndicator])

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!selectedChatId) return

    try {
      const attachment = await uploadImage(file)
      await sendMessage("", "image", [attachment])
    } catch (error) {
      console.error("Failed to upload image:", error)
      alert("Failed to upload image")
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file)
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

  const selectedChat = chats.find(chat => chat.id === selectedChatId)
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-gray-50 h-full">
      <div className="container mx-auto px-4 py-6 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Chat List Sidebar */}
          <div className="lg:col-span-1">
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

              <div className="flex-1 overflow-y-auto">
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
            <Card className="h-full flex flex-col">
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
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div 
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                  >
                    {messagesLoading && messages.length === 0 ? (
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {hasMore && (
                          <div className="text-center py-2">
                            <Button variant="ghost" size="sm" onClick={loadMoreMessages}>
                              Load more messages
                            </Button>
                          </div>
                        )}
                        {messages.map((msg) => (
                          <div key={msg.id} className={`flex gap-3 ${msg.sender.email === session?.user?.email ? "flex-row-reverse" : ""}`}>
                            <div className="w-8 h-8">
                              {renderAvatar(msg.sender)}
                            </div>
                            <div className={`max-w-[70%] ${msg.sender.email === session?.user?.email ? "text-right" : ""}`}>
                              {msg.sender.email !== session?.user?.email && (
                                <p className="text-sm font-medium text-[#2c3e2d] mb-1">{msg.sender.name}</p>
                              )}
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  msg.sender.email === session?.user?.email 
                                    ? "bg-[#4a7c59] text-white" 
                                    : "bg-white text-gray-900 border"
                                }`}
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
                                {msg.content && <p className="text-sm">{msg.content}</p>}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                        ))}
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
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-[#4a7c59]"
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                      </Button>
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1"
                        disabled={uploading}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        className="bg-[#4a7c59] hover:bg-[#3a6147]"
                        disabled={!message.trim() || uploading}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
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
