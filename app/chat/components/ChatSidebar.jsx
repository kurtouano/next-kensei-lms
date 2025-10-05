"use client"

import { useState } from "react"
import { Search, Users, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ChatSidebar({ 
  chats = [], 
  selectedChatId, 
  onChatSelect, 
  searchQuery, 
  onSearchChange,
  onJoinGroup,
  joinedGroupIds = [],
  publicGroups = [],
  onCreateGroup,
  chatsLoading = false,
  chatsError = null
}) {
  const [activeTab, setActiveTab] = useState("chats")

  const filteredChats = chats.filter(chat => {
    const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const handleJoinGroup = (groupId) => {
    if (onJoinGroup) {
      onJoinGroup(groupId)
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-[#2c3e2d] mb-3">Messages</h2>
          <TabsList className="grid w-full grid-cols-2 mb-3">
            <TabsTrigger value="chats">My Chats</TabsTrigger>
            <TabsTrigger value="discover">
              Discover
              <Users className="h-3 w-3 ml-1" />
            </TabsTrigger>
          </TabsList>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="chats" className="flex-1 overflow-y-auto m-0">
          {chatsLoading && chats.length === 0 ? (
            <div className="p-4 text-center">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
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
                onClick={() => onChatSelect(chat.id)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat.id ? "bg-[#eef2eb] border-l-4 border-l-[#4a7c59]" : ""
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
            ))
          )}
        </TabsContent>

        <TabsContent value="discover" className="flex-1 overflow-y-auto m-0 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-[#2c3e2d] flex items-center gap-2">
              <Users className="h-4 w-4 text-[#4a7c59]" />
              Popular Groups
            </h3>
            {publicGroups
              .filter((group) => group.isPopular)
              .map((group) => (
                <div key={group.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <img
                      src={group.avatar || "/placeholder.svg"}
                      alt={group.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[#2c3e2d] truncate">{group.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{group.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{group.members} members</span>
                        <span className="text-xs text-[#4a7c59] bg-[#eef2eb] px-2 py-0.5 rounded">
                          {group.category}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={joinedGroupIds.includes(group.id) ? "outline" : "default"}
                      className={
                        joinedGroupIds.includes(group.id)
                          ? "h-8 text-xs"
                          : "h-8 text-xs bg-[#4a7c59] hover:bg-[#3a6147]"
                      }
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      {joinedGroupIds.includes(group.id) ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Joined
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
          </div>

          <div className="space-y-2 pt-4 border-t">
            <h3 className="text-sm font-semibold text-[#2c3e2d]">More Groups</h3>
            {publicGroups
              .filter((group) => !group.isPopular)
              .map((group) => (
                <div key={group.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <img
                      src={group.avatar || "/placeholder.svg"}
                      alt={group.name}
                      className="w-12 h-12 rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-[#2c3e2d] truncate">{group.name}</h4>
                      <p className="text-xs text-gray-600 line-clamp-2">{group.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{group.members} members</span>
                        <span className="text-xs text-[#4a7c59] bg-[#eef2eb] px-2 py-0.5 rounded">
                          {group.category}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={joinedGroupIds.includes(group.id) ? "outline" : "default"}
                      className={
                        joinedGroupIds.includes(group.id)
                          ? "h-8 text-xs"
                          : "h-8 text-xs bg-[#4a7c59] hover:bg-[#3a6147]"
                      }
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      {joinedGroupIds.includes(group.id) ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Joined
                        </>
                      ) : (
                        <>
                          <Plus className="h-3 w-3 mr-1" />
                          Join
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
