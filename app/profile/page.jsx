"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Award, Settings, Loader2 } from "lucide-react"
import { CertificateModal } from "@/components/certificate-modal"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Import our new components
import { ProfileHeader } from "./components/ProfileHeader"
import { MyProfile } from "./components/MyProfile"
import { Certifications } from "./components/Certifications"
import { Settings as SettingsComponent } from "./components/Settings"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Certificate state
  const [certificates, setCertificates] = useState([])
  const [certificatesLoading, setCertificatesLoading] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState(null)

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
      fetchUserCertificates()
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

  const handleViewCertificate = (certificate) => {
    setSelectedCourseId(certificate.courseId)
    setShowCertificateModal(true)
  }

  const handleUserDataUpdate = (newUserData) => {
    setUserData(newUserData)
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
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
            <button 
              onClick={fetchUserProfile}
              className="bg-[#4a7c59] text-white px-4 py-2 rounded hover:bg-[#3a6147]"
            >
              Try Again
            </button>
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

          {/* Profile Header Component */}
          <ProfileHeader 
            userData={userData}
            onUserDataUpdate={handleUserDataUpdate}
            onError={handleError}
          />

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
              <MyProfile 
                userData={userData}
                certificates={certificates}
              />
            </TabsContent>

            <TabsContent value="certifications" className="mt-0 border-0 p-0">
              <Certifications
                certificates={certificates}
                certificatesLoading={certificatesLoading}
                onViewCertificate={handleViewCertificate}
              />
            </TabsContent>

            <TabsContent value="settings" className="mt-0 border-0 p-0">
              <SettingsComponent
                userData={userData}
                onUserDataUpdate={handleUserDataUpdate}
                onError={handleError}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseId={selectedCourseId}
      />
    </div>
  )
}