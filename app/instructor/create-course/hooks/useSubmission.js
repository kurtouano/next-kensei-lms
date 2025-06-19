// hooks/useSubmission.js - Updated with edit support
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"

export const useSubmission = (courseData, modules, validateForm, setCurrentStep, isEditMode = false, editCourseId = null) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Handle form submission
  const handleSubmit = useCallback(async (isDraft = false) => {
    const validationResult = validateForm()
    
    if (!validationResult.isValid) {
      // Navigate to the first step with errors
      if (setCurrentStep) {
        setCurrentStep(validationResult.firstErrorStep)
      }
      alert(`Please fix the validation errors in step ${validationResult.firstErrorStep + 1}: ${validationResult.stepName}`)
      return
    }

    setIsSubmitting(true)
    
    try {
      const finalData = {
        ...courseData,
        modules: modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            resources: lesson.resources.filter(r => r.fileUrl && r.title)
          }))
        })),
        isPublished: !isDraft,
        tags: courseData.tags.filter(tag => tag.trim() !== ''),
        highlights: courseData.highlights.filter(h => h.description.trim() !== ''),
        itemsReward: courseData.itemsReward.filter(item => item && item.trim() !== ''),
      }

      // Choose endpoint based on edit mode
      const endpoint = isEditMode 
        ? `/api/instructor/courses/${editCourseId}/edit`
        : '/api/instructor/create-course'
      
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })

      const result = await response.json()

      if (result.success) {
        const message = isEditMode 
          ? (isDraft ? 'Course updated and saved as draft!' : 'Course updated successfully!')
          : (isDraft ? 'Course saved as draft!' : 'Course published successfully!')
        
        alert(message)
        router.push('/instructor/dashboard')
      } else {
        throw new Error(result.error || `Failed to ${isEditMode ? 'update' : 'save'} course`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} course: ` + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [courseData, modules, validateForm, isEditMode, editCourseId, router])

  return {
    isSubmitting,
    handleSubmit
  }
}