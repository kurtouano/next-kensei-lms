"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, UserPlus, Check, X, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      fetchNotifications();
    }
  }, [status, router]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications");
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendResponse = async (friendRequestId, action) => {
    try {
      const response = await fetch('/api/friends/response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          friendRequestId, 
          action 
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh notifications to get updated list
        fetchNotifications();
        // Update notification count in header
        window.dispatchEvent(new Event('notification-updated'));
      } else {
        console.error('Failed to process friend request:', data.message);
      }
    } catch (error) {
      console.error('Error processing friend request:', error);
    }
  };

  const cleanupNotifications = async () => {
    try {
      const response = await fetch('/api/notifications/cleanup', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Cleanup successful:', data.message);
        // Refresh notifications to get updated list
        fetchNotifications();
        // Update notification count in header
        window.dispatchEvent(new Event('notification-updated'));
      } else {
        console.error('Failed to cleanup notifications:', data.message);
      }
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
    }
  };



  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <main className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Bell className="h-6 w-6 animate-pulse text-[#4a7c59]" />
            <span className="text-[#2c3e2d]">Loading notifications...</span>
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
              <Link 
                href="/users"
                className="p-2 rounded-lg hover:bg-[#eef2eb] transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-[#4a7c59]" />
              </Link>
              <Bell className="h-8 w-8 text-[#4a7c59]" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2c3e2d]">Notifications</h1>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[#5c6d5e] text-sm sm:text-base">
                Stay updated with friend requests and activities
              </p>
              <button
                onClick={cleanupNotifications}
                className="px-3 py-1 bg-[#4a7c59] text-white text-xs rounded-lg hover:bg-[#3a6147] transition-colors"
              >
                Cleanup Old Notifications
              </button>
            </div>
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                                 <div 
                   key={notification._id} 
                   className="bg-white rounded-lg border border-[#dce4d7] p-4 sm:p-6 hover:shadow-md transition-shadow border-l-4 border-l-[#4a7c59]"
                 >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {/* Notification Icon */}
                      <div className="h-10 w-10 rounded-full bg-[#eef2eb] flex items-center justify-center flex-shrink-0">
                        {notification.type === 'friend_request' && (
                          <UserPlus className="h-5 w-5 text-[#4a7c59]" />
                        )}
                        {notification.type === 'friend_accepted' && (
                          <Check className="h-5 w-5 text-[#4a7c59]" />
                        )}
                        {notification.type === 'friend_rejected' && (
                          <X className="h-5 w-5 text-[#4a7c59]" />
                        )}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#2c3e2d] text-sm sm:text-base mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-[#5c6d5e] text-sm mb-2">
                          {notification.message}
                        </p>
                                                 <div className="flex items-center gap-4 text-xs text-[#5c6d5e]">
                           <span>{formatTimeAgo(notification.createdAt)}</span>
                           <span className="text-[#4a7c59] font-medium">New</span>
                         </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {notification.type === 'friend_request' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleFriendResponse(notification.relatedData.friendRequestId, 'accept')}
                          className="px-3 py-1 bg-[#4a7c59] text-white text-xs rounded-lg hover:bg-[#3a6147] transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleFriendResponse(notification.relatedData.friendRequestId, 'reject')}
                          className="px-3 py-1 border border-[#dc2626] text-[#dc2626] text-xs rounded-lg hover:bg-[#fef2f2] transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    
                    {/* Status for already processed requests */}
                    {notification.type === 'friend_accepted' && (
                      <div className="ml-4">
                        <span className="px-3 py-1 bg-[#eef2eb] text-[#4a7c59] text-xs rounded-lg border border-[#4a7c59]">
                          Accepted
                        </span>
                      </div>
                    )}
                    
                    {notification.type === 'friend_rejected' && (
                      <div className="ml-4">
                        <span className="px-3 py-1 bg-[#fef2f2] text-[#dc2626] text-xs rounded-lg border border-[#dc2626]">
                          Declined
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="h-16 w-16 text-[#5c6d5e] opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#2c3e2d] mb-2">No notifications</h3>
              <p className="text-[#5c6d5e]">
                You're all caught up! Check back later for new updates.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default NotificationsPage;
