// Updated page.jsx - Added auto-completion and auto-next functionality
"use client"

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useRouter } from "next/navigation"
import { CoursePageSkeleton } from "@/components/CourseSkeleton"

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
import { MobileCourseSidebar } from "./components/MobileCourseSidebar"
import { RewardModal } from "@/components/RewardModal"
import { Confetti } from "@/components/Confetti"
import { CertificateModal } from "@/components/certificate-modal"

// ============ LOADING & ERROR LAYOUTS ============

const LoadingLayout = memo(function LoadingLayout() {
  return <CoursePageSkeleton />
})

const ErrorLayout = memo(function ErrorLayout({ error, onRetry }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-red-500 text-lg mb-4">⚠️ Error</div>
          <p className="text-[#5c6d5e] mb-6">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-[#5c6d5e] text-white px-6 py-2 rounded-lg hover:bg-[#4a5a4b] transition-colors"
            >
              Try Again
            </button>
          )}
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
  const { lessonData, loading: lessonLoading, error: lessonError, retry: retryLessonData } = useLessonData(lessonSlug)
  
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
    updateModuleProgress: originalUpdateModuleProgress, 
    getLessonCurrentTime 
  } = useProgress(
    (effectiveIsLoggedIn && effectiveIsEnrolled) ? lessonSlug : null
  )
  
  // Debouncing mechanism for rapid completion toggles
  const pendingUpdates = useRef(new Map())
  const updateTimeouts = useRef(new Map())
  const [pendingItems, setPendingItems] = useState(new Set())
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      updateTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId))
      updateTimeouts.current.clear()
      pendingUpdates.current.clear()
    }
  }, [])
  
  // Custom updateModuleProgress that handles reward modal
  const updateModuleProgress = useCallback(async (moduleId, quizScore) => {
    const result = await originalUpdateModuleProgress(moduleId, quizScore)
    
    // Update local moduleQuizCompleted state immediately
    if (result?.success && result?.completedModules) {
      const updatedModuleQuizCompleted = result.completedModules.map(completedModule => {
        const moduleIndex = lessonData?.modules?.findIndex(module => module.id === completedModule.moduleId)
        return moduleIndex >= 0 ? {
          moduleIndex,
          moduleId: completedModule.moduleId,
          quizScore: completedModule.quizScore,
          completedAt: completedModule.completedAt
        } : null
      }).filter(Boolean)
      
      setModuleQuizCompleted(updatedModuleQuizCompleted)
    }
    
    // Check for course completion and trigger rewards
    if (result?.success && result?.courseCompleted && result?.rewardData) {
      // Set reward data first
      setRewardData(result.rewardData)
      
      // Small delay to ensure state is set, then trigger effects
      setTimeout(() => {
        setShowConfetti(true)
        setShowRewardModal(true)
      }, 100)
    } else if (result?.success && result?.rewardData) {
      setRewardData(result.rewardData)
      setShowRewardModal(true)
      setShowConfetti(true)
    }
    
    return result
  }, [originalUpdateModuleProgress, lessonData?.modules])
  
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
    session // Always pass session if it exists, for optimistic updates
  )
  
  // Navigation state
  const [activeModule, setActiveModule] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])
  
  // Reward modal state
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [rewardData, setRewardData] = useState(null)
  
  // Certificate modal state
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false)

  // Calculate optimistic progress that reflects immediate UI changes
  const optimisticProgress = useMemo(() => {
    if (!lessonData?.modules || !effectiveIsEnrolled) {
      return progress?.courseProgress || 0
    }
    
    const totalItems = lessonData.modules.flatMap(m => m.items).length
    const completedCount = completedItems.length
    const optimisticPercentage = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0
    
    return optimisticPercentage
  }, [lessonData?.modules, completedItems.length, effectiveIsEnrolled, progress?.courseProgress])

  const isModuleAccessible = useCallback((moduleIndex) => {
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled) return false
    
    if (moduleIndex === 0) return true
    
    const prevModuleIndex = moduleIndex - 1
    const prevModule = lessonData?.modules?.[prevModuleIndex]
    if (!prevModule) return false
    
    const isPrevModuleComplete = prevModule.items.every(item => completedItems.includes(item.id))
    // 🔧 FIX: Check if any completed module has this index
    const isPrevQuizPassed = moduleQuizCompleted.some(cm => cm.moduleIndex === prevModuleIndex)
    
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
          }
        })
        
        // Remove quiz completion from this locked module
        const quizIndex = cleanedModuleQuizCompleted.indexOf(moduleIndex)
        if (quizIndex > -1) {
          cleanedModuleQuizCompleted.splice(quizIndex, 1)
          needsCleanup = true
        }
      }
    })
    
    if (needsCleanup) {
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
  const { reviewsState, fetchReviews, loadMoreReviews, submitReview, deleteReview, updateReview, toggleForm } = useReviews(
    lessonSlug, 
    effectiveIsLoggedIn ? session : null
  )

  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [activeTab, setActiveTab] = useState('reviews')
  const [hasInitializedQA, setHasInitializedQA] = useState(false)

  // NEW: Auto-completion and auto-next functionality
  const handleAutoComplete = useCallback(async (lessonId) => {
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled) {
      return
    }
    
    // Allow auto-completion in instructor preview mode when in "enrolled" mode
    if (isInstructorPreview && instructorPreviewMode !== 'enrolled') {
      return
    }
    
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
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, isInstructorPreview, instructorPreviewMode, updateLessonProgress])

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
      setActiveVideoId(nextAction.video.id)
      setActiveModule(nextAction.moduleIndex)
    } else if (nextAction.type === 'quiz') {
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
        
        // 🔧 FIX: Store the full objects instead of just indices
        setModuleQuizCompleted(completedModuleData)
      }
      
      // 🔧 FIX: Sync reward data from progress
      if (progress.rewardData) {
        setRewardData(progress.rewardData)
      }
    } else if (!effectiveIsLoggedIn || !effectiveIsEnrolled) {
      setCompletedItems([])
      setModuleQuizCompleted([])
      setRewardData(null)
    }
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, progressInitialized, progress, lessonData?.modules])

  // Set initial active video
  useEffect(() => {
    if (lessonData && !activeVideoId) {
      // For non-enrolled users (logged in or not)
      if (!effectiveIsEnrolled) {
        // Prefer course preview if available
        if (lessonData.previewVideoUrl) {
          setActiveVideoId("preview")
        } else {
          // If no preview, show first video of Module 1
          if (lessonData.modules?.length > 0) {
            const firstVideo = lessonData.modules[0].items.find(item => item.type === "video")
            if (firstVideo) setActiveVideoId(firstVideo.id)
          }
        }
      } 
      // For enrolled users
      else if (effectiveIsLoggedIn && effectiveIsEnrolled && lessonData.modules?.length > 0) {
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
    return moduleQuizCompleted.some(cm => cm.moduleIndex === activeModule)
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, moduleQuizCompleted, activeModule])

  // Check if current active item is accessible as preview (for non-enrolled users)
  const isCurrentItemPreviewAccessible = useMemo(() => {
    if (effectiveIsEnrolled) return false // Enrolled users don't need preview access
    if (!activeItem || activeItem.isPreview) return true // Course preview is always accessible
    if (activeModule !== 0) return false // Only Module 1 has preview content
    
    const module = lessonData?.modules?.[0]
    if (!module) return false
    
    const itemIndex = module.items.findIndex(i => i.id === activeItem.id)
    if (itemIndex === -1) return false
    
    // Check if this is a video in the first 2 videos
    if (activeItem.type === "video") {
      const videoItems = module.items.filter(i => i.type === "video")
      const videoIndex = videoItems.findIndex(v => v.id === activeItem.id)
      return videoIndex < 2
    } else {
      // For resources, check if they appear before the 3rd video
      const videosBeforeThisItem = module.items.slice(0, itemIndex).filter(i => i.type === "video").length
      return videosBeforeThisItem < 2
    }
  }, [effectiveIsEnrolled, activeItem, activeModule, lessonData])

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
      // Allow first 2 videos in Module 1 for non-enrolled users
      if (moduleIndex === 0) {
        const module = lessonData?.modules?.[0]
        if (module) {
          const videoItems = module.items.filter(item => item.type === "video")
          const itemIndex = videoItems.findIndex(video => video.id === itemId)
          if (itemIndex < 2) {
            setActiveVideoId(itemId)
            setActiveModule(moduleIndex)
            return
          }
        }
      }
      return
    }
    
    if (effectiveIsLoggedIn && !effectiveIsEnrolled && itemId !== "preview") {
      // Allow first 2 videos in Module 1 for non-enrolled users
      if (moduleIndex === 0) {
        const module = lessonData?.modules?.[0]
        if (module) {
          const videoItems = module.items.filter(item => item.type === "video")
          const itemIndex = videoItems.findIndex(video => video.id === itemId)
          if (itemIndex < 2) {
            setActiveVideoId(itemId)
            setActiveModule(moduleIndex)
            return
          }
        }
      }
      return
    }
    
    setActiveVideoId(itemId)
    setActiveModule(moduleIndex)
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, lessonData])

  const handleToggleCompletion = useCallback(async (itemId, e) => {
    e.stopPropagation()
    
    // Only allow completion tracking for logged in enrolled users (not instructor preview guest mode)
    if (!effectiveIsLoggedIn || !effectiveIsEnrolled || (isInstructorPreview && instructorPreviewMode === 'guest')) return
    
    const isCurrentlyCompleted = completedItems.includes(itemId)
    const newCompletionState = !isCurrentlyCompleted
    
    // OPTIMISTIC UPDATE: Update UI immediately for better UX
    setCompletedItems(prev => 
      newCompletionState 
        ? [...prev, itemId] 
        : prev.filter(id => id !== itemId)
    )
    
    // Clear any existing timeout for this item
    if (updateTimeouts.current.has(itemId)) {
      clearTimeout(updateTimeouts.current.get(itemId))
    }
    
    // Store the pending update
    pendingUpdates.current.set(itemId, newCompletionState)
    setPendingItems(prev => new Set([...prev, itemId]))
    
    // Debounce the database update to prevent race conditions
    const timeoutId = setTimeout(async () => {
      if (!isInstructorPreview || instructorPreviewMode === 'enrolled') {
        try {
          const success = await updateLessonProgress(itemId, newCompletionState)
          
          if (!success) {
            // Revert optimistic update if database update failed
            setCompletedItems(prev => 
              isCurrentlyCompleted 
                ? [...prev, itemId] 
                : prev.filter(id => id !== itemId)
            )
            console.warn('Failed to update progress for lesson:', itemId)
            // Don't show alert for every failure to avoid spam
          }
        } catch (error) {
          // Revert optimistic update on error
          setCompletedItems(prev => 
            isCurrentlyCompleted 
              ? [...prev, itemId] 
              : prev.filter(id => id !== itemId)
          )
          console.error('Error updating lesson progress:', error)
        }
      }
      
      // Clean up
      pendingUpdates.current.delete(itemId)
      updateTimeouts.current.delete(itemId)
      setPendingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 300) // 300ms debounce
    
    updateTimeouts.current.set(itemId, timeoutId)
  }, [effectiveIsLoggedIn, effectiveIsEnrolled, isInstructorPreview, instructorPreviewMode, updateLessonProgress])

  const handleNextModule = useCallback(() => {
    if (quizState.score >= 70 || existingScore >= 70) {
      hideQuiz()
      
      // No need to force refresh - the progress is already updated by updateModuleProgress
      // The sidebar will update automatically when the progress state changes
      
      if (lessonData?.modules?.[activeModule + 1]) {
        setActiveModule(prev => prev + 1)
        const firstVideo = lessonData.modules[activeModule + 1].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [quizState.score, existingScore, lessonData, activeModule, hideQuiz])

  // Navigation functions for previous/next lesson
  const handlePreviousLesson = useCallback(() => {
    if (!lessonData?.modules) return
    
    const currentModule = lessonData.modules[activeModule]
    if (!currentModule) return
    
    const currentItemIndex = currentModule.items.findIndex(item => item.id === activeVideoId)
    
    if (currentItemIndex > 0) {
      // Go to previous item in same module
      const previousItem = currentModule.items[currentItemIndex - 1]
      setActiveVideoId(previousItem.id)
    } else if (activeModule > 0) {
      // Go to last item in previous module
      const previousModule = lessonData.modules[activeModule - 1]
      const lastItem = previousModule.items[previousModule.items.length - 1]
      setActiveModule(activeModule - 1)
      setActiveVideoId(lastItem.id)
    }
  }, [lessonData, activeModule, activeVideoId])

  const handleNextLesson = useCallback(() => {
    if (!lessonData?.modules) return
    
    const currentModule = lessonData.modules[activeModule]
    if (!currentModule) return
    
    const currentItemIndex = currentModule.items.findIndex(item => item.id === activeVideoId)
    
    if (currentItemIndex < currentModule.items.length - 1) {
      const nextItem = currentModule.items[currentItemIndex + 1]
      
      // For non-enrolled users, verify next item is accessible
      if (!effectiveIsEnrolled && activeModule === 0) {
        const videoItems = currentModule.items.filter(i => i.type === "video")
        const nextItemVideoIndex = videoItems.findIndex(v => v.id === nextItem.id)
        
        let isNextItemAccessible = false
        if (nextItem.type === "video") {
          isNextItemAccessible = nextItemVideoIndex < 2
        } else {
          const nextItemIndex = currentModule.items.findIndex(i => i.id === nextItem.id)
          const videosBeforeNextItem = currentModule.items.slice(0, nextItemIndex).filter(i => i.type === "video").length
          isNextItemAccessible = videosBeforeNextItem < 2
        }
        
        if (!isNextItemAccessible) {
          return // Don't navigate to locked content
        }
      }
      
      // Go to next item in same module
      setActiveVideoId(nextItem.id)
    } else if (activeModule < lessonData.modules.length - 1) {
      // Check if next module is accessible before navigating
      const nextModuleIndex = activeModule + 1
      if (isModuleAccessible(nextModuleIndex)) {
        const nextModule = lessonData.modules[nextModuleIndex]
        const firstItem = nextModule.items[0]
        setActiveModule(nextModuleIndex)
        setActiveVideoId(firstItem.id)
      }
    }
  }, [lessonData, activeModule, activeVideoId, isModuleAccessible, effectiveIsEnrolled])

  // Check if previous/next lessons exist
  const hasPreviousLesson = useMemo(() => {
    if (!lessonData?.modules) return false
    
    const currentModule = lessonData.modules[activeModule]
    if (!currentModule) return false
    
    const currentItemIndex = currentModule.items.findIndex(item => item.id === activeVideoId)
    
    // Has previous item in same module
    if (currentItemIndex > 0) {
      return true
    }
    
    // Check if previous module exists AND is accessible
    if (activeModule > 0) {
      return isModuleAccessible(activeModule - 1)
    }
    
    return false
  }, [lessonData, activeModule, activeVideoId, isModuleAccessible])

  const hasNextLesson = useMemo(() => {
    if (!lessonData?.modules) return false
    
    const currentModule = lessonData.modules[activeModule]
    if (!currentModule) return false
    
    const currentItemIndex = currentModule.items.findIndex(item => item.id === activeVideoId)
    
    // Check if there's a next item in same module
    if (currentItemIndex < currentModule.items.length - 1) {
      const nextItem = currentModule.items[currentItemIndex + 1]
      
      // For non-enrolled users, check if next item is accessible
      if (!effectiveIsEnrolled && activeModule === 0) {
        // Count videos to check if next item is within first 2 videos
        const videoItems = currentModule.items.filter(i => i.type === "video")
        const nextItemVideoIndex = videoItems.findIndex(v => v.id === nextItem.id)
        
        if (nextItem.type === "video") {
          // Next item is a video - check if it's in first 2 videos
          return nextItemVideoIndex < 2
        } else {
          // Next item is a resource - check if it appears before 3rd video
          const nextItemIndex = currentModule.items.findIndex(i => i.id === nextItem.id)
          const videosBeforeNextItem = currentModule.items.slice(0, nextItemIndex).filter(i => i.type === "video").length
          return videosBeforeNextItem < 2
        }
      }
      
      return true
    }
    
    // Check if next module exists AND is accessible
    if (activeModule < lessonData.modules.length - 1) {
      return isModuleAccessible(activeModule + 1)
    }
    
    return false
  }, [lessonData, activeModule, activeVideoId, isModuleAccessible, effectiveIsEnrolled])

  const handleBackToModule = useCallback(() => {
    hideQuiz()
  }, [hideQuiz])

  // Certificate handler
  const handleViewCertificate = useCallback(() => {
    setShowCertificateModal(true)
  }, [])

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
    return <ErrorLayout error={lessonError || "Failed to load lesson data"} onRetry={retryLessonData} />
  }


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
                  {/* Mobile Course Content Button */}
                  <MobileCourseSidebar
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
                    progress={{ ...progress, courseProgress: optimisticProgress }}
                    isModuleAccessible={isModuleAccessible}
                    rewardData={rewardData}
                    pendingItems={pendingItems}
                    onViewCertificate={handleViewCertificate}
                  />
                  
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
                    onPreviousLesson={handlePreviousLesson}
                    onNextLesson={handleNextLesson}
                    hasPreviousLesson={hasPreviousLesson}
                    hasNextLesson={hasNextLesson}
                    onTakeQuiz={showQuiz}
                    currentModuleCompleted={currentModuleCompleted}
                    currentModuleQuizCompleted={currentModuleQuizCompleted}
                    onToggleCompletion={handleToggleCompletion}
                    isPreviewAccessible={isCurrentItemPreviewAccessible}
                  />
                  
                  {/* Show enrollment prompt for non-enrolled users */}
                  {(!effectiveIsLoggedIn || !effectiveIsEnrolled) && (
                    <EnrollmentPrompt course={lessonData} />
                  )}
                  
                  {effectiveIsLoggedIn && effectiveIsEnrolled && currentModuleCompleted && !currentModuleQuizCompleted && (
                    <ModuleCompleteNotif />
                  )}

                  <CourseInfo 
                    lesson={lessonData}
                    showFullDescription={showFullDescription}
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                    progress={effectiveIsLoggedIn && effectiveIsEnrolled ? optimisticProgress : 0}
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
                        onLoadMore={loadMoreReviews}
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

            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden lg:block mt-4 w-full lg:mt-0 lg:w-1/3 lg:pl-4">
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
                progress={{ ...progress, courseProgress: optimisticProgress }}
                isModuleAccessible={isModuleAccessible}
                rewardData={rewardData}
                pendingItems={pendingItems}
                onViewCertificate={handleViewCertificate}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Reward Modal */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false)
          setShowConfetti(false) // Stop confetti when modal closes
        }}
        rewardData={rewardData}
        courseId={lessonData?.id}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        courseId={lessonData?.id}
      />

      {/* Confetti Animation */}
      <Confetti 
        isActive={showConfetti} 
        duration={4000}
        onComplete={() => setShowConfetti(false)}
      />


    </div>
  )
}