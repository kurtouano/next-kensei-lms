"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ImageIcon, Paperclip, Search, MoreVertical, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const [chats] = useState([
    {
      id: 1,
      name: "Japanese Study Group",
      type: "group",
      avatar: "/placeholder.svg?height=40&width=40&text=JSG",
      lastMessage: "Yuki: こんにちは！日本語の勉強はどうですか？",
      time: "2:35 PM",
      unread: 3,
      online: true,
      members: 12,
    },
    {
      id: 2,
      name: "Yuki Tanaka",
      type: "direct",
      avatar: "/placeholder.svg?height=40&width=40&text=YT",
      lastMessage: "Thanks for the kanji tips!",
      time: "1:20 PM",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "JLPT N3 Prep",
      type: "group",
      avatar: "/placeholder.svg?height=40&width=40&text=N3",
      lastMessage: "Sarah: Anyone want to practice grammar?",
      time: "12:45 PM",
      unread: 1,
      online: false,
      members: 8,
    },
    {
      id: 4,
      name: "Mike Johnson",
      type: "direct",
      avatar: "/placeholder.svg?height=40&width=40&text=MJ",
      lastMessage: "See you in tomorrow's lesson!",
      time: "11:30 AM",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Conversation Practice",
      type: "group",
      avatar: "/placeholder.svg?height=40&width=40&text=CP",
      lastMessage: "Anna: Let's practice keigo today",
      time: "Yesterday",
      unread: 0,
      online: true,
      members: 15,
    },
  ])

  const [messages, setMessages] = useState([
    {
      id: 1,
      user: "Yuki Tanaka",
      avatar: "/placeholder.svg?height=32&width=32&text=YT",
      message: "こんにちは皆さん！今日は漢字の勉強をしませんか？",
      translation: "Hello everyone! Shall we study kanji today?",
      time: "2:30 PM",
      isMe: false,
    },
    {
      id: 2,
      user: "Sarah Kim",
      avatar: "/placeholder.svg?height=32&width=32&text=SK",
      message: "Great idea! I'm struggling with 難しい kanji lately.",
      time: "2:31 PM",
      isMe: false,
    },
    {
      id: 3,
      user: "Me",
      avatar: "/placeholder.svg?height=32&width=32&text=ME",
      message: "I'd love to join! I'm working on N4 level kanji right now.",
      time: "2:32 PM",
      isMe: true,
    },
    {
      id: 4,
      user: "Yuki Tanaka",
      avatar: "/placeholder.svg?height=32&width=32&text=YT",
      message: "Perfect! Let me share some practice sheets 📚",
      time: "2:33 PM",
      isMe: false,
      hasFile: true,
      fileName: "N4_Kanji_Practice.pdf",
    },
    {
      id: 5,
      user: "Mike Johnson",
      avatar: "/placeholder.svg?height=32&width=32&text=MJ",
      message: "Thanks Yuki! This is exactly what I needed.",
      time: "2:34 PM",
      isMe: false,
    },
    {
      id: 6,
      user: "Sarah Kim",
      avatar: "/placeholder.svg?height=32&width=32&text=SK",
      message: "Here's a helpful image I found:",
      time: "2:35 PM",
      isMe: false,
      hasImage: true,
      imageUrl: "/placeholder.svg?height=200&width=300&text=Kanji+Chart",
    },
  ])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        user: "Me",
        avatar: "/placeholder.svg?height=32&width=32&text=ME",
        message: message,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      }
      setMessages([...messages, newMessage])
      setMessage("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const newMessage = {
        id: messages.length + 1,
        user: "Me",
        avatar: "/placeholder.svg?height=32&width=32&text=ME",
        message: `Shared: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
        hasFile: true,
        fileName: file.name,
      }
      setMessages([...messages, newMessage])
    }
  }

  const selectedChatData = chats.find((chat) => chat.id === selectedChat)
  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => setSelectedChat(chat.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedChat === chat.id ? "bg-[#eef2eb] border-l-4 border-l-[#4a7c59]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={chat.avatar || "/placeholder.svg"}
                          alt={chat.name}
                          className="w-10 h-10 rounded-full"
                        />
                        {chat.online && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm text-[#2c3e2d] truncate">
                            {chat.name}
                            {chat.type === "group" && (
                              <span className="text-xs text-gray-500 ml-1">({chat.members})</span>
                            )}
                          </h3>
                          <span className="text-xs text-gray-500">{chat.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.unread > 0 && (
                        <div className="bg-[#4a7c59] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedChatData?.avatar || "/placeholder.svg"}
                      alt={selectedChatData?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-[#2c3e2d]">{selectedChatData?.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedChatData?.type === "group"
                          ? `${selectedChatData.members} members`
                          : selectedChatData?.online
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
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                    <img
                      src={msg.avatar || "/placeholder.svg"}
                      alt={msg.user}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className={`max-w-[70%] ${msg.isMe ? "text-right" : ""}`}>
                      {!msg.isMe && <p className="text-sm font-medium text-[#2c3e2d] mb-1">{msg.user}</p>}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          msg.isMe ? "bg-[#4a7c59] text-white" : "bg-white text-gray-900 border"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        {msg.translation && <p className="text-xs opacity-75 mt-1 italic">{msg.translation}</p>}
                        {msg.hasFile && (
                          <div className="mt-2 p-2 bg-black/10 rounded flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{msg.fileName}</span>
                          </div>
                        )}
                        {msg.hasImage && (
                          <div className="mt-2">
                            <img
                              src={msg.imageUrl || "/placeholder.svg"}
                              alt="Shared image"
                              className="rounded max-w-full h-auto"
                            />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFileUpload}
                    className="text-gray-500 hover:text-[#4a7c59]"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#4a7c59]">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#4a7c59]">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message... (Try typing in Japanese!)"
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} className="bg-[#4a7c59] hover:bg-[#3a6147]">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
