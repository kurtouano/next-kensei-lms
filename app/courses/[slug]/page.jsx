"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BonsaiIcon } from "@/components/bonsai-icon"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  FileText,
  BookOpen,
  Award,
  AlertCircle,
  Download,
  MessageSquare,
  BookIcon,
  Clock,
  ThumbsUp,
  Share2,
  Bookmark,
  Volume2,
  Settings,
  Maximize,
  Pause,
  Lock,
  Check,
  Circle,
  Star,
  User,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function LessonPage() {
  const params = useParams()
  const lessonSlug = params.slug
  const videoRef = useRef(null)

  // Core state
  const [lessonData, setLessonData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Navigation state
  const [activeModule, setActiveModule] = useState(0)
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [completedItems, setCompletedItems] = useState([])
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [showModuleQuiz, setShowModuleQuiz] = useState(false)
  
  // Video state
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  
  // UI state
  const [showFullDescription, setShowFullDescription] = useState(false)
  
  // Review state
  const [reviews, setReviews] = useState([
    {
      id: 1,
      user: { name: "Sarah Johnson", avatar: "/placeholder.svg" },
      rating: 5,
      comment: "Excellent course! The explanations are clear and the exercises are very helpful.",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      user: { name: "Mike Chen", avatar: "/placeholder.svg" },
      rating: 4,
      comment: "Great content overall. Would love to see more practice examples.",
      createdAt: "2024-01-10"
    }
  ])
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" })
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/api/courses/${lessonSlug}`)
        if (!response.ok) throw new Error('Failed to fetch lesson data')
        
        const data = await response.json()
        setLessonData(data.lessons)
        
        // Set initial active video
        if (data.lessons?.modules?.length > 0) {
          const firstVideo = data.lessons.modules[0].items.find(item => item.type === "video")
          if (firstVideo) setActiveVideoId(firstVideo.id)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonSlug])

  // Video event handlers
  useEffect(() => {
    if (!videoRef.current) return

    const video = videoRef.current
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [])

  // Video progress tracking
  useEffect(() => {
    if (!videoRef.current || !isPlaying) return

    const video = videoRef.current
    const updateProgress = () => {
      if (video.duration) {
        setVideoProgress((video.currentTime / video.duration) * 100)
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    return () => video.removeEventListener('timeupdate', updateProgress)
  }, [isPlaying])

  // Computed values
  const activeItem = useMemo(() => {
    if (!lessonData?.modules) return null
    
    // Check if it's a resource ID (format: resource-itemId-resourceIndex)
    if (activeVideoId && activeVideoId.startsWith('resource-')) {
      const [, itemId, resourceIndex] = activeVideoId.split('-')
      
      for (const module of lessonData.modules) {
        const item = module.items?.find((item) => item.id === itemId)
        if (item && item.resources && item.resources[parseInt(resourceIndex)]) {
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

  const totalItems = useMemo(() => 
    lessonData?.modules?.flatMap(m => m.items).length || 0, 
    [lessonData]
  )

  const overallProgress = useMemo(() => 
    totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0,
    [completedItems.length, totalItems]
  )

  const currentModuleCompleted = useMemo(() => {
    if (!lessonData?.modules?.[activeModule]) return false
    const moduleItems = lessonData.modules[activeModule].items
    return moduleItems.every(item => completedItems.includes(item.id))
  }, [lessonData, activeModule, completedItems])

  // Helper functions
  const isModuleComplete = useCallback((moduleIndex) => {
    if (!lessonData?.modules?.[moduleIndex]) return false
    return lessonData.modules[moduleIndex].items.every(item => completedItems.includes(item.id))
  }, [lessonData, completedItems])

  const isModuleAccessible = useCallback((moduleIndex) => {
    if (moduleIndex === 0) return true
    const prevModuleIndex = moduleIndex - 1
    return isModuleComplete(prevModuleIndex) && moduleQuizCompleted.includes(prevModuleIndex)
  }, [isModuleComplete, moduleQuizCompleted])

  // Event handlers
  const handleSelectItem = useCallback((itemId, moduleIndex) => {
    if (!isModuleAccessible(moduleIndex)) return

    setActiveVideoId(itemId)
    setActiveModule(moduleIndex)
    
    if (itemId !== activeVideoId) {
      setIsPlaying(false)
      setVideoProgress(0)
      if (videoRef.current) {
        videoRef.current.currentTime = 0
      }
    }
  }, [activeVideoId, isModuleAccessible])

  const toggleItemCompletion = useCallback((itemId, e) => {
    e.stopPropagation()
    setCompletedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId) 
        : [...prev, itemId]
    )
  }, [])

  const handleModuleCompletion = useCallback(() => {
    if (!lessonData?.modules?.[activeModule]) return

    const currentModuleItems = lessonData.modules[activeModule].items
    const newCompletedItems = [...new Set([...completedItems, ...currentModuleItems.map(item => item.id)])]
    
    setCompletedItems(newCompletedItems)
    setShowModuleQuiz(true)
    setQuizStarted(false)
    setQuizCompleted(false)
    setSelectedAnswers({})
  }, [lessonData, activeModule, completedItems])

  // Quiz handlers
  const startQuiz = useCallback(() => setQuizStarted(true), [])
  
  const selectAnswer = useCallback((questionId, answerIndex) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }))
  }, [])

  const submitQuiz = useCallback(() => {
    if (!lessonData?.modules?.[activeModule]?.quiz) return

    const questions = lessonData.modules[activeModule].quiz.questions
    const correctAnswers = questions.reduce((acc, question) => (
      selectedAnswers[question.id] === question.correctAnswer ? acc + 1 : acc
    ), 0)

    const score = Math.round((correctAnswers / questions.length) * 100)
    setQuizScore(score)
    setQuizCompleted(true)

    if (score >= 70) {
      setModuleQuizCompleted(prev => [...prev, activeModule])
    }
  }, [lessonData, activeModule, selectedAnswers])

  const proceedToNextModule = useCallback(() => {
    if (quizScore >= 70) {
      setShowModuleQuiz(false)
      setActiveModule(prev => prev + 1)
      setQuizStarted(false)
      setQuizCompleted(false)
      setSelectedAnswers({})
      setQuizScore(0)

      if (lessonData?.modules?.[activeModule + 1]) {
        const firstVideo = lessonData.modules[activeModule + 1].items.find(item => item.type === "video")
        if (firstVideo) setActiveVideoId(firstVideo.id)
      }
    }
  }, [quizScore, lessonData, activeModule])

  const retryQuiz = useCallback(() => {
    setQuizStarted(true)
    setQuizCompleted(false)
    setSelectedAnswers({})
    setQuizScore(0)
  }, [])

  // Review handlers
  const handleSubmitReview = useCallback(() => {
    if (newReview.rating === 0 || newReview.comment.trim() === "") return

    const review = {
      id: reviews.length + 1,
      user: { name: "Current User", avatar: "/placeholder.svg" },
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      createdAt: new Date().toISOString().split('T')[0]
    }

    setReviews(prev => [review, ...prev])
    setNewReview({ rating: 0, comment: "" })
    setShowReviewForm(false)
  }, [newReview, reviews.length])

  const handleRatingClick = useCallback((rating) => {
    setNewReview(prev => ({ ...prev, rating }))
  }, [])

  // Loading and error states
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div>Loading lesson data...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !lessonData) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header isLoggedIn={true} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-red-500">Error: {error || "Failed to load lesson data"}</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={true} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row">
            {/* Video Player Section */}
            <div className="w-full lg:w-2/3 lg:pr-4">
              {showModuleQuiz ? (
                <QuizSection 
                  quiz={lessonData.modules[activeModule]?.quiz}
                  quizStarted={quizStarted}
                  quizCompleted={quizCompleted}
                  quizScore={quizScore}
                  selectedAnswers={selectedAnswers}
                  onStartQuiz={startQuiz}
                  onSelectAnswer={selectAnswer}
                  onSubmitQuiz={submitQuiz}
                  onRetryQuiz={retryQuiz}
                  onProceed={proceedToNextModule}
                  onBack={() => setShowModuleQuiz(false)}
                  isLastModule={activeModule === lessonData.modules.length - 1}
                />
              ) : (
                <>
                  {/* Video Player */}
                  <div className="mb-4 overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm">
                    <div className="relative aspect-video bg-black">
                      {activeItem?.type === "video" ? (
                        <video
                          ref={videoRef}
                          controls
                          className="absolute inset-0 w-full h-full object-cover"
                          src={activeItem.videoUrl}
                          onClick={() => setIsPlaying(!isPlaying)}
                        />
                      ) : (
                        <MaterialView item={activeItem} />
                      )}
                    </div>
                  </div>

                  {currentModuleCompleted && (
                    <ModuleCompleteNotification onTakeQuiz={() => setShowModuleQuiz(true)} />
                  )}

                  <CourseInfo 
                    lesson={lessonData}
                    showFullDescription={showFullDescription}
                    onToggleDescription={() => setShowFullDescription(!showFullDescription)}
                    progress={overallProgress}
                  />

                  <ReviewSection
                    reviews={reviews}
                    newReview={newReview}
                    showReviewForm={showReviewForm}
                    onShowReviewForm={() => setShowReviewForm(true)}
                    onHideReviewForm={() => setShowReviewForm(false)}
                    onRatingClick={handleRatingClick}
                    onCommentChange={(comment) => setNewReview(prev => ({ ...prev, comment }))}
                    onSubmitReview={handleSubmitReview}
                  />
                </>
              )}
            </div>

            {/* Course Content Sidebar */}
            <div className="mt-4 w-full lg:mt-0 lg:w-1/3 lg:pl-4">
              <CourseSidebar
                modules={lessonData.modules}
                activeModule={activeModule}
                activeVideoId={activeVideoId}
                completedItems={completedItems}
                moduleQuizCompleted={moduleQuizCompleted}
                currentModuleCompleted={currentModuleCompleted}
                showModuleQuiz={showModuleQuiz}
                onSelectItem={handleSelectItem}
                onToggleCompletion={toggleItemCompletion}
                onPreviousModule={() => activeModule > 0 && setActiveModule(activeModule - 1)}
                onNextModule={() => {
                  if (currentModuleCompleted) {
                    setShowModuleQuiz(true)
                  } else {
                    handleModuleCompletion()
                  }
                }}
                isModuleAccessible={isModuleAccessible}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ReviewSection({
  reviews,
  newReview,
  showReviewForm,
  onShowReviewForm,
  onHideReviewForm,
  onRatingClick,
  onCommentChange,
  onSubmitReview
}) {
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0

  const StarRating = ({ rating, interactive = false, onStarClick = null }) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onStarClick ? () => onStarClick(star) : undefined}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
      <div className="border-b border-[#dce4d7] pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="font-medium text-[#2c3e2d]">Reviews & Ratings</h3>
            <div className="flex items-center gap-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-sm text-[#5c6d5e]">
                {averageRating} ({reviews.length} reviews)
              </span>
            </div>
          </div>
          {!showReviewForm && (
            <Button
              variant="outline"
              className="border-[#4a7c59] text-[#4a7c59]"
              onClick={onShowReviewForm}
            >
              <Star className="mr-2 h-4 w-4" />
              Write Review
            </Button>
          )}
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="border-b border-[#dce4d7] py-4">
          <h4 className="mb-3 font-medium text-[#2c3e2d]">Write a Review</h4>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">
              Rating
            </label>
            <StarRating 
              rating={newReview.rating} 
              interactive={true} 
              onStarClick={onRatingClick}
            />
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-[#2c3e2d]">
              Comment
            </label>
            <textarea
              className="w-full rounded-md border border-[#dce4d7] p-3 text-sm focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
              rows="4"
              placeholder="Share your thoughts about this course..."
              value={newReview.comment}
              onChange={(e) => onCommentChange(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <Button
              className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
              onClick={onSubmitReview}
              disabled={newReview.rating === 0 || newReview.comment.trim() === ""}
            >
              Submit Review
            </Button>
            <Button
              variant="outline"
              className="border-[#4a7c59] text-[#4a7c59]"
              onClick={onHideReviewForm}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 pt-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 text-[#5c6d5e]" />
            <p className="text-[#5c6d5e]">No reviews yet. Be the first to review this course!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-[#dce4d7] pb-4 last:border-b-0">
              <div className="flex items-start gap-3">
                <img
                  src={review.user.avatar}
                  alt={review.user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h5 className="font-medium text-[#2c3e2d]">{review.user.name}</h5>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} />
                        <span className="text-xs text-[#5c6d5e]">{review.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#5c6d5e]">{review.comment}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ===== HELPER COMPONENTS =====

function QuizSection({
  quiz,
  quizStarted,
  quizCompleted,
  quizScore,
  selectedAnswers,
  onStartQuiz,
  onSelectAnswer,
  onSubmitQuiz,
  onRetryQuiz,
  onProceed,
  onBack,
  isLastModule
}) {
  if (!quizStarted) {
    return (
      <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
        <BookOpen className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
        <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">{quiz.title}</h2>
        <p className="mb-6 text-[#5c6d5e]">
          Complete this quiz with a score of 70% or higher to proceed.
        </p>
        <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onStartQuiz}>
          Start Quiz
        </Button>
      </div>
    )
  }

  if (quizCompleted) {
    return (
      <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm text-center">
        {quizScore >= 70 ? (
          <Award className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
        ) : (
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-[#e67e22]" />
        )}
        <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">Quiz Results</h2>
        <div className="mb-4 inline-block rounded-full bg-[#eef2eb] px-6 py-3">
          <span className="text-2xl font-bold text-[#4a7c59]">{quizScore}%</span>
        </div>
        <p className="mb-6 text-[#5c6d5e]">
          {quizScore >= 70
            ? "Congratulations! You've passed the quiz."
            : "You need to score at least 70% to proceed."}
        </p>

        <div className="flex justify-center gap-4">
          {quizScore >= 70 ? (
            <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onProceed}>
              {isLastModule ? "Complete Course" : "Next Module"}
            </Button>
          ) : (
            <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={onRetryQuiz}>
              Retry Quiz
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">{quiz.title}</h2>
      <div className="space-y-6">
        {quiz.questions.map((question, qIndex) => (
          <div key={question.id} className="rounded-lg border border-[#dce4d7] p-4">
            <h3 className="mb-3 text-lg font-medium text-[#2c3e2d]">
              <span className="mr-2 font-bold">{qIndex + 1}.</span>
              {question.question}
            </h3>
            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div
                  key={oIndex}
                  className={`cursor-pointer rounded-md border p-3 transition-colors ${
                    selectedAnswers[question.id] === oIndex
                      ? "border-[#4a7c59] bg-[#eef2eb]"
                      : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                  }`}
                  onClick={() => onSelectAnswer(question.id, oIndex)}
                >
                  <div className="flex items-center">
                    <div
                      className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full border ${
                        selectedAnswers[question.id] === oIndex
                          ? "border-[#4a7c59] bg-[#4a7c59] text-white"
                          : "border-[#dce4d7]"
                      }`}
                    >
                      {String.fromCharCode(65 + oIndex)}
                    </div>
                    <span className="text-[#2c3e2d]">{option}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          className="border-[#4a7c59] text-[#4a7c59]"
          onClick={onBack}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Module
        </Button>
        <Button
          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
          onClick={onSubmitQuiz}
          disabled={Object.keys(selectedAnswers).length < quiz.questions.length}
        >
          Submit Quiz
        </Button>
      </div>
    </div>
  )
}

function MaterialView({ item }) {
  if (item?.type === "resource") {
    return (
      <div className="flex h-full items-center justify-center bg-[#eef2eb] p-8 text-center text-[#4a7c59]">
        <div className="max-w-md">
          <FileText className="mx-auto mb-2 h-12 w-12" />
          <h3 className="text-lg font-semibold mb-3 text-[#2c3e2d]">{item.title}</h3>
          <p className="text-[#5c6d5e] text-sm mb-6">
            Download this resource to enhance your learning experience.
          </p>
          
          <div className="space-y-3 text-sm">
            {item.resources && item.resources.map((resource, index) => (
              <a href={item.selectedResource?.fileUrl || item.selectedResource?.url}>
                <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#eef2eb] p-4 text-center text-[#4a7c59]">
      <div>
        <FileText className="mx-auto mb-2 h-12 w-12" />
        <h3 className="text-lg font-medium">{item?.title || "Select a lesson"}</h3>
        <p className="mt-2 text-sm text-[#5c6d5e]">
          {item?.type === "material"
            ? "Download this material to continue your learning"
            : "Select a video from the list to start learning"}
        </p>
        {item?.type === "material" && (
          <Button className="mt-4 bg-[#4a7c59] text-white hover:bg-[#3a6147]">
            <Download className="mr-2 h-4 w-4" />
            Download Material
          </Button>
        )}
      </div>
    </div>
  )
}

function ModuleCompleteNotification({ onTakeQuiz }) {
  return (
    <div className="mb-4 rounded-lg border-2 border-[#4a7c59] bg-[#eef2eb] p-4 text-center">
      <Award className="mx-auto mb-2 h-8 w-8 text-[#4a7c59]" />
      <h2 className="mb-2 text-xl font-bold text-[#2c3e2d]">Module Completed!</h2>
      <p className="mb-4 text-[#5c6d5e]">
        You've completed all lessons in this module. Take the quiz to proceed.
      </p>
      <Button
        className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
        onClick={onTakeQuiz}
      >
        Take Module Quiz Now
      </Button>
    </div>
  )
}

function CourseInfo({ lesson, showFullDescription, onToggleDescription, progress }) {
  return (
    <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold text-[#2c3e2d]">{lesson.title}</h1>

      <div className="mt-4 flex items-center">
        <span className="mr-2 text-sm text-[#5c6d5e]">Course Progress:</span>
        <div className="flex-1">
          <Progress
            value={progress}
            className="h-2 bg-[#dce4d7]"
            indicatorClassName="bg-[#4a7c59]"
          />
        </div>
        <span className="ml-2 text-sm font-medium text-[#2c3e2d]">{progress}%</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#5c6d5e]">
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          <span>{lesson.totalDuration}</span>
        </div>
        <div className="flex items-center">
          <BookIcon className="mr-1 h-4 w-4" />
          <span>{lesson.totalLessons} lessons</span>
        </div>
        <div className="flex items-center">
          <Award className="mr-1 h-4 w-4" />
          <span>{lesson.level}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        <img
          src={lesson.instructor.avatar || "/placeholder.svg"}
          alt={lesson.instructor.name}
          className="mr-3 h-10 w-10 rounded-full object-cover"
        />
        <div>
          <h3 className="font-medium text-[#2c3e2d]">{lesson.instructor.name}</h3>
          <p className="text-sm text-[#5c6d5e]">{lesson.instructor.title}</p>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 font-medium text-[#2c3e2d]">About This Course</h3>
        <p className="text-sm text-[#5c6d5e]">
          {showFullDescription
            ? lesson.fullDescription
            : `${lesson.fullDescription.substring(0, 200)}...`}
        </p>
        <button
          className="mt-2 text-sm font-medium text-[#4a7c59]"
          onClick={onToggleDescription}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
          <ThumbsUp className="mr-2 h-4 w-4" />
          Like
        </Button>
        <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  )
}

function CourseSidebar({
  modules,
  activeModule,
  activeVideoId,
  completedItems,
  moduleQuizCompleted,
  currentModuleCompleted,
  showModuleQuiz,
  onSelectItem,
  onToggleCompletion,
  onPreviousModule,
  onNextModule,
  isModuleAccessible
}) {
  return (
    <div className="sticky top-4 rounded-lg border border-[#dce4d7] bg-white shadow-sm">
      <div className="border-b border-[#dce4d7] bg-[#eef2eb] p-4">
        <h2 className="font-semibold text-[#2c3e2d]">Course Content</h2>
        <p className="text-sm text-[#5c6d5e]">
          {completedItems.length} of {modules.flatMap(m => m.items).length} lessons completed
        </p>
      </div>

      <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
        {modules.map((module, moduleIndex) => {
          const isAccessible = isModuleAccessible(moduleIndex)
          const isActive = activeModule === moduleIndex

          return (
            <div
              key={module.id}
              className={`border-b border-[#dce4d7] last:border-b-0 ${!isAccessible ? "opacity-60" : ""}`}
            >
              <div className={`flex items-center justify-between p-4 ${isActive ? "bg-[#eef2eb]" : ""}`}>
                <div className="flex items-center">
                  {!isAccessible && <Lock className="mr-2 h-4 w-4 text-[#5c6d5e]" />}
                  <h3 className={`font-medium ${isAccessible ? "text-[#2c3e2d]" : "text-[#5c6d5e]"}`}>
                    {module.title}
                  </h3>
                </div>
                <div className="flex items-center">
                  {module.items.every(item => completedItems.includes(item.id)) && (
                    <CheckCircle2 className="mr-2 h-4 w-4 text-[#4a7c59]" />
                  )}
                  <span className="text-xs text-[#5c6d5e]">
                    {module.items.filter(item => completedItems.includes(item.id)).length}/{module.items.length}
                  </span>
                </div>
              </div>

              <div className={`space-y-1 p-2 ${!isAccessible ? "pointer-events-none" : ""}`}>
                {module.items.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div
                      className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors ${
                        !isAccessible
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : activeVideoId === item.id
                            ? "cursor-pointer bg-[#4a7c59] text-white"
                            : completedItems.includes(item.id)
                              ? "cursor-pointer bg-[#eef2eb] text-[#2c3e2d]"
                              : "cursor-pointer text-[#5c6d5e] hover:bg-[#f8f7f4]"
                      }`}
                      onClick={() => onSelectItem(item.id, moduleIndex)}
                    >
                      <div className="mr-3 flex-shrink-0">
                        {item.type === "video" ? (
                          <PlayCircle
                            className={`h-4 w-4 ${
                              !isAccessible
                                ? "text-gray-400"
                                : activeVideoId === item.id
                                  ? "text-white"
                                  : "text-[#4a7c59]"
                            }`}
                          />
                        ) : (
                          <FileText
                            className={`h-4 w-4 ${
                              !isAccessible
                                ? "text-gray-400"
                                : activeVideoId === item.id
                                  ? "text-white"
                                  : "text-[#4a7c59]"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="truncate">{item.title}</span>
                          <div className="ml-2 flex items-center">
                            {item.type === "video" && (
                              <span
                                className={`text-xs ${
                                  !isAccessible
                                    ? "text-gray-400"
                                    : activeVideoId === item.id
                                      ? "text-white/80"
                                      : "text-[#5c6d5e]"
                                }`}
                              >
                                {item.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                          !isAccessible
                            ? "border-gray-300 text-gray-300"
                            : completedItems.includes(item.id)
                              ? "bg-[#4a7c59] text-white"
                              : "border-[#dce4d7]"
                        }`}
                        onClick={(e) => isAccessible && onToggleCompletion(item.id, e)}
                        disabled={!isAccessible}
                      >
                        {completedItems.includes(item.id) ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Circle className="h-3 w-3 opacity-0" />
                        )}
                      </button>
                    </div>

                    {/* Resources Section - Now shows directly below each lesson */}
                    {item.resources && item.resources.length > 0 && (
                      <div className="space-y-1">
                        {item.resources.map((resource, resourceIndex) => (
                          <div
                            key={resourceIndex}
                            className={`flex items-center justify-between rounded-md p-2 text-sm cursor-pointer transition-colors ${
                              !isAccessible
                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                : activeVideoId === `resource-${item.id}-${resourceIndex}`
                                  ? "bg-[#4a7c59] text-white"
                                  : "text-[#5c6d5e] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => isAccessible && onSelectItem(`resource-${item.id}-${resourceIndex}`, moduleIndex)}
                          >
                            <div className="flex items-center flex-1 min-w-0">
                              <div className="mr-3 flex-shrink-0">
                                <FileText
                                  className={`h-4 w-4 ${
                                    !isAccessible
                                      ? "text-gray-400"
                                      : activeVideoId === `resource-${item.id}-${resourceIndex}`
                                        ? "text-white"
                                        : "text-[#4a7c59]"
                                  }`}
                                />
                              </div>
                              <span className="truncate">{resource.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {moduleIndex === activeModule && currentModuleCompleted && !showModuleQuiz && (
                <div className="mx-2 mb-2 rounded-md bg-[#eef2eb] p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
                      <span className="text-sm font-medium text-[#2c3e2d]">Module Quiz</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                      onClick={() => onNextModule()}
                    >
                      Take Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-[#dce4d7] bg-[#eef2eb] p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            className="border-[#4a7c59] text-[#4a7c59]"
            onClick={onPreviousModule}
            disabled={activeModule === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <Button
            className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
            onClick={onNextModule}
          >
            {currentModuleCompleted ? "Take Module Quiz" : "Complete & Take Quiz"}
          </Button>
        </div>
      </div>
    </div>
  )
}