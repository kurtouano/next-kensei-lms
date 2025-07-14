// Updated page.jsx - Added auto-completion and auto-next functionality
"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"

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
import { InstructorPreviewToggle } from "./components/InstructorPreviewToggle"

// ============ LOADING & ERROR LAYOUTS ============

const LoadingLayout = memo(function LoadingLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a7c59] mx-auto mb-4"></div>
          <p className="text-[#5c6d5e]">Loading lesson data...</p>
        </div>
      </main>
    </div>
  )
})

const ErrorLayout = memo(function ErrorLayout({ error }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-[#5c6d5e]">{error}</p>
        </div>
      </main>
    </div>
  )
})

// ============ CUSTOM HOOK FOR DEBOUNCED LOADING ============
function useDebouncedLoading(isLoading, delay = 150) {
  const [debouncedLoading, setDebouncedLoading] = useState(isLoading)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (isLoading) {
      setDebouncedLoading(true)
    } else {
      timeoutRef.current = setTimeout(() => {
        setDebouncedLoading(false)
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [isLoading, delay])

  return debouncedLoading
}

// ============ MAIN COMPONENT ============

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const lessonSlug = params.slug
  const { data: session, status } = useSession()
  
  // Check if this is instructor preview mode
  const isInstructorPreview = searchParams.get('instructor-preview') === 'true'
  
  // Instructor preview mode state
  const [instructorPreviewMode, setInstructorPreviewMode] = useState('enrolled')
  
  const isLoggedIn = status === "authenticated" && !!session?.user
  const isSessionLoading = status === "loading"
  
  // Core hooks
  const { lessonData, loading: lessonLoading, error: lessonError } = useLessonData(lessonSlug)
  
  // Helper function to check if user is instructor of this course
  const isInstructorOwned = useMemo(() => {
    if (!isLoggedIn || !lessonData) return false
    
    if (session?.user?.role === 'admin') return true
    
    return lessonData.instructor?.email === session.user.email || 
          lessonData.instructorId === session.user.id
  }, [isLoggedIn, lessonData, session])

  // Only run enrollment check if user is logged in and not in instructor preview mode
  const { isEnrolled: actualIsEnrolled, loading: enrollmentLoading, checkEnrollment } = useEnrollmentCheck(
    (isLoggedIn && !isInstructorPreview) ? lessonData?.id : null
  )

  // Determine effective enrollment status
  const effectiveIsEnrolled = useMemo(() => {
    if (isInstructorPreview && isInstructorOwned) {
      return instructorPreviewMode === 'enrolled'
    }
    return actualIsEnrolled
  }, [isInstructorPreview, isInstructorOwned, instructorPreviewMode, actualIsEnrolled])

  // Determine effective login status
  const effectiveIsLoggedIn = useMemo(() => {
    if (isInstructorPreview && isInstructorOwned) {
      return instructorPreviewMode === 'enrolled'
    }
    return isLoggedIn
  }, [isInstructorPreview, isInstructorOwned, instructorPreviewMode, isLoggedIn])
  
  // Progress hook with initialization tracking
  const { 
    progress, 
    loading: progressLoading, 
    isInitialized: progressInitialized,
    updateLessonProgress, 
    updateVideoProgress, 
    updateModuleProgress, 
    getLessonCurrentTime 
  } = useProgress(
    (effectiveIsLoggedIn && effectiveIsEnrolled) ? lessonSlug : null
  )
  
  // Only run like functionality if user is logged in
  const { likeState, toggleLike } = useCourseLike(
    effectiveIsLoggedIn ? lessonSlug : null, 
    effectiveIsLoggedIn ? session : null
  )
  
  // Only run Q&A functionality if user is logged in
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
    effectiveIsLoggedIn ? lessonSlug : null, 
    effectiveIsLoggedIn ? session : null
  )
  
  // Navigation state
  const [activeModule, setActiveModule] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])

  // NEW: Check if a module is accessible based on previous module completion
  const isModuleAccessible = useCallback((moduleIndex) => {
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled) return false
    
    if (moduleIndex === 0) return true
    
    const prevModuleIndex = moduleIndex - 1
    const prevModule = lessonData?.modules?.[prevModuleIndex]
    if (!prevModule) return false
    
    const isPrevModuleComplete = prevModule.items.every(item => completedItems.includes(item.id))
    const isPrevQuizPassed = moduleQuizCompleted.includes(prevModuleIndex)
    
    return isPrevModuleComplete && isPrevQuizPassed
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, lessonData?.modules, completedItems, moduleQuizCompleted])

  // NEW: Auto-cleanup locked module completions
  useEffect(() => {
    if (!lessonData?.modules || !effectiveIsLoggedIn || !effectiveIsEnrolled) return
    
    let needsCleanup = false
    const cleanedCompletedItems = [...completedItems]
    const cleanedModuleQuizCompleted = [...moduleQuizCompleted]
    
    // Check each module and clean up if it becomes inaccessible
    lessonData.modules.forEach((module, moduleIndex) => {
      const isAccessible = isModuleAccessible(moduleIndex)
      
      if (!isAccessible && moduleIndex > 0) {
        // Remove completed items from this locked module
        module.items.forEach(item => {
          const itemIndex = cleanedCompletedItems.indexOf(item.id)
          if (itemIndex > -1) {
            cleanedCompletedItems.splice(itemIndex, 1)
            needsCleanup = true
            console.log('🧹 Cleaning up completed item from locked module:', item.title)
          }
        })
        
        // Remove quiz completion from this locked module
        const quizIndex = cleanedModuleQuizCompleted.indexOf(moduleIndex)
        if (quizIndex > -1) {
          cleanedModuleQuizCompleted.splice(quizIndex, 1)
          needsCleanup = true
          console.log('🧹 Cleaning up quiz completion from locked module:', moduleIndex + 1)
        }
      }
    })
    
    if (needsCleanup) {
      console.log('🔧 Auto-cleaning locked module progress')
      setCompletedItems(cleanedCompletedItems)
      setModuleQuizCompleted(cleanedModuleQuizCompleted)
      
      // Sync cleanup with backend
      const cleanupBackend = async () => {
        try {
          const response = await fetch(`/api/courses/progress/${lessonSlug}/cleanup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              allowedLessons: cleanedCompletedItems,
              allowedModules: cleanedModuleQuizCompleted
            })
          })
          
          const data = await response.json()
          if (data.success && data.cleaned) {
            console.log('✅ Backend progress cleanup completed')
          }
        } catch (error) {
          console.error('❌ Failed to sync cleanup with backend:', error)
        }
      }
      
      // Delay backend sync to avoid race conditions
      setTimeout(cleanupBackend, 1000)
    }
  }, [completedItems, moduleQuizCompleted, lessonData?.modules, effectiveIsLoggedIn, effectiveIsEnrolled, isModuleAccessible, updateLessonProgress])

  // Only run quiz hook if user is logged in and enrolled
  const { quizState, currentQuiz, existingScore, startQuiz, selectAnswer, submitQuiz, retryQuiz, showQuiz, hideQuiz } = useQuiz(
    lessonData, 
    activeModule, 
    (effectiveIsLoggedIn && effectiveIsEnrolled) ? updateModuleProgress : null, 
    moduleQuizCompleted
  )
  
  // Only run reviews hook if user is logged in
  const { reviewsState, fetchReviews, submitReview, deleteReview, updateReview, toggleForm } = useReviews(
    lessonSlug, 
    effectiveIsLoggedIn ? session : null
  )

  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState('reviews')
  const [hasInitializedQA, setHasInitializedQA] = useState(false)

  // NEW: Auto-completion and auto-next functionality
  const handleAutoComplete = useCallback(async (lessonId) => {
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled || isInstructorPreview) return
    
    console.log('🎯 Auto-completing lesson:', lessonId)
    
    // Update UI immediately for better UX
    setCompletedItems(prev => {
      if (!prev.includes(lessonId)) {
        return [...prev, lessonId]
      }
      return prev
    })
    
    // Update database
    const success = await updateLessonProgress(lessonId, true)
    
    if (!success) {
      // Revert UI update if database update failed
      setCompletedItems(prev => prev.filter(id => id !== lessonId))
      console.error('Failed to auto-complete lesson')
    }
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, isInstructorPreview, updateLessonProgress])

  // NEW: Find next video in the course or check if quiz should be shown
  const getNextAction = useCallback(() => {
    if (!lessonData?.modules || !activeVideoId || activeVideoId === "preview") return null
    
    // Find current video position
    let currentModuleIndex = -1
    let currentItemIndex = -1
    
    for (let modIndex = 0; modIndex < lessonData.modules.length; modIndex++) {
      const module = lessonData.modules[modIndex]
      for (let itemIndex = 0; itemIndex < module.items.length; itemIndex++) {
        const item = module.items[itemIndex]
        if (item.id === activeVideoId && item.type === "video") {
          currentModuleIndex = modIndex
          currentItemIndex = itemIndex
          break
        }
      }
      if (currentModuleIndex !== -1) break
    }
    
    if (currentModuleIndex === -1) return null
    
    // Look for next video in current module
    const currentModule = lessonData.modules[currentModuleIndex]
    for (let i = currentItemIndex + 1; i < currentModule.items.length; i++) {
      if (currentModule.items[i].type === "video") {
        return {
          type: 'video',
          video: currentModule.items[i],
          moduleIndex: currentModuleIndex
        }
      }
    }
    
    // If no more videos in current module, check if quiz should be shown
    const allModuleItemsCompleted = currentModule.items.every(item => 
      completedItems.includes(item.id) || item.id === activeVideoId
    )
    
    // Check if current module has a quiz and if it should be triggered
    if (allModuleItemsCompleted && currentModule.quiz && currentModule.quiz.questions && currentModule.quiz.questions.length > 0) {
      return {
        type: 'quiz',
        moduleIndex: currentModuleIndex,
        module: currentModule
      }
    }
    
    // Look for first video in next modules
    for (let modIndex = currentModuleIndex + 1; modIndex < lessonData.modules.length; modIndex++) {
      const module = lessonData.modules[modIndex]
      for (let itemIndex = 0; itemIndex < module.items.length; itemIndex++) {
        const item = module.items[itemIndex]
        if (item.type === "video") {
          return {
            type: 'video',
            video: item,
            moduleIndex: modIndex
          }
        }
      }
    }
    
    return null
  }, [lessonData, activeVideoId, completedItems])

  const nextAction = getNextAction()

  // NEW: Auto-next handler - handles both videos and quizzes
  const handleAutoNext = useCallback(() => {
    if (!nextAction) return
    
    if (nextAction.type === 'video') {
      console.log('⏭️ Auto-advancing to next video:', nextAction.video.title)
      setActiveVideoId(nextAction.video.id)
      setActiveModule(nextAction.moduleIndex)
    } else if (nextAction.type === 'quiz') {
      console.log('📝 Auto-triggering module quiz for module:', nextAction.moduleIndex + 1)
      setActiveModule(nextAction.moduleIndex)
      showQuiz() // Automatically show the quiz
    }
  }, [nextAction, showQuiz])

  // Handle instructor preview mode toggle
  const handleTogglePreviewMode = useCallback((mode) => {
    setInstructorPreviewMode(mode)
    
    // Reset some state when switching modes
    setCompletedItems([])
    setModuleQuizCompleted([])
    setActiveVideoId(null)
    setHasInitializedQA(false)
    
    // Set appropriate initial video based on mode
    if (lessonData) {
      if (mode === 'guest' && lessonData.previewVideoUrl) {
        setActiveVideoId("preview")
      } else if (mode === 'enrolled' && lessonData.modules?.length > 0) {
        const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [lessonData])

  // ============ EFFECTS ============

  // Check enrollment only when lesson data loads AND user is logged in AND not in instructor preview
  useEffect(() => {
    if (lessonData?.id && isLoggedIn && !isInstructorPreview) {
      checkEnrollment()
    }
  }, [lessonData?.id, isLoggedIn, isInstructorPreview, checkEnrollment])

  // Sync progress data immediately when available
  useEffect(() => {
    if (effectiveIsLoggedIn && effectiveIsEnrolled && progressInitialized && progress) {
      setCompletedItems(progress.completedLessons || [])
      
      if (progress.completedModules && lessonData?.modules) {
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
        
        setModuleQuizCompleted(completedModuleData.map(m => m.moduleIndex))
      }
    } else if (!effectiveIsLoggedIn || !effectiveIsEnrolled) {
      setCompletedItems([])
      setModuleQuizCompleted([])
    }
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, progressInitialized, progress, lessonData?.modules])

  // Set initial active video
  useEffect(() => {
    if (lessonData && !activeVideoId) {
      if (!effectiveIsLoggedIn && lessonData.previewVideoUrl) {
        setActiveVideoId("preview")
      } else if (!effectiveIsLoggedIn && !lessonData.previewVideoUrl) {
        if (lessonData.modules?.length > 0) {
          const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
          if (firstVideo) setActiveVideoId(firstVideo.id)
        }
      } else if (effectiveIsLoggedIn && !effectiveIsEnrolled && lessonData.previewVideoUrl) {
        setActiveVideoId("preview")
      } else if (effectiveIsLoggedIn && effectiveIsEnrolled && lessonData.modules?.length > 0) {
        const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [lessonData, activeVideoId, effectiveIsLoggedIn, effectiveIsEnrolled])

  // Fetch reviews and questions when lesson data loads
  useEffect(() => {
    if (lessonData && !hasInitializedQA) {
      fetchReviews()
      
      if (effectiveIsLoggedIn) {
        fetchQuestions()
      }
      
      setHasInitializedQA(true)
    }
  }, [lessonData, hasInitializedQA, effectiveIsLoggedIn, fetchReviews, fetchQuestions])

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
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled || !lessonData?.modules?.[activeModule]) return false
    const moduleItems = lessonData.modules[activeModule].items
    return moduleItems.every(item => completedItems.includes(item.id))
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, lessonData, activeModule, completedItems])

  const currentModuleQuizCompleted = useMemo(() => {
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled) return false
    return moduleQuizCompleted.includes(activeModule)
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, moduleQuizCompleted, activeModule])

  // ============ ENHANCED LOADING STATE ============

  const rawIsDataLoading = useMemo(() => {
    if (isSessionLoading || lessonLoading) return true
    
    if (effectiveIsLoggedIn && !isInstructorPreview && enrollmentLoading) return true
    
    if (effectiveIsLoggedIn && effectiveIsEnrolled && !progressInitialized) return true
    
    return false
  }, [isSessionLoading, lessonLoading, effectiveIsLoggedIn, effectiveIsEnrolled, enrollmentLoading, progressInitialized, isInstructorPreview])

  const isDataLoading = useDebouncedLoading(rawIsDataLoading, 100)

  // ============ EVENT HANDLERS ============

  const handleSelectItem = useCallback((itemId, moduleIndex) => {
    // Allow preview selection for non-logged users and guest mode
    if (!effectiveIsLoggedIn && itemId !== "preview") {
      return
    }
    
    if (effectiveIsLoggedIn && !effectiveIsEnrolled && itemId !== "preview") {
      return
    }
    
    setActiveVideoId(itemId)
    setActiveModule(moduleIndex)
  }, [effectiveIsLoggedIn, effectiveIsEnrolled])

  const handleToggleCompletion = useCallback(async (itemId, e) => {
    e.stopPropagation()
    
    // Only allow completion tracking for logged in enrolled users (not instructor preview guest mode)
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled || (isInstructorPreview && instructorPreviewMode === 'guest')) return
    
    const isCurrentlyCompleted = completedItems.includes(itemId)
    const newCompletionState = !isCurrentlyCompleted
    
    setCompletedItems(prev => 
      newCompletionState 
        ? [...prev, itemId] 
        : prev.filter(id => id !== itemId)
    )
    
    // Only update database if not in instructor preview mode
    if (!isInstructorPreview) {
      const success = await updateLessonProgress(itemId, newCompletionState)
      
      if (!success) {
        setCompletedItems(prev => 
          isCurrentlyCompleted 
            ? [...prev, itemId] 
            : prev.filter(id => id !== itemId)
        )
        alert('Failed to update progress. Please try again.')
      }
    }
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, isInstructorPreview, instructorPreviewMode, completedItems, updateLessonProgress])

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

  // Show loading only when we're actually loading
  if (isDataLoading) {
    return <LoadingLayout />
  }

  if (lessonError || !lessonData) {
    return <ErrorLayout error={lessonError || "Failed to load lesson data"} />
  }

  console.log('🔍 INSTRUCTOR PREVIEW STATUS:', {
    isInstructorPreview,
    instructorPreviewMode, 
    isInstructorOwned,
    effectiveIsLoggedIn,
    effectiveIsEnrolled,
    actualIsEnrolled,
    sessionUserEmail: session?.user?.email,
    lessonInstructorEmail: lessonData?.instructor?.email
  })

  // ============ MAIN RENDER ============
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Instructor Preview Toggle */}
          {isInstructorPreview && isInstructorOwned && (
            <InstructorPreviewToggle
              previewMode={instructorPreviewMode}
              onTogglePreviewMode={handleTogglePreviewMode}
              courseTitle={lessonData.title}
              isInstructorOwned={isInstructorOwned}
              onBackToDashboard={() => router.push('/instructor/dashboard')}
            />
          )}

          <div className="flex flex-col lg:flex-row">
            
            {/* Main Content Area */}
            <div className="w-full lg:w-2/3 lg:pr-4">
              {quizState.showModuleQuiz ? (
                effectiveIsLoggedIn && effectiveIsEnrolled ? (
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
                  {/* NEW: Enhanced VideoPlayer with auto-completion and auto-next */}
                  <VideoPlayer 
                    activeItem={activeItem} 
                    currentTime={effectiveIsLoggedIn && effectiveIsEnrolled && !isInstructorPreview && progress ? getLessonCurrentTime(activeItem?.id) : 0}
                    onProgressUpdate={effectiveIsLoggedIn && effectiveIsEnrolled && !isInstructorPreview ? updateVideoProgress : null}
                    isEnrolled={effectiveIsEnrolled}
                    onAutoComplete={handleAutoComplete}
                    onAutoNext={handleAutoNext}
                    hasNextAction={!!nextAction}
                    nextActionTitle={nextAction?.type === 'video' ? nextAction.video.title : nextAction?.type === 'quiz' ? 'Module Quiz' : ""}
                    nextActionType={nextAction?.type}
                    moduleData={lessonData?.modules?.[activeModule]}
                    activeModule={activeModule}
                    completedItems={completedItems}
                  />
                  
                  {/* Show enrollment prompt for non-enrolled users */}
                  {(!effectiveIsLoggedIn || !effectiveIsEnrolled) && (
                    <EnrollmentPrompt course={lessonData} />
                  )}
                  
                  {effectiveIsLoggedIn && effectiveIsEnrolled && currentModuleCompleted && !currentModuleQuizCompleted && (
                    <ModuleCompleteNotif onTakeQuiz={showQuiz} />
                  )}

                  <CourseInfo 
                    lesson={lessonData}
                    showFullDescription={showFullDescription}
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                    progress={effectiveIsLoggedIn && effectiveIsEnrolled && progress ? progress.courseProgress || 0 : 0}
                    isEnrolled={effectiveIsEnrolled}
                    likeState={likeState}
                    onToggleLike={toggleLike}
                    isLoggedIn={effectiveIsLoggedIn}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    onScrollToSection={handleScrollToSection}
                  />

                  {/* Conditional rendering based on active tab */}
                  {activeTab === 'reviews' && (
                    <div id="reviews-section">
                      <ReviewSection
                        reviewsState={reviewsState}
                        isLoggedIn={effectiveIsLoggedIn}
                        onSubmitReview={submitReview}
                        onDeleteReview={deleteReview}
                        onUpdateReview={updateReview}
                        onToggleForm={toggleForm}
                        isEnrolled={effectiveIsEnrolled}
                      />
                    </div>
                  )}

                  {activeTab === 'questions' && (
                    <div id="questions-section">
                      <QASection
                        qaState={qaState}
                        isLoggedIn={effectiveIsLoggedIn}
                        onSubmitQuestion={submitQuestion}
                        onDeleteQuestion={deleteQuestion}
                        onUpdateQuestion={updateQuestion}
                        onToggleForm={toggleQAForm}
                        onSubmitComment={submitComment}
                        onDeleteComment={deleteComment}
                        onUpdateComment={updateComment}
                        onToggleLike={toggleQuestionLike}
                        onLoadMore={loadMoreQuestions}
                        isEnrolled={effectiveIsEnrolled}
                        userRole={session?.user?.role || 'student'}
                        courseData={lessonData}
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
                moduleQuizCompleted={moduleQuizCompleted}
                currentModuleCompleted={currentModuleCompleted}
                showModuleQuiz={quizState.showModuleQuiz}
                onSelectItem={handleSelectItem}
                onToggleCompletion={handleToggleCompletion}
                onTakeQuiz={showQuiz}
                onBackToModule={handleBackToModule}
                isEnrolled={effectiveIsEnrolled}
                previewVideoUrl={lessonData.previewVideoUrl}
                courseData={lessonData}
                progress={progress || { courseProgress: 0 }}
                isModuleAccessible={isModuleAccessible}
              />
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}