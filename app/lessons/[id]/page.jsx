"use client"

import { useState, useRef, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id
  const videoRef = useRef(null)

  const [activeModule, setActiveModule] = useState(0)
  const [activeTab, setActiveTab] = useState("content")
  const [completedItems, setCompletedItems] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [activeVideoId, setActiveVideoId] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [showFullDescription, setShowFullDescription] = useState(false)

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
            videoUrl: "https://example.com/videos/intro-writing-systems.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn about the three Japanese writing systems: Hiragana, Katakana, and Kanji.",
          },
          {
            id: "material-1",
            type: "material",
            title: "Hiragana Chart and Pronunciation Guide",
            fileUrl: "https://example.com/materials/hiragana-chart.pdf",
            fileSize: "2.4 MB",
          },
          {
            id: "video-2",
            type: "video",
            title: "How to Write Hiragana: Basic Strokes",
            duration: "15:10",
            videoUrl: "https://example.com/videos/hiragana-strokes.mp4",
            thumbnail: "/placeholder.svg?height=720&width=1280",
            description: "Learn the basic strokes and proper technique for writing Hiragana characters.",
          },
          {
            id: "material-2",
            type: "material",
            title: "Practice Worksheets",
            fileUrl: "https://example.com/materials/hiragana-practice.pdf",
            fileSize: "1.8 MB",
          },
        ],
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
            title: "Dialogue Practice",
            fileUrl: "https://example.com/materials/dialogue-practice.pdf",
            fileSize: "1.5 MB",
          },
        ],
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
            title: "Self Introduction Template",
            fileUrl: "https://example.com/materials/intro-template.pdf",
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
            title: "Practice Exercises",
            fileUrl: "https://example.com/materials/question-exercises.pdf",
            fileSize: "1.3 MB",
          },
        ],
      },
    ],
    quiz: {
      title: "Module 1 Quiz",
      questions: [
        {
          id: 1,
          question: "Which of the following is NOT a Japanese writing system?",
          options: ["Hiragana", "Katakana", "Kanji", "Romaji", "Hangul"],
          correctAnswer: 4,
        },
        {
          id: 2,
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
          id: 3,
          question: "How do you say 'My name is...' in Japanese?",
          options: ["お元気ですか", "私の名前は...です", "ありがとうございます", "どこですか"],
          correctAnswer: 1,
        },
        {
          id: 4,
          question: "Which hiragana character represents the 'a' sound?",
          options: ["い", "う", "え", "あ", "お"],
          correctAnswer: 3,
        },
        {
          id: 5,
          question: "What is the appropriate response to 'おはようございます' (Good morning)?",
          options: ["さようなら", "おはようございます", "こんにちは", "はじめまして"],
          correctAnswer: 1,
        },
      ],
    },
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
  const handleSelectItem = (itemId) => {
    if (itemId !== activeVideoId) {
      setActiveVideoId(itemId)
      setIsPlaying(true)
      setVideoProgress(0)

      // Mark as complete after a delay (simulating watching)
      if (!completedItems.includes(itemId)) {
        setTimeout(() => {
          markAsComplete(itemId)
        }, 3000)
      }
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

  const isModuleComplete = (moduleIndex) => {
    const moduleItems = lesson.modules[moduleIndex].items
    return moduleItems.every((item) => completedItems.includes(item.id))
  }

  const markAsComplete = (itemId) => {
    if (!completedItems.includes(itemId)) {
      setCompletedItems([...completedItems, itemId])
    }
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

    // If there's a next module, go to it
    if (activeModule < lesson.modules.length - 1) {
      setActiveModule(activeModule + 1)
    } else {
      // If this is the last module, show the quiz
      setActiveTab("quiz")
    }
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
    // Calculate score
    let correctAnswers = 0
    lesson.quiz.questions.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctAnswer) {
        correctAnswers++
      }
    })

    const score = Math.round((correctAnswers / lesson.quiz.questions.length) * 100)
    setQuizScore(score)
    setQuizCompleted(true)
  }

  const skipQuiz = () => {
    setActiveModule(0) // Reset to first module
    setActiveTab("content") // Go back to content tab
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-[#eef2eb]">
              <TabsTrigger value="content" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                Lesson Content
              </TabsTrigger>
              <TabsTrigger value="quiz" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                Module Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 border-0 p-0">
              <div className="flex flex-col lg:flex-row">
                {/* Video Player Section - Takes full width on mobile, 2/3 on desktop */}
                <div className="w-full lg:w-2/3 lg:pr-4">
                  {/* Video Player */}
                  <div className="mb-4 overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm">
                    <div className="relative aspect-video bg-black">
                      {activeItem && activeItem.type === "video" ? (
                        <>
                          <img
                            src={activeItem.thumbnail || "/placeholder.svg"}
                            alt={activeItem.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4a7c59]/80 text-white transition-transform hover:scale-110"
                              onClick={() => setIsPlaying(!isPlaying)}
                            >
                              {isPlaying ? <Pause className="h-8 w-8" /> : <PlayCircle className="h-8 w-8" />}
                            </button>
                          </div>

                          {/* Video Controls */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                            <div className="mb-2">
                              <Progress
                                value={videoProgress}
                                className="h-1 bg-white/30"
                                indicatorClassName="bg-[#4a7c59]"
                              />
                            </div>
                            <div className="flex items-center justify-between text-white">
                              <div className="flex items-center space-x-3">
                                <button onClick={() => setIsPlaying(!isPlaying)}>
                                  {isPlaying ? <Pause className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                                </button>
                                <span className="text-sm">
                                  {Math.floor((videoProgress / 100) * Number.parseInt(activeItem.duration)) || "0:00"} /{" "}
                                  {activeItem.duration}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <button>
                                  <Volume2 className="h-5 w-5" />
                                </button>
                                <button>
                                  <Settings className="h-5 w-5" />
                                </button>
                                <button>
                                  <Maximize className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
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

                      <div className="mt-6">
                        <Button
                          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                          onClick={() => markAsComplete(activeItem.id)}
                          disabled={completedItems.includes(activeItem.id)}
                        >
                          {completedItems.includes(activeItem.id) ? "Completed" : "Mark as Complete"}
                        </Button>
                      </div>
                    </div>
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
                      {lesson.modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border-b border-[#dce4d7] last:border-b-0">
                          <div
                            className={`flex items-center justify-between p-4 ${
                              activeModule === moduleIndex ? "bg-[#eef2eb]" : ""
                            }`}
                          >
                            <h3 className="font-medium text-[#2c3e2d]">{module.title}</h3>
                            <div className="flex items-center">
                              {isModuleComplete(moduleIndex) && (
                                <CheckCircle2 className="mr-2 h-4 w-4 text-[#4a7c59]" />
                              )}
                              <span className="text-xs text-[#5c6d5e]">
                                {module.items.filter((item) => completedItems.includes(item.id)).length}/
                                {module.items.length}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 p-2">
                            {module.items.map((item) => (
                              <button
                                key={item.id}
                                className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors ${
                                  activeVideoId === item.id
                                    ? "bg-[#4a7c59] text-white"
                                    : completedItems.includes(item.id)
                                      ? "bg-[#eef2eb] text-[#2c3e2d]"
                                      : "text-[#5c6d5e] hover:bg-[#f8f7f4]"
                                }`}
                                onClick={() => handleSelectItem(item.id)}
                              >
                                <div className="mr-3 flex-shrink-0">
                                  {item.type === "video" ? (
                                    <PlayCircle
                                      className={`h-4 w-4 ${activeVideoId === item.id ? "text-white" : "text-[#4a7c59]"}`}
                                    />
                                  ) : (
                                    <FileText
                                      className={`h-4 w-4 ${activeVideoId === item.id ? "text-white" : "text-[#4a7c59]"}`}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">{item.title}</span>
                                    <div className="ml-2 flex items-center">
                                      {item.type === "video" && (
                                        <span
                                          className={`text-xs ${activeVideoId === item.id ? "text-white/80" : "text-[#5c6d5e]"}`}
                                        >
                                          {item.duration}
                                        </span>
                                      )}
                                      {completedItems.includes(item.id) && activeVideoId !== item.id && (
                                        <CheckCircle2 className="ml-2 h-3 w-3 text-[#4a7c59]" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
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

                        <Button
                          className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                          onClick={() => {
                            if (isModuleComplete(activeModule)) {
                              if (activeModule < lesson.modules.length - 1) {
                                setActiveModule(activeModule + 1)
                              } else {
                                setActiveTab("quiz")
                              }
                            } else {
                              handleModuleCompletion()
                            }
                          }}
                        >
                          {isModuleComplete(activeModule) ? (
                            activeModule < lesson.modules.length - 1 ? (
                              <>
                                Next
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </>
                            ) : (
                              <>
                                Quiz
                                <ChevronRight className="ml-1 h-4 w-4" />
                              </>
                            )
                          ) : (
                            "Complete"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
                {!quizStarted ? (
                  <div className="text-center">
                    <BookOpen className="mx-auto mb-4 h-16 w-16 text-[#4a7c59]" />
                    <h2 className="mb-2 text-2xl font-bold text-[#2c3e2d]">{lesson.quiz.title}</h2>
                    <p className="mb-6 text-[#5c6d5e]">
                      Test your knowledge of the material covered in this module. You can retake the quiz if needed.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={startQuiz}>
                        Start Quiz
                      </Button>
                      <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]" onClick={skipQuiz}>
                        Skip for Now
                      </Button>
                    </div>
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
                        ? "Congratulations! You've passed the quiz."
                        : "You didn't pass this time. Review the material and try again."}
                    </p>

                    {quizScore >= 70 && (
                      <div className="mb-8 rounded-lg bg-[#eef2eb] p-4">
                        <h3 className="mb-2 text-lg font-semibold text-[#2c3e2d]">Rewards Earned:</h3>
                        <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
                          <div className="flex items-center rounded-full bg-white px-4 py-2">
                            <BonsaiIcon className="mr-2 h-5 w-5 text-[#4a7c59]" />
                            <span className="font-medium text-[#2c3e2d]">+50 Bonsai Credits</span>
                          </div>
                          <div className="flex items-center rounded-full bg-white px-4 py-2">
                            <Award className="mr-2 h-5 w-5 text-[#4a7c59]" />
                            <span className="font-medium text-[#2c3e2d]">Beginner Pot Unlocked</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-center gap-4">
                      <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" onClick={startQuiz}>
                        Retry Quiz
                      </Button>
                      <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]" onClick={skipQuiz}>
                        Back to Lessons
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">{lesson.quiz.title}</h2>
                    <div className="space-y-6">
                      {lesson.quiz.questions.map((question, qIndex) => (
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
                        onClick={() => setActiveTab("content")}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Back to Lessons
                      </Button>
                      <Button
                        className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                        onClick={submitQuiz}
                        disabled={Object.keys(selectedAnswers).length < lesson.quiz.questions.length}
                      >
                        Submit Quiz
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
