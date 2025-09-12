"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Lazy load the heavy Create Course interface
const CreateCourseInterface = dynamic(() => import('./CreateCourseInterface'), {
  loading: () => (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#4a7c59]" />
        <p className="text-[#2c3e2d] text-sm">Loading course creation tools...</p>
      </div>
    </div>
  ),
  ssr: false // Course creation is interactive, doesn't need SSR
})

export default function CreateCourse() {
  return <CreateCourseInterface />
}