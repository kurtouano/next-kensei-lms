"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CourseCard } from "./CourseCard"

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
        setCourses(data.courses) // Get Data from API 
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