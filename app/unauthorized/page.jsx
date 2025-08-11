"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function UnauthorizedPage() {
  const [attemptedPath, setAttemptedPath] = useState('this area')
  const [mounted, setMounted] = useState(false)

  // Only run on client side to avoid SSR issues
  useEffect(() => {
    setMounted(true)
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const path = searchParams.get('attemptedPath') || 'this area'
      setAttemptedPath(path)
    } catch (error) {
      console.error('Error getting attempted path:', error)
    }
  }, [])

  // Always render the same content during SSR to avoid hydration issues
  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          You don't have permission to access{' '}
          <span className="font-semibold">
            {mounted ? attemptedPath : 'this area'}
          </span>
          .
        </p>
        
        <p className="text-gray-600 mb-8">
          Please log in to access this content.
        </p>
        
        <Link 
          href="/" 
          className="inline-block bg-[#4a7c59] text-white px-6 py-3 rounded-lg hover:bg-[#3a6147] transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}

