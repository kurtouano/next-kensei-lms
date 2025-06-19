"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { Header } from "@/components/header"
import { useParams, useRouter } from "next/navigation"

// Import components from the create-course page directly
// We'll need to move the components to a shared location or import from the page
// For now, let's create simplified components here

export default function EditCourse() {
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

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header/>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-[#4a7c59]" />
            <span className="ml-2 text-[#4a7c59]">Loading course data...</span>
          </div>
        </div>
      </>
    )
  }

  // Error state
  if (loadError) {
    return (
      <>
        <Header/>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Course</h2>
            <p className="text-gray-600 mb-4">{loadError}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Course ID: {courseId}</p>
              <Button onClick={() => router.push('/instructor/dashboard')}>
                Back to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="ml-2"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  // Success state - redirect to create-course with data
  if (courseData && modules) {
    // For now, let's redirect to create-course and pass the data
    // Later we can build a proper edit interface
    return (
      <>
        <Header/>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-[#2c3e2d] mb-4">Course Data Loaded</h1>
            <p className="text-[#4a7c59] mb-6">Course "{courseData.title}" loaded successfully!</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left max-w-2xl mx-auto">
              <h3 className="font-bold mb-4">Course Information:</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Title:</strong> {courseData.title}</p>
                <p><strong>Level:</strong> {courseData.level}</p>
                <p><strong>Price:</strong> ${courseData.price}</p>
                <p><strong>Modules:</strong> {modules.length}</p>
                <p><strong>Total Lessons:</strong> {modules.reduce((acc, mod) => acc + mod.lessons.length, 0)}</p>
                <p><strong>Published:</strong> {courseData.isPublished ? 'Yes' : 'No'}</p>
              </div>
              
              <h4 className="font-bold mt-4 mb-2">Modules:</h4>
              <ul className="text-sm space-y-1">
                {modules.map((module, index) => (
                  <li key={index}>
                    <strong>Module {index + 1}:</strong> {module.title} 
                    <span className="text-gray-500">
                      ({module.lessons.length} lessons, {module.quiz.questions.length} quiz questions)
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-x-4">
              <Button onClick={() => router.push('/instructor/dashboard')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button 
                className="bg-[#4a7c59] hover:bg-[#3a6147]"
                onClick={() => {
                  // Store data in sessionStorage for the create-course page to pick up
                  sessionStorage.setItem('editCourseData', JSON.stringify({
                    courseData,
                    modules,
                    courseId,
                    isEdit: true
                  }))
                  router.push('/instructor/create-course')
                }}
              >
                Continue Editing
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return null
}