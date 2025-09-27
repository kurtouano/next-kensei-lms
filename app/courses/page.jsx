"use client"

import dynamic from 'next/dynamic'

// Lazy load the heavy Courses components
const CoursesInterface = dynamic(() => import('./CoursesInterface'), {
  loading: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-80 animate-pulse mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-32 h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse mb-6"></div>
        </div>

        {/* Courses Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="aspect-[16/10] w-full bg-gray-200 animate-pulse"></div>
              <div className="p-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                </div>
                <div className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
                <div className="flex gap-2">
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
  ssr: true // Keep SSR for SEO (courses need to be indexed)
})

export default function CoursesPage() {
  return <CoursesInterface />
}
