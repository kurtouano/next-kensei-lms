"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BannerSlider } from "@/components/banner-slider"
import { LoadingScreen } from "@/components/loading-screen"
import { ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <LoadingScreen />
  }

  const banners = [
    {
      id: 1,
      title: "Master Japanese Online",
      description: "Start your journey to Japanese fluency today with our expert-led courses",
      buttonText: "Browse Courses",
      buttonLink: "/courses",
      image: "/placeholder.svg?height=600&width=1200",
    },
    {
      id: 2,
      title: "Try a Free Demo Lesson",
      description: "Experience our teaching methodology with a complimentary lesson",
      buttonText: "Get Free Access",
      buttonLink: "/demo",
      image: "/placeholder.svg?height=600&width=1200",
    },
    {
      id: 3,
      title: "Bonsai Credit System",
      description: "Grow your bonsai tree as you learn! Earn credits with every completed lesson",
      buttonText: "Learn More",
      buttonLink: "/credits",
      image: "/placeholder.svg?height=600&width=1200",
    },
    {
      id: 4,
      title: "Learn with Kensei Sensei",
      description: "Watch exclusive tutorials from our master teacher",
      buttonText: "Watch Now",
      buttonLink: "/videos",
      image: "/placeholder.svg?height=600&width=1200",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header */}
      <Header />

      <main className="flex-1">
        {/* Banner Slider */}
        <section className="relative">
          <BannerSlider banners={banners} />
        </section>

        {/* Featured Courses */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-bold text-[#2c3e2d]">Featured Courses</h2>
              <p className="mx-auto max-w-2xl text-[#5c6d5e]">
                Begin your Japanese language journey with our most popular courses, designed for learners at every level
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Japanese for Beginners",
                  level: "N5",
                  lessons: 24,
                  image: "/placeholder.svg?height=200&width=400",
                },
                {
                  title: "Intermediate Conversation",
                  level: "N4",
                  lessons: 18,
                  image: "/placeholder.svg?height=200&width=400",
                },
                {
                  title: "Business Japanese",
                  level: "N3",
                  lessons: 20,
                  image: "/placeholder.svg?height=200&width=400",
                },
              ].map((course, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={course.image || "/placeholder.svg"}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-[#eef2eb] px-3 py-1 text-xs font-medium text-[#4a7c59]">
                        JLPT {course.level}
                      </span>
                      <span className="text-sm text-[#5c6d5e]">{course.lessons} lessons</span>
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-[#2c3e2d]">{course.title}</h3>
                    <p className="mb-4 text-[#5c6d5e]">
                      Master essential Japanese skills with our structured curriculum and interactive lessons.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb]"
                      asChild
                    >
                      <Link href={`/courses/${index + 1}`}>
                        View Course
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                <Link href="/courses">
                  View All Courses
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Bonsai Credit System */}
        <section className="bg-[#eef2eb] py-16">
          <div className="container mx-auto px-4">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-3xl font-bold text-[#2c3e2d]">Bonsai Credit System</h2>
                <p className="mb-6 text-lg text-[#5c6d5e]">
                  Our unique learning approach combines Japanese language acquisition with the art of bonsai
                  cultivation.
                </p>
                <ul className="mb-8 space-y-4">
                  <li className="flex items-start">
                    <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2c3e2d]">Earn Credits as You Learn</h3>
                      <p className="text-[#5c6d5e]">
                        Complete lessons and exercises to earn Bonsai Credits that help your virtual tree grow
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2c3e2d]">Track Your Progress</h3>
                      <p className="text-[#5c6d5e]">
                        Watch your bonsai tree flourish as your Japanese language skills develop
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <div className="mr-3 rounded-full bg-[#4a7c59] p-1">
                      <ChevronRight className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#2c3e2d]">Unlock Rewards</h3>
                      <p className="text-[#5c6d5e]">
                        Redeem credits for bonus lessons, materials, and exclusive content
                      </p>
                    </div>
                  </li>
                </ul>
                <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                  <Link href="/credits">
                    Learn About Credits
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative mx-auto max-w-md">
                <div className="aspect-square overflow-hidden rounded-full border-8 border-white bg-[#dce4d7] shadow-lg">
                  <div className="flex h-full items-center justify-center">
                    <BonsaiTreeIllustration className="h-4/5 w-4/5" />
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 rounded-full border-4 border-white bg-[#eef2eb] p-4 shadow-lg">
                  <div className="rounded-full bg-[#4a7c59] p-2 text-white">
                    <span className="block text-center text-xl font-bold">250</span>
                    <span className="block text-center text-xs">Credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Floating Sign Up Button (visible on scroll) */}
        <div className="fixed bottom-6 right-6 z-50 md:hidden">
          <Button className="rounded-full bg-[#4a7c59] px-6 py-6 text-white shadow-lg hover:bg-[#3a6147]" asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function BonsaiTreeIllustration(props) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="90" y="140" width="20" height="50" fill="#8B5E3C" />
      <path
        d="M100 20C80 20 65 35 65 55C65 75 80 90 100 90C120 90 135 75 135 55C135 35 120 20 100 20Z"
        fill="#4a7c59"
      />
      <path d="M70 80C55 80 45 90 45 105C45 120 55 130 70 130C85 130 95 120 95 105C95 90 85 80 70 80Z" fill="#5d9e75" />
      <path
        d="M130 80C145 80 155 90 155 105C155 120 145 130 130 130C115 130 105 120 105 105C105 90 115 80 130 80Z"
        fill="#5d9e75"
      />
      <path
        d="M85 120C75 120 65 125 65 135C65 145 75 150 85 150C95 150 105 145 105 135C105 125 95 120 85 120Z"
        fill="#6fb58a"
      />
      <path
        d="M115 120C125 120 135 125 135 135C135 145 125 150 115 150C105 150 95 145 95 135C95 125 105 120 115 120Z"
        fill="#6fb58a"
      />
      <circle cx="100" cy="55" r="5" fill="#8B5E3C" />
      <circle cx="70" cy="105" r="4" fill="#8B5E3C" />
      <circle cx="130" cy="105" r="4" fill="#8B5E3C" />
      <circle cx="85" cy="135" r="3" fill="#8B5E3C" />
      <circle cx="115" cy="135" r="3" fill="#8B5E3C" />
    </svg>
  )
}
