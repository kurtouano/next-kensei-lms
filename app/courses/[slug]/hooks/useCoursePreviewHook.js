import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"

// ============ PROGRESS HOOK ============
export function useProgress(slug) {
  const { data: session } = useSession()
  const [progress, setProgress] = useState({
    completedLessons: [],
    completedModules: [],
    courseProgress: 0,
    status: 'not_started',
    isCompleted: false,
    lessonProgress: [] // Add lesson progress with currentTime
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!session?.user || !slug) return
    
    try {
      setLoading(true)
      const response = await fetch(`/api/courses/progress/${slug}`)
      const data = await response.json()
      
      if (data.success) {
        setProgress(data.progress)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch progress')
      console.error('Error fetching progress:', err)
    } finally {
      setLoading(false)
    }
  }, [session, slug])

  const updateLessonProgress = useCallback(async (lessonId, isCompleted, currentTime = 0) => {
    if (!session?.user || !slug) return false
    
    try {
      const response = await fetch(`/api/courses/progress/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, isCompleted, currentTime })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProgress(prev => ({
          ...prev,
          completedLessons: data.progress.completedLessons,
          courseProgress: data.progress.courseProgress,
          status: data.progress.status,
          lessonProgress: data.progress.lessonProgress
        }))
        return true
      } else {
        setError(data.error)
        return false
      }
    } catch (err) {
      setError('Failed to update lesson progress')
      console.error('Error updating lesson progress:', err)
      return false
    }
  }, [session, slug])

  // New function specifically for updating video progress
  const updateVideoProgress = useCallback(async (lessonId, currentTime) => {
    if (!session?.user || !slug) return false
    
    try {
      const response = await fetch(`/api/courses/progress/${slug}/video-progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, currentTime })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProgress(prev => ({
          ...prev,
          lessonProgress: data.progress.lessonProgress
        }))
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating video progress:', err)
      return false
    }
  }, [session, slug])

  const updateModuleProgress = useCallback(async (moduleId, quizScore) => {
    if (!session?.user || !slug) return false
    
    try {
      const response = await fetch(`/api/courses/progress/${slug}/module-progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId, quizScore })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setProgress(prev => ({
          ...prev,
          completedModules: data.completedModules
        }))
        return true
      } else {
        setError(data.error)
        return false
      }
    } catch (err) {
      setError('Failed to update module progress')
      console.error('Error updating module progress:', err)
      return false
    }
  }, [session, slug])

  // Helper function to get current time for a specific lesson
  const getLessonCurrentTime = useCallback((lessonId) => {
    const lessonProgress = progress.lessonProgress?.find(lp => lp.lesson === lessonId)
    return lessonProgress?.currentTime || 0
  }, [progress.lessonProgress])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    loading,
    error,
    updateLessonProgress,
    updateVideoProgress,
    updateModuleProgress,
    getLessonCurrentTime,
    refetchProgress: fetchProgress
  }
}

// ============ LESSON DATA HOOK ============
export function useLessonData(lessonSlug) {
  const [lessonData, setLessonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/api/courses/${lessonSlug}`)
        if (!response.ok) throw new Error('Failed to fetch lesson data')
        
        const data = await response.json()
        setLessonData(data.lessons)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonSlug])

  return { lessonData, loading, error }
}

// ============ QUIZ HOOK ============
export function useQuiz(lessonData, activeModule, updateModuleProgress) {
  const [quizState, setQuizState] = useState({
    showModuleQuiz: false,
    started: false,
    completed: false,
    score: 0,
    selectedAnswers: {},
    randomizedQuiz: null
  })

  const currentQuiz = useMemo(() => 
    lessonData?.modules?.[activeModule]?.quiz,
    [lessonData, activeModule]
  )

  // Shuffle array utility
  const shuffleArray = useCallback((array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }, [])

  // Randomize quiz when started
  useEffect(() => {
    if (currentQuiz && quizState.started && !quizState.completed) {
      const randomized = {
        ...currentQuiz,
        questions: currentQuiz.questions.map((question) => {
          const optionsWithIndex = question.options.map((option, index) => ({
            text: option,
            originalIndex: index
          }))

          const shuffledOptions = shuffleArray(optionsWithIndex)
          const newCorrectAnswer = shuffledOptions.findIndex(
            option => option.originalIndex === question.correctAnswer
          )

          return {
            ...question,
            options: shuffledOptions.map(option => option.text),
            correctAnswer: newCorrectAnswer,
            originalCorrectAnswer: question.correctAnswer
          }
        })
      }

      setQuizState(prev => ({ ...prev, randomizedQuiz: randomized }))
    }
  }, [currentQuiz, quizState.started, quizState.completed, shuffleArray])

  const startQuiz = useCallback(() => {
    setQuizState(prev => ({ 
      ...prev, 
      started: true, 
      completed: false, 
      selectedAnswers: {},
      randomizedQuiz: null 
    }))
  }, [])

  const selectAnswer = useCallback((questionId, answerIndex) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: { ...prev.selectedAnswers, [questionId]: answerIndex }
    }))
  }, [])

  const submitQuiz = useCallback(async () => {
    const quiz = quizState.randomizedQuiz || currentQuiz
    if (!quiz) return

    const questions = quiz.questions
    const correctAnswers = questions.reduce((acc, question) => (
      quizState.selectedAnswers[question.id] === question.correctAnswer ? acc + 1 : acc
    ), 0)

    const score = Math.round((correctAnswers / questions.length) * 100)
    
    setQuizState(prev => ({ ...prev, score, completed: true }))

    if (score >= 70) {
      const moduleId = lessonData.modules[activeModule].id
      await updateModuleProgress(moduleId, score)
    }
  }, [quizState.randomizedQuiz, quizState.selectedAnswers, currentQuiz, lessonData, activeModule, updateModuleProgress])

  const retryQuiz = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      started: true,
      completed: false,
      selectedAnswers: {},
      score: 0,
      randomizedQuiz: null
    }))
  }, [])

  const showQuiz = useCallback(() => {
    setQuizState(prev => ({ ...prev, showModuleQuiz: true }))
  }, [])

  const hideQuiz = useCallback(() => {
    setQuizState(prev => ({ ...prev, showModuleQuiz: false }))
  }, [])

  return {
    quizState,
    currentQuiz,
    startQuiz,
    selectAnswer,
    submitQuiz,
    retryQuiz,
    showQuiz,
    hideQuiz
  }
}

// ============ REVIEWS HOOK ============
export function useReviews(lessonSlug, session) {
  const [reviewsState, setReviewsState] = useState({
    reviews: [],
    loading: false,
    averageRating: 0,
    totalReviews: 0,
    userHasReviewed: false,
    userReview: null,
    showForm: false,
    submitting: false,
    newReview: { rating: 0, comment: "" }
  })

  const fetchReviews = useCallback(async () => {
    setReviewsState(prev => ({ ...prev, loading: true }))
    try {
      const response = await fetch(`/api/courses/${lessonSlug}/reviews`)
      const data = await response.json()
      
      if (data.success) {
        const existingReview = session?.user 
          ? data.reviews.find(review => review.user.email === session.user.email)
          : null

        setReviewsState(prev => ({
          ...prev,
          reviews: data.reviews,
          averageRating: data.averageRating,
          totalReviews: data.totalReviews,
          userHasReviewed: !!existingReview,
          userReview: existingReview,
          newReview: existingReview 
            ? { rating: existingReview.rating, comment: existingReview.comment }
            : { rating: 0, comment: "" }
        }))
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setReviewsState(prev => ({ ...prev, loading: false }))
    }
  }, [lessonSlug, session?.user])

  const submitReview = useCallback(async () => {
    if (!session?.user || reviewsState.newReview.rating === 0 || !reviewsState.newReview.comment.trim()) {
      return
    }

    setReviewsState(prev => ({ ...prev, submitting: true }))
    
    try {
      const response = await fetch(`/api/courses/${lessonSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: reviewsState.newReview.rating,
          comment: reviewsState.newReview.comment.trim()
        })
      })

      const data = await response.json()

      if (data.success) {
        await fetchReviews()
        setReviewsState(prev => ({ ...prev, showForm: false }))
      }
    } catch (error) {
      console.error("Error submitting review:", error)
    } finally {
      setReviewsState(prev => ({ ...prev, submitting: false }))
    }
  }, [reviewsState.newReview, session, lessonSlug, fetchReviews])

  const deleteReview = useCallback(async () => {
    if (!session?.user || !reviewsState.userHasReviewed) return

    try {
      const response = await fetch(`/api/courses/${lessonSlug}/reviews`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        await fetchReviews()
        setReviewsState(prev => ({
          ...prev,
          userHasReviewed: false,
          userReview: null,
          newReview: { rating: 0, comment: "" },
          showForm: false
        }))
      }
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }, [session, reviewsState.userHasReviewed, lessonSlug, fetchReviews])

  const updateReview = useCallback((updates) => {
    setReviewsState(prev => ({
      ...prev,
      newReview: { ...prev.newReview, ...updates }
    }))
  }, [])

  const toggleForm = useCallback((show) => {
    setReviewsState(prev => ({ ...prev, showForm: show }))
  }, [])

  return {
    reviewsState,
    fetchReviews,
    submitReview,
    deleteReview,
    updateReview,
    toggleForm
  }
}

// ============ ENROLLMENT CHECK HOOK ============
export function useEnrollmentCheck(courseId) {
  const { data: session } = useSession()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkEnrollment = useCallback(async () => {
    if (!courseId || !session?.user) {
      setIsEnrolled(false)
      return
    }
    
    try {
      setLoading(true)
      // Use the same endpoint as CourseCard
      const response = await fetch(`/api/courses/enrollment?courseId=${courseId}`)
      const data = await response.json()
      
      if (data.success) {
        setIsEnrolled(data.isEnrolled)
      } else {
        setError(data.error)
        setIsEnrolled(false)
      }
    } catch (err) {
      setError('Failed to check enrollment')
      setIsEnrolled(false)
      console.error('Error checking enrollment:', err)
    } finally {
      setLoading(false)
    }
  }, [courseId, session?.user])

  useEffect(() => {
    if (courseId && session?.user) {
      checkEnrollment()
    } else {
      setIsEnrolled(false)
    }
  }, [checkEnrollment, courseId, session?.user])

  return {
    isEnrolled,
    loading,
    error,
    checkEnrollment
  }
}
