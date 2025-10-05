"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { X, Edit, Image, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { compressImage, validateImageFile } from "@/lib/imageCompression"

export default function EditGroupModal({ isOpen, onClose, chat, onGroupUpdated }) {
  const { data: session } = useSession()
  const [groupName, setGroupName] = useState(chat?.name || "")
  const [groupAvatar, setGroupAvatar] = useState(chat?.avatar || null)
  const [avatarPreview, setAvatarPreview] = useState(chat?.avatar || null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)

  // Update form fields when chat prop changes
  useEffect(() => {
    if (chat) {
      setGroupName(chat.name || "")
      setGroupAvatar(chat.avatar || null)
      setAvatarPreview(chat.avatar || null)
      setError("")
    }
  }, [chat])

  // Handle avatar upload
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setError(validation.error)
      return
    }

    try {
      setUploadingAvatar(true)
      setError("")

      // Compress image
      const compressedFile = await compressImage(file, {
        maxWidth: 400,
        maxHeight: 400,
        quality: 0.8
      })

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target.result)
      }
      reader.readAsDataURL(compressedFile)

      // Upload to server
      const formData = new FormData()
      formData.append('file', compressedFile)
      formData.append('type', 'chat-avatar')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to upload avatar')
      }

      const data = await response.json()
      setGroupAvatar(data.url)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setError('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Handle save changes
  const handleSave = async () => {
    if (!groupName.trim()) {
      setError("Group name is required")
      return
    }

    try {
      setSaving(true)
      setError("")

      const response = await fetch(`/api/chats/${chat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: groupName.trim(),
          avatar: groupAvatar
        })
      })

      const data = await response.json()

      if (data.success) {
        onGroupUpdated?.(data.chat)
        onClose()
      } else {
        setError(data.error || 'Failed to update group')
      }
    } catch (error) {
      console.error('Error updating group:', error)
      setError('Failed to update group')
    } finally {
      setSaving(false)
    }
  }

  // Handle close
  const handleClose = () => {
    setGroupName(chat?.name || "")
    setGroupAvatar(chat?.avatar || null)
    setAvatarPreview(chat?.avatar || null)
    setError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4a7c59] rounded-full flex items-center justify-center">
                <Edit className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Edit Group</h2>
                <p className="text-sm text-gray-500">Update group name and avatar</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Group Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <Input
              type="text"
              placeholder="Enter group name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={50}
            />
          </div>

          {/* Group Avatar */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Avatar
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Group avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#4a7c59] text-white flex items-center justify-center text-lg font-medium">
                    {groupName?.charAt(0)?.toUpperCase() || "G"}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full"
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" />
                      {avatarPreview ? "Change Avatar" : "Add Avatar"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !groupName.trim()}
              className="bg-[#4a7c59] hover:bg-[#3a6147]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
