import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"

// Cache for bonsai data to avoid repeated API calls
const bonsaiCache = new Map()

export function useBonsaiData(userId) {
  const { data: session } = useSession()
  const [bonsaiData, setBonsaiData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBonsaiData = useCallback(async (userId) => {
    if (!userId || !session?.user?.email) return

    // Check cache first
    if (bonsaiCache.has(userId)) {
      setBonsaiData(bonsaiCache.get(userId))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/bonsai`)
      const data = await response.json()

      if (data.success) {
        const bonsai = data.bonsai
        setBonsaiData(bonsai)
        // Cache the result
        bonsaiCache.set(userId, bonsai)
      } else {
        throw new Error(data.error || "Failed to fetch bonsai data")
      }
    } catch (error) {
      console.error("Error fetching bonsai data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (userId) {
      fetchBonsaiData(userId)
    }
  }, [userId, fetchBonsaiData])

  return {
    bonsaiData,
    loading,
    error,
    refetch: () => fetchBonsaiData(userId)
  }
}

// Hook for multiple users (for chat lists)
export function useMultipleBonsaiData(userIds) {
  const { data: session } = useSession()
  const [bonsaiDataMap, setBonsaiDataMap] = useState(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchMultipleBonsaiData = useCallback(async (userIds) => {
    if (!userIds?.length || !session?.user?.email) return

    // Filter out users we already have cached
    const uncachedUserIds = userIds.filter(id => !bonsaiCache.has(id))
    
    if (uncachedUserIds.length === 0) {
      // All data is cached, just set from cache
      const cachedData = new Map()
      userIds.forEach(id => {
        if (bonsaiCache.has(id)) {
          cachedData.set(id, bonsaiCache.get(id))
        }
      })
      setBonsaiDataMap(cachedData)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/bonsai/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: uncachedUserIds })
      })
      
      const data = await response.json()

      if (data.success) {
        const newDataMap = new Map()
        
        // Add cached data
        userIds.forEach(id => {
          if (bonsaiCache.has(id)) {
            newDataMap.set(id, bonsaiCache.get(id))
          }
        })
        
        // Add new data
        data.bonsaiData.forEach(item => {
          if (item.bonsai) {
            newDataMap.set(item.userId, item.bonsai)
            bonsaiCache.set(item.userId, item.bonsai)
          }
        })
        
        setBonsaiDataMap(newDataMap)
      } else {
        throw new Error(data.error || "Failed to fetch bonsai data")
      }
    } catch (error) {
      console.error("Error fetching multiple bonsai data:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (userIds?.length) {
      fetchMultipleBonsaiData(userIds)
    }
  }, [userIds, fetchMultipleBonsaiData])

  return {
    bonsaiDataMap,
    loading,
    error,
    refetch: () => fetchMultipleBonsaiData(userIds)
  }
}
