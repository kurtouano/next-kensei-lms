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

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#4a7c59] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Course Ready to Edit</h3>
            <p className="text-gray-600">"{courseData?.title}" is loaded and ready for editing</p>
          </div>
          
          {/* Course Stats */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7c59] mb-1">
                {modules?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7c59] mb-1">
                {modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7c59] mb-1">
                {modules?.reduce((acc, mod) => acc + (mod.quiz?.questions?.length || 0), 0) || 0}
              </div>
              <div className="text-sm text-gray-600">Quiz Questions</div>
            </div>
          </div>
          
          {/* Course Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Level</div>
                <div className="font-medium text-gray-900">{courseData?.level || 'Not set'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Price</div>
                <div className="font-medium text-gray-900">${courseData?.price || 0}</div>
              </div>
            </div>
            
            {courseData?.description && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">Description</div>
                <p className="text-gray-700 leading-relaxed">{courseData.description}</p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Button
              onClick={handleEditCourse}
              className="bg-[#4a7c59] hover:bg-[#3a6147] text-white px-8 py-3 rounded-lg font-medium"
              size="lg"
            >
              Open Course Editor
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
