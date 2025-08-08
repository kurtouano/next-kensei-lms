// components/profile/ProfileHeader.jsx
"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BannerCropper } from "./BannerCropper"
import { User, Award, BookOpen, Flag, Check, Loader2, Upload, Camera, Image, Plus, Trash2 } from "lucide-react"

export function ProfileHeader({ userData, onUserDataUpdate, onError }) {
  const bannerFileInputRef = useRef(null)
  const [showBannerCropper, setShowBannerCropper] = useState(false)
  const [tempBannerImage, setTempBannerImage] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [showBannerDropdown, setShowBannerDropdown] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBannerDropdown && !event.target.closest('.banner-dropdown-container')) {
        setShowBannerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showBannerDropdown])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const handleBannerUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file size (limit to 5MB for banners)
    if (file.size > 5 * 1024 * 1024) {
      onError("Banner file size must be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      onError("Please select an image file")
      return
    }

    // Create temporary URL for cropping
    const tempUrl = URL.createObjectURL(file)
    setTempBannerImage(tempUrl)
    setShowBannerCropper(true)
    setShowBannerDropdown(false) // Close dropdown
    onError("")

    // Reset file input
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = ""
    }
  }

  const handleBannerCropComplete = async (croppedBlob) => {
    try {
      setUploadingBanner(true)
      
      // Step 1: Get presigned URL for banner
      const presignedResponse = await fetch('/api/profile/banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'banner.jpg',
          type: 'image/jpeg'
        })
      })

      const presignedData = await presignedResponse.json()
      
      if (!presignedData.success) {
        onError(presignedData.message || "Failed to prepare banner upload")
        return
      }

      // Step 2: Upload cropped image to S3
      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        body: croppedBlob,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      })

      if (uploadResponse.ok) {
        // Step 3: Immediately save banner to database
        const updateResponse = await fetch("/api/profile", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: userData.name,
            country: userData.country,
            icon: userData.icon,
            banner: presignedData.fileUrl
          })
        })

        const updateData = await updateResponse.json()
        
        if (updateData.success) {
          // Update userData through parent component
          onUserDataUpdate({ ...userData, banner: presignedData.fileUrl })
          setShowBannerCropper(false)
          onError("")
          
          // Trigger header refresh
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          onError(updateData.message || "Failed to save banner to profile")
          return
        }
        
        // Clean up temp URL
        if (tempBannerImage) {
          URL.revokeObjectURL(tempBannerImage)
          setTempBannerImage(null)
        }
      } else {
        onError("Failed to upload banner image")
      }
    } catch (err) {
      onError("Failed to upload banner image")
      console.error("Banner upload error:", err)
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleBannerCropCancel = () => {
    setShowBannerCropper(false)
    if (tempBannerImage) {
      URL.revokeObjectURL(tempBannerImage)
      setTempBannerImage(null)
    }
  }

  const handleRemoveBanner = async () => {
    try {
      setUploadingBanner(true)
      setShowBannerDropdown(false) // Close dropdown
      
      // Immediately remove banner from database
      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: userData.name,
          country: userData.country,
          icon: userData.icon,
          banner: null
        })
      })

      const updateData = await updateResponse.json()
      
      if (updateData.success) {
        // Update userData through parent component
        onUserDataUpdate({ ...userData, banner: null })
        onError("")
        
        // Trigger header refresh
        window.dispatchEvent(new CustomEvent('profile-updated'))
      } else {
        onError(updateData.message || "Failed to remove banner")
      }
    } catch (err) {
      onError("Failed to remove banner")
      console.error("Banner removal error:", err)
    } finally {
      setUploadingBanner(false)
    }
  }

  const handleBannerDropdownToggle = () => {
    setShowBannerDropdown(!showBannerDropdown)
  }

  const handleChooseCoverPhoto = () => {
    bannerFileInputRef.current?.click()
  }

  return (
    <>
      {/* Profile Header with Banner Background */}
      <div className="mb-8 relative">
        <div 
            className={`rounded-lg p-6 min-h-[150px] flex items-end relative overflow-hidden ${!userData.banner ? ' bg-[#679873] ': ''}`}
            style={userData.banner ? {
            backgroundImage: `url(${userData.banner})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
            } : {}}
        >
            {/* Dark overlay for better text readability when banner exists */}
            {userData.banner && (
            <div className="absolute inset-0 bg-black/40 rounded-lg"></div>
            )}
            
            {/* Banner Edit Button with Dropdown */}
            <div className="absolute top-3 right-3 z-20">
            <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerUpload}
                className="hidden"
            />
            
            <div className="relative banner-dropdown-container">
                <Button 
                size="sm"
                className="bg-transparent text-white hover:bg-white/10 border border-white/20 backdrop-blur-sm"
                onClick={handleBannerDropdownToggle}
                disabled={uploadingBanner}
                >
                {uploadingBanner ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                    <Camera className="mr-1 h-3 w-3" />
                )}
                {userData.banner ? 'Edit Banner' : 'Add Banner'}
                </Button>
                
                {/* Dropdown Menu */}
                {showBannerDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                    <button
                    onClick={handleChooseCoverPhoto}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    disabled={uploadingBanner}
                    >
                    <Image className="mr-3 h-4 w-4 text-[#4a7c59]" />
                    Choose banner photo
                    </button>
                    
                    {userData.banner && (
                    <button
                        onClick={handleRemoveBanner}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                        disabled={uploadingBanner}
                    >
                        <Trash2 className="mr-3 h-4 w-4 text-red-500" />
                        Remove
                    </button>
                    )}
                </div>
                )}
            </div>
            </div>

          {/* Profile Info - Bottom Aligned */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center">
              <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2eb] overflow-hidden border-4 border-white shadow-lg">
                {userData.icon ? (
                  userData.icon.startsWith('http') ? (
                    <img 
                      src={userData.icon} 
                      alt="Profile" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">{userData.icon}</span>
                  )
                ) : (
                  <BonsaiIcon className="h-12 w-12 text-[#4a7c59]" />
                )}
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-white">
                    {userData.name}
                  </h1>
                  <div className="ml-2 rounded-full px-2 py-0.5 bg-white/20">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-white/90">
                  Joined {formatDate(userData.joinDate)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center rounded-full px-4 py-2 bg-white/20 backdrop-blur-sm">
                <BookOpen className="mr-2 h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {userData.bonsai ? `Level ${userData.bonsai.level}` : 'Level 1'} Learner
                </span>
              </div>
              <div className="flex items-center rounded-full px-4 py-2 bg-white/20 backdrop-blur-sm">
                <BonsaiIcon className="mr-2 h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {userData.credits} Credits
                </span>
              </div>
              <div className="flex items-center rounded-full px-4 py-2 bg-white/20 backdrop-blur-sm">
                <Flag className="mr-2 h-4 w-4 text-white" />
                <span className="text-sm font-medium text-white">
                  {userData.country}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Cropper Modal */}
      <BannerCropper
        isOpen={showBannerCropper}
        onClose={handleBannerCropCancel}
        imageSrc={tempBannerImage}
        onCropComplete={handleBannerCropComplete}
        uploading={uploadingBanner}
      />
    </>
  )
}