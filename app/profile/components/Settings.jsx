// components/profile/Settings.jsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { Mail, LogOut, Loader2, Upload, Image } from "lucide-react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { compressImage } from '@/lib/imageCompression'

export function Settings({ userData, onUserDataUpdate, onError }) {
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({
    name: userData.name,
    country: userData.country,
    icon: userData.icon,
    banner: userData.banner
  })
  const [updating, setUpdating] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState('')

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true)
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editData)
      })

      const data = await response.json()
      
      if (data.success) {
        onUserDataUpdate({
          ...userData,
          name: editData.name,
          country: editData.country,
          icon: editData.icon,
          banner: editData.banner
        })
        setEditMode(false)
        onError("")
        
        // Trigger header refresh
        window.dispatchEvent(new CustomEvent('profile-updated'))
      } else {
        onError(data.message || "Failed to update profile")
      }
    } catch (err) {
      onError("Failed to update profile")
      console.error("Profile update error:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const handleEditModeToggle = () => {
    if (editMode) {
      // If canceling edit, reset edit data
      setEditData({
        name: userData.name,
        country: userData.country,
        icon: userData.icon,
        banner: userData.banner
      })
      onError("")
      setCompressionStatus('')
    }
    setEditMode(!editMode)
  }

  const handleIconUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleIconUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // ✅ REMOVED: File size check since compression will handle it
    // ✅ SIMPLIFIED: Only check file type
    if (!file.type.startsWith('image/')) {
      onError("Please select an image file")
      return
    }

    setUploadingIcon(true)
    onError("")

    try {
      // ✅ NEW: Compress the avatar image before upload
      setCompressionStatus('Compressing avatar image...')
      
      // Avatar-specific compression settings (square format, smaller size)
      const compressionOptions = {
        maxSizeKB: 100, // Smaller limit for avatars
        maxWidthOrHeight: 400, // Good size for avatars
        quality: 0.8,
        aggressiveQuality: 0.65,
        extremeQuality: 0.5,
        fileType: 'image/jpeg'
      }

      const compressedFile = await compressImage(file, compressionOptions)
      
      setCompressionStatus(`Compressed from ${(file.size / 1024).toFixed(1)}KB to ${(compressedFile.size / 1024).toFixed(1)}KB`)

      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: compressedFile.name,
          type: compressedFile.type
        })
      })

      const presignedData = await presignedResponse.json()
      
      if (!presignedData.success) {
        onError(presignedData.message || "Failed to prepare upload")
        return
      }

      setCompressionStatus('Uploading optimized image...')

      // Step 2: Upload compressed file directly to S3
      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        body: compressedFile,
        headers: {
          'Content-Type': compressedFile.type
        }
      })

      if (uploadResponse.ok) {
        // Step 3: Update the edit data with the new avatar URL
        setEditData(prev => ({ ...prev, icon: presignedData.fileUrl }))
        setCompressionStatus('✅ Avatar optimized and uploaded!')
        onError("")
        
        setTimeout(() => {
          setCompressionStatus('')
        }, 2000)
      } else {
        onError("Failed to upload image")
      }
    } catch (err) {
      if (err.message.includes('compress')) {
        onError("Failed to compress image: " + err.message)
      } else {
        onError("Failed to upload image")
      }
      console.error("Icon upload error:", err)
    } finally {
      setUploadingIcon(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#2c3e2d]">Account Settings</h2>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-[#4a7c59] text-[#4a7c59]"
            onClick={handleEditModeToggle}
          >
            {editMode ? "Cancel" : "Edit"}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Banner Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">Profile Banner</label>
            <div className="space-y-3">
              <div className="h-24 rounded-lg bg-[#f8f7f4] border-2 border-dashed border-[#dce4d7] overflow-hidden">
                {editData.banner ? (
                  <img 
                    src={editData.banner} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#5c6d5e] text-sm">
                    <div className="text-center">
                      <Image className="mx-auto h-6 w-6 mb-1" />
                      No banner selected
                    </div>
                  </div>
                )}
              </div>
              
              {/* Help text */}
              {!editMode && (
                <p className="text-xs text-[#5c6d5e] mt-2">
                  Click "Edit" above to change your banner
                </p>
              )}
            </div>
          </div>

          {/* Profile Icon Section */}
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">Profile Icon</label>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#eef2eb] overflow-hidden border-2 border-[#dce4d7]">
                {editData.icon ? (
                  editData.icon.startsWith('http') ? (
                    <img 
                      src={editData.icon} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">{editData.icon}</span>
                  )
                ) : (
                  <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
                )}
              </div>
              
              {editMode && (
                <div className="flex flex-col gap-2">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleIconUpload}
                    className="hidden"
                    disabled={uploadingIcon}
                  />
                  
                  <div className="flex gap-2">
                    {/* Upload button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                      onClick={handleIconUploadClick}
                      disabled={uploadingIcon}
                    >
                      {uploadingIcon ? (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="mr-1 h-3 w-3" />
                      )}
                      Upload
                    </Button>
                    
                    {/* Remove button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                      onClick={() => setEditData(prev => ({ ...prev, icon: null }))}
                      disabled={uploadingIcon}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {/* ✅ NEW: Compression Status */}
                  {compressionStatus && (
                    <div className="text-xs text-[#4a7c59] bg-blue-50 px-2 py-1 rounded">
                      {compressionStatus}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Help text */}
            {!editMode && (
              <p className="text-xs text-[#5c6d5e] mt-2">
                Click "Edit" above to change your personal details
              </p>
            )}
            
            {/* ✅ NEW: Compression info for edit mode */}
            {editMode && !compressionStatus && (
              <p className="text-xs text-[#5c6d5e] mt-2">
                ✨ Images are automatically optimized for fast loading (any size accepted)
              </p>
            )}
          </div>
          
          <div>
            <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Username</label>
            <input
              type="text"
              value={editMode ? editData.name : userData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-md border border-[#dce4d7] bg-white px-3 py-2 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none"
              readOnly={!editMode}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Email</label>
            <div className="flex items-center rounded-md border border-[#dce4d7] bg-[#f8f7f4] px-3 py-2">
              <Mail className="mr-2 h-4 w-4 text-[#5c6d5e]" />
              <span className="text-[#5c6d5e]">{userData.email}</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Country</label>
            <select 
              className="w-full rounded-md border border-[#dce4d7] bg-white px-3 py-2 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none"
              value={editMode ? editData.country : userData.country}
              onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
              disabled={!editMode}
            >
              <option value="United States">United States</option>
              <option value="Japan">Japan</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Bonsai Garden Resident">Bonsai Garden Resident</option>
            </select>
          </div>

          {/* Role Information */}
          <div>
            <label className="mb-1 block text-sm font-medium text-[#2c3e2d]">Role</label>
            <div className="flex items-center rounded-md border border-[#dce4d7] bg-[#f8f7f4] px-3 py-2">
              <span className="text-[#5c6d5e]">{capitalizeFirst(userData.role)}</span>
            </div>
          </div>
        </div>

        {editMode && (
          <Button 
            className="mt-6 w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]"
            onClick={handleUpdateProfile}
            disabled={updating}
          >
            {updating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        )}

        {/* Logout Button */}
        <div className="mt-8 pt-6 border-t border-[#dce4d7]">
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="w-full border-red-500 text-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}