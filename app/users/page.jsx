"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Search, User, Award, TreePine, Flag, UserPlus, Eye, Clock, Check, ChevronLeft, ChevronRight, RefreshCw, MessageCircle } from "lucide-react";
import { BonsaiIcon } from "@/components/bonsai-icon";
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRealTimeFriends } from "@/hooks/useRealTimeFriends";
import { formatLastSeen } from "@/lib/utils";
import { useApiWithRetry } from "@/hooks/useApiWithRetry";

function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [friendsSearchTerm, setFriendsSearchTerm] = useState(""); // Search term for friends
  const [sendingRequest, setSendingRequest] = useState(new Set()); // Track which buttons are loading
  const [dataReady, setDataReady] = useState(false); // Track when data is fully processed
  const [visibleUsersCount, setVisibleUsersCount] = useState(8); // Number of users to show initially
  const friendsScrollRef = useRef(null);
  
  // Friends pagination state
  const [friendsPage, setFriendsPage] = useState(1);
  const [friendsPerPage] = useState(10); // Show 10 friends per batch
  const [loadingMoreFriends, setLoadingMoreFriends] = useState(false);
  const [friendsPagination, setFriendsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false
  });
  
  // Use enhanced API hook with retry logic
  const { loading, error, retryCount, get, clearError, isRetrying } = useApiWithRetry({
    maxRetries: 5,
    baseDelay: 1000,
    showLoadingMinTime: 500
  });
  
  // Use real-time friends hook
  const { friends, loading: friendsLoading, lastUpdate } = useRealTimeFriends();
  
  // Note: Chat functionality now uses direct API calls instead of chat hook

  // Filter friends based on search term
  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(friendsSearchTerm.toLowerCase())
  );

  // Reset pagination when search term changes
  useEffect(() => {
    setFriendsPage(1);
  }, [friendsSearchTerm]);

  // Calculate friends pagination with incremental loading
  const totalFriends = filteredFriends.length;
  const totalPages = Math.ceil(totalFriends / friendsPerPage);
  const startIndex = (friendsPage - 1) * friendsPerPage;
  
  // Show incremental loading: 1-2 more users immediately, then load full batch
  const immediateLoadCount = Math.min(2, totalFriends - startIndex); // Show 1-2 users immediately
  const currentBatchEnd = startIndex + immediateLoadCount;
  const fullBatchEnd = startIndex + friendsPerPage;
  
  // Show immediate users first, then full batch when loaded
  const paginatedFriends = loadingMoreFriends 
    ? filteredFriends.slice(0, currentBatchEnd) // Show immediate users while loading
    : filteredFriends.slice(0, fullBatchEnd); // Show full batch when loaded
  
  const hasMoreFriends = fullBatchEnd < totalFriends;

  // Handle starting a chat with a friend
  const handleStartChat = async (friendId, friendName) => {
    try {
      console.log(`Attempting to start chat with ${friendName} (ID: ${friendId})`);
      
      const response = await fetch('/api/chats/start-with-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendId: friendId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to the chat with the specific chat ID
        // This will automatically open the chat with this friend
        router.push(`/chat?chatId=${data.chatId}&autoOpen=true`);
        console.log(`Started chat with ${friendName}`);
      } else {
        console.error('Failed to start chat:', data.message);
        alert(`Failed to start chat with ${friendName}. Please try again.`);
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      alert(`Failed to start chat with ${friendName}. Please try again.`);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUsers();
      updateLastSeen();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      setDataReady(false); // Mark data as not ready
      const data = await get("/api/users", {
        operationName: "Fetch Users List"
      });
      
      if (data.success) {
        setUsers(data.users);
        // Don't set dataReady here - let the filtering useEffect handle it
        clearError(); // Clear any previous errors
      } else {
        throw new Error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setDataReady(false);
      // Error state is handled by the useApiWithRetry hook
    }
  };



  const scrollFriends = (direction) => {
    if (direction === 'right' && hasMoreFriends) {
      // Load more friends when scrolling right
      loadMoreFriends();
    } else if (direction === 'left' && friendsScrollRef.current) {
      // Scroll left normally
      const scrollAmount = 300;
      const newScrollLeft = friendsScrollRef.current.scrollLeft - scrollAmount;
      friendsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const loadMoreFriends = async () => {
    if (loadingMoreFriends || !hasMoreFriends) return;
    
    setLoadingMoreFriends(true);
    
    // First, show 1-2 more users immediately for natural feel
    const immediateUsers = Math.min(2, totalFriends - (friendsPage - 1) * friendsPerPage);
    if (immediateUsers > 0) {
      // Show immediate users right away
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Then load the full batch with a slight delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setFriendsPage(prev => prev + 1);
    setLoadingMoreFriends(false);
  };

  const updateLastSeen = async () => {
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lastSeen: new Date().toISOString() }),
      });
      

    } catch (error) {
      console.error('Error updating last seen:', error);
    }
  };

  // Filter users based on search term and friend status
  useEffect(() => {
    if (users.length === 0) {
      setDataReady(false);
      return;
    }

    let filtered = users;
    
    // Filter out users who are already friends, but keep pending requests
    filtered = filtered.filter(user => user.friendStatus !== 'accepted');
    
    // Apply search filter
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
    
    // Mark data as ready after filtering is complete
    setTimeout(() => {
      setDataReady(true);
    }, 50); // Small delay to ensure smooth transition
  }, [searchTerm, users]);

  // Reset visible count only when search term changes (not when friend status changes)
  useEffect(() => {
    setVisibleUsersCount(8);
  }, [searchTerm]);

  // Get paginated users
  const paginatedUsers = filteredUsers.slice(0, visibleUsersCount);
  const hasMoreUsers = filteredUsers.length > visibleUsersCount;

  // Load more users function
  const loadMoreUsers = () => {
    setVisibleUsersCount(prev => Math.min(prev + 8, filteredUsers.length));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleFriendRequest = async (userId) => {
    // Prevent double-clicking
    if (sendingRequest.has(userId)) return;

    // 🚀 OPTIMISTIC UPDATE: Immediately show "Pending" state
    const updateUserStatus = (status) => {
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, friendStatus: status }
            : user
        )
      );
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, friendStatus: status }
            : user
        )
      );
    };

    // Track that we're sending a request for this user
    setSendingRequest(prev => new Set(prev).add(userId));

    // Immediately update UI to show pending state
    updateUserStatus('pending');

    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipientId: userId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Keep the pending state (already set optimistically)
        // Update notification count in header for the recipient
        window.dispatchEvent(new Event('notification-updated'));
      } else {
        // ❌ Request failed - revert to original state
        console.error('Failed to send friend request:', data.message);
        updateUserStatus(null); // Revert to no friend status
        
        // Show error feedback to user
        alert('Failed to send friend request. Please try again.');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      // ❌ Network error - revert to original state
      updateUserStatus(null); // Revert to no friend status
      
      // Show error feedback to user  
      alert('Network error. Please check your connection and try again.');
    } finally {
      // Remove from sending requests set
      setSendingRequest(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 animate-pulse text-[#4a7c59]" />
              <span className="text-[#2c3e2d]">
                {isRetrying ? `Connecting... (Attempt ${retryCount + 1})` : 'Loading users...'}
              </span>
            </div>
            {isRetrying && (
              <div className="text-sm text-[#5c6d5e] text-center">
                <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                Reconnecting to database...
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Enhanced error state with retry option
  if (error && !loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-4">
              <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#2c3e2d] mb-2">
                Unable to Load Users
              </h2>
              <p className="text-[#5c6d5e] mb-4">
                {error}
              </p>
              {retryCount > 0 && (
                <p className="text-sm text-[#5c6d5e] mb-4">
                  Failed after {retryCount} attempts
                </p>
              )}
            </div>
            <button
              onClick={fetchUsers}
              className="bg-[#4a7c59] text-white px-6 py-2 rounded-lg hover:bg-[#3a6147] transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#4a7c59]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#2c3e2d]">Community</h1>
            </div>
            <p className="text-[#5c6d5e] text-sm sm:text-base">
              Connect with friends and discover new learners in the Jotatsu community
            </p>
          </div>

          {/* Friends Section */}
          {friendsLoading ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2c3e2d]">Your Friends</h2>
              </div>
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[100px] animate-pulse">
                    <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : friends.length > 0 ? (
            <div className="mb-8">
              <div className="mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                  <div className="flex flex-row items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#2c3e2d]">
                      Your Friends ({friends.length})
                    </h2>
                    {friends.length > 0 && (
                      <span className="text-sm sm:text-base text-[#5c6d5e] transition-all duration-300">
                        <span className="inline-block animate-pulse">
                          {friends.filter(friend => friend.isOnline).length}
                        </span> online
                      </span>
                    )}
                  </div>
                  
                  {/* Friends Search Input */}
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5c6d5e]" />
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={friendsSearchTerm}
                      onChange={(e) => setFriendsSearchTerm(e.target.value)}
                      className="w-full pl-10 text-sm pr-4 py-2 border border-[#dce4d7] rounded-lg bg-white text-[#2c3e2d] placeholder-[#5c6d5e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="relative">
                {/* Left Blur Gradient */}
                <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[rgb(248,247,244)] to-transparent z-20 pointer-events-none" />
                
                {/* Right Blur Gradient */}
                <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[rgb(248,247,244)] to-transparent z-20 pointer-events-none" />
                
                {/* Left Arrow */}
                <button
                  onClick={() => scrollFriends('left')}
                  className="absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-white border border-[#dce4d7] hover:bg-[#eef2eb] transition-colors shadow-sm"
                  title="Scroll left"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                </button>
                
                {/* Right Arrow */}
                <button
                  onClick={() => scrollFriends('right')}
                  disabled={!hasMoreFriends || loadingMoreFriends}
                  className={`absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 z-30 p-1.5 sm:p-2 rounded-full bg-white border border-[#dce4d7] transition-colors shadow-sm ${
                    hasMoreFriends && !loadingMoreFriends 
                      ? 'hover:bg-[#eef2eb] cursor-pointer' 
                      : 'cursor-not-allowed opacity-50'
                  }`}
                  title={loadingMoreFriends ? "Loading more friends..." : hasMoreFriends ? "Load more friends" : "No more friends to load"}
                >
                  {loadingMoreFriends ? (
                    <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] animate-spin" />
                  ) : (
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59]" />
                  )}
                </button>
                
                {paginatedFriends.length > 0 ? (
                  <div 
                    ref={friendsScrollRef}
                    className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2 px-11 sm:px-16"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {paginatedFriends.map((friend, index) => (
                      <div
                        key={friend.id || `friend-${index}`}
                        className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[120px] sm:min-w-[155px]"
                      >
                        {/* Friend Icon - Clickable to view profile */}
                        <Link href={`/users/${friend.id}`} className="relative cursor-pointer hover:opacity-80 transition-opacity">
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
                            {/* Online indicator */}
                            {friend.isOnline && (
                              <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full animate-pulse" 
                                   title="Online" />
                            )}
                            {friend.icon && friend.icon.startsWith('http') ? (
                              <img 
                                src={friend.icon} 
                                alt={friend.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <BonsaiSVG 
                                  level={friend.bonsai?.level || 1}
                                  treeColor={friend.bonsai?.customization?.foliageColor} 
                                  potColor={friend.bonsai?.customization?.potColor} 
                                  selectedEyes={friend.bonsai?.customization?.eyes}
                                  selectedMouth={friend.bonsai?.customization?.mouth}
                                  selectedPotStyle={friend.bonsai?.customization?.potStyle}
                                  selectedGroundStyle={friend.bonsai?.customization?.groundStyle}
                                  decorations={friend.bonsai?.customization?.decorations ? Object.values(friend.bonsai.customization.decorations).filter(Boolean) : []}
                                  zoomed={true}
                                  profileIcon={true}
                                />
                              </div>
                            )}
                          </div>
                          {/* Online Status Indicator */}
                          <div className={`absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-white transition-all duration-300 ${
                            friend.isOnline ? 'bg-green-500 scale-110' : 'bg-gray-400 scale-100'
                          }`} />
                        </Link>
                        
                        {/* Friend Name - Clickable to view profile */}
                        <div className="text-center">
                          <Link href={`/users/${friend.id}`} className="hover:opacity-80 transition-opacity">
                            <h3 className="font-medium text-[#2c3e2d] text-sm sm:text-base truncate max-w-[100px] sm:max-w-[180px]">{friend.name}</h3>
                          </Link>
                          {/* Last seen timestamp */}
                          <p className="text-xs text-[#5c6d5e] mt-1">
                            {formatLastSeen(friend.lastSeen)}
                          </p>
                        </div>

                        {/* Message Button */}
                        <button
                          onClick={() => handleStartChat(friend.id, friend.name)}
                          className="mt-1 px-2 sm:px-3 py-1 sm:py-1.5 bg-white text-[#4a7c59] border border-[#4a7c59] text-xs rounded-lg hover:bg-[#f8f7f4] hover:border-[#3a6147] transition-colors flex items-center gap-1 sm:gap-1.5"
                          title={`Message ${friend.name}`}
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span className="hidden sm:inline">Message</span>
                        </button>
                      </div>
                    ))}
                    
                    {/* Skeleton loading for more friends */}
                    {loadingMoreFriends && (
                      <>
                        {[...Array(3)].map((_, skeletonIndex) => (
                          <div
                            key={`skeleton-${skeletonIndex}`}
                            className="flex-shrink-0 flex flex-col items-center gap-2 min-w-[120px] sm:min-w-[160px] animate-pulse"
                          >
                            {/* Skeleton Avatar */}
                            <div className="h-16 w-16 rounded-full bg-gray-200" />
                            
                            {/* Skeleton Name */}
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                            
                            {/* Skeleton Message Button */}
                            <div className="h-6 w-16 bg-gray-200 rounded-lg mt-1" />
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 px-16">
                    <p className="text-[#5c6d5e] text-sm">
                      {friendsSearchTerm ? `No friends found matching "${friendsSearchTerm}"` : "No friends to display"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Find Friends Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-3">
                <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-[#4a7c59]" />
                <h2 className="text-lg font-semibold text-[#2c3e2d]">Find Friends</h2>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5c6d5e]" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 text-sm pr-4 py-2 border border-[#dce4d7] rounded-lg bg-white text-[#2c3e2d] placeholder-[#5c6d5e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Users Grid */}
          {!dataReady ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 animate-pulse text-[#4a7c59]" />
                <span className="text-[#2c3e2d]">Preparing user list...</span>
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {paginatedUsers.map((user, index) => (
                <div key={user.id || `user-${index}`} className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 hover:shadow-md transition-shadow">
                  {/* User Header */}
                  <div className="flex items-center mb-4">
                                         <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                       {user.icon && user.icon.startsWith('http') ? (
                         <img 
                           src={user.icon} 
                           alt={user.name} 
                           className="h-full w-full object-cover"
                         />
                       ) : (
                                                   <div className="h-full w-full flex items-center justify-center">
                            <BonsaiSVG 
                              level={user.bonsai?.level || 1}
                              treeColor={user.bonsai?.customization?.foliageColor} 
                              potColor={user.bonsai?.customization?.potColor} 
                              selectedEyes={user.bonsai?.customization?.eyes}
                              selectedMouth={user.bonsai?.customization?.mouth}
                              selectedPotStyle={user.bonsai?.customization?.potStyle}
                              selectedGroundStyle={user.bonsai?.customization?.groundStyle}
                              decorations={user.bonsai?.customization?.decorations ? Object.values(user.bonsai.customization.decorations).filter(Boolean) : []}
                              zoomed={true}
                              profileIcon={true}
                            />
                          </div>
                       )}
                     </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#2c3e2d] text-sm sm:text-base truncate">{user.name}</h3>
                      <p className="text-xs sm:text-sm text-[#5c6d5e]">
                        Joined {formatDate(user.joinDate)}
                      </p>
                    </div>
                  </div>

                                     {/* User Stats */}
                   <div className="space-y-2 mb-4">
                     <div className="flex items-center justify-between text-xs sm:text-sm">
                       <div className="flex items-center">
                         <TreePine className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] mr-1 sm:mr-2" />
                         <span className="text-[#5c6d5e]">Bonsai Level</span>
                       </div>
                       <span className="font-medium text-[#4a7c59]">
                         {user.bonsai?.level || 1}
                       </span>
                     </div>
                     
                     <div className="flex items-center justify-between text-xs sm:text-sm">
                       <div className="flex items-center">
                         <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#5c6d5e] mr-1 sm:mr-2" />
                         <span className="text-[#5c6d5e]">Mutuals</span>
                       </div>
                       <span className="font-medium text-[#4a7c59]">
                         {user.mutualFriends || 0}
                       </span>
                     </div>
                   </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      href={`/users/${user.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#4a7c59] text-white py-2 px-3 rounded-lg hover:bg-[#3a6147] transition-colors text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">View Profile</span>
                      <span className="sm:hidden">Profile</span>
                    </Link>
                    
                    {user.friendStatus === 'pending' ? (
                      <button
                        className="flex items-center justify-center gap-2 bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] py-2 px-3 rounded-lg cursor-not-allowed text-xs sm:text-sm"
                        disabled
                        title="Friend request pending"
                      >
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="whitespace-nowrap">Pending</span>
                      </button>
                    ) : user.friendStatus === 'accepted' ? (
                      <button
                        className="flex items-center justify-center gap-2 bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] py-2 px-3 rounded-lg cursor-not-allowed text-xs sm:text-sm"
                        title="Already friends"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Friends</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFriendRequest(user.id)}
                        className="flex items-center justify-center gap-2 bg-[#4a7c59] text-white py-2 px-3 rounded-lg hover:bg-[#3a6147] transition-colors text-xs sm:text-sm shadow-sm"
                        title="Add Friend"
                      >
                        <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-[#5c6d5e] opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2c3e2d] mb-2">No users found</h3>
              <p className="text-[#5c6d5e]">
                {searchTerm ? "Try adjusting your search terms" : "No users to display"}
              </p>
            </div>
          )}
          
          {/* Load More Button */}
          {dataReady && filteredUsers.length > 0 && hasMoreUsers && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMoreUsers}
                className="flex items-center gap-2 bg-white text-[#4a7c59] border border-[#4a7c59] py-2 px-4 rounded-lg hover:bg-[#f0f8f0] transition-colors shadow-sm text-xs sm:text-sm"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Load More Users</span>
                <span className="sm:hidden">More</span>
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default UsersPage;