"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, UserPlus, Check, X, Users, MoreVertical, Trash2, Trash } from "lucide-react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { NotificationsSkeleton } from "@/components/NotificationsSkeleton";

// Lazy load the confirmation modal
const ConfirmationModal = lazy(() => import('./components/ConfirmationModal'));

function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState('');
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const limit = 5;

  // Real-time notifications hook
  const { notificationCount } = useRealTimeNotifications();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated") {
      // Immediately reset notification count when visiting the page
      window.dispatchEvent(new Event('notification-updated'));
      fetchNotifications();
    }
  }, [status, router]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionsMenu && !event.target.closest('.actions-menu-container')) {
        setShowActionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  // Refresh notifications when notification count changes (real-time updates)
  useEffect(() => {
    if (status === "authenticated" && notificationCount !== undefined) {
      // Refresh notifications when count changes (new notification received)
      fetchNotifications(1, false);
    }
  }, [notificationCount, status]);

  const fetchNotifications = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(`/api/notifications?page=${pageNum}&limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        if (append) {
          setNotifications(prev => [...prev, ...data.notifications]);
        } else {
          setNotifications(data.notifications);
        }
        
        setHasMore(data.notifications.length === limit);
        setPage(pageNum);
        
        // Mark all unread notifications as read when viewing the page
        const unreadNotifications = data.notifications.filter(n => !n.read);
        if (unreadNotifications.length > 0) {
          // Mark all unread notifications as read in batch
          await markAllNotificationsAsRead(unreadNotifications.map(n => n._id));
          // Update notification count in header immediately
          window.dispatchEvent(new Event('notification-updated'));
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllNotificationsAsRead = async (notificationIds) => {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds }),
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleFriendResponse = async (friendRequestId, action, notificationId) => {
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
        // Mark the notification as read immediately
        await markNotificationAsRead(notificationId);
        // Refresh notifications to get updated list
        fetchNotifications(1, false);
        // Update notification count in header
        window.dispatchEvent(new Event('notification-updated'));
      } else {
        console.error('Failed to process friend request:', data.message);
      }
    } catch (error) {
      console.error('Error processing friend request:', error);
    }
  };

  const loadMoreNotifications = async () => {
    await fetchNotifications(page + 1, true);
  };

  const cleanupOldNotifications = async () => {
    try {
      setCleanupLoading(true);
      setCleanupMessage('');
      
      const response = await fetch('/api/notifications/cleanup', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.cleanedCount > 0) {
          setCleanupMessage(`Cleaned up ${data.cleanedCount} old notifications`);
        } else {
          setCleanupMessage('No old notifications to clean up');
        }
        // Refresh notifications to get updated list
        fetchNotifications(1, false);
        // Update notification count in header
        window.dispatchEvent(new Event('notification-updated'));
        
        // Clear message after 4 seconds
        setTimeout(() => setCleanupMessage(''), 4000);
      } else {
        setCleanupMessage('Failed to cleanup notifications');
        setTimeout(() => setCleanupMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      setCleanupMessage('Error cleaning up notifications');
      setTimeout(() => setCleanupMessage(''), 3000);
    } finally {
      setCleanupLoading(false);
    }
  };

  const handleCleanupOld = () => {
    setConfirmAction('cleanupOld');
    setShowConfirmModal(true);
    setShowActionsMenu(false);
  };

  const handleDeleteAll = () => {
    setConfirmAction('deleteAll');
    setShowConfirmModal(true);
    setShowActionsMenu(false);
  };

  const confirmActionHandler = async () => {
    if (confirmAction === 'cleanupOld') {
      await cleanupOldNotifications();
    } else if (confirmAction === 'deleteAll') {
      await clearAllNotifications();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const clearAllNotifications = async () => {
    try {
      setCleanupLoading(true);
      setCleanupMessage('');
      
      const response = await fetch('/api/notifications/clear-all', {
        method: 'POST',
      });

      const data = await response.json();
      
      if (data.success) {
        setCleanupMessage(`Cleared all notifications`);
        // Refresh notifications to get updated list
        fetchNotifications(1, false);
        // Update notification count in header
        window.dispatchEvent(new Event('notification-updated'));
        
        // Clear message after 4 seconds
        setTimeout(() => setCleanupMessage(''), 4000);
      } else {
        setCleanupMessage('Failed to clear notifications');
        setTimeout(() => setCleanupMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
      setCleanupMessage('Error clearing notifications');
      setTimeout(() => setCleanupMessage(''), 3000);
    } finally {
      setCleanupLoading(false);
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

  const getNotificationAge = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays < 1) {
      return { age: 'Today', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    } else if (diffInDays < 7) {
      return { age: `${diffInDays} day${diffInDays > 1 ? 's' : ''} old`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return { age: `${weeks} week${weeks > 1 ? 's' : ''} old`, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return { age: `${months} month${months > 1 ? 's' : ''} old`, color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    } else {
      const years = Math.floor(diffInDays / 365);
      return { age: `${years} year${years > 1 ? 's' : ''} old`, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    }
  };

  const isOldNotification = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    return diffInDays >= 7; // 7+ days is considered "old"
  };

  if (loading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 py-4 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="">
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-[#4a7c59]" />
              <h1 className="text-xl sm:text-2xl font-bold text-[#2c3e2d]">Notifications</h1>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[#5c6d5e] text-sm sm:text-base">
                  Stay updated with friend requests and activities
                </p>
                {notifications.length > 0 && (
                  <p className="text-[#5c6d5e] text-xs sm:text-sm mt-9 mb-6">
                    Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 mt-9">
                 <div className="relative actions-menu-container">
                   <button
                     onClick={() => setShowActionsMenu(!showActionsMenu)}
                     disabled={cleanupLoading}
                     className="p-2 sm:p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 hover:text-gray-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-gray-200 hover:border-gray-300"
                   >
                     {cleanupLoading ? (
                       <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                       <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                     )}
                   </button>
                   
                   {showActionsMenu && !cleanupLoading && (
                     <div className="absolute right-0 top-full mt-1 w-52 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                       <div className="py-1">
                         <button
                           onClick={handleCleanupOld}
                           className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                         >
                           <Trash className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                           <span className="whitespace-nowrap">Clean old notifications</span>
                         </button>
                         <button
                           onClick={handleDeleteAll}
                           className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                         >
                           <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                           <span className="whitespace-nowrap">Delete all notifications</span>
                         </button>
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {cleanupMessage && (
                   <p className={`text-xs ${
                     cleanupMessage.includes('Cleaned up') || cleanupMessage.includes('Cleared') ? 'text-green-600' : 
                     cleanupMessage.includes('No old') ? 'text-blue-600' : 
                     'text-red-600'
                   }`}>
                     {cleanupMessage}
                   </p>
                 )}
               </div>
             </div>
          </div>

                     {/* Notifications List */}
           {notifications.length > 0 ? (
             <div className="space-y-4">
               {notifications.map((notification) => (
                                  <div 
                    key={notification._id} 
                    className="bg-white rounded-lg border border-[#dce4d7] p-3 sm:p-4 lg:p-6"
                  >
                   <div className="flex items-start justify-between">
                     <div className="flex items-start gap-2 sm:gap-3 flex-1">
                       {/* Notification Icon */}
                       <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-[#eef2eb] flex items-center justify-center flex-shrink-0">
                         {notification.type === 'friend_request' && (
                           <UserPlus className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                         )}
                         {notification.type === 'friend_accepted' && (
                           <Check className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                         )}
                         {notification.type === 'friend_rejected' && (
                           <X className="h-4 w-4 sm:h-5 sm:w-5 text-[#4a7c59]" />
                         )}
                       </div>

                       {/* Notification Content */}
                       <div className="flex-1 min-w-0">
                         <h3 className="font-semibold text-[#2c3e2d] text-sm sm:text-base mb-1">
                           {notification.title}
                         </h3>
                         <p className="text-[#5c6d5e] text-xs sm:text-sm mb-2">
                           {notification.message}
                         </p>
                         <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                           <span className="text-[#5c6d5e]">{formatTimeAgo(notification.createdAt)}</span>
                           
                           {!notification.read && (
                             <span className="text-[#4a7c59] font-medium bg-[#eef2eb] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs">New</span>
                           )}
                         </div>
                       </div>
                     </div>

                     {/* Action Buttons */}
                     {notification.type === 'friend_request' && (
                       <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2 sm:ml-4">
                         <button
                           onClick={() => handleFriendResponse(notification.relatedData.friendRequestId, 'accept', notification._id)}
                           className="px-2 sm:px-3 py-1 bg-[#4a7c59] text-white text-xs rounded-lg hover:bg-[#3a6147] transition-colors"
                         >
                           Accept
                         </button>
                         <button
                           onClick={() => handleFriendResponse(notification.relatedData.friendRequestId, 'reject', notification._id)}
                           className="px-2 sm:px-3 py-1 border border-[#dc2626] text-[#dc2626] text-xs rounded-lg hover:bg-[#fef2f2] transition-colors"
                         >
                           Decline
                         </button>
                       </div>
                     )}
                     
                     {/* Status for already processed requests */}
                     {notification.type === 'friend_accepted' && (
                       <div className="ml-2 sm:ml-4">
                         <span className="px-2 sm:px-3 py-1 bg-[#eef2eb] text-[#4a7c59] text-xs rounded-lg border border-[#4a7c59]">
                           Accepted
                         </span>
                       </div>
                     )}
                     
                     {notification.type === 'friend_rejected' && (
                       <div className="ml-2 sm:ml-4">
                         <span className="px-2 sm:px-3 py-1 bg-[#fef2f2] text-[#dc2626] text-xs rounded-lg border border-[#dc2626]">
                           Declined
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
               
               {/* Load More Button */}
               {hasMore && (
                 <div className="text-center pt-4">
                   <button
                     onClick={loadMoreNotifications}
                     disabled={loadingMore}
                     className="px-3 sm:px-4 py-1.5 bg-white text-[#4a7c59] border border-[#4a7c59] text-xs sm:text-sm rounded-md hover:bg-[#4a7c59] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                   >
                     {loadingMore ? (
                       <>
                         <div className="w-3 h-3 bg-[#4a7c59] rounded animate-pulse"></div>
                         <span className="hidden sm:inline">Loading...</span>
                         <span className="sm:hidden">Loading</span>
                       </>
                     ) : (
                       'Load More'
                     )}
                   </button>
                 </div>
               )}
             </div>
           ) : (
            <div className="text-center py-8 sm:py-12">
              <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-[#5c6d5e] opacity-50 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium text-[#2c3e2d] mb-2">No notifications</h3>
              <p className="text-sm sm:text-base text-[#5c6d5e]">
                You're all caught up! Check back later for new updates.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Lazy-loaded Confirmation Modal */}
      {showConfirmModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-[#2c3e2d] bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#f8f7f4] rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-[#4a7c59] border-opacity-20 p-8">
              <div className="flex items-center justify-center">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        }>
          <ConfirmationModal
            showModal={showConfirmModal}
            confirmAction={confirmAction}
            cleanupLoading={cleanupLoading}
            onConfirm={confirmActionHandler}
            onCancel={() => setShowConfirmModal(false)}
          />
        </Suspense>
      )}
    </div>
  );
}

export default NotificationsPage;
