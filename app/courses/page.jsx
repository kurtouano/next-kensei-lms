"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CourseCard } from "./CourseCard"
import { useSession } from "next-auth/react"
import { AlertCircle, BookOpen, Loader2 } from "lucide-react"

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const [userData, setUserData] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "beginner", name: "Beginner (N5)" },
    { id: "intermediate", name: "Elementary (N4)" },
    { id: "advanced", name: "Intermediate (N3)" },
    { id: "upper-intermediate", name: "Upper Intermediate (N2)" },
    { id: "fluent", name: "Advanced (N1)" },
  ]

  useEffect(() => { // Fetch Courses
    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/courses', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        
        const data = await response.json()
        console.log('Courses API Response:', data) // Debug log
        
        if (!response.ok) {
          throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
        }
        
        // Handle different response formats
        let coursesArray = [];
        if (data.success && Array.isArray(data.courses)) {
          coursesArray = data.courses;
        } else if (Array.isArray(data.courses)) {
          coursesArray = data.courses;
        } else if (Array.isArray(data)) {
          coursesArray = data;
        } else {
          throw new Error('Invalid response format - expected courses array')
        }
        
        setCourses(coursesArray)
        console.log(`Loaded ${coursesArray.length} courses`) // Debug log
        
      } catch (error) {
        console.error("Failed to fetch courses:", error)
        setError(error.message)
        setCourses([]) // Set empty array as fallback
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => { // Fetch User Details
    const fetchUserDetails = async () => {
      if (status !== "authenticated") return
      
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
      } catch (error) {
        console.error("Failed to fetch user details:", error)
      }
    }

    if (status !== "loading") {
      fetchUserDetails()
    }
  }, [status])

  // Filter courses based on selected category
  const filteredCourses = selectedCategory === "all" 
    ? courses.filter(course => course.isPublished !== false) // Show published courses
    : courses.filter((course) => {
        // Handle both level and category filtering
        const matchesLevel = course.level === selectedCategory
        const matchesCategory = course.category === selectedCategory
        const isPublished = course.isPublished !== false
        
        return (matchesLevel || matchesCategory) && isPublished
      })

  // Sort courses by rating and then by creation date
  const sortedCourses = filteredCourses.sort((a, b) => {
    const aRating = a.ratingStats?.averageRating || a.averageRating || 0
    const bRating = b.ratingStats?.averageRating || b.averageRating || 0
    
    // First sort by rating (highest first)
    if (aRating !== bRating) {
      return bRating - aRating
    }
    
    // Then by creation date (newest first)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  })

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header isLoggedIn={!!session?.user} />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-[#4a7c59] mx-auto mb-4" />
                <p className="text-[#5c6d5e]">Loading courses...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <Header isLoggedIn={!!session?.user} />
        <main className="flex-1 py-8">
          <div className="container mx-auto px-4">
            <div className="flex h-64 items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <p className="text-red-500 mb-2">Error loading courses</p>
                <p className="text-[#5c6d5e]">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-[#4a7c59] text-white rounded-md hover:bg-[#3a6147]"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <Header isLoggedIn={!!session?.user} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Course Catalog</h1>
            <p className="text-[#5c6d5e]">
              Browse our comprehensive selection of Japanese language courses
            </p>
            <div className="mt-2 text-sm text-[#5c6d5e]">
              {courses.length} course{courses.length !== 1 ? 's' : ''} available
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-8">
            <TabsList className="mb-6 w-full bg-transparent p-0 justify-around">
              {/* Mobile: Stack vertically */}
              <div className="grid grid-cols-2 gap-2 w-full sm:hidden">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="border border-[#dce4d7] bg-white data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white hover:bg-[#eef2eb] transition-colors text-xs px-2 py-2"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </div>
              
              {/* Desktop: Horizontal flex */}
              <div className="hidden gap-3 sm:flex sm:flex-wrap sm:justify-start">
                {categories.map((category) => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="border border-[#dce4d7] bg-white data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white hover:bg-[#eef2eb] transition-colors whitespace-nowrap"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-0">
              {sortedCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e]" />
                  <h3 className="text-lg font-medium text-[#2c3e2d] mb-2">
                    No courses found
                  </h3>
                  <p className="text-[#5c6d5e]">
                    {selectedCategory === "all" 
                      ? "No courses are currently available." 
                      : `No courses found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
                    }
                  </p>
                  {selectedCategory !== "all" && (
                    <button 
                      onClick={() => setSelectedCategory("all")}
                      className="mt-4 px-4 py-2 bg-[#4a7c59] text-white rounded-md hover:bg-[#3a6147]"
                    >
                      View All Courses
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Fixed responsive course info section */}
                  <div className="mb-4 space-y-2 mt-6 lg:mt-0">
                    <div className="flex flex-row justify-between space-y-1 sm:space-y-0 sm:flex-row items-center">
                      <div className="text-xs text-[#5c6d5e]">
                        <span className="flex sm:inline">
                          Showing {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
                        </span>
                        {selectedCategory !== "all" && (
                          <span className="block sm:inline sm:ml-1">
                            in {categories.find(c => c.id === selectedCategory)?.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5c6d5e] sm:text-right">
                        Sorted by rating and date
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedCourses.map((course) => (
                      <CourseCard key={course._id || course.id} course={course} />
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}