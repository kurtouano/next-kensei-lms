"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

// Components - Direct imports
import ProgressSteps from "./components/ProgressSteps"
import ErrorSummary from "./components/ErrorSummary"
import CourseDetailsStep from "./components/CourseDetailsStep"
import ModulesLessonsStep from "./components/ModulesLessonsStep"
import QuizzesStep from "./components/QuizzesStep"
import ReviewStep from "./components/ReviewStep"

// Hooks - Direct imports
import { useCourseData } from "./hooks/useCourseData"
import { useModules } from "./hooks/useModules"
import { useValidation } from "./hooks/useValidation"
import { useFileUpload } from "./hooks/useFileUpload"
import { useSubmission } from "./hooks/useSubmission"

export default function CreateCourseInterface() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editCourseId, setEditCourseId] = useState(null)
  
  // Custom hooks
  const { courseData, updateCourseData, updateCourseArray, setCourseData } = useCourseData()
  const { modules, moduleHandlers, setModules } = useModules()
  const { validationErrors, showValidation, setShowValidation, setValidationErrors, validateStep, validateCurrentStep, validateForm, renderValidationError } = useValidation(courseData, modules)
  const { uploadingFiles, uploadProgress, handleFileUpload } = useFileUpload()
  const { isSubmitting, handleSubmit } = useSubmission(courseData, modules, validateForm, setCurrentStep, isEditMode, editCourseId)

  // Check for edit data on mount
  useEffect(() => {
    const editData = sessionStorage.getItem('editCourseData')
    if (editData) {
      try {
        const { courseData: editCourseData, modules: editModules, courseId, isEdit } = JSON.parse(editData)
        
        console.log('🔄 Loading edit data:', { editCourseData, editModules, courseId })
        
        // Set edit mode
        setIsEditMode(isEdit)
        setEditCourseId(courseId)
        
        // Load the data
        setCourseData(editCourseData)
        setModules(editModules)
        
        // Clear sessionStorage
        sessionStorage.removeItem('editCourseData')
        
        console.log('✅ Edit mode activated for course:', courseId)
      } catch (error) {
        console.error('❌ Error loading edit data:', error)
      }
    }
  }, [setCourseData, setModules])

  // Constants
  const steps = useMemo(() => ["Course Details", "Modules & Lessons", "Quizzes", isEditMode ? "Review & Update" : "Review & Publish"], [isEditMode])

  // Navigation handlers
  const goToPreviousStep = () => {
    // Clear validation when going backwards
    setValidationErrors({})
    setShowValidation(false)
    setCurrentStep(prev => Math.max(0, prev - 1))
  }
  
  const goToNextStep = () => {
    // Optional: Validate current step before proceeding
    // if (!validateCurrentStep(currentStep)) return
    
    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))
  }

  // Check if current step can proceed
  const canProceedToNextStep = useMemo(() => true, []) // Always allow proceeding for now

  // Computed values
  const totalLessons = useMemo(() => 
    modules.reduce((acc, module) => acc + module.lessons.length, 0), 
    [modules]
  )

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {isEditMode && (
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="outline"
                onClick={() => router.push('/instructor/dashboard')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
          )}
          <h1 className="text-3xl font-bold text-[#2c3e2d]">
            {isEditMode ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-[#4a7c59]">
            {isEditMode ? 'Update your course details and content' : 'Build your Japanese learning course step by step'}
          </p>
          {isEditMode && (
            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md inline-block">
              🔄 Edit Mode: {courseData.title || 'Loading...'}
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <ProgressSteps 
          steps={steps}
          currentStep={currentStep}
          showValidation={showValidation}
          validateStep={validateStep}
        />

        {/* Error Summary */}
        <ErrorSummary 
          showValidation={showValidation}
          validationErrors={validationErrors}
        />

        {/* Step Content */}
        {currentStep === 0 && (
          <CourseDetailsStep
            courseData={courseData}
            updateCourseData={updateCourseData}
            updateCourseArray={updateCourseArray}
            uploadingFiles={uploadingFiles}
            uploadProgress={uploadProgress}
            handleFileUpload={handleFileUpload}
            validationErrors={validationErrors}
            showValidation={showValidation}
            renderValidationError={renderValidationError}
          />
        )}

        {currentStep === 1 && (
          <ModulesLessonsStep
            modules={modules}
            moduleHandlers={moduleHandlers}
            uploadingFiles={uploadingFiles}
            uploadProgress={uploadProgress}
            handleFileUpload={handleFileUpload}
            validationErrors={validationErrors}
            showValidation={showValidation}
            renderValidationError={renderValidationError}
          />
        )}

        {currentStep === 2 && (
          <QuizzesStep
            modules={modules}
            moduleHandlers={moduleHandlers}
            validationErrors={validationErrors}
            showValidation={showValidation}
            renderValidationError={renderValidationError}
          />
        )}

        {currentStep === 3 && (
          <ReviewStep
            courseData={courseData}
            modules={modules}
            totalLessons={totalLessons}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
            isEditMode={isEditMode}
          />
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={goToNextStep}
            disabled={currentStep === steps.length - 1 || !canProceedToNextStep}
            className="bg-[#4a7c59] hover:bg-[#3a6147]"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}
