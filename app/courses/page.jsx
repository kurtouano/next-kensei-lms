"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BookOpen, Award, Check } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "beginner", name: "Beginner (N5)" },
    { id: "intermediate", name: "Intermediate (N4-N3)" },
    { id: "advanced", name: "Advanced (N2-N1)" },
    { id: "business", name: "Business Japanese" },
    { id: "culture", name: "Culture & Traditions" },
  ]

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses')
        const data = await response.json()
        setCourses(data.courses)
      } catch (error) {
        console.error("Failed to fetch courses:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const filteredCourses =
    selectedCategory === "all" 
      ? courses 
      : courses.filter((course) => course.level === selectedCategory)

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex h-64 items-center justify-center">
              <p>Loading courses...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Course Catalog</h1>
            <p className="text-[#5c6d5e]">Browse our comprehensive selection of Japanese language courses</p>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-6 grid w-full grid-cols-2 gap-2 bg-transparent p-0 md:flex md:flex-wrap">
              {categories.map((category) => (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="border border-[#dce4d7] bg-white data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-xl font-semibold text-[#2c3e2d]">{course.title}</h3>
        <p className="mb-4 text-sm text-[#5c6d5e]">{course.description}</p>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-bold text-[#2c3e2d]">${course.price}</div>
          <div className="flex items-center text-sm text-[#5c6d5e]">
            <BonsaiIcon className="mr-1 h-4 w-4 text-[#4a7c59]" />
            {course.credits} credits
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-md bg-[#eef2eb] p-3">
          <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
            <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
            {course.modules} modules • {course.quizzes} quizzes
          </div>
          <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
            <Award className="mr-2 h-4 w-4 text-[#4a7c59]" />
            Includes: {course.customItems.join(", ")}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-[#2c3e2d]">Learning Highlights:</h4>
          <ul className="space-y-1">
            {course.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="mr-2 h-4 w-4 shrink-0 text-[#4a7c59]" />
                <span className="text-[#5c6d5e]">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 align-bottom">
          <Button className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]">
            Subscribe
          </Button>
          <Link
            href={`/lessons/${course.id}`}
            className="flex-1 rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-center text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]"
          >
            Preview
          </Link>
        </div>
      </div>
    </div>
  )
}