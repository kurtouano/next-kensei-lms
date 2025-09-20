"use client"

import { useState, useEffect, useMemo } from "react"
import { ExternalLink, Play, Image as ImageIcon, Globe } from "lucide-react"

// Simple in-memory cache for link metadata
const linkMetadataCache = new Map()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to check if cached data is still valid
const isCacheValid = (cachedData) => {
  return cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION
}

// Function to extract YouTube video ID from various YouTube URL formats
const getYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Function to extract Twitter/X post ID
const getTwitterPostId = (url) => {
  const match = url.match(/twitter\.com\/\w+\/status\/(\d+)/) || url.match(/x\.com\/\w+\/status\/(\d+)/)
  return match ? match[1] : null
}

// Function to extract Instagram post ID
const getInstagramPostId = (url) => {
  const match = url.match(/instagram\.com\/p\/([^\/\?]+)/)
  return match ? match[1] : null
}

// Function to extract TikTok video ID
const getTikTokVideoId = (url) => {
  const match = url.match(/tiktok\.com\/@\w+\/video\/(\d+)/) || url.match(/vm\.tiktok\.com\/([^\/\?]+)/)
  return match ? match[1] : null
}

// Function to check if URL is an image
const isImageUrl = (url) => {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i
  return imageExtensions.test(url)
}

// Function to get Open Graph metadata (simplified version)
const fetchLinkMetadata = async (url) => {
  try {
    // Check cache first
    const cachedData = linkMetadataCache.get(url)
    if (isCacheValid(cachedData)) {
      return cachedData.data
    }

    let metadata = null

    // For YouTube videos, we can get metadata from YouTube's oEmbed API
    const youtubeId = getYouTubeVideoId(url)
    if (youtubeId) {
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
        if (response.ok) {
          const data = await response.json()
        metadata = {
          title: data.title,
          description: data.author_name,
          thumbnail: data.thumbnail_url,
          type: 'youtube',
          videoId: youtubeId
        }
        }
      } catch (error) {
        // Fallback for CORS issues or API failures
        console.warn('YouTube oEmbed API failed, using fallback:', error)
        metadata = {
          title: 'YouTube Video',
          description: 'Click to view on YouTube',
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`,
          type: 'youtube',
          videoId: youtubeId
        }
      }
    }

    // For Twitter/X posts
    if (!metadata) {
      const twitterId = getTwitterPostId(url)
      if (twitterId) {
        metadata = {
          title: 'Twitter Post',
          description: 'View on Twitter/X',
          thumbnail: null,
          type: 'twitter',
          postId: twitterId
        }
      }
    }

    // For Instagram posts
    if (!metadata) {
      const instagramId = getInstagramPostId(url)
      if (instagramId) {
        metadata = {
          title: 'Instagram Post',
          description: 'View on Instagram',
          thumbnail: null,
          type: 'instagram',
          postId: instagramId
        }
      }
    }

    // For TikTok videos
    if (!metadata) {
      const tiktokId = getTikTokVideoId(url)
      if (tiktokId) {
        metadata = {
          title: 'TikTok Video',
          description: 'View on TikTok',
          thumbnail: null,
          type: 'tiktok',
          videoId: tiktokId
        }
      }
    }

    // For images
    if (!metadata && isImageUrl(url)) {
      metadata = {
        title: 'Image',
        description: url.split('/').pop(),
        thumbnail: url,
        type: 'image'
      }
    }

    // For other URLs, try to get basic metadata
    if (!metadata) {
      // Note: This is a simplified approach. In production, you'd want to use a proper link preview service
      // Truncate long URLs to prevent width issues
      const truncatedUrl = url.length > 50 ? url.substring(0, 50) + '...' : url
      metadata = {
        title: new URL(url).hostname,
        description: truncatedUrl,
        thumbnail: null,
        type: 'link'
      }
    }

    // Cache the result
    if (metadata) {
      linkMetadataCache.set(url, {
        data: metadata,
        timestamp: Date.now()
      })
    }

    return metadata
  } catch (error) {
    console.error('Error fetching link metadata:', error)
    return null
  }
}

const LinkPreview = ({ url, className = "" }) => {
  const [metadata, setMetadata] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Memoize the URL to avoid unnecessary re-fetches
  const normalizedUrl = useMemo(() => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      return urlObj.toString()
    } catch {
      return url
    }
  }, [url])

  useEffect(() => {
    let isMounted = true

    const loadMetadata = async () => {
      setLoading(true)
      setError(false)
      
      try {
        const data = await fetchLinkMetadata(normalizedUrl)
        if (isMounted) {
          setMetadata(data)
          setError(!data)
        }
      } catch (err) {
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadMetadata()

    return () => {
      isMounted = false
    }
  }, [normalizedUrl])

  if (loading) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !metadata) {
    return null
  }

  const handleClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    window.open(normalizedUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div 
      className={`bg-gray-50 border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors shadow-sm max-w-full link-preview ${className}`}
      style={{ maxWidth: '100%', width: '100%' }}
      onClick={handleClick}
    >
      {/* YouTube Video Preview */}
      {metadata.type === 'youtube' && (
        <div className="relative">
          {metadata.thumbnail && (
            <div className="relative group">
              <img
                src={metadata.thumbnail}
                alt={metadata.title}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-200">
                <div className="bg-red-600 text-white rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform duration-200">
                  <Play className="w-6 h-6 fill-current" />
                </div>
              </div>
            </div>
          )}
          <div className="p-3">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
              {metadata.title}
            </h3>
            <p className="text-xs text-gray-600 mb-2 truncate whitespace-nowrap overflow-hidden" style={{ maxWidth: '100%', textOverflow: 'ellipsis' }}>
              {metadata.description}
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-4 h-4 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </div>
              <span className="flex-1">youtube.com</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Twitter/X Post Preview */}
      {metadata.type === 'twitter' && (
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">
                View on Twitter/X
              </h3>
              <p className="text-xs text-gray-600">
                Click to view the post
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Instagram Post Preview */}
      {metadata.type === 'instagram' && (
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">
                View on Instagram
              </h3>
              <p className="text-xs text-gray-600">
                Click to view the post
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* TikTok Video Preview */}
      {metadata.type === 'tiktok' && (
        <div className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 text-sm">
                View on TikTok
              </h3>
              <p className="text-xs text-gray-600">
                Click to view the video
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Image Preview */}
      {metadata.type === 'image' && (
        <div>
          <img
            src={metadata.thumbnail}
            alt={metadata.description}
            className="w-full max-h-64 object-cover"
            loading="lazy"
          />
          <div className="p-3">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ImageIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate flex-1 whitespace-nowrap overflow-hidden" style={{ maxWidth: '100%', textOverflow: 'ellipsis' }}>{metadata.description}</span>
              <ExternalLink className="w-3 h-3 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Generic Link Preview */}
      {metadata.type === 'link' && (
        <div className="p-3">
          <div className="flex items-center gap-3 w-full" style={{ maxWidth: '100%' }}>
            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
              <Globe className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0 overflow-hidden" style={{ maxWidth: 'calc(100% - 3rem)' }}>
              <h3 className="font-medium text-gray-900 text-sm truncate">
                {metadata.title}
              </h3>
              <p className="text-xs text-gray-600 truncate whitespace-nowrap overflow-hidden" style={{ maxWidth: '100%', textOverflow: 'ellipsis' }}>
                {metadata.description}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkPreview
