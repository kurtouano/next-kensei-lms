import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Pusher from 'pusher-js';

export const useRealTimeNotifications = () => {
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pusherRef = useRef(null);
  const channelRef = useRef(null);

  const fetchNotificationCount = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/count");
      const data = await response.json();
      
      if (data.success) {
        setNotificationCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching notification count:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial fetch
    fetchNotificationCount();

    // Set up Pusher for real-time updates
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      });
    }

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`;
    channelRef.current = pusherRef.current.subscribe(channelName);

    // Listen for notification count updates
    channelRef.current.bind('notification-count', (data) => {
      console.log('[Pusher] Notification count update:', data.count);
      setNotificationCount(data.count);
    });

    // Listen for custom events from pages (like when visiting notifications page)
    const handleNotificationUpdate = () => {
      fetchNotificationCount();
    };

    window.addEventListener('notification-updated', handleNotificationUpdate);

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      window.removeEventListener('notification-updated', handleNotificationUpdate);
    };
  }, [session?.user?.id, fetchNotificationCount]);

  return {
    notificationCount,
    loading,
    refreshNotificationCount: fetchNotificationCount
  };
};
