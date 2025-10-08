import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { getPusherClient } from '@/lib/pusherClient';

export const useRealTimeNotifications = () => {
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
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

    // Get singleton Pusher client
    const pusher = getPusherClient();
    
    if (!pusher) {
      console.error('[Pusher] Failed to initialize Pusher client for notifications');
      return;
    }

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`;
    channelRef.current = pusher.subscribe(channelName);

    // Listen for notification count updates
    channelRef.current.bind('notification-count', (data) => {
      console.log('[Pusher] Notification count update:', data.count);
      setNotificationCount(data.count);
    });

    // Re-fetch on reconnection
    const handleReconnect = () => {
      console.log('[Pusher] Reconnected - refreshing notification count');
      fetchNotificationCount();
    };
    pusher.connection.bind('connected', handleReconnect);

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
      pusher.connection.unbind('connected', handleReconnect);
      window.removeEventListener('notification-updated', handleNotificationUpdate);
    };
  }, [session?.user?.id, fetchNotificationCount]);

  return {
    notificationCount,
    loading,
    refreshNotificationCount: fetchNotificationCount
  };
};
