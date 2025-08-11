"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"

export default function UnauthorizedPage() {
  const { data: session } = useSession()
  
  // Get the attempted path from URL params
  const searchParams = new URLSearchParams(window.location.search)
  const attemptedPath = searchParams.get('attemptedPath') || 'this area'

  return (
    <div className="min-h-[80vh] bg-white flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          You don't have permission to access <span className="font-semibold">{attemptedPath}</span>.
        </p>
        
        {session?.user ? (
          <p className="text-gray-600 mb-8">
            This area requires different permissions than your current role.
          </p>
        ) : (
          <p className="text-gray-600 mb-8">
            Please log in to access this content.
          </p>
        )}
        
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

