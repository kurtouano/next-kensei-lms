"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonsaiIcon } from "@/components/bonsai-icon"
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  BookOpen,
  Award,
  AlertCircle,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function LessonPage() {
  const params = useParams()
  const lessonId = params.id

  const [activeModule, setActiveModule] = useState(0)
  const [activeTab, setActiveTab] = useState("content")
  const [completedItems, setCompletedItems] = useState([])
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({})

  // Mock lesson data
  const lesson = {
    id: lessonId,
    title: "Japanese for Beginners - Module 1",
    description: "Introduction to Japanese language basics",
    progress: 35,
    modules: [
      {
        id: "module-1",
        title: "Introduction to Hiragana",
        items: [
          { id: "video-1", type: "video", title: "Introduction to Japanese Writing Systems" },
          { id: "material-1", type: "material", title: "Hiragana Chart and Pronunciation Guide" },
          { id: "video-2", type: "video", title: "How to Write Hiragana: Basic Strokes" },
          { id: "material-2", type: "material", title: "Practice Worksheets" },
        ],
      },
      {
        id: "module-2",
        title: "Basic Greetings",
        items: [
          { id: "video-3", type: "video", title: "Common Japanese Greetings" },
          { id: "material-3", type: "material", title: "Greeting Vocabulary List" },
          { id: "video-4", type: "video", title: "Formal vs. Casual Greetings" },
          { id: "material-4", type: "material", title: "Dialogue Practice" },
        ],
      },
      {
        id: "module-3",
        title: "Self Introduction",
        items: [
          { id: "video-5", type: "video", title: "How to Introduce Yourself" },
          { id: "material-5", type: "material", title: "Self Introduction Template" },
          { id: "video-6", type: "video", title: "Asking Questions About Others" },
          { id: "material-6", type: "material", title: "Practice Exercises" },
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

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header */}
      <Header isLoggedIn={true} />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="md:hidden">
            <h1 className="mb-4 text-2xl font-bold text-[#2c3e2d]">{lesson.title}</h1>
            <div className="mb-6 flex items-center">
              <span className="mr-2 text-sm text-[#5c6d5e]">Progress:</span>
              <div className="flex-1">
                <Progress value={lesson.progress} className="h-2 bg-[#dce4d7]" indicatorClassName="bg-[#4a7c59]" />
              </div>
              <span className="ml-2 text-sm font-medium text-[#2c3e2d]">{lesson.progress}%</span>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#eef2eb]">
              <TabsTrigger value="content" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                Lesson Content
              </TabsTrigger>
              <TabsTrigger value="quiz" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                Module Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Module Navigation */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-4">
                  <h2 className="mb-4 text-lg font-semibold text-[#2c3e2d]">Modules</h2>
                  <ul className="space-y-2">
                    {lesson.modules.map((module, index) => (
                      <li key={module.id}>
                        <button
                          onClick={() => setActiveModule(index)}
                          className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors ${
                            activeModule === index ? "bg-[#eef2eb] text-[#4a7c59]" : "text-[#5c6d5e] hover:bg-[#f8f7f4]"
                          }`}
                        >
                          {isModuleComplete(index) ? (
                            <CheckCircle2 className="mr-2 h-4 w-4 text-[#4a7c59]" />
                          ) : (
                            <Circle className="mr-2 h-4 w-4" />
                          )}
                          <span>{module.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Module Content */}
                <div className="md:col-span-2">
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">{lesson.modules[activeModule].title}</h2>

                    <div className="space-y-4">
                      {lesson.modules[activeModule].items.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-md border p-4 transition-colors ${
                            completedItems.includes(item.id)
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {item.type === "video" ? (
                                <PlayCircle className="mr-3 h-5 w-5 text-[#4a7c59]" />
                              ) : (
                                <FileText className="mr-3 h-5 w-5 text-[#4a7c59]" />
                              )}
                              <div>
                                <h3 className="font-medium text-[#2c3e2d]">{item.title}</h3>
                                <p className="text-sm text-[#5c6d5e]">
                                  {item.type === "video" ? "Video Lesson" : "Learning Material"}
                                </p>
                              </div>
                            </div>
                            <Button
                              variant={completedItems.includes(item.id) ? "outline" : "default"}
                              size="sm"
                              className={
                                completedItems.includes(item.id)
                                  ? "border-[#4a7c59] text-[#4a7c59]"
                                  : "bg-[#4a7c59] text-white"
                              }
                              onClick={() => markAsComplete(item.id)}
                            >
                              {completedItems.includes(item.id) ? "Completed" : "Mark Complete"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex justify-between">
                      <Button
                        variant="outline"
                        className="border-[#4a7c59] text-[#4a7c59]"
                        onClick={() => activeModule > 0 && setActiveModule(activeModule - 1)}
                        disabled={activeModule === 0}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous Module
                      </Button>
                      <Button
                        className="bg-[#4a7c59] text-white"
                        onClick={handleModuleCompletion}
                        disabled={!lesson.modules[activeModule].items.some((item) => !completedItems.includes(item.id))}
                      >
                        {isModuleComplete(activeModule) ? (
                          activeModule < lesson.modules.length - 1 ? (
                            <>
                              Next Module
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Take Quiz
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </>
                          )
                        ) : (
                          "Complete Module"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="quiz" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
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
