"use client";

import { useState, useEffect } from "react";
import { Users, Search, User, Award, TreePine, Flag, UserPlus, Eye, Clock, Check } from "lucide-react";
import { BonsaiIcon } from "@/components/bonsai-icon";
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchUsers();
    }
  }, [status, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const handleFriendRequest = async (userId) => {
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
           // Update the local state to reflect the pending request
           setUsers(prevUsers => 
             prevUsers.map(user => 
               user.id === userId 
                 ? { ...user, friendStatus: 'pending' }
                 : user
             )
           );
           setFilteredUsers(prevUsers => 
             prevUsers.map(user => 
               user.id === userId 
                 ? { ...user, friendStatus: 'pending' }
                 : user
             )
           );
           // Update notification count in header for the recipient
           window.dispatchEvent(new Event('notification-updated'));
         } else {
           console.error('Failed to send friend request:', data.message);
         }
    } catch (error) {
      console.error('Error sending friend request:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 animate-pulse text-[#4a7c59]" />
            <span className="text-[#2c3e2d]">Loading users...</span>
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
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e2d]">Find Friends</h1>
            </div>
            <p className="text-[#5c6d5e] text-sm sm:text-base">
              Discover and connect with other learners in the Jotatsu community
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#5c6d5e]" />
              <input
                type="text"
                placeholder="Search by name or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#dce4d7] rounded-lg bg-white text-[#2c3e2d] placeholder-[#5c6d5e] focus:outline-none focus:ring-2 focus:ring-[#4a7c59] focus:border-transparent"
              />
            </div>
          </div>

          {/* Users Grid */}
          {filteredUsers.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 hover:shadow-md transition-shadow">
                  {/* User Header */}
                  <div className="flex items-center mb-4">
                                         <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-[#4a7c59] bg-[#eef2eb] flex items-center justify-center overflow-hidden mr-3 sm:mr-4 flex-shrink-0">
                       {user.icon ? (
                         user.icon.startsWith('http') ? (
                           <img 
                             src={user.icon} 
                             alt={user.name} 
                             className="h-full w-full object-cover"
                           />
                         ) : user.icon === 'bonsai' ? (
                           <div className="h-full w-full flex items-center justify-center">
                             <BonsaiSVG 
                               level={user.bonsai?.level || 1}
                               treeColor={user.bonsai?.customization?.foliageColor || '#77DD82'} 
                               potColor={user.bonsai?.customization?.potColor || '#FD9475'} 
                               selectedEyes={user.bonsai?.customization?.eyes || 'default_eyes'}
                               selectedMouth={user.bonsai?.customization?.mouth || 'default_mouth'}
                               selectedPotStyle={user.bonsai?.customization?.potStyle || 'default_pot'}
                               selectedGroundStyle={user.bonsai?.customization?.groundStyle || 'default_ground'}
                               decorations={user.bonsai?.customization?.decorations ? Object.values(user.bonsai.customization.decorations).filter(Boolean) : []}
                               zoomed={true}
                             />
                           </div>
                         ) : (
                           <span className="text-lg sm:text-2xl">{user.icon}</span>
                         )
                       ) : (
                         <BonsaiIcon className="h-6 w-6 sm:h-8 sm:w-8 text-[#4a7c59]" />
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
                     
                     <div className="flex items-center justify-between text-xs sm:text-sm">
                       <div className="flex items-center">
                         <Flag className="h-3 w-3 sm:h-4 sm:w-4 text-[#4a7c59] mr-1 sm:mr-2" />
                         <span className="text-[#5c6d5e]">Country</span>
                       </div>
                       <span className="font-medium text-[#2c3e2d] text-xs">
                         {user.country}
                       </span>
                     </div>
                   </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Link
                      href={`/users/${user.id}`}
                      className="flex-1 flex items-center justify-center gap-1 sm:gap-2 bg-[#4a7c59] text-white py-2 px-3 rounded-lg hover:bg-[#3a6147] transition-colors text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      View Profile
                    </Link>
                    
                    {user.friendStatus === 'pending' ? (
                      <button
                        className="flex items-center justify-center gap-1 sm:gap-2 border border-[#5c6d5e] text-[#5c6d5e] py-2 px-3 rounded-lg bg-[#f8f7f4] cursor-not-allowed text-xs sm:text-sm"
                        disabled
                        title="Friend request pending"
                      >
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Pending</span>
                      </button>
                    ) : user.friendStatus === 'accepted' ? (
                      <button
                        className="flex items-center justify-center gap-1 sm:gap-2 border border-[#4a7c59] text-[#4a7c59] py-2 px-3 rounded-lg bg-[#eef2eb] cursor-not-allowed text-xs sm:text-sm"
                        disabled
                        title="Already friends"
                      >
                        <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Friends</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFriendRequest(user.id)}
                        className="flex items-center justify-center gap-1 sm:gap-2 border border-[#4a7c59] text-[#4a7c59] py-2 px-3 rounded-lg hover:bg-[#eef2eb] transition-colors text-xs sm:text-sm"
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
        </div>
      </main>
    </div>
  );
}

export default UsersPage;