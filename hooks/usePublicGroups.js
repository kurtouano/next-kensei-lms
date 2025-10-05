import { useState, useEffect, useCallback } from 'react'

export function usePublicGroups() {
  const [publicGroups, setPublicGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    hasMore: false
  })

  const fetchPublicGroups = useCallback(async (page = 1, append = false) => {
    if (!append) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      const response = await fetch(`/api/chats/public-groups?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch public groups')
      }

      const data = await response.json()
      
      if (page === 1 || !append) {
        setPublicGroups(data.groups)
      } else {
        setPublicGroups(prev => [...prev, ...data.groups])
      }
      
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching public groups:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  const joinGroup = useCallback(async (groupId) => {
    try {
      const response = await fetch(`/api/chats/public-groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to join group')
      }

      const data = await response.json()
      
      // Update the group in the list
      setPublicGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: true, members: data.group.members }
            : group
        )
      )

      return data.group
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const leaveGroup = useCallback(async (groupId) => {
    try {
      const response = await fetch(`/api/chats/public-groups/${groupId}/join`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to leave group')
      }

      // Update the group in the list
      setPublicGroups(prev => 
        prev.map(group => 
          group.id === groupId 
            ? { ...group, isJoined: false, members: group.members - 1 }
            : group
        )
      )

      return true
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const createPublicGroup = useCallback(async (groupData) => {
    try {
      const response = await fetch('/api/chats/public-groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create public group')
      }

      const data = await response.json()
      
      // Add the new group to the list
      setPublicGroups(prev => [data.group, ...prev])
      
      return data.group
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const loadMore = useCallback(() => {
    if (pagination.hasMore && !loading && !loadingMore) {
      fetchPublicGroups(pagination.currentPage + 1, true)
    }
  }, [pagination.hasMore, pagination.currentPage, loading, loadingMore, fetchPublicGroups])

  // Initial load
  useEffect(() => {
    fetchPublicGroups(1)
  }, [fetchPublicGroups])

  return {
    publicGroups,
    loading,
    loadingMore,
    error,
    pagination,
    fetchPublicGroups,
    joinGroup,
    leaveGroup,
    createPublicGroup,
    loadMore
  }
}
