"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Users, Plus, Search, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"

export default function CreateGroupChatModal({ isOpen, onClose, onGroupCreated }) {
  const { data: session } = useSession()
  const [groupName, setGroupName] = useState("")
  const [groupDescription, setGroupDescription] = useState("")
  const [selectedFriends, setSelectedFriends] = useState([])
  const [friends, setFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  // Fetch user's friends
  useEffect(() => {
    if (isOpen && session?.user?.email) {
      fetchFriends()
    }
  }, [isOpen, session])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/friends')
      const data = await response.json()
      
      if (data.success) {
        setFriends(data.friends)
      }
    } catch (error) {
      console.error('Error fetching friends:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedFriends.some(selected => {
      const selectedId = selected._id || selected.id
      const friendId = friend._id || friend.id
      return selectedId && friendId && selectedId.toString() === friendId.toString()
    })
  )

  const handleFriendSelect = (friend) => {
    setSelectedFriends(prev => [...prev, friend])
    setSearchQuery("")
  }

  const handleFriendRemove = (friendId) => {
    setSelectedFriends(prev => prev.filter(friend => {
      const friendIdValue = friend._id || friend.id
      return friendIdValue && friendIdValue.toString() !== friendId.toString()
    }))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      alert("Please enter a group name and select at least one friend")
      return
    }

    try {
      setCreating(true)
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'group',
          name: groupName.trim(),
          description: groupDescription.trim(),
          participantIds: selectedFriends.map(friend => (friend._id || friend.id).toString())
        })
      })

      const data = await response.json()

      if (data.success) {
        onGroupCreated(data.chat)
        handleClose()
      } else {
        alert(data.error || 'Failed to create group chat')
      }
    } catch (error) {
      console.error('Error creating group chat:', error)
      alert('Failed to create group chat')
    } finally {
      setCreating(false)
    }
  }

  const handleClose = () => {
    setGroupName("")
    setGroupDescription("")
    setSelectedFriends([])
    setSearchQuery("")
    onClose()
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#4a7c59] flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#2c3e2d]">Create Group Chat</h2>
                <p className="text-sm text-gray-600">Start a conversation with multiple friends</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Group Details */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#2c3e2d] mb-2">
                Group Name *
              </label>
              <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2c3e2d] mb-2">
                Description (Optional)
              </label>
              <Input
                placeholder="What's this group about?"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                maxLength={200}
              />
            </div>
          </div>

          {/* Selected Friends */}
          {selectedFriends.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#2c3e2d] mb-2">
                Selected Members ({selectedFriends.length})
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedFriends.map((friend) => (
                  <div
                    key={friend._id || friend.id || Math.random()}
                    className="flex items-center gap-2 bg-[#eef2eb] rounded-full px-3 py-2"
                  >
                    <div className="w-6 h-6">
                      {renderAvatar(friend)}
                    </div>
                    <span className="text-sm text-[#2c3e2d]">{friend.name}</span>
                    <button
                      onClick={() => handleFriendRemove(friend._id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friend Search */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#2c3e2d] mb-2">
              Add Friends
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Friends List */}
          <div className="max-h-60 overflow-y-auto mb-6">
            {loading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading friends...</p>
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  {searchQuery ? "No friends found matching your search" : "No friends available"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend._id || friend.id || Math.random()}
                    onClick={() => handleFriendSelect(friend)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10">
                      {renderAvatar(friend)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-[#2c3e2d]">{friend.name}</p>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                    <UserPlus className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={creating || !groupName.trim() || selectedFriends.length === 0}
              className="bg-[#4a7c59] hover:bg-[#3a6147]"
            >
              {creating ? "Creating..." : `Create Group (${selectedFriends.length + 1})`}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
