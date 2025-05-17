"use client"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Search } from "lucide-react"

export default function MyLearning() {
  // Mock user data
  const user = {
    name: "Akira",
    totalCourses: 3,
  }

  // Mock courses data
  const inProgressCourses = [
    {
      id: 1,
      title: "Japanese for Beginners",
      level: "N5",
      progress: 65,
      lastLesson: "Basic Greetings",
      image: "/placeholder.svg?height=200&width=400",
      totalLessons: 24,
      completedLessons: 16,
      instructor: "Tanaka Sensei",
    },
    {
      id: 2,
      title: "Intermediate Conversation",
      level: "N4",
      progress: 30,
      lastLesson: "Asking for Directions",
      image: "/placeholder.svg?height=200&width=400",
      totalLessons: 18,
      completedLessons: 5,
      instructor: "Yamada Sensei",
    },
    {
      id: 3,
      title: "Business Japanese",
      level: "N3",
      progress: 10,
      lastLesson: "Introduction to Keigo",
      image: "/placeholder.svg?height=200&width=400",
      totalLessons: 20,
      completedLessons: 2,
      instructor: "Sato Sensei",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header isLoggedIn={true} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          {/* Simple Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl mb-2 font-bold text-gray-900">My Learning</h1>
            <p className="text-gray-600">Continue your Japanese learning journey</p>
          </div>

          {/* In Progress Courses */}
          <div className="mb-12">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">In Progress</h2>
              <span className="text-sm text-gray-500">{user.totalCourses} courses</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inProgressCourses.map((course) => (
                <Card
                  key={course.id}
                  className="overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <CardContent className="relative p-4">
                    <h3 className="mb-1 text-lg font-medium text-gray-900">{course.title}</h3>
                    <div className="absolute top-4 right-2 rounded-full bg-[#4a7c59] px-2 py-1 text-xs font-medium text-white">
                      {course.level}
                    </div>
                    <p className="mb-3 text-sm text-gray-500">Instructor: {course.instructor}</p>

                    <div className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                        <span className="font-medium text-[#4a7c59]">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2 bg-gray-100" indicatorClassName="bg-[#4a7c59]" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        <span>Last: {course.lastLesson}</span>
                      </div>
                      <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" size="sm" asChild>
                        <Link href={`/lessons/${course.id}`}>Continue</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
