"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BookOpen, Award, Check } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function CoursesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  const categories = [
    { id: "all", name: "All Courses" },
    { id: "beginner", name: "Beginner (N5)" },
    { id: "intermediate", name: "Intermediate (N4-N3)" },
    { id: "advanced", name: "Advanced (N2-N1)" },
    { id: "business", name: "Business Japanese" },
    { id: "culture", name: "Culture & Traditions" },
  ]

  const courses = [
    {
      id: 1,
      title: "Japanese for Absolute Beginners",
      description: "Start your Japanese journey with essential vocabulary, basic greetings, and hiragana.",
      price: 49.99,
      credits: 250,
      customItems: ["Maple Bonsai Seed", "Beginner Pot"],
      modules: 12,
      quizzes: 6,
      level: "beginner",
      image: "/placeholder.svg?height=200&width=400",
      highlights: [
        "Master hiragana and katakana",
        "Learn 100+ essential vocabulary words",
        "Basic conversation practice",
        "Cultural context for beginners",
      ],
    },
    {
      id: 2,
      title: "Intermediate Conversation Skills",
      description: "Enhance your speaking abilities with practical conversation patterns and vocabulary.",
      price: 69.99,
      credits: 350,
      customItems: ["Stone Lantern", "Decorative Rocks"],
      modules: 10,
      quizzes: 5,
      level: "intermediate",
      image: "/placeholder.svg?height=200&width=400",
      highlights: [
        "Natural conversation patterns",
        "Situational vocabulary",
        "Pronunciation refinement",
        "Listening comprehension practice",
      ],
    },
    {
      id: 3,
      title: "Business Japanese Essentials",
      description: "Learn formal Japanese for professional settings, including business etiquette and keigo.",
      price: 89.99,
      credits: 450,
      customItems: ["Executive Pot", "Office Miniature"],
      modules: 8,
      quizzes: 4,
      level: "business",
      image: "/placeholder.svg?height=200&width=400",
      highlights: [
        "Formal keigo expressions",
        "Business email writing",
        "Meeting and presentation vocabulary",
        "Networking in Japanese",
      ],
    },
    {
      id: 4,
      title: "JLPT N3 Preparation",
      description: "Comprehensive preparation for the JLPT N3 exam with practice tests and strategies.",
      price: 79.99,
      credits: 400,
      customItems: ["Study Lamp", "Achievement Ribbon"],
      modules: 15,
      quizzes: 10,
      level: "intermediate",
      image: "/placeholder.svg?height=200&width=400",
      highlights: [
        "Complete grammar coverage",
        "Vocabulary building",
        "Reading comprehension strategies",
        "Listening practice with native speakers",
      ],
    },
    {
      id: 5,
      title: "Japanese Culture and Traditions",
      description: "Explore Japan's rich cultural heritage, traditions, and modern cultural phenomena.",
      price: 59.99,
      credits: 300,
      customItems: ["Sakura Decoration", "Traditional Miniature"],
      modules: 8,
      quizzes: 4,
      level: "culture",
      image: "/placeholder.svg?height=200&width=400",
      highlights: [
        "Traditional arts and crafts",
        "Festivals and celebrations",
        "Modern pop culture",
        "Regional traditions and customs",
      ],
    },
    {
      id: 6,
      title: "Advanced Japanese Grammar",
      description: "Master complex grammatical structures and nuanced expressions for advanced proficiency.",
      price: 99.99,
      credits: 500,
      customItems: ["Master's Pot", "Golden Pruning Shears"],
      modules: 12,
      quizzes: 8,
      level: "advanced",
      image: "/placeholder.svg?height=200&width=400",
      highlights: [
        "Complex sentence structures",
        "Nuanced expressions",
        "Literary Japanese elements",
        "Advanced honorific language",
      ],
    },
  ]

  const filteredCourses =
    selectedCategory === "all" ? courses : courses.filter((course) => course.level === selectedCategory)

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header - Reused from homepage */}
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Course Catalog</h1>
            <p className="text-[#5c6d5e]">Browse our comprehensive selection of Japanese language courses</p>
          </div>

          {/* Course Categories */}
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

      {/* Footer - Simplified version */}
      <Footer />
    </div>
  )
}

function CourseCard({ course }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.image || "/placeholder.svg"}
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
