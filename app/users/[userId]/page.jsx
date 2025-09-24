"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { BonsaiIcon } from "@/components/bonsai-icon";
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG";
import { Award, BookOpen, User, TreePine, Flag, UserCheck, Loader2, UserPlus, ArrowLeft, Clock, Check, UserMinus, MessageCircle, X, ExternalLink } from "lucide-react";
import Link from "next/link";
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
} from "@/app/profile/components/SocialMediaIcons";

function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [showFriendDropdown, setShowFriendDropdown] = useState(false);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && params.userId) {
      fetchUserProfile(params.userId);
    }
  }, [status, params.userId, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFriendDropdown && !event.target.closest('.friend-dropdown-container')) {
        setShowFriendDropdown(false);
      }
    };

    if (showFriendDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFriendDropdown]);

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
    const platformData = [
      { value: 'facebook', label: 'Facebook' },
      { value: 'twitter', label: 'Twitter' },
      { value: 'instagram', label: 'Instagram' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'github', label: 'GitHub' },
      { value: 'discord', label: 'Discord' },
      { value: 'twitch', label: 'Twitch' },
      { value: 'website', label: 'Website' }
    ]
    const found = platformData.find(p => p.value === platform)
    return found ? found.label : platform
  }

  const handleFriendRequest = async () => {
    // Prevent double-clicking
    if (sendingRequest) return;

    // 🚀 OPTIMISTIC UPDATE: Immediately show "Request Sent" state
    setSendingRequest(true);
    setUserData(prev => ({ ...prev, friendStatus: 'pending' }));

    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId: params.userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Keep the pending state (already set optimistically)
        // Update notification count in header for the recipient
        window.dispatchEvent(new Event('notification-updated'));
      } else {
        // ❌ Request failed - revert to original state
        console.error('Failed to send friend request:', data.message);
        setUserData(prev => ({ ...prev, friendStatus: null }));
        
        // Show error feedback to user
        alert('Failed to send friend request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      // ❌ Network error - revert to original state
      setUserData(prev => ({ ...prev, friendStatus: null }));
      
      // Show error feedback to user  
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleUnfriend = () => {
    setShowUnfriendModal(true);
    setShowFriendDropdown(false); // Close dropdown
  };

  const confirmUnfriend = async () => {
    // Prevent double-clicking
    if (sendingRequest) return;

    // 🚀 OPTIMISTIC UPDATE: Immediately show "Not Friends" state
    setSendingRequest(true);
    setUserData(prev => ({ ...prev, friendStatus: null }));
    setShowUnfriendModal(false); // Close modal

    try {
      const response = await fetch('/api/friends/unfriend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: params.userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Keep the unfriended state (already set optimistically)
        // Refresh the page to update the UI
        window.location.reload();
      } else {
        // ❌ Request failed - revert to original state
        console.error('Failed to unfriend:', data.message);
        setUserData(prev => ({ ...prev, friendStatus: 'accepted' }));
        
        // Show error feedback to user
        alert('Failed to unfriend. Please try again.');
      }
    } catch (error) {
      console.error('Error unfriending:', error);
      // ❌ Network error - revert to original state
      setUserData(prev => ({ ...prev, friendStatus: 'accepted' }));
      
      // Show error feedback to user  
      alert('Network error. Please check your connection and try again.');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const response = await fetch('/api/chats/start-with-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: params.userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to the chat with the specific chat ID
        // This will automatically open the chat with this friend
        router.push(`/chat?chatId=${data.chatId}&autoOpen=true`);
      } else {
        console.error('Failed to start chat:', data.message);
        alert('Failed to start chat. Please try again.');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Network error. Please check your connection and try again.');
    }
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
                    {userData.icon && userData.icon.startsWith('http') ? (
                      <img 
                        src={userData.icon} 
                        alt="Profile" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <BonsaiSVG 
                          level={userData.bonsai?.level || 1}
                          treeColor={userData.bonsai?.customization?.foliageColor} 
                          potColor={userData.bonsai?.customization?.potColor} 
                          selectedEyes={userData.bonsai?.customization?.eyes}
                          selectedMouth={userData.bonsai?.customization?.mouth}
                          selectedPotStyle={userData.bonsai?.customization?.potStyle}
                          selectedGroundStyle={userData.bonsai?.customization?.groundStyle}
                          decorations={userData.bonsai?.customization?.decorations ? Object.values(userData.bonsai.customization.decorations).filter(Boolean) : []}
                          zoomed={true}
                        />
                      </div>
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
                 <div className="flex flex-wrap justify-center sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto items-center">
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



          {/* Profile Content */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                             {/* Learning Progress */}
               <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
                 <div className="flex items-center justify-between mb-3 sm:mb-4">
                   <h2 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">Learning Progress</h2>
                   
                   {/* Friend Status Button */}
                   {userData.friendStatus === 'pending' ? (
                     <button 
                       className="flex items-center justify-center gap-2 bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] px-4 py-2 rounded-full cursor-default text-sm font-medium"
                       title="Friend request has been sent"
                     >
                       <Clock className="h-4 w-4" />
                       <span className="whitespace-nowrap">Request Sent</span>
                     </button>
                   ) : userData.friendStatus === 'accepted' ? (
                     <div className="flex items-center gap-2">
                       {/* Chat Button - Direct access */}
                       <button
                         onClick={handleStartChat}
                         className="flex items-center justify-center gap-2 bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] px-4 py-2 rounded-full hover:bg-[#dce4d7] transition-colors text-sm font-medium shadow-sm"
                         title={`Chat with ${userData.name}`}
                       >
                         <MessageCircle className="h-4 w-4" />
                         <span>Message</span>
                       </button>
                       
                       {/* Friends Icon with Dropdown */}
                       <div className="relative friend-dropdown-container">
                         <button 
                           onClick={() => setShowFriendDropdown(!showFriendDropdown)}
                           className="flex items-center justify-center bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] w-10 h-10 rounded-full hover:bg-[#dce4d7] transition-colors cursor-pointer"
                           title="Friends - Click for options"
                         >
                           <UserCheck className="h-5 w-5" />
                         </button>
                         
                         {/* Dropdown Menu */}
                         {showFriendDropdown && (
                           <div className="absolute right-0 top-12 z-50 bg-white border border-[#dce4d7] rounded-lg shadow-lg py-2 min-w-[160px]">
                             <button
                               onClick={handleUnfriend}
                               disabled={sendingRequest}
                               className="w-full flex items-center gap-3 px-4 py-2 text-sm text-[#5c6d5e] hover:bg-[#f8f7f4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               <UserMinus className="h-4 w-4" />
                               <span>Unfriend</span>
                             </button>
                           </div>
                         )}
                       </div>
                     </div>
                   ) : (
                     <button 
                       onClick={handleFriendRequest}
                       disabled={sendingRequest}
                       className="flex items-center justify-center gap-2 bg-[#4a7c59] text-white px-4 py-2 rounded-full hover:bg-[#3a6147] transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                       title="Send friend request"
                     >
                       <UserPlus className="h-4 w-4" />
                       <span className="whitespace-nowrap">Add Friend</span>
                     </button>
                   )}
                 </div>
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
                {/* Social Links */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
                  <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-[#2c3e2d]">Social Links</h2>
                  {userData.socialLinks && userData.socialLinks.length > 0 ? (
                    <div className="space-y-2">
                      {userData.socialLinks.map((link) => {
                        const IconComponent = getSocialIcon(link.platform)
                        return (
                          <div key={link.id} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-[#eef2eb]">
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="mr-2 sm:mr-3 flex-shrink-0">
                                <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-[#2c3e2d] truncate">
                                  {getSocialLabel(link.platform)}
                                </p>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-[#4a7c59] hover:text-[#3a6147] truncate block"
                                >
                                  {link.url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center ml-2">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:bg-[#dce4d7] rounded"
                                title={`Visit ${getSocialLabel(link.platform)}`}
                              >
                                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-2xl mb-2">🔗</div>
                      <p className="text-xs sm:text-sm text-[#5c6d5e] mb-2">No social links added yet</p>
                      <p className="text-xs text-[#5c6d5e]">This user hasn't added any social media profiles</p>
                    </div>
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
                      <p className="text-xs sm:text-sm text-[#5c6d5e]">No certificates yet</p>
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
        </div>
      </main>

      {/* Unfriend Confirmation Modal */}
      {showUnfriendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <UserMinus className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2c3e2d]">Unfriend User</h3>
                  <p className="text-sm text-[#5c6d5e]">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-[#2c3e2d] mb-6">
                Are you sure you want to unfriend <span className="font-medium">{userData?.name}</span>? 
                You'll need to send a new friend request to connect again.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUnfriendModal(false)}
                  className="px-4 py-2 text-sm font-medium text-[#5c6d5e] bg-white border border-[#dce4d7] rounded-lg hover:bg-[#f8f7f4] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnfriend}
                  disabled={sendingRequest}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingRequest ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Unfriending...
                    </>
                  ) : (
                    'Unfriend'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PublicProfilePage;