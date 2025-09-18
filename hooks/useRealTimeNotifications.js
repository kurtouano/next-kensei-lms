import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

export const useRealTimeNotifications = () => {
  const { data: session } = useSession();
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const eventSourceRef = useRef(null);

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

    // Set up SSE connection for real-time updates
    const setupSSE = () => {
      try {
        eventSourceRef.current = new EventSource('/api/friends/stream');
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'notification_count_update') {
              setNotificationCount(data.count);
            } else if (data.type === 'heartbeat') {
              // Keep connection alive
              console.log('SSE heartbeat received');
            }
          } catch (error) {
            console.error('Error parsing SSE data:', error);
          }
        };

        eventSourceRef.current.onerror = (error) => {
          console.error('SSE connection error:', error);
          // Fallback to polling if SSE fails
          setTimeout(() => {
            if (eventSourceRef.current) {
              eventSourceRef.current.close();
              setupSSE();
            }
          }, 5000);
        };

      } catch (error) {
        console.error('Error setting up SSE:', error);
        // Fallback to polling
        const intervalId = setInterval(fetchNotificationCount, 30000); // Poll every 30 seconds
        return () => clearInterval(intervalId);
      }
    };

    setupSSE();

    // Fallback polling for when SSE is not available
    let fallbackInterval;
    const setupFallback = () => {
      fallbackInterval = setInterval(fetchNotificationCount, 30000); // Poll every 30 seconds
    };

    // Only use fallback if SSE is not supported
    if (!window.EventSource) {
      setupFallback();
    }

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [session?.user?.id, fetchNotificationCount]);

  return {
    notificationCount,
    loading,
    refreshNotificationCount: fetchNotificationCount
  };
};
