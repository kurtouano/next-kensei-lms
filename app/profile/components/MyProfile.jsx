// components/profile/MyProfile.jsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { Award, BookOpen, User, Target, TreePine, ChevronRight, Plus, X, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedInIcon, 
  YouTubeIcon, 
  TikTokIcon, 
  GitHubIcon, 
  DiscordIcon, 
  TwitchIcon, 
  WebsiteIcon 
} from "./SocialMediaIcons"

export function MyProfile({ userData, certificates }) {
  const [socialLinks, setSocialLinks] = useState(userData?.socialLinks || [])
  const [showAddSocial, setShowAddSocial] = useState(false)
  const [newSocialPlatform, setNewSocialPlatform] = useState('')
  const [newSocialUrl, setNewSocialUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Initialize social links when userData changes
  useEffect(() => {
    if (userData?.socialLinks) {
      setSocialLinks(userData.socialLinks)
    }
  }, [userData])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const socialPlatforms = [
    { value: 'facebook', label: 'Facebook', icon: 'FacebookIcon' },
    { value: 'twitter', label: 'Twitter', icon: 'TwitterIcon' },
    { value: 'instagram', label: 'Instagram', icon: 'InstagramIcon' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'LinkedInIcon' },
    { value: 'youtube', label: 'YouTube', icon: 'YouTubeIcon' },
    { value: 'tiktok', label: 'TikTok', icon: 'TikTokIcon' },
    { value: 'github', label: 'GitHub', icon: 'GitHubIcon' },
    { value: 'discord', label: 'Discord', icon: 'DiscordIcon' },
    { value: 'twitch', label: 'Twitch', icon: 'TwitchIcon' },
    { value: 'website', label: 'Website', icon: 'WebsiteIcon' }
  ]

  const handleAddSocial = async () => {
    if (!newSocialPlatform || !newSocialUrl) return

    // Ensure URL has protocol
    let formattedUrl = newSocialUrl.trim()
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl
    }

    const newLink = {
      platform: newSocialPlatform,
      url: formattedUrl,
      id: Date.now().toString()
    }

    const updatedLinks = [...socialLinks, newLink]
    setSocialLinks(updatedLinks)
    setNewSocialPlatform('')
    setNewSocialUrl('')
    setShowAddSocial(false)

    // Save to backend
    try {
      setIsSaving(true)
      console.log('Saving social links:', updatedLinks)
      const response = await fetch('/api/profile/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: updatedLinks })
      })
      
      console.log('Response status:', response.status)
      const result = await response.json()
      console.log('Response result:', result)
      
      if (!result.success) {
        console.error('Error saving social links:', result.message, result.error)
        // Revert the change if save failed
        setSocialLinks(socialLinks)
      }
    } catch (error) {
      console.error('Error saving social links:', error)
      // Revert the change if save failed
      setSocialLinks(socialLinks)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRemoveSocial = async (id) => {
    const originalLinks = [...socialLinks]
    const updatedLinks = socialLinks.filter(link => link.id !== id)
    setSocialLinks(updatedLinks)

    // Save to backend
    try {
      setIsSaving(true)
      console.log('Removing social link, updated links:', updatedLinks)
      const response = await fetch('/api/profile/social-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: updatedLinks })
      })
      
      console.log('Remove response status:', response.status)
      const result = await response.json()
      console.log('Remove response result:', result)
      
      if (!result.success) {
        console.error('Error saving social links:', result.message, result.error)
        // Revert the change if save failed
        setSocialLinks(originalLinks)
      }
    } catch (error) {
      console.error('Error saving social links:', error)
      // Revert the change if save failed
      setSocialLinks(originalLinks)
    } finally {
      setIsSaving(false)
    }
  }

  const getSocialIcon = (platform) => {
    const iconMap = {
      facebook: FacebookIcon,
      twitter: TwitterIcon,
      instagram: InstagramIcon,
      linkedin: LinkedInIcon,
      youtube: YouTubeIcon,
      tiktok: TikTokIcon,
      github: GitHubIcon,
      discord: DiscordIcon,
      twitch: TwitchIcon,
      website: WebsiteIcon
    }
    return iconMap[platform] || WebsiteIcon
  }

  const getSocialLabel = (platform) => {
    const platformData = socialPlatforms.find(p => p.value === platform)
    return platformData ? platformData.label : platform
  }

  return (
    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Profile Summary - Takes 2/3 width on desktop */}
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        {/* Learning Progress */}
        <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Learning Progress</h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
            <div className="rounded-lg bg-[#eef2eb] p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-[#4a7c59]">{userData.progress?.enrolledCourses || 0}</p>
              <p className="text-xs sm:text-sm text-[#5c6d5e]">Courses Enrolled</p>
            </div>
            <div className="rounded-lg bg-[#eef2eb] p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-[#4a7c59]">{userData.progress?.coursesCompleted || 0}</p>
              <p className="text-xs sm:text-sm text-[#5c6d5e]">Courses Completed</p>
            </div>
            <div className="rounded-lg bg-[#eef2eb] p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-[#4a7c59]">{userData.progress?.lessonsCompleted || 0}</p>
              <p className="text-xs sm:text-sm text-[#5c6d5e]">Lessons Completed</p>
            </div>
            <div className="rounded-lg bg-[#eef2eb] p-3 sm:p-4 text-center">
              <p className="text-lg sm:text-2xl font-bold text-[#4a7c59]">
                {userData.bonsai ? userData.bonsai.totalCredits : 0}
              </p>
              <p className="text-xs sm:text-sm text-[#5c6d5e]">Total Credits Earned</p>
            </div>
          </div>
        </div>

        {/* My Bonsai */}
        <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6 flex flex-col h-fit">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">My Bonsai</h2>
          <div className="flex-1 flex flex-col justify-center">
            {userData.bonsai ? (
              <div className="flex flex-col items-center mb-8">
                <div className="mb-3 sm:mb-4 flex justify-center h-60 sm:h-80 lg:h-[440px]">
                  <BonsaiSVG 
                    level={userData.bonsai.level || 1}
                    treeColor={userData.bonsai.customization?.foliageColor || '#77DD82'} 
                    potColor={userData.bonsai.customization?.potColor || '#FD9475'} 
                    selectedEyes={userData.bonsai.customization?.eyes || 'default_eyes'}
                    selectedMouth={userData.bonsai.customization?.mouth || 'default_mouth'}
                    selectedPotStyle={userData.bonsai.customization?.potStyle || 'default_pot'}
                    selectedGroundStyle={userData.bonsai.customization?.groundStyle || 'default_ground'}
                    selectedHat={userData.bonsai.customization?.hat || null}
                    selectedBackground={userData.bonsai.customization?.background || null}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="mb-3 sm:mb-4 flex justify-center h-60 sm:h-80">
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
                <p className="text-[#5c6d5e] mb-4 text-sm sm:text-base">Start learning to grow your bonsai!</p>
              </div>
            )}
          </div>
          <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147] mt-auto text-sm sm:text-base" asChild>
            <Link href="/bonsai">
              Customize My Bonsai
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Subscription Information */}
        {userData.subscription && (
          <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Subscription</h2>
            <div className="space-y-2">
              <p className="text-sm sm:text-base text-[#2c3e2d]">
                <span className="font-medium">Plan:</span> {capitalizeFirst(userData.subscription.plan)}
              </p>
              <p className="text-sm sm:text-base text-[#2c3e2d]">
                <span className="font-medium">Status:</span> {capitalizeFirst(userData.subscription.status)}
              </p>
              {userData.subscription.endDate && (
                <p className="text-sm sm:text-base text-[#2c3e2d]">
                  <span className="font-medium">Expires:</span> {formatDate(userData.subscription.endDate)}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar - Takes 1/3 width on desktop */}
      <div className="lg:col-span-1 flex flex-col h-full">
        <div className="space-y-4 sm:space-y-6 flex-1">
          {/* Social Media Links */}
          <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">Social Links</h2>
              {socialLinks.length < 5 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddSocial(!showAddSocial)}
                  className="text-xs sm:text-sm border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Add
                </Button>
              )}
            </div>

            {/* Add Social Link Form */}
            {showAddSocial && (
              <div className="mb-4 p-3 rounded-lg bg-[#f8f7f4] border border-[#dce4d7]">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-[#2c3e2d] mb-1 block">Platform</label>
                    <select
                      value={newSocialPlatform}
                      onChange={(e) => setNewSocialPlatform(e.target.value)}
                      className="w-full p-2 text-xs sm:text-sm border border-[#dce4d7] rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    >
                      <option value="">Select platform</option>
                      {socialPlatforms.map((platform) => {
                        const IconComponent = getSocialIcon(platform.value)
                        return (
                          <option key={platform.value} value={platform.value}>
                            {platform.label}
                          </option>
                        )
                      })}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs sm:text-sm font-medium text-[#2c3e2d] mb-1 block">URL</label>
                    <input
                      type="url"
                      value={newSocialUrl}
                      onChange={(e) => setNewSocialUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full p-2 text-xs sm:text-sm border border-[#dce4d7] rounded-md focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleAddSocial}
                      disabled={!newSocialPlatform || !newSocialUrl || isSaving}
                      className="bg-[#4a7c59] text-white hover:bg-[#3a6147] text-xs sm:text-sm"
                    >
                      {isSaving ? 'Saving...' : 'Add Link'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddSocial(false)
                        setNewSocialPlatform('')
                        setNewSocialUrl('')
                      }}
                      className="text-xs sm:text-sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Social Links List */}
            <div className="space-y-2">
              {socialLinks.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">🔗</div>
                  <p className="text-xs sm:text-sm text-[#5c6d5e] mb-2">No social links added yet</p>
                  <p className="text-xs text-[#5c6d5e]">Add your social media profiles to connect with others</p>
                </div>
              ) : (
                socialLinks.map((link) => {
                  const IconComponent = getSocialIcon(link.platform)
                  return (
                    <div key={link.id} className="p-3 sm:p-4 rounded-lg bg-[#eef2eb] border border-[#dce4d7]">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59] flex-shrink-0" />
                          <span className="text-sm sm:text-base font-medium text-[#2c3e2d]">
                            {getSocialLabel(link.platform)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-[#dce4d7] rounded-md transition-colors"
                            title="Open link"
                          >
                            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                          </a>
                          <button
                            onClick={() => handleRemoveSocial(link.id)}
                            className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-red-500 hover:text-red-700"
                            title="Remove link"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#4a7c59] hover:text-[#3a6147] break-all block leading-relaxed"
                      >
                        {link.url}
                      </a>
                    </div>
                  )
                })
              )}
            </div>

            {socialLinks.length >= 5 && (
              <p className="text-xs text-[#5c6d5e] mt-2 text-center">
                Maximum of 5 social links allowed
              </p>
            )}
          </div>

          {/* Recent Achievement */}
          <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Recent Achievement</h2>
            {certificates.length > 0 ? (
              <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-[#eef2eb] to-[#dce4d7]">
                <Award className="mx-auto mb-2 sm:mb-3 h-6 w-6 sm:h-8 sm:w-8 text-[#4a7c59]" />
                <h3 className="font-medium text-[#2c3e2d] mb-1 text-sm sm:text-base">Latest Certificate</h3>
                <p className="text-xs sm:text-sm text-[#5c6d5e] mb-2 leading-tight">
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
              <div className="text-center p-3 sm:p-4 rounded-lg bg-[#f8f7f4]">
                <Award className="mx-auto mb-2 sm:mb-3 h-6 w-6 sm:h-8 sm:w-8 text-[#5c6d5e] opacity-50" />
                <p className="text-xs sm:text-sm text-[#5c6d5e] mb-2">No certificates yet</p>
                <Button size="sm" className="bg-[#4a7c59] text-white hover:bg-[#3a6147] text-xs sm:text-sm" asChild>
                  <Link href="/courses">Start Learning</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Quick Stats</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#eef2eb]">
                <div className="flex items-center">
                  <BonsaiIcon className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                  <span className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Bonsai Level</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-[#4a7c59]">
                  {userData.bonsai ? userData.bonsai.level : 1}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#eef2eb]">
                <div className="flex items-center">
                  <Award className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                  <span className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Certificates</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-[#4a7c59]">
                  {certificates.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#eef2eb]">
                <div className="flex items-center">
                  <BookOpen className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                  <span className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Active Courses</span>
                </div>
                <span className="text-base sm:text-lg font-bold text-[#4a7c59]">
                  {userData.progress?.enrolledCourses || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}