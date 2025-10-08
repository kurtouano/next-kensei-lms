import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/contexts/ToastContext';
import { getPusherClient } from '@/lib/pusherClient';

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
  const channelRef = useRef(null);

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

    // Set up Pusher connection for real-time updates
    const pusher = getPusherClient();
    
    if (!pusher) {
      console.error('[Pusher] Failed to initialize Pusher client for friends');
      return;
    }

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`;
    channelRef.current = pusher.subscribe(channelName);

    // Listen for friends list updates (when friend accepts/rejects)
    channelRef.current.bind('friends-update', (data) => {
      console.log('[Pusher] Friends list update');
      fetchFriends(page, search, false); // Refresh friends list
    });

    // Listen for online status updates
    channelRef.current.bind('friend-online-status', (data) => {
      console.log('[Pusher] Friend online status update:', data);
      setFriends(prevFriends => 
        prevFriends.map(friend => 
          friend.id === data.userId 
            ? { ...friend, isOnline: data.isOnline }
            : friend
        )
      );
    });

    // Re-fetch on reconnection
    const handleReconnect = () => {
      console.log('[Pusher] Reconnected - refreshing friends list');
      fetchFriends(page, search, false);
    };
    pusher.connection.bind('connected', handleReconnect);

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all();
        channelRef.current.unsubscribe();
      }
      pusher.connection.unbind('connected', handleReconnect);
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
