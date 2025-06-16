// Clear validation error for specific field// hooks/useValidation.js
import { useState, useCallback } from "react"
import { AlertCircle } from "lucide-react"

export const useValidation = (courseData, modules) => {
  const [validationErrors, setValidationErrors] = useState({})
  const [showValidation, setShowValidation] = useState(false)

  // Validate specific step
  const validateStep = useCallback((step) => {
    const errors = {}
    
    if (step === 0) {
      // Course Details validation
      if (!courseData.title.trim()) errors.title = "Course title is required"
      if (!courseData.shortDescription.trim()) errors.shortDescription = "Short description is required"
      if (!courseData.fullDescription.trim()) errors.fullDescription = "Full description is required"
      if (!courseData.level || courseData.level === "") errors.level = "Level is required"
      if (!courseData.thumbnail) errors.thumbnail = "Course thumbnail is required"
      if (!courseData.previewVideoUrl) errors.previewVideoUrl = "Preview video is required"
      if (courseData.price <= 0) errors.price = "Price must be greater than 0"
      
      // Check highlights
      const validHighlights = courseData.highlights.filter(h => h.description.trim())
      if (validHighlights.length === 0) errors.highlights = "At least one highlight is required"
      
      // Check tags
      const validTags = courseData.tags.filter(tag => tag.trim())
      if (validTags.length === 0) errors.tags = "At least one tag is required"
    }
      
    if (step === 1) {
      // Modules & Lessons validation
      modules.forEach((module, moduleIndex) => {
        if (!module.title.trim()) {
          errors[`module_${moduleIndex}_title`] = `Module ${moduleIndex + 1} title is required`
        }
        
        module.lessons.forEach((lesson, lessonIndex) => {
          if (!lesson.title.trim()) {
            errors[`module_${moduleIndex}_lesson_${lessonIndex}_title`] = 
              `Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1} title is required`
          }
          if (!lesson.videoUrl) {
            errors[`module_${moduleIndex}_lesson_${lessonIndex}_video`] = 
              `Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1} video is required`
          }
          
          // Validate resources - if file is uploaded, title is required
          lesson.resources.forEach((resource, resourceIndex) => {
            if (resource.fileUrl && !resource.title.trim()) {
              errors[`module_${moduleIndex}_lesson_${lessonIndex}_resource_${resourceIndex}_title`] = 
                `Resource ${resourceIndex + 1} in Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1} needs a title`
            }
          })
        })
      })
    }
    
    if (step === 2) {
      // Quiz validation
      modules.forEach((module, moduleIndex) => {
        if (!module.quiz.title.trim()) {
          errors[`quiz_${moduleIndex}_title`] = `Quiz title for Module ${moduleIndex + 1} is required`
        }
        
        module.quiz.questions.forEach((question, questionIndex) => {
          if (!question.question.trim()) {
            errors[`quiz_${moduleIndex}_question_${questionIndex}`] = 
              `Question ${questionIndex + 1} in Module ${moduleIndex + 1} is required`
          }
          
          const hasValidOptions = question.options.some(opt => opt.text.trim())
          if (!hasValidOptions) {
            errors[`quiz_${moduleIndex}_question_${questionIndex}_options`] = 
              `Question ${questionIndex + 1} in Module ${moduleIndex + 1} needs at least one option`
          }
          
          const hasCorrectAnswer = question.options.some(opt => opt.isCorrect && opt.text.trim())
          if (!hasCorrectAnswer) {
            errors[`quiz_${moduleIndex}_question_${questionIndex}_correct`] = 
              `Question ${questionIndex + 1} in Module ${moduleIndex + 1} needs a correct answer`
          }
        })
      })
    }
    
    return errors
  }, [courseData, modules])

  // Validate entire form and return first error step
  const validateForm = useCallback(() => {
    const steps = 3 // We have 4 steps, but we validate first 3
    
    // Find the first step with errors
    for (let step = 0; step < steps; step++) {
      const stepErrors = validateStep(step)
      if (Object.keys(stepErrors).length > 0) {
        setShowValidation(true)
        setValidationErrors(stepErrors) // Only show errors for the problematic step
        
        const stepNames = ["Course Details", "Modules & Lessons", "Quizzes"]
        return {
          isValid: false,
          firstErrorStep: step,
          stepName: stepNames[step]
        }
      }
    }

    // All steps are valid
    setValidationErrors({})
    return { isValid: true }
  }, [validateStep])

  // Validate current step only (for navigation)
  const validateCurrentStep = useCallback((currentStep) => {
    const stepErrors = validateStep(currentStep)
    setValidationErrors(stepErrors)
    setShowValidation(Object.keys(stepErrors).length > 0)
    return Object.keys(stepErrors).length === 0
  }, [validateStep])
  const clearValidationError = useCallback((errorKey) => {
    if (showValidation && validationErrors[errorKey]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[errorKey]
        return newErrors
      })
    }
  }, [validationErrors, showValidation])

  // Render validation error component
  const renderValidationError = useCallback((errorKey) => {
    if (showValidation && validationErrors[errorKey]) {
      return (
        <div className="flex items-center mt-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          {validationErrors[errorKey]}
        </div>
      )
    }
    return null
  }, [validationErrors, showValidation])

  return {
    validationErrors,
    showValidation,
    setShowValidation,
    setValidationErrors,
    validateStep,
    validateCurrentStep,
    validateForm,
    clearValidationError,
    renderValidationError
  }
}