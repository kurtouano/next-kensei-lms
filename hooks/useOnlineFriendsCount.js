"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Pusher from 'pusher-js'

export const useOnlineFriendsCount = () => {
  const { data: session } = useSession()
  const [onlineCount, setOnlineCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pusherRef = useRef(null)
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

    // Set up Pusher for real-time updates
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      })
    }

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`
    channelRef.current = pusherRef.current.subscribe(channelName)

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
