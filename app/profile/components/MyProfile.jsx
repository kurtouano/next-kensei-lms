// components/profile/MyProfile.jsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { Award, BookOpen, User, Target, TreePine, ChevronRight } from "lucide-react"

export function MyProfile({ userData, certificates }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
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
              <div className="flex flex-col items-center">
                <div className="mb-3 sm:mb-4 flex justify-center h-60 sm:h-80 lg:h-[440px]">
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

          {/* Account Overview - General Info */}
          <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Account Overview</h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center">
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-2 sm:mr-3">
                  <User className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Member Since</p>
                  <p className="text-xs text-[#5c6d5e]">{formatDate(userData.joinDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-2 sm:mr-3">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Account Type</p>
                  <p className="text-xs text-[#5c6d5e]">{capitalizeFirst(userData.role)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-2 sm:mr-3">
                  <TreePine className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Bonsai Tree</p>
                  <p className="text-xs text-[#5c6d5e]">Level {userData.bonsai ? userData.bonsai.level : 1} Growth</p>
                </div>
              </div>

              {userData.subscription && (
                <div className="flex items-center">
                  <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#eef2eb] mr-2 sm:mr-3">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Plan Status</p>
                    <p className="text-xs text-[#5c6d5e]">{capitalizeFirst(userData.subscription.plan)} - {capitalizeFirst(userData.subscription.status)}</p>
                  </div>
                </div>
              )}
            </div>  
          </div>
        </div>
      </div>
    </div>
  )
}