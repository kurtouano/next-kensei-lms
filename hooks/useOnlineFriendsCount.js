"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getPusherClient } from '@/lib/pusherClient'

export const useOnlineFriendsCount = () => {
  const { data: session } = useSession()
  const [onlineCount, setOnlineCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const channelRef = useRef(null)

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

    // Get singleton Pusher client
    const pusher = getPusherClient()

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`
    channelRef.current = pusher.subscribe(channelName)

    // Listen for online friends count updates
    channelRef.current.bind('online-friends-count', (data) => {
      console.log('[Pusher] Online friends count update:', data.count)
      setOnlineCount(data.count)
    })

    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all()
        channelRef.current.unsubscribe()
      }
    }
  }, [session?.user?.id])

  return { onlineCount, loading }
}
