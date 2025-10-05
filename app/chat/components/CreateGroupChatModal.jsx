"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { X, Users, Plus, Search, UserPlus, Camera, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { compressImage, validateImageFile } from "@/lib/imageCompression"
import AlertModal from "./AlertModal"

export default function CreateGroupChatModal({ isOpen, onClose, onGroupCreated, activeTab = "chats" }) {
  const { data: session } = useSession()
  const [groupName, setGroupName] = useState("")
  const [selectedFriends, setSelectedFriends] = useState([])
  const [friends, setFriends] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [groupAvatar, setGroupAvatar] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [alertModal, setAlertModal] = useState({ isOpen: false, title: "", message: "", type: "info" })
  const fileInputRef = useRef(null)

  // Check if user can create public groups
  const canCreatePublicGroup = session?.user?.role === 'admin' || session?.user?.role === 'instructor'
  const isPublicGroup = activeTab === "discover" && canCreatePublicGroup

  // Fetch user's friends
  useEffect(() => {
    if (isOpen && session?.user?.email && !isPublicGroup) {
      fetchFriends()
    }
  }, [isOpen, session, isPublicGroup])

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
    if (!friendId) return // Guard against undefined friendId
    
    setSelectedFriends(prev => prev.filter(friend => {
      const friendIdValue = friend._id || friend.id
      return friendIdValue && friendIdValue.toString() !== friendId.toString()
    }))
  }

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setAlertModal({
        isOpen: true,
        title: "Missing Information",
        message: "Please enter a group name",
        type: "warning"
      })
      return
    }

    // For regular groups, require at least one friend
    if (!isPublicGroup && selectedFriends.length === 0) {
      setAlertModal({
        isOpen: true,
        title: "Missing Information",
        message: "Please select at least one friend",
        type: "warning"
      })
      return
    }


    try {
      setCreating(true)
      
      let response
      if (isPublicGroup) {
        // Create public group
        response = await fetch('/api/chats/public-groups/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: groupName.trim(),
            avatar: groupAvatar
          })
        })
      } else {
        // Create regular group
        response = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'group',
            name: groupName.trim(),
            avatar: groupAvatar,
            participantIds: selectedFriends.map(friend => (friend._id || friend.id).toString())
          })
        })
      }

      const data = await response.json()

      if (data.success || data.group) {
        onGroupCreated(data.chat || data.group)
        handleClose()
      } else {
        setAlertModal({
          isOpen: true,
          title: "Error",
          message: data.error || 'Failed to create group',
          type: "error"
        })
      }
    } catch (error) {
      console.error('Error creating group:', error)
      setAlertModal({
        isOpen: true,
        title: "Error",
        message: 'Failed to create group',
        type: "error"
      })
    } finally {
      setCreating(false)
    }
  }

  // Handle avatar file selection
  const handleAvatarSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploadingAvatar(true)

      // Validate image file
      const validation = validateImageFile(file, {
        maxSizeMB: 10,
        allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      })

      if (!validation.isValid) {
        setAlertModal({
          isOpen: true,
          title: "Invalid Image",
          message: validation.errors.join(', '),
          type: "error"
        })
        return
      }

      // Compress image to 100KB as requested
      const compressionOptions = {
        maxSizeKB: 100, // 100KB target as requested
        maxWidthOrHeight: 512, // Good size for group avatars
        quality: 0.8,
        aggressiveQuality: 0.6,
        extremeQuality: 0.4,
        fileType: 'image/jpeg'
      }

      const compressedFile = await compressImage(file, compressionOptions)
      

      // Upload to S3
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('type', 'group-avatar')

      const response = await fetch('/api/chats/group-avatar-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setGroupAvatar(data.url)
        setAvatarPreview(URL.createObjectURL(compressedFile))
      } else {
        throw new Error(data.error || 'Failed to upload avatar')
      }

    } catch (error) {
      console.error('Avatar upload failed:', error)
      setAlertModal({
        isOpen: true,
        title: "Upload Failed",
        message: `Failed to upload avatar: ${error.message}`,
        type: "error"
      })
    } finally {
      setUploadingAvatar(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveAvatar = () => {
    setGroupAvatar(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    setGroupName("")
    setSelectedFriends([])
    setSearchQuery("")
    setGroupAvatar(null)
    setAvatarPreview(null)
    setUploadingAvatar(false)
    setAlertModal({ isOpen: false, title: "", message: "", type: "info" })
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
            selectedHat={user.bonsai.customization?.hat || null}
            selectedBackground={user.bonsai.customization?.background || null}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <Card className="w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#4a7c59] flex items-center justify-center">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">
                  {isPublicGroup ? "Create Public Group" : "Create Group Chat"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {isPublicGroup 
                    ? "Create a public group that others can discover and join" 
                    : "Start a conversation with multiple friends"
                  }
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Group Avatar */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-[#2c3e2d] mb-2 sm:mb-3">
              Group Avatar (Optional)
            </label>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Group avatar preview" 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  )}
                </div>
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-1 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2"
                >
                  <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                  {avatarPreview ? 'Change Avatar' : 'Upload Avatar'}
                </Button>
                
                {avatarPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1"
                  >
                    Remove Avatar
                  </Button>
                )}
                
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          {/* Group Details */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#2c3e2d] mb-2">
                Group Name *
              </label>
              <Input
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                maxLength={50}
              />
            </div>

          </div>

          {/* Selected Friends - Only for regular groups */}
          {!isPublicGroup && selectedFriends.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-[#2c3e2d] mb-2">
                Selected Members ({selectedFriends.length})
              </label>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {selectedFriends.map((friend) => (
                  <div
                    key={friend._id || friend.id || Math.random()}
                    className="flex items-center gap-1 sm:gap-2 bg-[#eef2eb] rounded-full px-2 sm:px-3 py-1 sm:py-2"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6">
                      {renderAvatar(friend)}
                    </div>
                    <span className="text-xs sm:text-sm text-[#2c3e2d]">{friend.name}</span>
                    <button
                      onClick={() => handleFriendRemove(friend._id || friend.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friend Search - Only for regular groups */}
          {!isPublicGroup && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-xs sm:text-sm font-medium text-[#2c3e2d] mb-2">
                Add Friends
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                <Input
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 sm:pl-10"
                />
              </div>
            </div>
          )}

          {/* Friends List - Only for regular groups */}
          {!isPublicGroup && (
            <div className="max-h-48 sm:max-h-60 overflow-y-auto mb-4 sm:mb-6">
              {loading ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-xs sm:text-sm">Loading friends...</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {searchQuery ? "No friends found matching your search" : "No friends available"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 sm:space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend._id || friend.id || Math.random()}
                      onClick={() => handleFriendSelect(friend)}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10">
                        {renderAvatar(friend)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#2c3e2d] text-sm sm:text-base">{friend.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{friend.email}</p>
                      </div>
                      <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="text-xs sm:text-sm px-3 py-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateGroup}
              disabled={creating || uploadingAvatar}
              className="bg-[#4a7c59] hover:bg-[#3a6147] text-xs sm:text-sm px-3 py-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  {isPublicGroup ? "Create Public Group" : "Create Group"}
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, title: "", message: "", type: "info" })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
