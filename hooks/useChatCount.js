"use client"

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

export const useChatCount = () => {
  const { data: session } = useSession()
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const eventSourceRef = useRef(null)

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

    // Set up SSE connection for real-time updates
    const setupSSE = () => {
      try {
        eventSourceRef.current = new EventSource('/api/friends/stream')
        
        eventSourceRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            
            if (data.type === 'chat_count_update') {
              setUnreadCount(data.count)
            } else if (data.type === 'new_message') {
              // Increment count when new message is received
              setUnreadCount(prev => prev + 1)
            } else if (data.type === 'message_read') {
              // Decrement count when message is read
              setUnreadCount(prev => Math.max(0, prev - 1))
            }
          } catch (error) {
            console.error('Error parsing SSE data for chat count:', error)
          }
        }

        eventSourceRef.current.onerror = (error) => {
          console.error('SSE connection error for chat count:', error)
          // Fallback to polling every 30 seconds
          const interval = setInterval(fetchUnreadCount, 30000)
          
          return () => {
            clearInterval(interval)
            if (eventSourceRef.current) {
              eventSourceRef.current.close()
            }
          }
        }

      } catch (error) {
        console.error('Error setting up SSE for chat count:', error)
        // Fallback to polling
        const interval = setInterval(fetchUnreadCount, 30000)
        return () => clearInterval(interval)
      }
    }

    setupSSE()

    // Cleanup
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
        eventSourceRef.current = null
      }
    }
  }, [session?.user?.id])

  return { unreadCount, loading, refreshUnreadCount: fetchUnreadCount }
}
