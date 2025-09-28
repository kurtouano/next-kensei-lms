"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BannerSlider } from "@/components/banner-slider"
import { LoadingScreen } from "@/components/loading-screen"
import { ChevronRight, BookOpen, PlayCircle, Star, Award, ShoppingBag, Palette, MessageCircle, Users, GraduationCap } from "lucide-react"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCourseError] = useState(null)
  const [openFeature, setOpenFeature] = useState(null)

  // Handle loading completion
  const handleLoadingComplete = () => {
    setIsLoading(false)
  }

  // Fetch featured courses
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        setCoursesLoading(true)
        const response = await fetch('/api/courses/featured')
        const data = await response.json()
        
        if (data.success) {
          setFeaturedCourses(data.courses)
        } else {
          setCourseError(data.message || 'Failed to load featured courses')
        }
      } catch (error) {
        console.error('Error fetching featured courses:', error)
        setCourseError('Failed to load featured courses')
      } finally {
        setCoursesLoading(false)
      }
    }

    // Only fetch courses after loading is complete
    if (!isLoading) {
      fetchFeaturedCourses()
    }
  }, [isLoading])

  // Show loading screen until images are loaded
  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />
  }

  const banners = [
    {
      id: 1,
      title: "Master Japanese Online",
      description: "Start your journey to Japanese fluency today with our expert-led courses",
      buttonText: "Browse Courses",
      buttonLink: "/courses",
      image: "/banner1.png",
    },
    {
      id: 2,
      title: "Explore Our Free Courses",
      description: "Start learning Japanese with free courses that include certificates",
      buttonText: "View Free Courses",
      buttonLink: "#featured-courses",
      scrollTo: true,
      image: "/banner2.png",
    },
    {
      id: 3,
      title: "Learn with Kensei Sensei",
      description: "Watch exclusive tutorials from our master teacher",
      buttonText: "Watch Now on Youtube",
      buttonLink: "https://www.youtube.com/@KenseiSensei",
      target: "_blank",
      image: "/banner3.png",
    },
  ]

  const benefits = [
    {
      icon: GraduationCap,
      title: "Native Japanese Instructors",
      description: "Learn from certified Japanese instructors in Japan with high-quality video content. Get authentic pronunciation, cultural insights, and credible language education.",
      color: "bg-emerald-500"
    },
    {
      icon: BookOpen,
      title: "Interactive Quizzes & Exercises",
      description: "Test your knowledge with engaging quizzes and practice exercises in every course to reinforce your learning and track your progress.",
      color: "bg-violet-500"
    },
    {
      icon: Award,
      title: "Official Certificates",
      description: "Earn recognized completion certificates for each course you finish, perfect for your professional portfolio and language learning journey.",
      color: "bg-amber-500"
    },
    {
      icon: MessageCircle,
      title: "Direct Chat with Instructors",
      description: "Connect directly with your instructors and the learning community through our integrated chat feature. Get personalized help and support whenever you need it.",
      color: "bg-blue-500"
    }
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">

      <main className="flex-1">
        {/* Banner Slider */}
        <section className="relative">
          <BannerSlider banners={banners} autoSlideInterval={5000} />
        </section>

        {/* What You'll Get Section */}
        <section className="py-8 md:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-[#2c3e2d]">What You'll Get</h2>
              <p className="mx-auto max-w-2xl text-[#5c6d5e]">
                Every course completion comes with valuable rewards that enhance your learning experience and celebrate your progress
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-6 rounded-2xl bg-gradient-to-r from-white to-gray-50 p-6 shadow-sm border border-gray-100">
                  <div className="flex-shrink-0">
                    <div className={`${benefit.color} rounded-2xl p-4 shadow-md`}>
                      <benefit.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-3 text-xl font-bold text-[#2c3e2d]">{benefit.title}</h3>
                    <p className="text-sm md:text-base text-[#5c6d5e] leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section id="featured-courses" className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-[#2c3e2d]">Featured Courses</h2>
              <p className="mx-auto max-w-2xl text-[#5c6d5e]">
                Begin your Japanese language journey with our most popular courses, designed for learners at every level
              </p>
            </div>

            {/* Dynamic Featured Courses */}
            {coursesLoading ? (
              <FeaturedCoursesLoading />
            ) : coursesError ? (
              <FeaturedCoursesError error={coursesError} />
            ) : featuredCourses.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredCourses.map((course) => (
                  <FeaturedCourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyFeaturedCourses />
            )}

            <div className="mt-10 text-center">
              <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                <Link href="/courses">
                  Browse Courses
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bonsai Credit System */}
        <section className="bg-white py-8 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid items-center md:gap-16 md:grid-cols-2">
              <div>
                <h2 className="mb-6 text-3xl font-bold text-[#2c3e2d]">Grow Your Bonsai Tree</h2>
                <p className="mb-10 text-[#5c6d5e]">
                  Our unique learning approach combines Japanese language acquisition with the art of bonsai
                  cultivation.
                </p>
                <div className="mb-8 space-y-2">
                  <div className="border border-[#dce4d7] rounded-lg">
                    <button
                      onClick={() => setOpenFeature(openFeature === 0 ? null : 0)}
                      className="w-full flex items-center justify-between p-4 text-left  transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                          <ChevronRight className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-medium text-[#2c3e2d]">Customizable Bonsai Tree</h3>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-[#4a7c59] transition-transform ${
                          openFeature === 0 ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFeature === 0 ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-4 pb-4">
                        <p className="text-[#5c6d5e] ml-8">
                          Express your personality by decorating your bonsai as you progress through your learning journey.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-[#dce4d7] rounded-lg">
                    <button
                      onClick={() => setOpenFeature(openFeature === 1 ? null : 1)}
                      className="w-full flex items-center justify-between p-4 text-left  transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                          <ChevronRight className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-medium text-[#2c3e2d]">Earn Credits as You Learn</h3>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-[#4a7c59] transition-transform ${
                          openFeature === 1 ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFeature === 1 ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-4 pb-4">
                        <p className="text-[#5c6d5e] ml-8">
                          Complete courses to earn Bonsai Credits. Use credits to buy decorations for your bonsai tree.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-[#dce4d7] rounded-lg">
                    <button
                      onClick={() => setOpenFeature(openFeature === 2 ? null : 2)}
                      className="w-full flex items-center justify-between p-4 text-left  transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                          <ChevronRight className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-medium text-[#2c3e2d]">Visual Progress Tracking</h3>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-[#4a7c59] transition-transform ${
                          openFeature === 2 ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFeature === 2 ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-4 pb-4">
                        <p className="text-[#5c6d5e] ml-8">
                          The more credits you earn, the bigger your bonsai tree becomes. Watch your tree grow as you complete more courses.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-[#dce4d7] rounded-lg">
                    <button
                      onClick={() => setOpenFeature(openFeature === 3 ? null : 3)}
                      className="w-full flex items-center justify-between p-4 text-left  transition-colors"
                    >
                      <div className="flex items-center">
                        <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                          <ChevronRight className="h-4 w-4 text-white" />
                        </div>
                        <h3 className="font-medium text-[#2c3e2d]">Share Your Progress</h3>
                      </div>
                      <ChevronRight 
                        className={`h-4 w-4 text-[#4a7c59] transition-transform ${
                          openFeature === 3 ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      openFeature === 3 ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className="px-4 pb-4">
                        <p className="text-[#5c6d5e] ml-8">
                          Show off your growing bonsai tree to friends and the community. Compare your progress with other learners.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative max-w-md">
                  <div className="aspect-square overflow-hidden">
                    <div className="flex h-full items-center justify-center p-8">
                      <img 
                        src="/bonsaiLevelThree.svg" 
                        alt="Level 3 Bonsai Tree" 
                        className="h-full w-full object-contain" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Sign Up Button (visible on scroll) */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button className="rounded-full bg-[#4a7c59] px-6 py-6 text-white shadow-lg hover:bg-[#3a6147]" asChild>
            <Link href="/auth/signup">Get Started</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}

// Featured Course Card Component
function FeaturedCourseCard({ course }) {
  const handleImageError = (e) => {
    e.target.src = "/placeholder.svg"
  }

  return (
    <Link href={`/courses/${course.slug}`} className="block">
      <div className="group relative overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer">
        <div className="aspect-video w-full overflow-hidden relative">
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500"
            onError={handleImageError}
          />
          {/* JLPT Level Badge on Image */}
          <div className="absolute top-4 right-4">
            <span className="rounded-sm bg-[#eef2eb] px-3 py-1 text-xs font-medium text-[#4a7c59] shadow-sm">
              JLPT {course.level}
            </span>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          {/* Rating and Lessons in one row */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(course.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#5c6d5e]">
                {course.averageRating > 0 ? course.averageRating.toFixed(1) : '0.0'} ({course.totalRatings})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#5c6d5e]">
              <PlayCircle className="h-3 w-3" />
              <span>{course.lessonsCount} lessons</span>
            </div>
          </div>

          <h3 className="mb-2 text-xl font-bold text-[#2c3e2d]">{course.title}</h3>
          <p className="mb-4 text-[#5c6d5e] text-sm line-clamp-2 flex-1">
            {course.description}
          </p>

          {/* Button always at bottom */}
          <div className="mt-auto">
            <div className="w-full border border-[#4a7c59] text-[#4a7c59] hover:border-[#3a6147] hover:bg-[#4a7c59]/12 hover:text-[#3a6147] transition-all duration-200 ease-out backdrop-blur-sm group rounded-md px-4 py-2 text-center text-sm font-medium">
              <span className="flex items-center justify-center">
                View Course
                <ChevronRight className="ml-4 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// Loading component for featured courses
function FeaturedCoursesLoading() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm">
          <div className="aspect-video w-full bg-gray-200 animate-pulse"></div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between">
              <div className="h-5 bg-gray-200 rounded-full w-16 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Error component for featured courses
function FeaturedCoursesError({ error }) {
  return (
    <div className="text-center py-12">
      <div className="text-red-500 mb-2">Failed to load featured courses</div>
      <p className="text-[#5c6d5e] text-sm">{error}</p>
    </div>
  )
}

// Empty state component
function EmptyFeaturedCourses() {
  return (
    <div className="text-center py-12">
      <BookOpen className="mx-auto mb-4 h-12 w-12 text-[#5c6d5e]" />
      <h3 className="text-lg font-medium text-[#2c3e2d] mb-2">No featured courses available</h3>
      <p className="text-[#5c6d5e] mb-4">
        Featured courses will appear here once they are published and have student enrollments.
      </p>
    </div>
  )
}

