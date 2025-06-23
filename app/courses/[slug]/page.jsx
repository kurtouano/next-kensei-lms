// Fixed page.jsx - Allow non-logged in users to view course preview
"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Import custom hooks
import { useProgress, useLessonData, useQuiz, useReviews, useEnrollmentCheck, useCourseLike, useQA } from "./hooks/useCoursePreviewHook"

// Import components
import { VideoPlayer } from "./components/VideoPlayer"
import { QuizSection } from "./components/Quiz"
import { ReviewSection } from "./components/Reviews"
import QASection from "./components/QASection"
import { CourseSidebar } from "./components/CourseSidebar"
import { CourseInfo } from "./components/CourseInfo"
import { ModuleCompleteNotif } from "./components/ModuleCompleteNotif"
import { EnrollmentPrompt } from "./components/EnrollmentPrompt"

// ============ LOADING & ERROR LAYOUTS ============

const LoadingLayout = memo(function LoadingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={false} />
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
      <Header isLoggedIn={false} />
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
  const { data: session, status } = useSession()
  
  // FIXED: Determine if user is logged in based on session status, not just session existence
  const isLoggedIn = status === "authenticated" && !!session?.user
  const isSessionLoading = status === "loading"
  
  // Core hooks - these should work regardless of login status
  const { lessonData, loading: lessonLoading, error: lessonError } = useLessonData(lessonSlug)
  
  // FIXED: Only run enrollment check if user is logged in
  const { isEnrolled, loading: enrollmentLoading, checkEnrollment } = useEnrollmentCheck(
    isLoggedIn ? lessonData?.id : null
  )
  
  // FIXED: Only run progress tracking if user is logged in
  const { progress, loading: progressLoading, updateLessonProgress, updateVideoProgress, updateModuleProgress, getLessonCurrentTime } = useProgress(
    isLoggedIn ? lessonSlug : null
  )
  
  // FIXED: Only run like functionality if user is logged in
  const { likeState, toggleLike } = useCourseLike(
    isLoggedIn ? lessonSlug : null, 
    isLoggedIn ? session : null
  )
  
  // FIXED: Only run Q&A functionality if user is logged in
  const { 
    qaState, 
    fetchQuestions, 
    loadMoreQuestions,
    submitQuestion, 
    deleteQuestion, 
    updateQuestion, 
    submitComment, 
    deleteComment, 
    updateComment, 
    toggleQuestionLike, 
    toggleForm: toggleQAForm 
  } = useQA(
    isLoggedIn ? lessonSlug : null, 
    isLoggedIn ? session : null
  )
  
  // Navigation state
  const [activeModule, setActiveModule] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])

  // FIXED: Only run quiz hook if user is logged in
  const { quizState, currentQuiz, existingScore, startQuiz, selectAnswer, submitQuiz, retryQuiz, showQuiz, hideQuiz } = useQuiz(
    lessonData, 
    activeModule, 
    isLoggedIn ? updateModuleProgress : null, 
    moduleQuizCompleted
  )
  
  // FIXED: Only run reviews hook if user is logged in
  const { reviewsState, fetchReviews, submitReview, deleteReview, updateReview, toggleForm } = useReviews(
    lessonSlug, 
    isLoggedIn ? session : null
  )

  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState('reviews')
  
  // FIXED: Add a flag to prevent multiple initial loads
  const [hasInitializedQA, setHasInitializedQA] = useState(false)

  // ============ EFFECTS ============

  // FIXED: Check enrollment only when lesson data loads AND user is logged in
  useEffect(() => {
    if (lessonData?.id && isLoggedIn) {
      checkEnrollment()
    }
  }, [lessonData?.id, isLoggedIn, checkEnrollment])

  // FIXED: Sync progress data with local state only if user is logged in
  useEffect(() => {
    if (isLoggedIn && progress.completedLessons.length > 0) {
      setCompletedItems(progress.completedLessons)
    }
  }, [isLoggedIn, progress.completedLessons])

  useEffect(() => {
    if (isLoggedIn && progress.completedModules.length > 0 && lessonData?.modules) {
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
  }, [isLoggedIn, progress.completedModules, lessonData])

  // FIXED: Set initial active video - allow preview for non-logged users
  useEffect(() => {
    if (lessonData && !activeVideoId) {
      if (!isLoggedIn && lessonData.previewVideoUrl) {
        // Non-logged users can only see preview
        setActiveVideoId("preview")
      } else if (!isLoggedIn && !lessonData.previewVideoUrl) {
        // No preview available for non-logged users, show first video but locked
        if (lessonData.modules?.length > 0) {
          const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
          if (firstVideo) setActiveVideoId(firstVideo.id)
        }
      } else if (isLoggedIn && !isEnrolled && lessonData.previewVideoUrl) {
        // Logged in but not enrolled, show preview
        setActiveVideoId("preview")
      } else if (isLoggedIn && isEnrolled && lessonData.modules?.length > 0) {
        // Logged in and enrolled, show first actual video
        const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [lessonData, activeVideoId, isLoggedIn, isEnrolled])

  // FIXED: Fetch reviews and questions when lesson data loads - work for all users
  useEffect(() => {
    if (lessonData && !hasInitializedQA) {
      // Always fetch reviews (works for non-logged users too)
      fetchReviews()
      
      // Only fetch questions if user is logged in
      if (isLoggedIn) {
        fetchQuestions()
      }
      
      setHasInitializedQA(true)
    }
  }, [lessonData, hasInitializedQA, isLoggedIn, fetchReviews, fetchQuestions])

  // ============ COMPUTED VALUES ============

  const activeItem = useMemo(() => {
    if (!lessonData) return null
    
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
    if (!isLoggedIn || !lessonData?.modules?.[activeModule]) return false
    const moduleItems = lessonData.modules[activeModule].items
    return moduleItems.every(item => completedItems.includes(item.id))
  }, [isLoggedIn, lessonData, activeModule, completedItems])

  const currentModuleQuizCompleted = useMemo(() => {
    if (!isLoggedIn) return false
    return moduleQuizCompleted.some(completed => completed.moduleIndex === activeModule)
  }, [isLoggedIn, moduleQuizCompleted, activeModule])

  // ============ EVENT HANDLERS ============

  const handleSelectItem = useCallback((itemId, moduleIndex) => {
    // FIXED: Allow preview selection for non-logged users
    if (!isLoggedIn && itemId !== "preview") {
      return // Non-logged users can only access preview
    }
    
    if (isLoggedIn && !isEnrolled && itemId !== "preview") {
      return // Logged in but not enrolled users can only access preview
    }
    
    setActiveVideoId(itemId)
    setActiveModule(moduleIndex)
  }, [isLoggedIn, isEnrolled])

  const handleToggleCompletion = useCallback(async (itemId, e) => {
    e.stopPropagation()
    
    // FIXED: Only allow completion tracking for logged in enrolled users
    if (!isLoggedIn || !isEnrolled) return
    
    const isCurrentlyCompleted = completedItems.includes(itemId)
    const newCompletionState = !isCurrentlyCompleted
    
    setCompletedItems(prev => 
      newCompletionState 
        ? [...prev, itemId] 
        : prev.filter(id => id !== itemId)
    )
    
    const success = await updateLessonProgress(itemId, newCompletionState)
    
    if (!success) {
      setCompletedItems(prev => 
        isCurrentlyCompleted 
          ? [...prev, itemId] 
          : prev.filter(id => id !== itemId)
      )
      alert('Failed to update progress. Please try again.')
    }
  }, [isLoggedIn, isEnrolled, completedItems, updateLessonProgress])

  const handleNextModule = useCallback(() => {
    if (quizState.score >= 70 || existingScore >= 70) {
      hideQuiz()
      
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

  // Tab and scroll handlers
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
  }, [])

  const handleScrollToSection = useCallback((section) => {
    const element = document.getElementById(`${section}-section`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ============ LOADING STATES ============

  // FIXED: Show loading only when session is loading OR lesson is loading
  // Don't wait for session if it's not loading
  if (isSessionLoading || lessonLoading) {
    return <LoadingLayout />
  }

  // FIXED: Only wait for progress and enrollment if user is logged in
  if (isLoggedIn && (progressLoading || enrollmentLoading)) {
    return <LoadingLayout />
  }

  if (lessonError || !lessonData) {
    return <ErrorLayout error={lessonError || "Failed to load lesson data"} />
  }

  // ============ MAIN RENDER ============

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={isLoggedIn} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row">
            
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3 lg:pr-4">
              {quizState.showModuleQuiz ? (
                isLoggedIn && isEnrolled ? (
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
                    existingScore={existingScore}
                  />
                ) : (
                  <EnrollmentPrompt course={lessonData} />
                )
              ) : (
                <>
                  <VideoPlayer 
                    activeItem={activeItem} 
                    currentTime={isLoggedIn && isEnrolled ? getLessonCurrentTime(activeItem?.id) : 0}
                    onProgressUpdate={isLoggedIn && isEnrolled ? updateVideoProgress : null}
                    isEnrolled={isEnrolled}
                  />
                  
                  {/* FIXED: Show enrollment prompt for non-logged users too */}
                  {(!isLoggedIn || !isEnrolled) && (
                    <EnrollmentPrompt course={lessonData} />
                  )}
                  
                  {isLoggedIn && isEnrolled && currentModuleCompleted && !currentModuleQuizCompleted && (
                    <ModuleCompleteNotif onTakeQuiz={showQuiz} />
                  )}

                  <CourseInfo 
                    lesson={lessonData}
                    showFullDescription={showFullDescription}
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                    progress={isLoggedIn && isEnrolled ? progress.courseProgress || 0 : 0}
                    isEnrolled={isEnrolled}
                    likeState={likeState}
                    onToggleLike={toggleLike}
                    isLoggedIn={isLoggedIn}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onScrollToSection={handleScrollToSection}
                  />

                  {/* Conditional rendering based on active tab */}
                  {activeTab === 'reviews' && (
                    <div id="reviews-section">
                      <ReviewSection
                        reviewsState={reviewsState}
                        isLoggedIn={isLoggedIn}
                        onSubmitReview={submitReview}
                        onDeleteReview={deleteReview}
                        onUpdateReview={updateReview}
                        onToggleForm={toggleForm}
                        isEnrolled={isEnrolled}
                      />
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div id="questions-section">
                      <QASection
                        qaState={qaState}
                        isLoggedIn={isLoggedIn}
                        onSubmitQuestion={submitQuestion}
                        onDeleteQuestion={deleteQuestion}
                        onUpdateQuestion={updateQuestion}
                        onToggleForm={toggleQAForm}
                        onSubmitComment={submitComment}
                        onDeleteComment={deleteComment}
                        onUpdateComment={updateComment}
                        onToggleLike={toggleQuestionLike}
                        onLoadMore={loadMoreQuestions}
                        isEnrolled={isEnrolled}
                        userRole={session?.user?.role || 'student'}
                        courseData={lessonData} // Pass course data for enrollment
                      />
                    </div>
                  )}
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
                moduleQuizCompleted={moduleQuizCompleted.map(m => m.moduleIndex)}
                currentModuleCompleted={currentModuleCompleted}
                showModuleQuiz={quizState.showModuleQuiz}
                onSelectItem={handleSelectItem}
                onToggleCompletion={handleToggleCompletion}
                onTakeQuiz={showQuiz}
                onBackToModule={handleBackToModule}
                isEnrolled={isEnrolled}
                previewVideoUrl={lessonData.previewVideoUrl}
                courseData={lessonData}
                progress={progress}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}