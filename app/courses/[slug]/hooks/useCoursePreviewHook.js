// Complete useCoursePreviewHook.js - All hooks for course functionality
import { useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"

// ============ Q&A HOOK ============
export function useQA(courseSlug, session) {
  const [qaState, setQAState] = useState({
    questions: [],
    loading: false,
    loadingMore: false,
    totalQuestions: 0,
    hasMore: false,
    currentPage: 1,
    userHasAsked: false,
    showForm: false,
    submitting: false,
    newQuestion: { question: "" }
  })

  const QUESTIONS_PER_PAGE = 5

  // Memoize session values to prevent dependency changes
  const userId = session?.user?.id
  const userEmail = session?.user?.email

  const fetchQuestions = useCallback(async (page = 1, append = false) => {
    if (!courseSlug) return

    // Set appropriate loading state
    if (append) {
      setQAState(prev => ({ ...prev, loadingMore: true }))
    } else {
      setQAState(prev => ({ ...prev, loading: true }))
    }

    try {
      const response = await fetch(`/api/courses/${courseSlug}/questions?page=${page}&limit=${QUESTIONS_PER_PAGE}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        const userHasAsked = userEmail 
          ? data.questions.some(q => q.user.email === userEmail)
          : false

        // Add like status for questions and comments
        const questionsWithLikeStatus = data.questions.map(question => {
          const questionLiked = question.likedBy?.includes(userId) || false
          
          const commentsWithLikeStatus = question.comments?.map(comment => ({
            ...comment,
            isLiked: comment.likedBy?.includes(userId) || false,
            currentUserEmail: userEmail
          })) || []

          return {
            ...question,
            isLiked: questionLiked,
            currentUserEmail: userEmail,
            comments: commentsWithLikeStatus
          }
        })

        setQAState(prev => ({
          ...prev,
          questions: append 
            ? [...prev.questions, ...questionsWithLikeStatus]
            : questionsWithLikeStatus,
          totalQuestions: data.totalQuestions,
          hasMore: data.hasMore,
          currentPage: page,
          userHasAsked: append ? prev.userHasAsked || userHasAsked : userHasAsked
        }))
      } else {
        throw new Error(data.error || 'Failed to fetch questions');
      }
    } catch (error) {
      console.error("Error fetching questions:", error)
      alert(`Failed to load questions: ${error.message}`);
    } finally {
      setQAState(prev => ({ 
        ...prev, 
        loading: false, 
        loadingMore: false 
      }))
    }
  }, [courseSlug, userEmail, userId, QUESTIONS_PER_PAGE])

  // NEW: Optimistic update functions to prevent flickering
  const updateQuestionOptimistically = useCallback((questionId, updates) => {
    setQAState(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId
          ? { ...question, ...updates }
          : question
      )
    }))
  }, [])

  const updateCommentOptimistically = useCallback((questionId, commentId, updates) => {
    setQAState(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId
          ? {
              ...question,
              comments: question.comments.map(comment =>
                comment._id === commentId
                  ? { ...comment, ...updates }
                  : comment
              )
            }
          : question
      )
    }))
  }, [])

  const addCommentOptimistically = useCallback((questionId, newComment) => {
    setQAState(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId
          ? {
              ...question,
              comments: [...(question.comments || []), newComment]
            }
          : question
      )
    }))
  }, [])

  const removeQuestionOptimistically = useCallback((questionId) => {
    setQAState(prev => ({
      ...prev,
      questions: prev.questions.filter(question => question.id !== questionId),
      totalQuestions: prev.totalQuestions - 1
    }))
  }, [])

  const removeCommentOptimistically = useCallback((questionId, commentId) => {
    setQAState(prev => ({
      ...prev,
      questions: prev.questions.map(question =>
        question.id === questionId
          ? {
              ...question,
              comments: question.comments.filter(comment => comment._id !== commentId)
            }
          : question
      )
    }))
  }, [])

  // Load more questions function
  const loadMoreQuestions = useCallback(async () => {
    if (qaState.loadingMore || !qaState.hasMore) return
    
    const nextPage = qaState.currentPage + 1
    await fetchQuestions(nextPage, true)
  }, [qaState.loadingMore, qaState.hasMore, qaState.currentPage, fetchQuestions])

  const submitQuestion = useCallback(async () => {
    if (!session?.user || !qaState.newQuestion.question.trim()) {
      return
    }

    setQAState(prev => ({ ...prev, submitting: true }))
    
    try {
      const response = await fetch(`/api/courses/${courseSlug}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: qaState.newQuestion.question.trim()
        })
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json()

      if (data.success) {
        // Reset to first page and fetch fresh data (this is necessary for new questions)
        await fetchQuestions(1, false)
        setQAState(prev => ({ 
          ...prev, 
          showForm: false,
          newQuestion: { question: "" }
        }))
      } else {
        throw new Error(data.error || 'Failed to submit question');
      }
    } catch (error) {
      console.error("Error submitting question:", error)
      alert(`Failed to submit question: ${error.message}`)
    } finally {
      setQAState(prev => ({ ...prev, submitting: false }))
    }
  }, [qaState.newQuestion, session, courseSlug, fetchQuestions])

  const deleteQuestion = useCallback(async (questionId) => {
    if (!session?.user) return

    // Optimistic update
    removeQuestionOptimistically(questionId)

    try {
      const response = await fetch(`/api/courses/${courseSlug}/questions/${questionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json()

      if (!data.success) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        throw new Error(data.error || 'Failed to delete question');
      }
    } catch (error) {
      console.error("Error deleting question:", error)
      alert(`Failed to delete question: ${error.message}`)
    }
  }, [session, courseSlug, fetchQuestions, removeQuestionOptimistically])

  const updateQuestion = useCallback((updates) => {
    setQAState(prev => ({
      ...prev,
      newQuestion: { ...prev.newQuestion, ...updates }
    }))
  }, [])

  const submitComment = useCallback(async (questionId, comment) => {
    if (!session?.user || !comment || !comment.trim()) {
      alert('Please log in and enter a comment');
      return;
    }

    // Create optimistic comment
    const optimisticComment = {
      _id: `temp-${Date.now()}`, // Temporary ID
      comment: comment.trim(),
      likeCount: 0,
      isLiked: false,
      isInstructorReply: false, // Will be determined by server
      createdAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      user: {
        name: session.user.name || "You",
        email: session.user.email,
        avatar: session.user.image || null
      },
      currentUserEmail: userEmail
    }

    // Optimistic update
    addCommentOptimistically(questionId, optimisticComment)

    try {
      const response = await fetch(`/api/courses/${courseSlug}/questions/${questionId}/comments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: comment.trim() })
      });

      if (!response.ok) {
        // Revert optimistic update on error
        removeCommentOptimistically(questionId, optimisticComment._id)
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Replace optimistic comment with real data by refetching
        await fetchQuestions(1, false)
      } else {
        // Revert optimistic update on error
        removeCommentOptimistically(questionId, optimisticComment._id)
        throw new Error(data.error || 'Failed to submit comment');
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert(`Failed to submit comment: ${error.message}`);
    }
  }, [session, courseSlug, userEmail, addCommentOptimistically, removeCommentOptimistically, fetchQuestions])

  const deleteComment = useCallback(async (questionId, commentId) => {
    if (!session?.user) return

    // Optimistic update
    removeCommentOptimistically(questionId, commentId)

    try {
      const response = await fetch(`/api/courses/${courseSlug}/questions/${questionId}/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json()

      if (!data.success) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        throw new Error(data.error || 'Failed to delete comment');
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert(`Failed to delete comment: ${error.message}`)
    }
  }, [session, courseSlug, fetchQuestions, removeCommentOptimistically])

  const updateComment = useCallback(async (questionId, commentId, comment) => {
    if (!session?.user || !comment.trim()) return

    // Optimistic update
    updateCommentOptimistically(questionId, commentId, { 
      comment: comment.trim(),
      updatedAt: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    })

    try {
      const response = await fetch(`/api/courses/${courseSlug}/questions/${questionId}/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment.trim() })
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json()

      if (!data.success) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        throw new Error(data.error || 'Failed to update comment');
      }
    } catch (error) {
      console.error("Error updating comment:", error)
      alert(`Failed to update comment: ${error.message}`)
    }
  }, [session, courseSlug, fetchQuestions, updateCommentOptimistically])

  // FIXED: Optimistic like updates to prevent flickering
  const toggleQuestionLike = useCallback(async (type, questionId, commentId = null) => {
    if (!session?.user) {
      alert('Please log in to like questions and comments')
      return
    }

    try {
      if (type === 'question') {
        // Optimistic update for question like
        const currentQuestion = qaState.questions.find(q => q.id === questionId)
        if (currentQuestion) {
          const newIsLiked = !currentQuestion.isLiked
          const newLikeCount = newIsLiked 
            ? (currentQuestion.likeCount || 0) + 1 
            : Math.max(0, (currentQuestion.likeCount || 0) - 1)
          
          updateQuestionOptimistically(questionId, {
            isLiked: newIsLiked,
            likeCount: newLikeCount
          })
        }
      } else {
        // Optimistic update for comment like
        const currentQuestion = qaState.questions.find(q => q.id === questionId)
        const currentComment = currentQuestion?.comments?.find(c => c._id === commentId)
        if (currentComment) {
          const newIsLiked = !currentComment.isLiked
          const newLikeCount = newIsLiked 
            ? (currentComment.likeCount || 0) + 1 
            : Math.max(0, (currentComment.likeCount || 0) - 1)
          
          updateCommentOptimistically(questionId, commentId, {
            isLiked: newIsLiked,
            likeCount: newLikeCount
          })
        }
      }

      // Make API call
      const url = type === 'question' 
        ? `/api/courses/${courseSlug}/questions/${questionId}/like`
        : `/api/courses/${courseSlug}/questions/${questionId}/comments/${commentId}/like`

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json()

      if (!data.success) {
        // Revert optimistic update on error
        await fetchQuestions(1, false)
        throw new Error(data.error || 'Failed to toggle like');
      }

      // API call successful - optimistic update was correct!
    } catch (error) {
      console.error("Error toggling like:", error)
      // Don't show alert for like errors, just revert silently
    }
  }, [session, courseSlug, qaState.questions, updateQuestionOptimistically, updateCommentOptimistically, fetchQuestions])

  const toggleForm = useCallback((show) => {
    setQAState(prev => ({ ...prev, showForm: show }))
  }, [])

  // Create a stable version of fetchQuestions for initial load
  const initialFetchQuestions = useCallback(() => {
    fetchQuestions(1, false)
  }, [fetchQuestions])

  return {
    qaState,
    fetchQuestions: initialFetchQuestions,
    loadMoreQuestions,
    submitQuestion,
    deleteQuestion,
    updateQuestion,
    submitComment,
    deleteComment,
    updateComment,
    toggleQuestionLike,
    toggleForm
  }
}

// ============ PROGRESS HOOK ============
export function useProgress(slug) {
  const { data: session } = useSession()
  const [progress, setProgress] = useState({
    completedLessons: [],
    completedModules: [],
    courseProgress: 0,
    status: 'not_started',
    isCompleted: false,
    lessonProgress: []
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
        if (data.updated) {
          setProgress(prev => ({
            ...prev,
            completedModules: data.completedModules
          }))
        }
        return { success: true, updated: data.updated, message: data.message }
      } else {
        setError(data.error)
        return { success: false, error: data.error }
      }
    } catch (err) {
      setError('Failed to update module progress')
      console.error('Error updating module progress:', err)
      return { success: false, error: 'Network error' }
    }
  }, [session, slug])

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

// ============ ENHANCED QUIZ HOOK ============
export function useQuiz(lessonData, activeModule, updateModuleProgress, moduleQuizCompleted) {
  const [quizState, setQuizState] = useState({
    showModuleQuiz: false,
    started: false,
    completed: false,
    score: 0,
    selectedAnswers: {},
    randomizedQuiz: null,
    totalPoints: 0,
    earnedPoints: 0,
    showReview: false,
    existingScore: null
  })

  const currentQuiz = useMemo(() => 
    lessonData?.modules?.[activeModule]?.quiz,
    [lessonData, activeModule]
  )

  // Get existing quiz score from progress data
  const existingScore = useMemo(() => {
    if (!lessonData?.modules?.[activeModule] || !moduleQuizCompleted) return null
    
    const moduleId = lessonData.modules[activeModule].id
    const completedModule = moduleQuizCompleted.find(
      cm => cm.moduleId === moduleId
    )
    
    return completedModule?.quizScore || null
  }, [lessonData, activeModule, moduleQuizCompleted])

  // Update existing score in state when it changes
  useEffect(() => {
    setQuizState(prev => ({ ...prev, existingScore }))
  }, [existingScore])

  // Shuffle array utility
  const shuffleArray = useCallback((array) => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }, [])

  // Enhanced randomize quiz when started - handles different question types
  useEffect(() => {
    if (currentQuiz && quizState.started && !quizState.completed) {
      const randomized = {
        ...currentQuiz,
        questions: currentQuiz.questions.map((question) => {
          switch (question.type) {
            case "multiple_choice":
              const optionsWithIndex = question.options.map((option, index) => ({
                text: option.text || option,
                originalIndex: index,
                isCorrect: option.isCorrect
              }))

              const shuffledOptions = shuffleArray(optionsWithIndex)
              const newCorrectAnswer = shuffledOptions.findIndex(
                option => option.isCorrect
              )

              return {
                ...question,
                options: shuffledOptions.map(option => option.text),
                correctAnswer: newCorrectAnswer,
                originalCorrectAnswer: question.correctAnswer
              }

            case "matching":
              const rightItems = question.pairs.map((pair, index) => ({
                ...pair,
                originalIndex: index
              }))
              
              return {
                ...question,
                pairs: question.pairs,
                shuffledRightItems: shuffleArray(rightItems)
              }

            case "fill_in_blanks":
              return question

            default:
              return question
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
      randomizedQuiz: null,
      score: 0,
      totalPoints: 0,
      earnedPoints: 0,
      showReview: false
    }))
  }, [])

  const selectAnswer = useCallback((questionId, answerValue) => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: { ...prev.selectedAnswers, [questionId]: answerValue }
    }))
  }, [])

  // Scoring system 
  const calculateScore = useCallback((quiz, answers) => {
    if (!quiz || !quiz.questions) return { score: 0, totalPoints: 0, earnedPoints: 0 }

    let totalPoints = 0
    let earnedPoints = 0

    quiz.questions.forEach((question, index) => {
      const questionId = question._id || question.id
      const questionPoints = question.points || 1
      totalPoints += questionPoints
      
      const userAnswer = answers[questionId]

      // Check for undefined, null, or empty answers
      if (userAnswer === undefined || userAnswer === null || userAnswer === '') {
        return
      }

      switch (question.type) {
        case "multiple_choice":
          // Handle both original and randomized questions properly
          let correctIndex
          if (question.originalCorrectAnswer !== undefined) {
            // This is a randomized question, use the new correct answer
            correctIndex = question.correctAnswer
          } else {
            // This is the original question
            correctIndex = question.correctAnswer !== undefined 
              ? question.correctAnswer 
              : question.options.findIndex(opt => opt.isCorrect)
          }
          
          if (userAnswer === correctIndex) {
            earnedPoints += questionPoints
          }
          break

        case "fill_in_blanks":
          if (question.blanks && typeof userAnswer === 'object' && userAnswer !== null) {
            let correctBlanks = 0
            const totalBlanks = question.blanks.length
            
            question.blanks.forEach((blank, blankIndex) => {
              const userBlankAnswer = userAnswer[blankIndex]?.toLowerCase()?.trim()
              const correctAnswer = blank.answer.toLowerCase().trim()
              const alternatives = blank.alternatives?.map(alt => alt.toLowerCase().trim()) || []
              
              const isCorrect = userBlankAnswer === correctAnswer || alternatives.includes(userBlankAnswer)
              if (isCorrect) correctBlanks++
            })
            
            // Use proper proportional scoring without rounding too early
            const proportionalPoints = (correctBlanks / totalBlanks) * questionPoints
            earnedPoints += proportionalPoints
          }
          break

        case "matching":
          if (question.pairs && typeof userAnswer === 'object' && userAnswer !== null) {
            let correctMatches = 0
            const totalPairs = question.pairs.length
            
            Object.entries(userAnswer).forEach(([leftIndex, selectedRight]) => {
              const leftIndexNum = parseInt(leftIndex)
              const correctRight = question.pairs[leftIndexNum]?.right
              
              const isCorrect = selectedRight === correctRight
              if (isCorrect) correctMatches++
            })
            
            // Use proper proportional scoring without rounding too early
            const proportionalPoints = (correctMatches / totalPairs) * questionPoints
            earnedPoints += proportionalPoints
          }
          break

        default:
          // Handle unknown types as multiple choice fallback
          const defaultCorrectIndex = question.options?.findIndex(opt => opt.isCorrect)
          if (userAnswer === defaultCorrectIndex) {
            earnedPoints += questionPoints
          }
      }
    })

    // Round only at the very end for accuracy
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    
    return { score, totalPoints, earnedPoints }
  }, [])

  const submitQuiz = useCallback(async () => {
    const quiz = quizState.randomizedQuiz || currentQuiz
    if (!quiz) return

    const { score, totalPoints, earnedPoints } = calculateScore(quiz, quizState.selectedAnswers)
    
    setQuizState(prev => ({ 
      ...prev, 
      score, 
      totalPoints, 
      earnedPoints, 
      completed: true,
      showReview: true
    }))

    // Only update database if:
    // 1. User passes (score >= 70) AND
    // 2. Either no existing score OR new score is higher than existing score
    const shouldUpdateDatabase = score >= 70 && (!existingScore || score > existingScore)
    
    if (shouldUpdateDatabase && lessonData?.modules?.[activeModule]) {
      const moduleId = lessonData.modules[activeModule].id
      const result = await updateModuleProgress(moduleId, score)
      
      if (result?.success && result?.updated) {
        console.log('✅ Quiz score saved to database:', score)
      } else if (result?.success && !result?.updated) {
        console.log('📊 Quiz completed but score not saved (not an improvement)')
      }
    }
  }, [quizState.randomizedQuiz, quizState.selectedAnswers, currentQuiz, lessonData, activeModule, updateModuleProgress, calculateScore, existingScore])

  const retryQuiz = useCallback(() => {
    setQuizState(prev => ({
      ...prev,
      started: true,
      completed: false,
      selectedAnswers: {},
      score: 0,
      totalPoints: 0,
      earnedPoints: 0,
      randomizedQuiz: null,
      showReview: false
    }))
  }, [])

  const showQuiz = useCallback(() => {
    setQuizState(prev => ({ ...prev, showModuleQuiz: true }))
  }, [])

  const hideQuiz = useCallback(() => {
    setQuizState(prev => ({ ...prev, showModuleQuiz: false, showReview: false }))
  }, [])

  const toggleReview = useCallback(() => {
    setQuizState(prev => ({ ...prev, showReview: !prev.showReview }))
  }, [])

  return {
    quizState,
    currentQuiz,
    existingScore,
    startQuiz,
    selectAnswer,
    submitQuiz,
    retryQuiz,
    showQuiz,
    hideQuiz,
    toggleReview
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
    // FIXED: Return early if no courseId or no session
    if (!courseId || !session?.user) {
      setIsEnrolled(false)
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
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
    // FIXED: Only run if both courseId and session exist
    if (courseId && session?.user) {
      checkEnrollment()
    } else {
      setIsEnrolled(false)
      setLoading(false)
    }
  }, [checkEnrollment, courseId, session?.user])

  return {
    isEnrolled,
    loading,
    error,
    checkEnrollment
  }
}

// ============ COURSE LIKE HOOK ============
export function useCourseLike(courseSlug, session) {
  const [likeState, setLikeState] = useState({
    isLiked: false,
    likeCount: 0,
    loading: false,
    error: null
  })

  // Fetch like status when component mounts
  const fetchLikeStatus = useCallback(async () => {
    if (!courseSlug) return

    try {
      setLikeState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/courses/${courseSlug}/like`)
      const data = await response.json()
      
      if (data.success) {
        setLikeState(prev => ({
          ...prev,
          isLiked: data.isLiked,
          likeCount: data.likeCount,
          loading: false
        }))
      } else {
        setLikeState(prev => ({
          ...prev,
          error: data.error || 'Failed to fetch like status',
          loading: false
        }))
      }
    } catch (error) {
      console.error('Error fetching like status:', error)
      setLikeState(prev => ({
        ...prev,
        error: 'Failed to fetch like status',
        loading: false
      }))
    }
  }, [courseSlug])

  // Toggle like/unlike
  const toggleLike = useCallback(async () => {
    if (!session?.user || !courseSlug) {
      setLikeState(prev => ({ ...prev, error: 'Please log in to like courses' }))
      return
    }

    try {
      setLikeState(prev => ({ ...prev, loading: true, error: null }))
      
      const response = await fetch(`/api/courses/${courseSlug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        setLikeState(prev => ({
          ...prev,
          isLiked: data.isLiked,
          likeCount: data.likeCount,
          loading: false
        }))
      } else {
        setLikeState(prev => ({
          ...prev,
          error: data.error || 'Failed to toggle like',
          loading: false
        }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      setLikeState(prev => ({
        ...prev,
        error: 'Failed to toggle like',
        loading: false
      }))
    }
  }, [session, courseSlug])

  // Fetch like status on mount and when session changes
  useEffect(() => {
    fetchLikeStatus()
  }, [fetchLikeStatus])

  return {
    likeState,
    toggleLike,
    fetchLikeStatus
  }
}