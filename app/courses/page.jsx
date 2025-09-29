"use client"

import dynamic from 'next/dynamic'
import { CoursesSkeleton } from '@/components/CoursesSkeleton'

// Lazy load the heavy Courses components
const CoursesInterface = dynamic(() => import('./CoursesInterface'), {
  loading: () => (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <CoursesSkeleton />
      </div>
    </div>
  ),
  ssr: true // Keep SSR for SEO (courses need to be indexed)
})

export default function CoursesPage() {
  return <CoursesInterface />
}
