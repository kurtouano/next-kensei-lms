"use client"

import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id
  const videoRef = useRef(null)

  const [activeModule, setActiveModule] = useState(0)
  const [completedItems, setCompletedItems] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showModuleQuiz, setShowModuleQuiz] = useState(false)
  const [currentModuleCompleted, setCurrentModuleCompleted] = useState(false)
  const [moduleQuizCompleted, setModuleQuizCompleted] = useState([])

    // State for loading
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lessonData, setLessonData] = useState(null)

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch lesson data')
        }
        const data = await response.json()
        console.log("DATA DATA:", data);
        setLessonData(data.lessons)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLessonData()
  }, [lessonId])

  // Handle video play/pause
useEffect(() => {
  if (!videoRef.current) return;

  const video = videoRef.current;
  
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  
  video.addEventListener('play', handlePlay);
  video.addEventListener('pause', handlePause);
  
  return () => {
    video.removeEventListener('play', handlePlay);
    video.removeEventListener('pause', handlePause);
  };
}, []);

// Handle video progress
useEffect(() => {
  if (!videoRef.current || !isPlaying) return;

  const video = videoRef.current;
  const updateProgress = () => {
    if (video.duration) {
      setVideoProgress((video.currentTime / video.duration) * 100);
    }
  };

  video.addEventListener('timeupdate', updateProgress);
  return () => video.removeEventListener('timeupdate', updateProgress);
}, [isPlaying]);

  
  // Mock lesson data
  const lesson = {
    id: lessonId,
    title: "Japanese for Beginners - Module 1",
    description: "Introduction to Japanese language basics",
    progress: 35,
    instructor: {
      name: "Tanaka Yuki",
      avatar: "/placeholder.svg?height=100&width=100",
      title: "Japanese Language Instructor",
    },
    fullDescription:
      "This comprehensive course introduces you to the fundamentals of Japanese language. You'll learn the basic writing systems, essential greetings, and how to introduce yourself in Japanese. Perfect for absolute beginners, this course provides a solid foundation for further Japanese language studies. By the end of this module, you'll be able to read and write Hiragana, greet people appropriately based on the time of day and social context, and introduce yourself in a culturally appropriate way.",
    lastUpdated: "March 2023",
    totalDuration: "2h 45m",
    totalLessons: 12,
    level: "Beginner",
    modules: [
      {
        id: "module-1",
        title: "Introduction to Hiragana",
        items: [
          {
            id: "video-1",
            type: "video",
            title: "Introduction to Japanese Writing Systems",
            duration: "10:25",
            videoUrl: "https://d2mkrje6fcm11v.cloudfront.net/videos/🇯🇵 What is Hiragana, Katakana, Kanji.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn about the three Japanese writing systems: Hiragana, Katakana, and Kanji.",
          },
          {
            id: "material-1",
            type: "material",
            title: "Hiragana Chart and Reference Guide",
            fileUrl: "https://example.com/materials/hiragana-chart.pdf",
            fileSize: "2.4 MB",
          },
          {
            id: "video-2",
            type: "video",
            title: "How to Write Hiragana: Basic Strokes",
            duration: "15:10",
            videoUrl: "https://d2mkrje6fcm11v.cloudfront.net/videos/How to ask questions in Japanese __ その, この, あの __ ある vs いる (JAPANESE LESSON .mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn the basic strokes and proper technique for writing Hiragana characters.",
          },
          {
            id: "material-2",
            type: "material",
            title: "Hiragana Study Guide",
            fileUrl: "https://example.com/materials/hiragana-guide.pdf",
            fileSize: "1.8 MB",
          },
        ],
        quiz: {
          title: "Hiragana Quiz",
          questions: [
            {
              id: 1,
              question: "Which of the following is NOT a Japanese writing system?",
              options: ["Hiragana", "Katakana", "Kanji", "Romaji", "Hangul"],
              correctAnswer: 4,
            },
            {
              id: 2,
              question: "How many basic Hiragana characters are there?",
              options: ["26", "46", "52", "72"],
              correctAnswer: 1,
            },
            {
              id: 3,
              question: "Which hiragana character represents the 'a' sound?",
              options: ["い", "う", "え", "あ", "お"],
              correctAnswer: 3,
            },
          ],
        },
      },
      {
        id: "module-2",
        title: "Basic Greetings",
        items: [
          {
            id: "video-3",
            type: "video",
            title: "Common Japanese Greetings",
            duration: "08:45",
            videoUrl: "https://example.com/videos/japanese-greetings.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn the most common greetings used in everyday Japanese conversation.",
          },
          {
            id: "material-3",
            type: "material",
            title: "Greeting Vocabulary List",
            fileUrl: "https://example.com/materials/greeting-vocab.pdf",
            fileSize: "1.2 MB",
          },
          {
            id: "video-4",
            type: "video",
            title: "Formal vs. Casual Greetings",
            duration: "12:30",
            videoUrl: "https://example.com/videos/formal-casual-greetings.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Understand the differences between formal and casual greetings in Japanese.",
          },
          {
            id: "material-4",
            type: "material",
            title: "Dialogue Examples",
            fileUrl: "https://example.com/materials/dialogue-examples.pdf",
            fileSize: "1.5 MB",
          },
        ],
        quiz: {
          title: "Greetings Quiz",
          questions: [
            {
              id: 1,
              question: "What is the appropriate greeting for meeting someone for the first time?",
              options: [
                "さようなら (Sayounara)",
                "おはよう (Ohayou)",
                "はじめまして (Hajimemashite)",
                "おやすみなさい (Oyasuminasai)",
              ],
              correctAnswer: 2,
            },
            {
              id: 2,
              question: "What is the appropriate response to 'おはようございます' (Good morning)?",
              options: ["さようなら", "おはようございます", "こんにちは", "はじめまして"],
              correctAnswer: 1,
            },
            {
              id: 3,
              question: "Which greeting would you use in the evening?",
              options: ["おはよう", "こんにちは", "こんばんは", "おやすみなさい"],
              correctAnswer: 2,
            },
          ],
        },
      },
      {
        id: "module-3",
        title: "Self Introduction",
        items: [
          {
            id: "video-5",
            type: "video",
            title: "How to Introduce Yourself",
            duration: "11:20",
            videoUrl: "https://example.com/videos/self-introduction.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn how to properly introduce yourself in Japanese.",
          },
          {
            id: "material-5",
            type: "material",
            title: "Self Introduction Examples",
            fileUrl: "https://example.com/materials/intro-examples.pdf",
            fileSize: "0.9 MB",
          },
          {
            id: "video-6",
            type: "video",
            title: "Asking Questions About Others",
            duration: "09:45",
            videoUrl: "https://example.com/videos/asking-questions.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn how to ask questions about others in Japanese conversation.",
          },
          {
            id: "material-6",
            type: "material",
            title: "Conversation Examples",
            fileUrl: "https://example.com/materials/conversation-examples.pdf",
            fileSize: "1.3 MB",
          },
        ],
        quiz: {
          title: "Self Introduction Quiz",
          questions: [
            {
              id: 1,
              question: "How do you say 'My name is...' in Japanese?",
              options: ["お元気ですか", "私の名前は...です", "ありがとうございます", "どこですか"],
              correctAnswer: 1,
            },
            {
              id: 2,
              question: "Which particle is used when stating your occupation?",
              options: ["は", "が", "を", "に"],
              correctAnswer: 0,
            },
            {
              id: 3,
              question: "How would you ask someone's name in Japanese?",
              options: ["お名前は何ですか", "どこから来ましたか", "何歳ですか", "お仕事は何ですか"],
              correctAnswer: 0,
            },
            {
              id: 4,
              question: "Which of these is NOT typically included in a Japanese self-introduction?",
              options: ["Name", "Age", "Blood type", "Political opinions"],
              correctAnswer: 3,
            },
          ],
        },
      },
    ],
  }

  // Find the current active item
  const findActiveItem = () => {
    if (!activeVideoId) {
      // Default to first video in active module
      const firstVideo = lesson.modules[activeModule].items.find((item) => item.type === "video")
      return firstVideo || lesson.modules[activeModule].items[0]
    }

    // Find the item across all modules
    for (const module of lesson.modules) {
      const item = module.items.find((item) => item.id === activeVideoId)
      if (item) return item
    }

    return null
  }

  const activeItem = findActiveItem()

  // Handle video selection
  const handleSelectItem = (itemId, moduleIndex) => {
    if (!isModuleAccessible(moduleIndex)) return;

    setActiveVideoId(itemId);
    setActiveModule(moduleIndex);
    
    // Reset video state when changing videos
    if (itemId !== activeVideoId) {
      setIsPlaying(false);
      setVideoProgress(0);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  // Toggle item completion
  const toggleItemCompletion = (itemId, e) => {
    e.stopPropagation() // Prevent triggering the parent button click

    if (completedItems.includes(itemId)) {
      setCompletedItems(completedItems.filter((id) => id !== itemId))
    } else {
      setCompletedItems([...completedItems, itemId])
    }
  }

  // Simulate video progress
  useEffect(() => {
    let interval
    if (isPlaying && activeItem?.type === "video") {
      interval = setInterval(() => {
        setVideoProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return newProgress
        })
      }, 300)
    }

    return () => clearInterval(interval)
  }, [isPlaying, activeItem])

  // Check if all items in the current module are completed
  useEffect(() => {
    if (lesson.modules[activeModule]) {
      const moduleItems = lesson.modules[activeModule].items
      const isComplete = moduleItems.every((item) => completedItems.includes(item.id))
      setCurrentModuleCompleted(isComplete)
    }
  }, [completedItems, activeModule])

  const isModuleComplete = (moduleIndex) => {
    const moduleItems = lesson.modules[moduleIndex].items
    return moduleItems.every((item) => completedItems.includes(item.id))
  }

  // Check if a module is accessible (previous module completed and passed quiz)
  const isModuleAccessible = (moduleIndex) => {
    if (moduleIndex === 0) return true // First module is always accessible

    // Previous module must be completed and its quiz passed
    const prevModuleIndex = moduleIndex - 1
    return isModuleComplete(prevModuleIndex) && moduleQuizCompleted.includes(prevModuleIndex)
  }

  const handleModuleCompletion = () => {
    // Mark all items in the current module as complete
    const currentModuleItems = lesson.modules[activeModule].items
    const newCompletedItems = [...completedItems]

    currentModuleItems.forEach((item) => {
      if (!newCompletedItems.includes(item.id)) {
        newCompletedItems.push(item.id)
      }
    })

    setCompletedItems(newCompletedItems)
    setCurrentModuleCompleted(true)

    // Immediately show the quiz for this module
    setShowModuleQuiz(true)
    setQuizStarted(false)
    setQuizCompleted(false)
    setSelectedAnswers({})
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setSelectedAnswers({})
    setQuizCompleted(false)
    setQuizScore(0)
  }

  const selectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerIndex,
    })
  }

  const submitQuiz = () => {
    // Get current module quiz
    const currentQuiz = lesson.modules[activeModule].quiz

    // Calculate score
    let correctAnswers = 0
    currentQuiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100)
    setQuizScore(score)
    setQuizCompleted(true)

    // If passed, mark this module's quiz as completed
    if (score >= 70) {
      setModuleQuizCompleted([...moduleQuizCompleted, activeModule])
    }
  }

  const proceedToNextModule = () => {
    // Only proceed if quiz is passed with 70% or more
    if (quizScore >= 70) {
      setShowModuleQuiz(false)
      setActiveModule(activeModule + 1)

      // Reset quiz state
      setQuizStarted(false)
      setQuizCompleted(false)
      setSelectedAnswers({})
      setQuizScore(0)

      // Find first video in next module
      if (activeModule + 1 < lesson.modules.length) {
        const firstVideo = lesson.modules[activeModule + 1].items.find((item) => item.type === "video")
        if (firstVideo) {
          setActiveVideoId(firstVideo.id)
        }
      }
    }
  }

  const retryQuiz = () => {
    setQuizStarted(true)
    setQuizCompleted(false)
    setSelectedAnswers({})
    setQuizScore(0)
  }

  // Set initial active video
  useEffect(() => {
    if (!activeVideoId && lesson.modules.length > 0) {
      const firstVideo = lesson.modules[activeModule].items.find((item) => item.type === "video")
      if (firstVideo) {
        setActiveVideoId(firstVideo.id)
      }
    }
  }, [activeModule, activeVideoId, lesson.modules])

  // Calculate total completed items
  const totalItems = lesson.modules.flatMap((m) => m.items).length
  const totalCompleted = completedItems.length
  const overallProgress = Math.round((totalCompleted / totalItems) * 100)

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header */}
      <Header isLoggedIn={true} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row">
            {/* Video Player Section - Takes full width on mobile, 2/3 on desktop */}
            <div className="w-full lg:w-2/3 lg:pr-4">
              {/* Module Quiz Section */}
              {showModuleQuiz ? (
                <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
                  {!quizStarted ? (
                    <div className="text-center">
                      <BookOpen className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
                      <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">
                        {lesson.modules[activeModule].quiz.title}
                      </h2>
                      <p className="mb-6 text-[#5c6d5e]">
                        Complete this quiz with a score of 70% or higher to proceed to the next module.
                      </p>
                      <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={startQuiz}>
                        Start Quiz
                      </Button>
                    </div>
                  ) : quizCompleted ? (
                    <div className="text-center">
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
                          ? "Congratulations! You've passed the quiz and can proceed to the next module."
                          : "You need to score at least 70% to proceed. Please review the material and try again."}
                      </p>

                      {quizScore >= 70 && (
                        <div className="mb-8 rounded-lg bg-[#eef2eb] p-4">
                          <h3 className="mb-2 text-lg font-semibold text-[#2c3e2d]">Rewards Earned:</h3>
                          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
                            <div className="flex items-center rounded-full bg-white px-4 py-2">
                              <BonsaiIcon className="mr-2 h-5 w-5 text-[#4a7c59]" />
                              <span className="font-medium text-[#2c3e2d]">+50 Bonsai Credits</span>
                            </div>
                            {activeModule === 0 && (
                              <div className="flex items-center rounded-full bg-white px-4 py-2">
                                <Award className="mr-2 h-5 w-5 text-[#4a7c59]" />
                                <span className="font-medium text-[#2c3e2d]">Beginner Pot Unlocked</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-center gap-4">
                        {quizScore >= 70 ? (
                          <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={proceedToNextModule}>
                            {activeModule < lesson.modules.length - 1 ? (
                              <>
                                Next Module
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </>
                            ) : (
                              "Complete Course"
                            )}
                          </Button>
                        ) : (
                          <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={retryQuiz}>
                            Retry Quiz
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">
                        {lesson.modules[activeModule].quiz.title}
                      </h2>
                      <div className="space-y-6">
                        {lesson.modules[activeModule].quiz.questions.map((question, qIndex) => (
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
                                  onClick={() => selectAnswer(question.id, oIndex)}
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
                          onClick={() => setShowModuleQuiz(false)}
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Back to Module
                        </Button>
                        <Button
                          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                          onClick={submitQuiz}
                          disabled={
                            Object.keys(selectedAnswers).length < lesson.modules[activeModule].quiz.questions.length
                          }
                        >
                          Submit Quiz
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Video Player */}
                  <div className="mb-4 overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm">
                    <div className="relative aspect-video bg-black">
                      {activeItem && activeItem.type === "video" ? (
                        <>
                          <video
                            ref={videoRef}
                            controls
                            className="absolute inset-0 w-full h-full object-cover"
                            src={activeItem.videoUrl}
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            Your browser does not support the video tag.
                          </video>

                        </>
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[#eef2eb] p-4 text-center text-[#4a7c59]">
                          <div>
                            <FileText className="mx-auto mb-2 h-12 w-12" />
                            <h3 className="text-lg font-medium">{activeItem?.title || "Select a lesson"}</h3>
                            <p className="mt-2 text-sm text-[#5c6d5e]">
                              {activeItem?.type === "material"
                                ? "Download this material to continue your learning"
                                : "Select a video from the list to start learning"}
                            </p>
                            {activeItem?.type === "material" && (
                              <Button className="mt-4 bg-[#4a7c59] text-white hover:bg-[#3a6147]">
                                <Download className="mr-2 h-4 w-4" />
                                Download Material
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module Completion Notification */}
                  {currentModuleCompleted && !showModuleQuiz && (
                    <div className="mb-4 rounded-lg border-2 border-[#4a7c59] bg-[#eef2eb] p-4 text-center">
                      <Award className="mx-auto mb-2 h-8 w-8 text-[#4a7c59]" />
                      <h2 className="mb-2 text-xl font-bold text-[#2c3e2d]">Module Completed!</h2>
                      <p className="mb-4 text-[#5c6d5e]">
                        You've completed all lessons in this module. Take the quiz to test your knowledge and proceed to
                        the next module.
                      </p>
                      <Button
                        className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                        onClick={() => setShowModuleQuiz(true)}
                      >
                        Take Module Quiz Now
                      </Button>
                    </div>
                  )}

                  {/* Course Info and Tabs */}
                  <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
                    <h1 className="text-2xl font-bold text-[#2c3e2d]">{lesson.title}</h1>

                    {/* Course Progress */}
                    <div className="mt-4 flex items-center">
                      <span className="mr-2 text-sm text-[#5c6d5e]">Course Progress:</span>
                      <div className="flex-1">
                        <Progress
                          value={overallProgress}
                          className="h-2 bg-[#dce4d7]"
                          indicatorClassName="bg-[#4a7c59]"
                        />
                      </div>
                      <span className="ml-2 text-sm font-medium text-[#2c3e2d]">{overallProgress}%</span>
                    </div>

                    {/* Course Meta Info */}
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
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>Last updated {lesson.lastUpdated}</span>
                      </div>
                    </div>

                    {/* Instructor Info */}
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

                    {/* Course Description */}
                    <div className="mt-4">
                      <h3 className="mb-2 font-medium text-[#2c3e2d]">About This Course</h3>
                      <p className="text-sm text-[#5c6d5e]">
                        {showFullDescription
                          ? lesson.fullDescription
                          : `${lesson.fullDescription.substring(0, 200)}...`}
                      </p>
                      <button
                        className="mt-2 text-sm font-medium text-[#4a7c59]"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                      >
                        {showFullDescription ? "Show less" : "Show more"}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Like
                      </Button>
                      <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Discuss
                      </Button>
                    </div>
                  </div>

                  {/* Current Lesson Info */}
                  {activeItem && (
                    <div className="rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
                      <h2 className="text-xl font-semibold text-[#2c3e2d]">{activeItem.title}</h2>
                      <p className="mt-2 text-[#5c6d5e]">
                        {activeItem.description || "No description available for this item."}
                      </p>

                      {activeItem.type === "material" && (
                        <div className="mt-4 rounded-md bg-[#eef2eb] p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="mr-2 h-5 w-5 text-[#4a7c59]" />
                              <span className="text-sm font-medium text-[#2c3e2d]">{activeItem.title}</span>
                            </div>
                            <Button size="sm" className="bg-[#4a7c59] text-white hover:bg-[#3a6147]">
                              <Download className="mr-1 h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Course Content Sidebar - Takes full width on mobile, 1/3 on desktop */}
            <div className="mt-4 w-full lg:mt-0 lg:w-1/3 lg:pl-4">
              <div className="sticky top-4 rounded-lg border border-[#dce4d7] bg-white shadow-sm">
                <div className="border-b border-[#dce4d7] bg-[#eef2eb] p-4">
                  <h2 className="font-semibold text-[#2c3e2d]">Course Content</h2>
                  <p className="text-sm text-[#5c6d5e]">
                    {completedItems.length} of {totalItems} lessons completed
                  </p>
                </div>

                <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
                  {lesson.modules.map((module, moduleIndex) => {
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
                            {isModuleComplete(moduleIndex) && <CheckCircle2 className="mr-2 h-4 w-4 text-[#4a7c59]" />}
                            <span className="text-xs text-[#5c6d5e]">
                              {module.items.filter((item) => completedItems.includes(item.id)).length}/
                              {module.items.length}
                            </span>
                          </div>
                        </div>

                        <div className={`space-y-1 p-2 ${!isAccessible ? "pointer-events-none" : ""}`}>
                          {module.items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors ${
                                !isAccessible
                                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                  : activeVideoId === item.id
                                    ? "cursor-pointer bg-[#4a7c59] text-white"
                                    : completedItems.includes(item.id)
                                      ? "cursor-pointer bg-[#eef2eb] text-[#2c3e2d]"
                                      : "cursor-pointer text-[#5c6d5e] hover:bg-[#f8f7f4]"
                              }`}
                              onClick={() => handleSelectItem(item.id, moduleIndex)}
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
                              {/* Completion toggle button */}
                              <button
                                className={`ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                                  !isAccessible
                                    ? "border-gray-300 text-gray-300"
                                    : completedItems.includes(item.id)
                                      ? "bg-[#4a7c59] text-white"
                                      : "border-[#dce4d7]"
                                }`}
                                onClick={(e) => isAccessible && toggleItemCompletion(item.id, e)}
                                disabled={!isAccessible}
                              >
                                {completedItems.includes(item.id) ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Circle className="h-3 w-3 opacity-0" />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Module Quiz Indicator */}
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
                                onClick={() => setShowModuleQuiz(true)}
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
                      onClick={() => activeModule > 0 && setActiveModule(activeModule - 1)}
                      disabled={activeModule === 0}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </Button>

                    {showModuleQuiz ? (
                      <Button
                        variant="outline"
                        className="border-[#4a7c59] text-[#4a7c59]"
                        onClick={() => setShowModuleQuiz(false)}
                      >
                        Back to Module
                      </Button>
                    ) : (
                      <Button
                        className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                        onClick={() => {
                          if (currentModuleCompleted) {
                            setShowModuleQuiz(true)
                          } else {
                            handleModuleCompletion()
                          }
                        }}
                      >
                        {currentModuleCompleted ? "Take Module Quiz" : "Complete & Take Quiz"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function Calendar(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
