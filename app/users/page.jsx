"use client";

import { useState, useEffect, useRef } from "react";
import { Users, Search, User, Award, TreePine, Flag, UserPlus, Eye, Clock, Check, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
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
  const [sendingRequest, setSendingRequest] = useState(new Set()); // Track which buttons are loading
  const [dataReady, setDataReady] = useState(false); // Track when data is fully processed
  const friendsScrollRef = useRef(null);
  
  // Use enhanced API hook with retry logic
  const { loading, error, retryCount, get, clearError, isRetrying } = useApiWithRetry({
    maxRetries: 5,
    baseDelay: 1000,
    showLoadingMinTime: 500
  });
  
  // Use real-time friends hook
  const { friends, loading: friendsLoading, lastUpdate } = useRealTimeFriends();

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
    if (friendsScrollRef.current) {
      const scrollAmount = 300; // Scroll by 300px
      const newScrollLeft = friendsScrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      friendsScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
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
        <div className="container mx-auto px-3 sm:px-4">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Users className="h-8 w-8 text-[#4a7c59]" />
              <h1 className="text-2xl font-bold text-[#2c3e2d]">Community</h1>
            </div>
            <p className="text-[#5c6d5e] text-base">
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
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#2c3e2d]">
                    Your Friends ({friends.length})
                  </h2>
                  {friends.length > 0 && (
                    <span className="text-base text-[#5c6d5e] transition-all duration-300">
                      <span className="inline-block animate-pulse">
                        {friends.filter(friend => friend.isOnline).length}
                      </span> online
                    </span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                {/* Left Arrow */}
                <button
                  onClick={() => scrollFriends('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-[#dce4d7] hover:bg-[#eef2eb] transition-colors shadow-sm"
                  title="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4 text-[#4a7c59]" />
                </button>
                
                {/* Right Arrow */}
                <button
                  onClick={() => scrollFriends('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 rounded-full bg-white border border-[#dce4d7] hover:bg-[#eef2eb] transition-colors shadow-sm"
                  title="Scroll right"
                >
                  <ChevronRight className="h-4 w-4 text-[#4a7c59]" />
                </button>
                
                <div 
                  ref={friendsScrollRef}
                  className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-12"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {friends.map((friend) => (
                    <Link
                      key={friend.id}
                      href={`/users/${friend.id}`}
                      className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity min-w-[100px]"
                    >
                      {/* Friend Icon */}
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-2 border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden">
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
                              />
                            </div>
                          )}
                        </div>
                        {/* Online Status Indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-300 ${
                          friend.isOnline ? 'bg-green-500 scale-110' : 'bg-gray-400 scale-100'
                        }`} />
                      </div>
                      
                      {/* Friend Name */}
                      <div className="text-center">
                        <h3 className="font-medium text-[#2c3e2d] text-base truncate max-w-[100px]">{friend.name}</h3>
                                   {/* Last seen timestamp */}
           <p className="text-xs text-[#5c6d5e] mt-1">
             {formatLastSeen(friend.lastSeen)}
           </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Find Friends Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-[#4a7c59]" />
                <h2 className="text-lg font-semibold text-[#2c3e2d]">Find Friends</h2>
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5c6d5e]" />
                <input
                  type="text"
                  placeholder="Search users"
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
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 hover:shadow-md transition-shadow">
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
                            />
                          </div>
                       )}
                     </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-[#2c3e2d] text-base truncate">{user.name}</h3>
                      <p className="text-sm text-[#5c6d5e]">
                        Joined {formatDate(user.joinDate)}
                      </p>
                    </div>
                  </div>

                                     {/* User Stats */}
                   <div className="space-y-2 mb-4">
                     <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center">
                         <TreePine className="h-4 w-4 text-[#4a7c59] mr-2" />
                         <span className="text-[#5c6d5e]">Bonsai Level</span>
                       </div>
                       <span className="font-medium text-[#4a7c59]">
                         {user.bonsai?.level || 1}
                       </span>
                     </div>
                     
                     <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center">
                         <Users className="h-4 w-4 text-[#5c6d5e] mr-2" />
                         <span className="text-[#5c6d5e]">Mutuals</span>
                       </div>
                       <span className="font-medium text-[#4a7c59]">
                         {user.mutualFriends || 0}
                       </span>
                     </div>
                   </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/users/${user.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#4a7c59] text-white py-2 px-3 rounded-lg hover:bg-[#3a6147] transition-colors text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      View Profile
                    </Link>
                    
                    {user.friendStatus === 'pending' ? (
                      <button
                        className="flex items-center justify-center gap-2 bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] py-2 px-3 rounded-lg cursor-not-allowed text-sm"
                        disabled
                        title="Friend request pending"
                      >
                        <Clock className="h-4 w-4" />
                        <span className="whitespace-nowrap">Pending</span>
                      </button>
                    ) : user.friendStatus === 'accepted' ? (
                      <button
                        className="flex items-center justify-center gap-2 bg-[#eef2eb] text-[#4a7c59] border border-[#4a7c59] py-2 px-3 rounded-lg cursor-not-allowed text-sm"
                        title="Already friends"
                      >
                        <Check className="h-4 w-4" />
                        <span className="hidden sm:inline">Friends</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFriendRequest(user.id)}
                        className="flex items-center justify-center gap-2 bg-[#4a7c59] text-white py-2 px-3 rounded-lg hover:bg-[#3a6147] transition-colors text-sm shadow-sm"
                        title="Add Friend"
                      >
                        <UserPlus className="h-4 w-4" />
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
        </div>
      </main>
    </div>
  );
}

export default UsersPage;