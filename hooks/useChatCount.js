"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Pusher from 'pusher-js'

export const useChatCount = () => {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const pusherRef = useRef(null)
  const channelRef = useRef(null)

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chats/unread-count')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUnreadCount(data.count)
        }
      }
    } catch (error) {
      console.error('Error fetching unread chat count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!session?.user?.id) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    // Initial fetch
    fetchUnreadCount()

    // Set up Pusher for real-time updates
    if (!pusherRef.current) {
      pusherRef.current = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      })
    }

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`
    channelRef.current = pusherRef.current.subscribe(channelName)

    // Listen for chat count updates
    channelRef.current.bind('chat-count', (data) => {
      console.log('[Pusher] Chat count update:', data.count)
      setUnreadCount(data.count)
    })

    // Listen for custom events from pages (like when visiting chat page)
    const handleChatUpdate = () => {
      fetchUnreadCount()
    }

    window.addEventListener('chat-updated', handleChatUpdate)

    // Cleanup
    return () => {
      if (channelRef.current) {
        channelRef.current.unbind_all()
        channelRef.current.unsubscribe()
      }
      window.removeEventListener('chat-updated', handleChatUpdate)
    }
  }, [session?.user?.id])

  return { unreadCount, loading, refreshUnreadCount: fetchUnreadCount }
}
