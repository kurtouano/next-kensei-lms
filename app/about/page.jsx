"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Award, Globe, MessageSquare, Heart } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function AboutPage() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active Students",
    },
    {
      icon: BookOpen,
      value: "50+",
      label: "Courses",
    },
    {
      icon: Award,
      value: "95%",
      label: "Success Rate",
    },
    {
      icon: Globe,
      value: "120+",
      label: "Countries",
    },
  ]

  const values = [
    {
      icon: BookOpen,
      title: "Effective Learning",
      description:
        "We believe in structured, progressive learning that builds strong foundations. Our curriculum is designed to ensure steady progress and long-term retention.",
    },
    {
      icon: Users,
      title: "Community Connection",
      description:
        "Language learning thrives in community. We foster a supportive environment where students can practice, share experiences, and grow together.",
    },
    {
      icon: MessageSquare,
      title: "Cultural Context",
      description:
        "We teach more than just language. Understanding Japanese culture is essential to truly mastering the language and connecting with its people.",
    },
    {
      icon: Heart,
      title: "Personal Growth",
      description:
        "Learning Japanese is a journey of personal growth. We celebrate each milestone and encourage continuous improvement through our bonsai-inspired approach.",
    },
  ]

  const team = [
    {
      name: "Yamada Kenji",
      role: "Founder & Lead Instructor",
      bio: "Former university professor with 15+ years of Japanese language teaching experience.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Sarah Johnson",
      role: "Curriculum Director",
      bio: "Linguistics PhD with expertise in language acquisition and educational technology.",
      image: "/placeholder.svg?height=300&width=300",
    },
    {
      name: "Nakamura Hiro",
      role: "Cultural Content Creator",
      bio: "Author and cultural consultant specializing in making Japanese traditions accessible to learners.",
      image: "/placeholder.svg?height=300&width=300",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header - Reused from homepage */}
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#eef2eb] py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 text-4xl font-bold text-[#2c3e2d] md:text-5xl">Our Story</h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-[#5c6d5e]">
              日本語ガーデン was founded with a simple mission: to make learning Japanese as rewarding as nurturing a
              bonsai tree — patient, mindful, and deeply satisfying.
            </p>
            <div className="mx-auto mb-8 h-1 w-16 bg-[#4a7c59]"></div>
            <div className="grid gap-8 md:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="rounded-lg bg-white p-6 shadow-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2eb]">
                    <stat.icon className="h-6 w-6 text-[#4a7c59]" />
                  </div>
                  <h3 className="mb-1 text-2xl font-bold text-[#2c3e2d]">{stat.value}</h3>
                  <p className="text-sm text-[#5c6d5e]">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Philosophy */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-[#2c3e2d]">Our Philosophy</h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <div key={index} className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2eb]">
                    <value.icon className="h-6 w-6 text-[#4a7c59]" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-[#2c3e2d]">{value.title}</h3>
                  <p className="text-sm text-[#5c6d5e]">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team */}
        <section className="bg-[#eef2eb] py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold text-[#2c3e2d]">Leadership Team</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {team.map((member, index) => (
                <div key={index} className="overflow-hidden rounded-lg bg-white shadow-sm">
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="mb-1 text-xl font-semibold text-[#2c3e2d]">{member.name}</h3>
                    <p className="mb-3 text-sm font-medium text-[#4a7c59]">{member.role}</p>
                    <p className="text-sm text-[#5c6d5e]">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="rounded-lg bg-[#4a7c59] p-8 text-center text-white md:p-12">
              <h2 className="mb-4 text-3xl font-bold">Ready to Start Your Japanese Journey?</h2>
              <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
                Join our community of learners and grow your Japanese skills with our bonsai-inspired approach.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  className="border-2 py-3 border-white bg-transparent text-white hover:bg-white hover:text-[#4a7c59]"
                  size="lg"
                  asChild
                >
                  <Link href="/courses">Explore Courses</Link>
                </Button>
                <Button className="bg-white text-[#4a7c59] hover:bg-[#eef2eb]" size="lg" asChild>
                  <Link href="/signup">Sign Up Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Simplified version */}
      <Footer />
    </div>
  )
}
