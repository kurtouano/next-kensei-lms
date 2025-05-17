"use client"

import Link from "next/link"
import { Mail, BookOpen, Award, Star } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function TeachersPage() {
  const teachers = [
    {
      id: 1,
      name: "Tanaka Yuki",
      title: "JLPT N1 Certified Instructor",
      bio: "With over 10 years of teaching experience, Tanaka-sensei specializes in helping students prepare for the JLPT exams. Her engaging teaching style makes even the most complex grammar points accessible.",
      expertise: ["JLPT Preparation", "Grammar", "Reading Comprehension"],
      courses: 5,
      students: 1240,
      rating: 4.9,
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 2,
      name: "Suzuki Hiroshi",
      title: "Conversation & Business Japanese Expert",
      bio: "Former translator for international businesses, Suzuki-sensei brings real-world experience to his business Japanese courses. His conversation-focused approach helps students gain confidence in speaking.",
      expertise: ["Business Japanese", "Conversation", "Keigo (Honorific Language)"],
      courses: 3,
      students: 890,
      rating: 4.8,
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 3,
      name: "Watanabe Aiko",
      title: "Japanese Culture & Language Specialist",
      bio: "Watanabe-sensei combines language instruction with deep cultural insights. Her courses are perfect for students who want to understand the cultural context behind the Japanese language.",
      expertise: ["Cultural Context", "Literature", "Traditional Arts"],
      courses: 4,
      students: 1050,
      rating: 4.7,
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 4,
      name: "Nakamura Ken",
      title: "Pronunciation & Speaking Coach",
      bio: "With a background in voice acting, Nakamura-sensei helps students perfect their Japanese pronunciation and intonation. His speaking drills and feedback are invaluable for learners at all levels.",
      expertise: ["Pronunciation", "Conversation", "Listening Skills"],
      courses: 2,
      students: 760,
      rating: 4.9,
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 5,
      name: "Yamamoto Mei",
      title: "Beginner Specialist & Curriculum Developer",
      bio: "Yamamoto-sensei has a gift for introducing complete beginners to Japanese. She developed our core curriculum for N5 and N4 levels, with a focus on building strong foundations.",
      expertise: ["Beginner Instruction", "Hiragana/Katakana", "Basic Conversation"],
      courses: 6,
      students: 1820,
      rating: 4.8,
      image: "/placeholder.svg?height=400&width=400",
    },
    {
      id: 6,
      name: "Sato Takeshi",
      title: "Kanji Expert & Advanced Grammar Instructor",
      bio: "Sato-sensei's systematic approach to kanji learning has helped thousands of students master this challenging aspect of Japanese. His advanced grammar courses are perfect for N2 and N1 preparation.",
      expertise: ["Kanji", "Advanced Grammar", "Reading Comprehension"],
      courses: 4,
      students: 950,
      rating: 4.7,
      image: "/placeholder.svg?height=400&width=400",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header - Reused from homepage */}
      <Header />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">Meet Our Teachers</h1>
            <p className="mx-auto max-w-2xl text-[#5c6d5e]">
              Our instructors are certified Japanese language experts with years of teaching experience. Each brings
              their unique expertise and teaching style to help you master Japanese.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer - Simplified version */}
      <Footer />
    </div>
  )
}

function TeacherCard({ teacher }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-square w-full overflow-hidden bg-[#eef2eb]">
        <img src={teacher.image || "/placeholder.svg"} alt={teacher.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-5">
        <h3 className="mb-1 text-xl font-semibold text-[#2c3e2d]">{teacher.name}</h3>
        <p className="mb-3 text-sm font-medium text-[#4a7c59]">{teacher.title}</p>
        <p className="mb-4 text-sm text-[#5c6d5e]">{teacher.bio}</p>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-[#2c3e2d]">Expertise:</h4>
          <div className="flex flex-wrap gap-2">
            {teacher.expertise.map((skill, index) => (
              <span key={index} className="rounded-full bg-[#eef2eb] px-3 py-1 text-xs font-medium text-[#4a7c59]">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 rounded-md bg-[#eef2eb] p-3">
          <div className="text-center">
            <div className="flex items-center justify-center text-[#4a7c59]">
              <BookOpen className="mr-1 h-4 w-4" />
            </div>
            <div className="mt-1 text-sm font-semibold text-[#2c3e2d]">{teacher.courses}</div>
            <div className="text-xs text-[#5c6d5e]">Courses</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-[#4a7c59]">
              <Award className="mr-1 h-4 w-4" />
            </div>
            <div className="mt-1 text-sm font-semibold text-[#2c3e2d]">{teacher.students.toLocaleString()}</div>
            <div className="text-xs text-[#5c6d5e]">Students</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-[#4a7c59]">
              <Star className="mr-1 h-4 w-4" />
            </div>
            <div className="mt-1 text-sm font-semibold text-[#2c3e2d]">{teacher.rating}</div>
            <div className="text-xs text-[#5c6d5e]">Rating</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/teachers/${teacher.id}`}
            className="flex-1 flex items-center justify-center rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]"
          >
            <Mail className="mr-2 h-4 w-4" />
            Contact
          </Link>
          <Link
            href={`/teachers/${teacher.id}/courses`}
            className="flex-1 flex items-center justify-center rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
          >
            <BookOpen className="mr-2 h-4 w-4" />
            View Courses
          </Link>
        </div>
      </div>
    </div>
  )
}
