"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BonsaiIcon } from "@/components/bonsai-icon";
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG";
import { Award, BookOpen, User, TreePine, Flag, Check, Loader2, UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && params.userId) {
      fetchUserProfile(params.userId);
    }
  }, [status, params.userId, router]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUserData(data.user);
        setCertificates(data.certificates || []);
      } else {
        setError(data.message || "Failed to fetch user profile");
      }
    } catch (err) {
      setError("Failed to fetch user profile");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

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
    );
  }

  if (error && !userData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              href="/users"
              className="bg-[#4a7c59] text-white px-4 py-2 rounded hover:bg-[#3a6147]"
            >
              Back to Users
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Back Button */}
          <div className="mb-4">
            <Link 
              href="/users"
              className="inline-flex items-center gap-2 text-[#4a7c59] hover:text-[#3a6147] text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Users
            </Link>
          </div>

          {/* Profile Header */}
          <div className="mb-4 sm:mb-8 relative">
            <div 
              className={`rounded-lg p-4 sm:p-6 min-h-[120px] sm:min-h-[150px] flex items-end relative overflow-hidden ${!userData.banner ? ' bg-[#679873] ': ''}`}
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

              {/* Profile Info */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row sm:justify-between sm:items-center">
                <div className="flex flex-col sm:flex-row items-center sm:items-center">
                  <div className="mb-2 sm:mb-0 sm:mr-4 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#eef2eb] overflow-hidden border-2 sm:border-4 border-white shadow-lg">
                    {userData.icon ? (
                      userData.icon.startsWith('http') ? (
                        <img 
                          src={userData.icon} 
                          alt="Profile" 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl sm:text-4xl">{userData.icon}</span>
                      )
                    ) : (
                      <BonsaiIcon className="h-8 w-8 sm:h-12 sm:w-12 text-[#4a7c59]" />
                    )}
                  </div>
                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <div className="flex items-center justify-center sm:justify-start">
                      <h1 className="text-xl sm:text-2xl font-bold text-white truncate max-w-full">
                        {userData.name}
                      </h1>
                      <div className="ml-2 rounded-full px-1.5 sm:px-2 py-0.5 bg-white/20 flex-shrink-0">
                        <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
                  <div className="flex items-center rounded-full px-2 sm:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm">
                    <BookOpen className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {userData.bonsai ? `Level ${userData.bonsai.level}` : 'Level 1'} Learner
                    </span>
                  </div>
                  <div className="flex items-center rounded-full px-2 sm:px-4 py-1 sm:py-2 bg-white/20 backdrop-blur-sm">
                    <Flag className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    <span className="text-xs sm:text-sm font-medium text-white">
                      {userData.country}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Friend Button */}
          <div className="mb-6 flex justify-center">
            <button className="flex items-center gap-2 bg-[#4a7c59] text-white px-6 py-2 rounded-lg hover:bg-[#3a6147] transition-colors">
              <UserPlus className="h-4 w-4" />
              Add Friend
            </button>
          </div>

          {/* Profile Content */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Main Content */}
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

              {/* Bonsai Display */}
              <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6 flex flex-col h-fit">
                <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">{userData.name}'s Bonsai</h2>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex flex-col items-center">
                    <div className="mb-3 sm:mb-4 flex justify-center h-60 sm:h-80 lg:h-[440px]">
                      <BonsaiSVG 
                        level={userData.bonsai?.level || 1}
                        treeColor={userData.bonsai?.customization?.foliageColor || '#77DD82'} 
                        potColor={userData.bonsai?.customization?.potColor || '#FD9475'} 
                        selectedEyes={userData.bonsai?.customization?.eyes || 'default_eyes'}
                        selectedMouth={userData.bonsai?.customization?.mouth || 'default_mouth'}
                        selectedPotStyle={userData.bonsai?.customization?.potStyle || 'default_pot'}
                        selectedGroundStyle={userData.bonsai?.customization?.groundStyle || 'default_ground'}
                        decorations={userData.bonsai?.customization?.decorations ? Object.values(userData.bonsai.customization.decorations).filter(Boolean) : []}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col h-full">
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
                      <p className="text-xs sm:text-sm text-[#5c6d5e]">No certificates yet</p>
                    </div>
                  )}
                </div>

                {/* Account Overview */}
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
                        <TreePine className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-[#2c3e2d]">Account Type</p>
                        <p className="text-xs text-[#5c6d5e]">{capitalizeFirst(userData.role)} Account</p>
                      </div>
                    </div>
                  </div>  
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PublicProfilePage;