"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { getPusherClient } from '@/lib/pusherClient'

export const useChatCount = () => {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
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

    // Initial fetch - always do this immediately
    fetchUnreadCount()

    // Get singleton Pusher client
    const pusher = getPusherClient()
    
    if (!pusher) {
      console.error('[Pusher] Failed to initialize Pusher client for chat')
      return
    }

    // Subscribe to user-specific channel
    const channelName = `user-${session.user.id}`
    channelRef.current = pusher.subscribe(channelName)

    // Listen for chat count updates
    channelRef.current.bind('chat-count', (data) => {
      console.log('[Pusher] Chat count update:', data.count)
      setUnreadCount(data.count)
    })

    // Re-fetch on connection (both initial and reconnections)
    const handleConnect = () => {
      console.log('[Pusher] Connected - refreshing chat count')
      fetchUnreadCount()
    }
    pusher.connection.bind('connected', handleConnect)

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
      pusher.connection.unbind('connected', handleConnect)
      window.removeEventListener('chat-updated', handleChatUpdate)
    }
  }, [session?.user?.id])

  return { unreadCount, loading, refreshUnreadCount: fetchUnreadCount }
}
