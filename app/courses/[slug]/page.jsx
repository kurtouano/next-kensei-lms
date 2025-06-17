// Updated page.jsx - Key changes to quiz hook usage
"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Import custom hooks
import { useProgress, useLessonData, useQuiz, useReviews, useEnrollmentCheck } from "./hooks/useCoursePreviewHook"

// Import components
import { VideoPlayer } from "./components/VideoPlayer"
import { QuizSection } from "./components/Quiz"
import { ReviewSection } from "./components/Reviews"
import { CourseSidebar } from "./components/CourseSidebar"
import { CourseInfo } from "./components/CourseInfo"
import { ModuleCompleteNotif } from "./components/ModuleCompleteNotif"
import { EnrollmentPrompt } from "./components/EnrollmentPrompt"

// ============ LOADING & ERROR LAYOUTS ============

const LoadingLayout = memo(function LoadingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={true} />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a7c59] mx-auto mb-4"></div>
          <p className="text-[#5c6d5e]">Loading lesson data...</p>
        </div>
      </main>
      <Footer />
    </div>
  )
})

const ErrorLayout = memo(function ErrorLayout({ error }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={true} />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-[#5c6d5e]">{error}</p>
        </div>
      </main>
      <Footer />
    </div>
  )
})

// ============ MAIN COMPONENT ============

export default function LessonPage() {
  const params = useParams()
  const lessonSlug = params.slug
  const { data: session } = useSession()

  // Core hooks
  const { lessonData, loading: lessonLoading, error: lessonError } = useLessonData(lessonSlug)
  const { isEnrolled, loading: enrollmentLoading, checkEnrollment } = useEnrollmentCheck(lessonData?.id)
  const { progress, loading: progressLoading, updateLessonProgress, updateVideoProgress, updateModuleProgress, getLessonCurrentTime } = useProgress(lessonSlug)
  
  // Navigation state
  const [activeModule, setActiveModule] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])

  // UPDATED: Pass moduleQuizCompleted to quiz hook
  const { quizState, currentQuiz, existingScore, startQuiz, selectAnswer, submitQuiz, retryQuiz, showQuiz, hideQuiz } = useQuiz(lessonData, activeModule, updateModuleProgress, moduleQuizCompleted)
  
  const { reviewsState, fetchReviews, submitReview, deleteReview, updateReview, toggleForm } = useReviews(lessonSlug, session)

  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false)

  // ============ EFFECTS ============

  // Check enrollment when lesson data loads
  useEffect(() => {
    if (lessonData?.id && session?.user) {
      checkEnrollment()
    }
  }, [lessonData?.id, session?.user, checkEnrollment])

  // Sync progress data with local state
  useEffect(() => {
    if (progress.completedLessons.length > 0) {
      setCompletedItems(progress.completedLessons)
    }
  }, [progress.completedLessons])

  useEffect(() => {
    if (progress.completedModules.length > 0 && lessonData?.modules) {
      const completedModuleData = progress.completedModules
        .map(completedModule => {
          const moduleIndex = lessonData.modules.findIndex(module => module.id === completedModule.moduleId)
          return moduleIndex >= 0 ? {
            moduleIndex,
            moduleId: completedModule.moduleId,
            quizScore: completedModule.quizScore,
            completedAt: completedModule.completedAt
          } : null
        })
        .filter(Boolean)
      
      setModuleQuizCompleted(completedModuleData)
    }
  }, [progress.completedModules, lessonData])

  // Set initial active video - show preview for non-enrolled users
  useEffect(() => {
    if (lessonData && !activeVideoId) {
      if (!isEnrolled && lessonData.previewVideoUrl) {
        // Show preview video for non-enrolled users
        setActiveVideoId("preview")
      } else if (isEnrolled && lessonData.modules?.length > 0) {
        // Show first actual lesson for enrolled users
        const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [lessonData, activeVideoId, isEnrolled])

  // Fetch reviews when lesson data loads
  useEffect(() => {
    if (lessonData) {
      fetchReviews()
    }
  }, [lessonData, fetchReviews])

  // ============ COMPUTED VALUES ============

  const activeItem = useMemo(() => {
    if (!lessonData) return null
    
    // If showing preview video
    if (activeVideoId === "preview") {
      return {
        id: "preview",
        type: "video",
        title: "Course Preview",
        videoUrl: lessonData.previewVideoUrl,
        isPreview: true
      }
    }
    
    if (!lessonData?.modules) return null
    
    if (activeVideoId?.startsWith('resource-')) {
      const [, itemId, resourceIndex] = activeVideoId.split('-')
      
      for (const module of lessonData.modules) {
        const item = module.items?.find((item) => item.id === itemId)
        if (item?.resources?.[parseInt(resourceIndex)]) {
          return {
            ...item,
            type: "resource",
            selectedResource: item.resources[parseInt(resourceIndex)],
            resources: item.resources
          }
        }
      }
    }
    
    if (!activeVideoId) {
      const firstVideo = lessonData.modules[activeModule]?.items?.find(item => item.type === "video")
      return firstVideo || lessonData.modules[activeModule]?.items?.[0]
    }

    for (const module of lessonData.modules) {
      const item = module.items?.find(item => item.id === activeVideoId)
      if (item) return item
    }
    return null
  }, [lessonData, activeVideoId, activeModule])

  const currentModuleCompleted = useMemo(() => {
    if (!lessonData?.modules?.[activeModule]) return false
    const moduleItems = lessonData.modules[activeModule].items
    return moduleItems.every(item => completedItems.includes(item.id))
  }, [lessonData, activeModule, completedItems])

  // Check if current module quiz is completed
  const currentModuleQuizCompleted = useMemo(() => {
    return moduleQuizCompleted.some(completed => completed.moduleIndex === activeModule)
  }, [moduleQuizCompleted, activeModule])

  // ============ EVENT HANDLERS ============

  const handleSelectItem = useCallback((itemId, moduleIndex) => {
    // Prevent non-enrolled users from accessing course content
    if (!isEnrolled && itemId !== "preview") {
      return
    }
    
    setActiveVideoId(itemId)
    setActiveModule(moduleIndex)
  }, [isEnrolled])

  const handleToggleCompletion = useCallback(async (itemId, e) => {
    e.stopPropagation()
    
    // Only allow enrolled users to mark completion
    if (!isEnrolled) return
    
    const isCurrentlyCompleted = completedItems.includes(itemId)
    const newCompletionState = !isCurrentlyCompleted
    
    // Optimistic update
    setCompletedItems(prev => 
      newCompletionState 
        ? [...prev, itemId] 
        : prev.filter(id => id !== itemId)
    )
    
    // Save to database
    const success = await updateLessonProgress(itemId, newCompletionState)
    
    // Revert if failed
    if (!success) {
      setCompletedItems(prev => 
        isCurrentlyCompleted 
          ? [...prev, itemId] 
          : prev.filter(id => id !== itemId)
      )
      alert('Failed to update progress. Please try again.')
    }
  }, [completedItems, updateLessonProgress, isEnrolled])

  const handleNextModule = useCallback(() => {
    if (quizState.score >= 70 || existingScore >= 70) {
      hideQuiz()
      
      // Move to next module if available
      if (lessonData?.modules?.[activeModule + 1]) {
        setActiveModule(prev => prev + 1)
        const firstVideo = lessonData.modules[activeModule + 1].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [quizState.score, existingScore, lessonData, activeModule, hideQuiz])

  const handleBackToModule = useCallback(() => {
    hideQuiz()
  }, [hideQuiz])

  // ============ LOADING STATES ============

  if (lessonLoading || progressLoading || enrollmentLoading) {
    return <LoadingLayout />
  }

  if (lessonError || !lessonData) {
    return <ErrorLayout error={lessonError || "Failed to load lesson data"} />
  }

  // ============ MAIN RENDER ============

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={!!session?.user} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row">
            
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3 lg:pr-4">
              {quizState.showModuleQuiz ? (
                // Only show quiz if enrolled
                isEnrolled ? (
                  <QuizSection 
                    quiz={quizState.randomizedQuiz || currentQuiz}
                    quizState={quizState}
                    onStartQuiz={startQuiz}
                    onSelectAnswer={selectAnswer}
                    onSubmitQuiz={submitQuiz}
                    onRetryQuiz={retryQuiz}
                    onProceed={handleNextModule}
                    onBack={handleBackToModule}
                    isLastModule={activeModule === lessonData.modules.length - 1}
                    existingScore={existingScore} // Pass existing score
                  />
                ) : (
                  <EnrollmentPrompt course={lessonData} />
                )
              ) : (
                <>
                  <VideoPlayer 
                    activeItem={activeItem} 
                    currentTime={isEnrolled ? getLessonCurrentTime(activeItem?.id) : 0}
                    onProgressUpdate={isEnrolled ? updateVideoProgress : null}
                    isEnrolled={isEnrolled}
                  />
                  
                  {/* Show enrollment prompt for non-enrolled users */}
                  {!isEnrolled && (
                    <EnrollmentPrompt course={lessonData} />
                  )}
                  
                  {/* Only show module completion notification for enrolled users */}
                  {isEnrolled && currentModuleCompleted && !currentModuleQuizCompleted && (
                    <ModuleCompleteNotif onTakeQuiz={showQuiz} />
                  )}

                  <CourseInfo 
                    lesson={lessonData}
                    showFullDescription={showFullDescription}
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                    progress={isEnrolled ? progress.courseProgress || 0 : 0}
                    isEnrolled={isEnrolled}
                  />

                  <ReviewSection
                    reviewsState={reviewsState}
                    isLoggedIn={!!session?.user}
                    onSubmitReview={submitReview}
                    onDeleteReview={deleteReview}
                    onUpdateReview={updateReview}
                    onToggleForm={toggleForm}
                    isEnrolled={isEnrolled}
                  />
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="mt-4 w-full lg:mt-0 lg:w-1/3 lg:pl-4">
              <CourseSidebar
                modules={lessonData.modules}
                activeModule={activeModule}
                activeVideoId={activeVideoId}
                completedItems={completedItems}
                moduleQuizCompleted={moduleQuizCompleted.map(m => m.moduleIndex)} // Convert to indices for compatibility
                currentModuleCompleted={currentModuleCompleted}
                showModuleQuiz={quizState.showModuleQuiz}
                onSelectItem={handleSelectItem}
                onToggleCompletion={handleToggleCompletion}
                onTakeQuiz={showQuiz}
                onBackToModule={handleBackToModule}
                isEnrolled={isEnrolled}
                previewVideoUrl={lessonData.previewVideoUrl}
                courseData={lessonData}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}