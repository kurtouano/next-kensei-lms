"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { User, Award, BookOpen, Flag, Globe, Mail, Lock, LogOut, Check, ChevronRight, Loader2, Upload } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CertificateModal } from "@/components/certificate-modal"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState({})
  const [updating, setUpdating] = useState(false)
  const [uploadingIcon, setUploadingIcon] = useState(false)

  // Certificate state
  const [certificates, setCertificates] = useState([])
  const [certificatesLoading, setCertificatesLoading] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState(null)

  // FIXED: Define isLoggedIn properly
  const isLoggedIn = status === "authenticated" && !!session?.user

  // Predefined avatar options
  const avatarOptions = [
    "🌸", "🌿", "🎋", "🌱", "🍃", "🌊", "⛩️", "🎌", 
    "🗾", "🌙", "☀️", "🎨", "📚", "✨", "🌺", "🎭"
  ]

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
          icon: data.user.icon
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
          icon: editData.icon
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
        icon: userData.icon
      })
      setError("")
    }
    setEditMode(!editMode)
  }

  const handleIconUploadClick = () => {
    fileInputRef.current?.click()
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
        <Header isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#4a7c59]" />
            <span className="text-[#2c3e2d]">Loading profile...</span>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !userData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchUserProfile} className="bg-[#4a7c59] text-white hover:bg-[#3a6147]">
              Try Again
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!userData) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header */}
      <Header isLoggedIn={true} />

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

          <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center">
              <div className="mr-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#eef2eb] overflow-hidden">
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
                  <h1 className="text-2xl font-bold text-[#2c3e2d]">{userData.name}</h1>
                  <div className="ml-2 rounded-full bg-[#eef2eb] px-2 py-0.5">
                    <Check className="h-4 w-4 text-[#4a7c59]" />
                  </div>
                </div>
                <p className="text-[#5c6d5e]">Joined {formatDate(userData.joinDate)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center rounded-full bg-[#eef2eb] px-4 py-2">
                <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">
                  {userData.bonsai ? `Level ${userData.bonsai.level}` : 'Level 1'} Learner
                </span>
              </div>
              <div className="flex items-center rounded-full bg-[#eef2eb] px-4 py-2">
                <BonsaiIcon className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">{userData.credits} Credits</span>
              </div>
              <div className="flex items-center rounded-full bg-[#eef2eb] px-4 py-2">
                <Flag className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">{userData.country}</span>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#eef2eb]">
              <TabsTrigger value="profile" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="certifications"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Award className="mr-2 h-4 w-4" />
                Certifications
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

                  {/* Account Settings */}
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

                {/* Bonsai Preview & Logout */}
                <div className="space-y-4">
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">My Bonsai</h2>
                    {userData.bonsai ? (
                      <div className="mb-6 flex flex-col items-center">
                        <div className="relative mb-4 h-48 w-48">
                          {/* Pot */}
                          <div 
                            className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-sm rounded-b-xl"
                            style={{
                              backgroundColor: userData.bonsai.pot.type === 'ceramic' ? '#5b8fb0' : 
                                             userData.bonsai.pot.type === 'stone' ? '#8a8a8a' :
                                             userData.bonsai.pot.type === 'plastic' ? '#4CAF50' : '#8B5E3C'
                            }}
                          ></div>
                          {/* Trunk */}
                          <div className="absolute bottom-12 left-1/2 h-24 w-4 -translate-x-1/2 bg-[#8B5E3C]"></div>
                          {/* Main foliage */}
                          <div 
                            className="absolute bottom-24 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full"
                            style={{ backgroundColor: getBonsaiTreeColor(userData.bonsai.tree.color) }}
                          ></div>
                          {/* Side branches */}
                          <div 
                            className="absolute bottom-28 left-1/4 h-12 w-12 -translate-x-1/2 rounded-full"
                            style={{ backgroundColor: getBonsaiTreeColor(userData.bonsai.tree.color) }}
                          ></div>
                          <div 
                            className="absolute bottom-28 right-1/4 h-12 w-12 translate-x-1/2 rounded-full"
                            style={{ backgroundColor: getBonsaiTreeColor(userData.bonsai.tree.color) }}
                          ></div>
                          <div 
                            className="absolute bottom-32 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full"
                            style={{ backgroundColor: getBonsaiTreeColor(userData.bonsai.tree.color) }}
                          ></div>
                          {/* Decoration */}
                          <div className="absolute bottom-6 right-12 h-6 w-6 rounded-md bg-[#d3d3d3]"></div>
                        </div>
                        <div className="text-center">
                          <p className="font-medium text-[#2c3e2d]">
                            {capitalizeFirst(userData.bonsai.tree.type)} Bonsai (Level {userData.bonsai.tree.level})
                          </p>
                          <p className="text-sm text-[#5c6d5e]">
                            {capitalizeFirst(userData.bonsai.pot.type)} {capitalizeFirst(userData.bonsai.pot.size)} Pot
                          </p>
                          <p className="text-sm text-[#5c6d5e]">
                            {capitalizeFirst(userData.bonsai.decoration.style)} {capitalizeFirst(userData.bonsai.decoration.type)}
                          </p>
                          <p className="text-xs text-[#5c6d5e] mt-1">
                            Total Credits: {userData.bonsai.totalCredits}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <p className="text-[#5c6d5e] mb-4">No bonsai found</p>
                      </div>
                    )}
                    <div className="space-y-3">
                      <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                        <Link href="/bonsai">
                          Customize My Bonsai
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        onClick={handleLogout} 
                        variant="outline"
                        className="w-full border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
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
                       <div className="mb-2 flex items-center">
                         <span className="text-xs text-[#5c6d5e]">
                           {new Date(cert.completionDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric'
                           })}
                         </span>
                       </div>
                       <div className="mb-4 flex items-center">
                         <Award className="mr-3 h-8 w-8 text-[#4a7c59]" />
                         <h3 className="text-lg font-semibold text-[#2c3e2d]">{cert.courseTitle}</h3>
                       </div>
                       <div className="flex justify-between">
                         <Button
                           variant="outline"
                           size="sm"
                           className="border-[#4a7c59] text-[#4a7c59]"
                           onClick={() => handleViewCertificate(cert)}
                         >
                           View Certificate
                         </Button>
                         <Button 
                           variant="outline" 
                           size="sm" 
                           className="border-[#4a7c59] text-[#4a7c59]"
                           onClick={() => {
                             const shareText = `I just completed "${cert.courseTitle}" on Bonsai Learning! 🌿🎓`
                             const shareUrl = window.location.origin
                             
                             if (navigator.share) {
                               navigator.share({
                                 title: 'My Certificate',
                                 text: shareText,
                                 url: shareUrl
                               })
                             } else {
                               navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
                               alert('Certificate shared to clipboard!')
                             }
                           }}
                         >
                           Share
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
         </Tabs>
       </div>
     </main>

     <Footer />
   </div>
 )
}