// components/profile/ProfileIconModal.jsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { Upload, TreePine, Loader2, X } from "lucide-react"
import { compressImage } from '@/lib/imageCompression'

export function ProfileIconModal({ isOpen, onClose, userData, onUserDataUpdate, onError }) {
  const fileInputRef = useRef(null)
  const [uploadingIcon, setUploadingIcon] = useState(false)
  const [compressionStatus, setCompressionStatus] = useState('')
  const [tempIcon, setTempIcon] = useState(userData.icon)
  const [useBonsaiAsIcon, setUseBonsaiAsIcon] = useState(userData.icon === 'bonsai')

  const handleIconUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUseBonsaiAsIcon = () => {
    setUseBonsaiAsIcon(true)
    setTempIcon('bonsai')
  }

  const handleRemoveBonsaiIcon = () => {
    setUseBonsaiAsIcon(false)
    setTempIcon(null)
  }

  const handleIconUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError("Please select an image file")
      return
    }

    setUploadingIcon(true)
    onError("")

    try {
      // Compress the avatar image before upload
      setCompressionStatus('Compressing avatar image...')
      
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
        // Step 3: Update the temp icon with the new avatar URL
        setTempIcon(presignedData.fileUrl)
        setUseBonsaiAsIcon(false)
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

  const handleSaveIcon = async () => {
    try {
      setUploadingIcon(true)
      
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: userData.name,
          country: userData.country,
          icon: tempIcon,
          banner: userData.banner
        })
      })

      const data = await response.json()
      
      if (data.success) {
        onUserDataUpdate({
          ...userData,
          icon: tempIcon
        })
        onClose()
        onError("")
        
        // Trigger header refresh
        window.dispatchEvent(new CustomEvent('profile-updated'))
      } else {
        onError(data.message || "Failed to update profile icon")
      }
    } catch (err) {
      onError("Failed to update profile icon")
      console.error("Icon update error:", err)
    } finally {
      setUploadingIcon(false)
    }
  }

  const handleCancel = () => {
    setTempIcon(userData.icon)
    setUseBonsaiAsIcon(userData.icon === 'bonsai')
    setCompressionStatus('')
    onError("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#2c3e2d]">Change Profile Icon</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Icon Preview */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2eb] overflow-hidden border-2 border-[#dce4d7]">
              {tempIcon ? (
                tempIcon === 'bonsai' ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <BonsaiSVG 
                      level={userData.bonsai?.level || 1}
                      treeColor={userData.bonsai?.customization?.foliageColor || '#77DD82'} 
                      potColor={userData.bonsai?.customization?.potColor || '#FD9475'} 
                      selectedEyes={userData.bonsai?.customization?.eyes || 'default_eyes'}
                      selectedMouth={userData.bonsai?.customization?.mouth || 'default_mouth'}
                      selectedPotStyle={userData.bonsai?.customization?.potStyle || 'default_pot'}
                      selectedGroundStyle={userData.bonsai?.customization?.groundStyle || 'default_ground'}
                      selectedHat={userData.bonsai?.customization?.hat || null}
                      selectedBackground={userData.bonsai?.customization?.background || null}
                      zoomed={true}
                      profileIcon={true}
                    />
                  </div>
                ) : tempIcon.startsWith('http') ? (
                  <img 
                    src={tempIcon} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">{tempIcon}</span>
                )
              ) : (
                <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleIconUpload}
            className="hidden"
            disabled={uploadingIcon}
          />

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Upload Image Button */}
            <Button 
              variant="outline" 
              className="w-full border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
              onClick={handleIconUploadClick}
              disabled={uploadingIcon}
            >
              {uploadingIcon ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Upload New Image
            </Button>
            
            {/* Use My Bonsai Button */}
            {userData.bonsai && (
              <Button 
                variant="outline" 
                className={`w-full ${
                  tempIcon === 'bonsai' 
                    ? 'bg-[#4a7c59] text-white border-[#4a7c59]' 
                    : 'border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]'
                }`}
                onClick={tempIcon === 'bonsai' ? handleRemoveBonsaiIcon : handleUseBonsaiAsIcon}
                disabled={uploadingIcon}
              >
                <TreePine className="mr-2 h-4 w-4" />
                {tempIcon === 'bonsai' ? 'Remove Bonsai Icon' : 'Use My Bonsai'}
              </Button>
            )}
            
            {/* Remove Icon Button - only show if not using bonsai */}
            {tempIcon && tempIcon !== 'bonsai' && (
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                onClick={() => setTempIcon(null)}
                disabled={uploadingIcon}
              >
                Remove Icon
              </Button>
            )}
          </div>

          {/* Compression Status */}
          {compressionStatus && (
            <div className="text-sm text-[#4a7c59] bg-blue-50 px-3 py-2 rounded">
              {compressionStatus}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
            onClick={handleCancel}
            disabled={uploadingIcon}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-[#4a7c59] text-white hover:bg-[#3a6147]"
            onClick={handleSaveIcon}
            disabled={uploadingIcon || tempIcon === userData.icon}
          >
            {uploadingIcon ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
