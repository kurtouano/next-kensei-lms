// app/dashboard/page.jsx
"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function DashboardRedirect() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (status === "unauthenticated") {
      router.replace("/auth/login")
      return
    }

    if (session?.user) {
      const role = session.user.role || "student"
      
      switch (role) {
        case "admin":
          router.replace("/admin/blogs")
          break
        case "instructor":
          router.replace("/instructor/dashboard")
          break
        case "student":
        default:
          router.replace("/my-learning")
          break
      }
    }
  }, [session, status, router])

  // Show loading while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[#4a7c59]" />
        <p className="text-[#5c6d5e]">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}