"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CourseCard } from "./CourseCard"
import { useSession } from "next-auth/react" 

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)
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

  useEffect(() => { // Fetch Courses
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

  useEffect(() => { // Fetch User Details
    const fetchUserDetails = async () => {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
        }
        const data = await res.json()
        if (data.success) {
        setUserData(data.user)
        } else {
          console.error('Failed to fetch user:', data.message)
        }
        setUserData(data.user)
      } catch (error) {
        console.error("Failed to fetch user details:", error)
      }
    }

    fetchUserDetails();
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