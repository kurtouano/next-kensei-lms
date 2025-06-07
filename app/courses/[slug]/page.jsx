"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Import custom hooks
import { useProgress, useLessonData, useQuiz, useReviews } from "./hooks/useCoursePreviewHook"

// Import components
import { VideoPlayer } from "./components/VideoPlayer"
import { QuizSection } from "./components/Quiz"
import { ReviewSection } from "./components/Reviews"
import { CourseSidebar } from "./components/CourseSidebar"
import { CourseInfo } from "./components/CourseInfo"
import { ModuleCompleteNotif } from "./components/ModuleCompleteNotif"

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
  const { progress, loading: progressLoading, updateLessonProgress, updateVideoProgress, updateModuleProgress, getLessonCurrentTime } = useProgress(lessonSlug)
  
  // Navigation state
  const [activeModule, setActiveModule] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])

  // Specialized hooks
  const { quizState, currentQuiz, startQuiz, selectAnswer, submitQuiz, retryQuiz, showQuiz, hideQuiz } = useQuiz(lessonData, activeModule, updateModuleProgress)
  const { reviewsState, fetchReviews, submitReview, deleteReview, updateReview, toggleForm } = useReviews(lessonSlug, session)

  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false)

  // ============ EFFECTS ============

  // Sync progress data with local state
  useEffect(() => {
    if (progress.completedLessons.length > 0) {
      setCompletedItems(progress.completedLessons)
    }
  }, [progress.completedLessons])

  useEffect(() => {
    if (progress.completedModules.length > 0 && lessonData?.modules) {
      const completedModuleIndices = progress.completedModules
        .map(completedModule => 
          lessonData.modules.findIndex(module => module.id === completedModule.moduleId)
        )
        .filter(index => index >= 0)
      
      setModuleQuizCompleted(completedModuleIndices)
    }
  }, [progress.completedModules, lessonData])

  // Set initial active video
  useEffect(() => {
    if (lessonData?.modules?.length > 0 && !activeVideoId) {
      const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
      if (firstVideo) setActiveVideoId(firstVideo.id)
    }
  }, [lessonData, activeVideoId])

  // Fetch reviews when lesson data loads
  useEffect(() => {
    if (lessonData) {
      fetchReviews()
    }
  }, [lessonData, fetchReviews])

  // ============ COMPUTED VALUES ============

  const activeItem = useMemo(() => {
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

  // ============ EVENT HANDLERS ============

  const handleSelectItem = useCallback((itemId, moduleIndex) => {
    setActiveVideoId(itemId)
    setActiveModule(moduleIndex)
  }, [])

  const handleToggleCompletion = useCallback(async (itemId, e) => {
    e.stopPropagation()
    
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
  }, [completedItems, updateLessonProgress])

  const handleNextModule = useCallback(() => {
    if (quizState.score >= 70) {
      hideQuiz()
      
      // Add current module to completed quizzes
      setModuleQuizCompleted(prev => [...prev, activeModule])
      
      // Move to next module if available
      if (lessonData?.modules?.[activeModule + 1]) {
        setActiveModule(prev => prev + 1)
        const firstVideo = lessonData.modules[activeModule + 1].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [quizState.score, lessonData, activeModule, hideQuiz])

  const handleBackToModule = useCallback(() => {
    hideQuiz()
  }, [hideQuiz])

  // ============ LOADING STATES ============

  if (lessonLoading || progressLoading) {
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
                />
              ) : (
                <>
                  <VideoPlayer 
                    activeItem={activeItem} 
                    currentTime={getLessonCurrentTime(activeItem?.id)}
                    onProgressUpdate={updateVideoProgress}
                  />
                  
                  {currentModuleCompleted && !moduleQuizCompleted.includes(activeModule) && (
                    <ModuleCompleteNotif onTakeQuiz={showQuiz} />
                  )}

                  <CourseInfo 
                    lesson={lessonData}
                    showFullDescription={showFullDescription}
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                    progress={progress.courseProgress || 0}
                  />

                  <ReviewSection
                    reviewsState={reviewsState}
                    isLoggedIn={!!session?.user}
                    onSubmitReview={submitReview}
                    onDeleteReview={deleteReview}
                    onUpdateReview={updateReview}
                    onToggleForm={toggleForm}
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
                moduleQuizCompleted={moduleQuizCompleted}
                currentModuleCompleted={currentModuleCompleted}
                showModuleQuiz={quizState.showModuleQuiz}
                onSelectItem={handleSelectItem}
                onToggleCompletion={handleToggleCompletion}
                onTakeQuiz={showQuiz}
                onBackToModule={handleBackToModule}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}