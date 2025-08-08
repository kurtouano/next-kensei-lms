"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { BannerCropper } from "./components/BannerCropper"
import { User, Award, BookOpen, Flag, Globe, Mail, Lock, LogOut, Check, ChevronRight, Loader2, Upload, Settings, Target, TreePine, Camera, Image, MoreHorizontal, Edit3, Move, Trash2, Plus } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CertificateModal } from "@/components/certificate-modal"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef(null)
  const bannerFileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [updating, setUpdating] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  // Banner states
  const [showBannerCropper, setShowBannerCropper] = useState(false)
  const [tempBannerImage, setTempBannerImage] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [showBannerDropdown, setShowBannerDropdown] = useState(false)

  // Certificate state
  const [certificates, setCertificates] = useState([])
  const [certificatesLoading, setCertificatesLoading] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  // FIXED: Define isLoggedIn properly
  const isLoggedIn = status === "authenticated" && !!session?.user

  useEffect(() => {
    // Get the current URL search params
    const searchParams = new URLSearchParams(window.location.search);
    const tab = searchParams.get('tab');
    
    if (tab === 'certifications') {
      setActiveTab('certifications');
    }
  }, []);

  // Fetch user profile data
  useEffect(() => {
    if (status === "authenticated") {
      fetchUserProfile()
      fetchUserCertificates() // FIXED: Call here instead of separate useEffect
    } else if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/profile")
      const data = await response.json()

      if (data.success) {
        setUserData(data.user)
        setEditData({
          name: data.user.name,
          country: data.user.country,
          icon: data.user.icon,
          banner: data.user.banner
        })
      } else {
        setError(data.message || "Failed to fetch profile data")
      }
    } catch (err) {
      setError("Failed to fetch profile data")
      console.error("Profile fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserCertificates = async () => {
    try {
      setCertificatesLoading(true)
      const response = await fetch('/api/certificates')
      const data = await response.json()
      
      if (data.success) {
        setCertificates(data.certificates)
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setCertificatesLoading(false)
    }
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
        setUserData(prev => ({
          ...prev,
          name: editData.name,
          country: editData.country,
          icon: editData.icon,
          banner: editData.banner
        }))
        setEditMode(false)
        setError("")
        
        // Trigger header refresh
        window.dispatchEvent(new CustomEvent('profile-updated'))
      } else {
        setError(data.message || "Failed to update profile")
      }
    } catch (err) {
      setError("Failed to update profile")
      console.error("Profile update error:", err)
    } finally {
      setUpdating(false)
    }
  }

  const handleViewCertificate = (certificate) => {
    setSelectedCourseId(certificate.courseId)
    setShowCertificateModal(true)
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
      setError("")
    }
    setEditMode(!editMode)
  }

  const handleIconUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleBannerUploadClick = () => {
    bannerFileInputRef.current?.click()
  }

  const handleIconUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file size (limit to 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB")
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file")
      return
    }

    setUploadingIcon(true)
    setError("")

    try {
      // Step 1: Get presigned URL
      const presignedResponse = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type
        })
      })

      const presignedData = await presignedResponse.json()
      
      if (!presignedData.success) {
        setError(presignedData.message || "Failed to prepare upload")
        return
      }

      // Step 2: Upload file directly to S3
      const uploadResponse = await fetch(presignedData.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      })

      if (uploadResponse.ok) {
        // Step 3: Update the edit data with the new avatar URL
        setEditData(prev => ({ ...prev, icon: presignedData.fileUrl }))
        setError("")
      } else {
        setError("Failed to upload image")
      }
    } catch (err) {
      setError("Failed to upload image")
      console.error("Icon upload error:", err)
    } finally {
      setUploadingIcon(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleBannerUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Check file size (limit to 5MB for banners)
    if (file.size > 5 * 1024 * 1024) {
      setError("Banner file size must be less than 5MB")
      return
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file")
      return
    }

    // Create temporary URL for cropping
    const tempUrl = URL.createObjectURL(file)
    setTempBannerImage(tempUrl)
    setShowBannerCropper(true)
    setShowBannerDropdown(false) // Close dropdown
    setError("")

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
        setError(presignedData.message || "Failed to prepare banner upload")
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
          // Update both userData and editData
          setUserData(prev => ({ ...prev, banner: presignedData.fileUrl }))
          setEditData(prev => ({ ...prev, banner: presignedData.fileUrl }))
          setShowBannerCropper(false)
          setError("")
          
          // Trigger header refresh
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          setError(updateData.message || "Failed to save banner to profile")
          return
        }
        
        // Clean up temp URL
        if (tempBannerImage) {
          URL.revokeObjectURL(tempBannerImage)
          setTempBannerImage(null)
        }
      } else {
        setError("Failed to upload banner image")
      }
    } catch (err) {
      setError("Failed to upload banner image")
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
        // Update both userData and editData
        setUserData(prev => ({ ...prev, banner: null }))
        setEditData(prev => ({ ...prev, banner: null }))
        setError("")
        
        // Trigger header refresh
        window.dispatchEvent(new CustomEvent('profile-updated'))
      } else {
        setError(updateData.message || "Failed to remove banner")
      }
    } catch (err) {
      setError("Failed to remove banner")
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getBonsaiTreeColor = (color) => {
    return color || "#6fb58a"
  }

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#4a7c59]" />
            <span className="text-[#2c3e2d]">Loading profile...</span>
          </div>
        </main>
      </div>
    )
  }

  if (error && !userData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUserProfile} className="bg-[#4a7c59] text-white hover:bg-[#3a6147]">
              Try Again
            </Button>
          </div>
        </main>
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Error Display */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={() => setError("")} 
                className="text-red-600 hover:text-red-800 text-xs underline ml-2"
              >
                Dismiss
              </button>
            </div>
          )}

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
                      <h1 className={`text-2xl font-bold ${userData.banner || !userData.banner ? 'text-white' : 'text-[#2c3e2d]'}`}>
                        {userData.name}
                      </h1>
                      <div className={`ml-2 rounded-full px-2 py-0.5 ${userData.banner || !userData.banner ? 'bg-white/20' : 'bg-[#eef2eb]'}`}>
                        <Check className={`h-4 w-4 ${userData.banner || !userData.banner ? 'text-white' : 'text-[#4a7c59]'}`} />
                      </div>
                    </div>
                    <p className={`${userData.banner || !userData.banner ? 'text-white/90' : 'text-[#5c6d5e]'}`}>
                      Joined {formatDate(userData.joinDate)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className={`flex items-center rounded-full px-4 py-2 ${userData.banner || !userData.banner ? 'bg-white/20 backdrop-blur-sm' : 'bg-[#eef2eb]'}`}>
                    <BookOpen className={`mr-2 h-4 w-4 ${userData.banner || !userData.banner ? 'text-white' : 'text-[#4a7c59]'}`} />
                    <span className={`text-sm font-medium ${userData.banner || !userData.banner ? 'text-white' : 'text-[#2c3e2d]'}`}>
                      {userData.bonsai ? `Level ${userData.bonsai.level}` : 'Level 1'} Learner
                    </span>
                  </div>
                  <div className={`flex items-center rounded-full px-4 py-2 ${userData.banner || !userData.banner ? 'bg-white/20 backdrop-blur-sm' : 'bg-[#eef2eb]'}`}>
                    <BonsaiIcon className={`mr-2 h-4 w-4 ${userData.banner || !userData.banner ? 'text-white' : 'text-[#4a7c59]'}`} />
                    <span className={`text-sm font-medium ${userData.banner || !userData.banner ? 'text-white' : 'text-[#2c3e2d]'}`}>
                      {userData.credits} Credits
                    </span>
                  </div>
                  <div className={`flex items-center rounded-full px-4 py-2 ${userData.banner || !userData.banner ? 'bg-white/20 backdrop-blur-sm' : 'bg-[#eef2eb]'}`}>
                    <Flag className={`mr-2 h-4 w-4 ${userData.banner || !userData.banner ? 'text-white' : 'text-[#4a7c59]'}`} />
                    <span className={`text-sm font-medium ${userData.banner || !userData.banner ? 'text-white' : 'text-[#2c3e2d]'}`}>
                      {userData.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-[#eef2eb]">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                <User className="mr-2 h-4 w-4" />
                My Profile
              </TabsTrigger>
              <TabsTrigger
                value="certifications"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Award className="mr-2 h-4 w-4" />
                Certifications
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Profile Summary */}
                <div className="md:col-span-2 space-y-6">
                  {/* Learning Progress */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Learning Progress</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{userData.progress?.enrolledCourses || 0}</p>
                        <p className="text-sm text-[#5c6d5e]">Courses Enrolled</p>
                      </div>
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{userData.progress?.coursesCompleted || 0}</p>
                        <p className="text-sm text-[#5c6d5e]">Courses Completed</p>
                      </div>
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">{userData.progress?.lessonsCompleted || 0}</p>
                        <p className="text-sm text-[#5c6d5e]">Lessons Completed</p>
                      </div>
                      <div className="rounded-lg bg-[#eef2eb] p-4 text-center">
                        <p className="text-2xl font-bold text-[#4a7c59]">
                          {userData.bonsai ? userData.bonsai.totalCredits : 0}
                        </p>
                        <p className="text-sm text-[#5c6d5e]">Total Credits Earned</p>
                      </div>
                    </div>
                  </div>

                  {/* My Bonsai */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6 flex flex-col h-fit">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">My Bonsai</h2>
                    <div className="flex-1 flex flex-col justify-center">
                      {userData.bonsai ? (
                        <div className=" flex flex-col items-center">
                          <div className="mb-4 flex justify-center md:h-[440px]">
                            <BonsaiSVG 
                              level={userData.bonsai.level || 1}
                              treeColor={userData.bonsai.customization?.foliageColor || '#77DD82'} 
                              potColor={userData.bonsai.customization?.potColor || '#FD9475'} 
                              selectedEyes={userData.bonsai.customization?.eyes || 'default_eyes'}
                              selectedMouth={userData.bonsai.customization?.mouth || 'default_mouth'}
                              selectedPotStyle={userData.bonsai.customization?.potStyle || 'default_pot'}
                              selectedGroundStyle={userData.bonsai.customization?.groundStyle || 'default_ground'}
                              decorations={userData.bonsai.customization?.decorations || []}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <div className="mb-4 flex justify-center">
                            <BonsaiSVG 
                              level={1}
                              treeColor="#77DD82" 
                              potColor="#FD9475" 
                              selectedEyes="default_eyes"
                              selectedMouth="default_mouth"
                              selectedPotStyle="default_pot"
                              selectedGroundStyle="default_ground"
                              decorations={[]}
                            />
                          </div>
                          <p className="text-[#5c6d5e] mb-4">Start learning to grow your bonsai!</p>
                        </div>
                      )}
                    </div>
                    <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147] mt-auto" asChild>
                      <Link href="/bonsai">
                        Customize My Bonsai
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Subscription Information */}
                  {userData.subscription && (
                    <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                      <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Subscription</h2>
                      <div className="space-y-2">
                        <p className="text-[#2c3e2d]">
                          <span className="font-medium">Plan:</span> {capitalizeFirst(userData.subscription.plan)}
                        </p>
                        <p className="text-[#2c3e2d]">
                          <span className="font-medium">Status:</span> {capitalizeFirst(userData.subscription.status)}
                        </p>
                        {userData.subscription.endDate && (
                          <p className="text-[#2c3e2d]">
                            <span className="font-medium">Expires:</span> {formatDate(userData.subscription.endDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col h-full">
                  <div className="space-y-6 flex-1">
                    {/* Quick Stats */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Quick Stats</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#eef2eb]">
                        <div className="flex items-center">
                          <BonsaiIcon className="mr-3 h-5 w-5 text-[#4a7c59]" />
                          <span className="text-sm font-medium text-[#2c3e2d]">Bonsai Level</span>
                        </div>
                        <span className="text-lg font-bold text-[#4a7c59]">
                          {userData.bonsai ? userData.bonsai.level : 1}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#eef2eb]">
                        <div className="flex items-center">
                          <Award className="mr-3 h-5 w-5 text-[#4a7c59]" />
                          <span className="text-sm font-medium text-[#2c3e2d]">Certificates</span>
                        </div>
                        <span className="text-lg font-bold text-[#4a7c59]">
                          {certificates.length}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-[#eef2eb]">
                        <div className="flex items-center">
                          <BookOpen className="mr-3 h-5 w-5 text-[#4a7c59]" />
                          <span className="text-sm font-medium text-[#2c3e2d]">Active Courses</span>
                        </div>
                        <span className="text-lg font-bold text-[#4a7c59]">
                          {userData.progress?.enrolledCourses || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Achievement */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Recent Achievement</h2>
                    {certificates.length > 0 ? (
                      <div className="text-center p-4 rounded-lg bg-gradient-to-br from-[#eef2eb] to-[#dce4d7]">
                        <Award className="mx-auto mb-3 h-8 w-8 text-[#4a7c59]" />
                        <h3 className="font-medium text-[#2c3e2d] mb-1">Latest Certificate</h3>
                        <p className="text-sm text-[#5c6d5e] mb-2">
                          {certificates[certificates.length - 1]?.courseTitle}
                        </p>
                        <p className="text-xs text-[#5c6d5e]">
                          {certificates[certificates.length - 1]?.completionDate ? 
                            new Date(certificates[certificates.length - 1].completionDate).toLocaleDateString() : 
                            'Recently earned'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4 rounded-lg bg-[#f8f7f4]">
                        <Award className="mx-auto mb-3 h-8 w-8 text-[#5c6d5e] opacity-50" />
                        <p className="text-sm text-[#5c6d5e] mb-2">No certificates yet</p>
                        <Button size="sm" className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                          <Link href="/courses">Start Learning</Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Learning Streak */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">Learning Journey</h2>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-3">
                          <User className="h-4 w-4 text-[#4a7c59]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2c3e2d]">Joined</p>
                          <p className="text-xs text-[#5c6d5e]">{formatDate(userData.joinDate)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-3">
                          <Target className="h-4 w-4 text-[#4a7c59]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2c3e2d]">Current Focus</p>
                          <p className="text-xs text-[#5c6d5e]">Japanese Language Learning</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-3">
                          <TreePine className="h-4 w-4 text-[#4a7c59]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2c3e2d]">Bonsai Growth</p>
                          <p className="text-xs text-[#5c6d5e]">Level {userData.bonsai ? userData.bonsai.level : 1} Tree</p>
                        </div>
                      </div>
                    </div>  
                  </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="certifications" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">My Certifications</h2>

                {certificatesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4a7c59] mx-auto mb-3"></div>
                    <p className="text-[#5c6d5e]">Loading certificates...</p>
                    </div>
               ) : certificates && certificates.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="rounded-lg border border-[#dce4d7] bg-[#eef2eb] p-4">
                      <div className="flex items-center">
                        <span className="text-xs text-[#5c6d5e]">
                          {new Date(cert.completionDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="mb-2 flex items-center min-h-[4rem]">
                        <Award className="mr-3 h-8 w-8 text-[#4a7c59] flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-[#2c3e2d] line-clamp-2 leading-tight self-center">
                          {cert.courseTitle}
                        </h3>
                      </div>
                      <div className="flex justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          className="mb-2 border-[#4a7c59] text-[#4a7c59]"
                          onClick={() => handleViewCertificate(cert)}
                        >
                          View Certificate
                        </Button>
                      </div>
                      <div className="mt-2 text-xs text-[#5c6d5e]">
                        ID: {cert.certificateId}
                      </div>
                    </div>
                  ))}
                </div>
               ) : (
                 <div className="rounded-lg border border-dashed border-[#dce4d7] bg-[#f8f7f4] p-8 text-center">
                   <Award className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e] opacity-50" />
                   <h3 className="mb-2 text-lg font-medium text-[#2c3e2d]">No Certificates Yet</h3>
                   <p className="mb-4 text-[#5c6d5e]">
                     Complete courses and pass all quizzes to earn your first certificate.
                   </p>
                   <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                     <Link href="/courses">Browse Courses</Link>
                   </Button>
                 </div>
               )}
             </div>

             {/* Certificate Modal */}
             <CertificateModal
               isOpen={showCertificateModal}
               onClose={() => setShowCertificateModal(false)}
               courseId={selectedCourseId}
             />
           </TabsContent>

           <TabsContent value="settings" className="mt-0 border-0 p-0">
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
                     
                     {editMode && (
                       <div className="flex gap-2">
                         {/* Hidden file input for banner */}
                         <input
                           ref={bannerFileInputRef}
                           type="file"
                           accept="image/*"
                           onChange={handleBannerUpload}
                           className="hidden"
                           disabled={uploadingBanner}
                         />
                         
                         {/* Upload button */}
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                           onClick={handleBannerUploadClick}
                           disabled={uploadingBanner}
                         >
                           {uploadingBanner ? (
                             <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                           ) : (
                             <Upload className="mr-1 h-3 w-3" />
                           )}
                           {editData.banner ? 'Change Banner' : 'Upload Banner'}
                         </Button>
                         
                         {/* Remove button */}
                         {editData.banner && (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                             onClick={() => setEditData(prev => ({ ...prev, banner: null }))}
                           >
                             Remove
                           </Button>
                         )}
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
                       <div className="flex gap-2">
                         {/* Hidden file input */}
                         <input
                           ref={fileInputRef}
                           type="file"
                           accept="image/*"
                           onChange={handleIconUpload}
                           className="hidden"
                           disabled={uploadingIcon}
                         />
                         
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
                         >
                           Remove
                         </Button>
                       </div>
                     )}
                   </div>
                   
                   {/* Help text */}
                   {!editMode && (
                     <p className="text-xs text-[#5c6d5e] mt-2">
                       Click "Edit" above to change your personal details
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
           </TabsContent>
         </Tabs>
       </div>
     </main>

     {/* Banner Cropper Modal */}
     <BannerCropper
       isOpen={showBannerCropper}
       onClose={handleBannerCropCancel}
       imageSrc={tempBannerImage}
       onCropComplete={handleBannerCropComplete}
       uploading={uploadingBanner}
     />
   </div>
 )
}