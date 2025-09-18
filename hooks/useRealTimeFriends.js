import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export const useRealTimeFriends = () => {
  const { data: session } = useSession();
  const { showSuccess, showInfo } = useToast();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const eventSourceRef = useRef(null);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await fetch("/api/friends");
      const data = await response.json();
      
      if (data.success) {
        setFriends(data.friends);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial fetch
    fetchFriends();

    // Set up SSE connection for real-time updates
    const setupSSE = () => {
      try {
        eventSourceRef.current = new EventSource('/api/friends/stream');
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'friends_update') {
              setFriends(data.friends);
              setLastUpdate(new Date(data.timestamp));
            } else if (data.type === 'friend_request_received') {
              // Show notification for new friend request
              showInfo(data.message, 7000);
            } else if (data.type === 'friend_request_accepted') {
              // Show notification for accepted friend request
              showSuccess(data.message, 5000);
            } else if (data.type === 'online_status_update') {
              // Update online status for a specific friend
              setFriends(prevFriends => 
                prevFriends.map(friend => 
                  friend.id === data.userId 
                    ? { ...friend, isOnline: data.isOnline }
                    : friend
                )
              );
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
        const intervalId = setInterval(fetchFriends, 120000);
        return () => clearInterval(intervalId);
      }
    };

    setupSSE();

    // Fallback polling for when SSE is not available
    let fallbackInterval;
    const setupFallback = () => {
      fallbackInterval = setInterval(fetchFriends, 120000);
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
  }, [session?.user?.id, fetchFriends]);

  return {
    friends,
    loading,
    lastUpdate,
    refreshFriends: fetchFriends
  };
};
