// hooks/useSubmission.js
import { useState, useCallback } from "react"

export const useSubmission = (courseData, modules, validateForm, setCurrentStep) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

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

      const response = await fetch('/api/instructor/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })

      const result = await response.json()

      if (result.success) {
        alert(isDraft ? 'Course saved as draft!' : 'Course published successfully!')
      } else {
        throw new Error(result.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving course: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [courseData, modules, validateForm])

  return {
    isSubmitting,
    handleSubmit
  }
}