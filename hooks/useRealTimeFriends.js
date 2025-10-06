import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';

export const useRealTimeFriends = (page = 1, search = '', append = false) => {
  const { data: session } = useSession();
  const { showSuccess, showInfo } = useToast();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasMore: false,
    totalFriends: 0
  });
  const eventSourceRef = useRef(null);

  const fetchFriends = useCallback(async (pageNum = 1, searchTerm = '', appendData = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await fetch(`/api/friends?${params}`);
      const data = await response.json();
      
      if (data.success) {
        if (appendData) {
          setFriends(prev => [...prev, ...data.friends]);
        } else {
          setFriends(data.friends);
        }
        setPagination(data.pagination);
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
    fetchFriends(page, search, append);

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
  }, [session?.user?.id, fetchFriends, page, search, append]);

  return {
    friends,
    loading,
    lastUpdate,
    pagination,
    refreshFriends: fetchFriends
  };
};
