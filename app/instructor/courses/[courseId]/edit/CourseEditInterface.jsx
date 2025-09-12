"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"

export default function CourseEditInterface() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [modules, setModules] = useState([])

  // Load course data for editing
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/instructor/courses/${courseId}/edit`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()

        if (data.success) {
          setCourseData(data.courseData)
          setModules(data.modules)
          console.log('Loaded course data:', data)
        } else {
          setLoadError(data.error || 'Failed to load course data')
        }
      } catch (error) {
        console.error('Error loading course:', error)
        setLoadError('Failed to load course data: ' + error.message)
      } finally {
        setIsLoading(false)
      }
    }

    if (courseId) {
      loadCourseData()
    }
  }, [courseId])

  const handleEditCourse = () => {
    // Store the course data in sessionStorage for the create-course page
    const editData = {
      courseData,
      modules,
      courseId,
      isEdit: true
    }
    
    sessionStorage.setItem('editCourseData', JSON.stringify(editData))
    console.log('🔄 Redirecting to edit mode with data:', editData)
    
    // Navigate to the create-course page which will handle editing
    router.push('/instructor/create-course')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a7c59]" />
          <span className="ml-2 text-[#4a7c59]">Loading course data...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (loadError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Course</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <div className="space-x-4">
            <Button 
              variant="outline"
              onClick={() => router.push('/instructor/dashboard')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-[#4a7c59] hover:bg-[#3a6147]"
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/instructor/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold text-[#2c3e2d] mb-2">
          Edit Course: {courseData?.title || 'Loading...'}
        </h1>
        <p className="text-[#4a7c59] mb-6">
          Make changes to your course content and settings
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[#2c3e2d] mb-4">
            Course Loaded Successfully
          </h3>
          <p className="text-gray-600 mb-6">
            Ready to edit "{courseData?.title}". This will open the course editor with all your current content loaded.
          </p>
          
          <div className="grid gap-4 md:grid-cols-2 mb-6 text-sm">
            <div className="bg-gray-50 p-4 rounded">
              <strong>Modules:</strong> {modules?.length || 0}
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <strong>Total Lessons:</strong> {modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0}
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <strong>Price:</strong> ${courseData?.price || 0}
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <strong>Status:</strong> {courseData?.status || 'Unknown'}
            </div>
          </div>

          <Button
            onClick={handleEditCourse}
            className="bg-[#4a7c59] hover:bg-[#3a6147]"
            size="lg"
          >
            Open Course Editor
          </Button>
        </div>
      </div>
    </div>
  )
}
