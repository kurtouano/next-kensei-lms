"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

export const useOnlineFriendsCount = () => {
  const { data: session } = useSession()
  const [onlineCount, setOnlineCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) {
      setOnlineCount(0)
      setLoading(false)
      return
    }

    const fetchOnlineFriendsCount = async () => {
      try {
        const response = await fetch('/api/friends')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            // Count friends who are online
            const onlineFriends = data.friends.filter(friend => friend.isOnline)
            setOnlineCount(onlineFriends.length)
          }
        }
      } catch (error) {
        console.error('Error fetching online friends count:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initial fetch
    fetchOnlineFriendsCount()

    // Set up real-time updates via SSE
    const eventSource = new EventSource('/api/friends/stream')
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'friends_update') {
          // Count online friends from the update
          const onlineFriends = data.friends.filter(friend => friend.isOnline)
          setOnlineCount(onlineFriends.length)
        } else if (data.type === 'online_status_update') {
          // Update count when a friend's online status changes
          fetchOnlineFriendsCount()
        } else if (data.type === 'online_friends_count_update') {
          // Direct count update
          setOnlineCount(data.count)
        }
      } catch (error) {
        console.error('Error parsing SSE data for online friends count:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('SSE connection error for online friends count:', error)
      // Fallback to polling every 30 seconds
      const interval = setInterval(fetchOnlineFriendsCount, 30000)
      
      return () => {
        clearInterval(interval)
        eventSource.close()
      }
    }

    return () => {
      eventSource.close()
    }
  }, [session?.user?.id])

  return { onlineCount, loading }
}
