// app/unauthorized/page.jsx
"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { Shield, ArrowLeft, Home } from "lucide-react"

export default function UnauthorizedPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role || 'guest'

  const getDashboardLink = () => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard'
      case 'instructor':
        return '/instructor/dashboard'
      case 'student':
        return '/my-learning'
      default:
        return '/'
    }
  }

  const getRoleMessage = () => {
    switch (userRole) {
      case 'student':
        return "This area is restricted to instructors and administrators."
      case 'instructor':
        return "This area is restricted to administrators only."
      case 'admin':
        return "You shouldn't see this message. Please contact support."
      default:
        return "Please log in to access this content."
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-12">

        {/* Error Card */}
        <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm text-center">
          
          {/* Icon */}
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <Shield className="h-8 w-8 text-red-500" />
          </div>

          {/* Title */}
          <h1 className="mb-3 text-2xl font-bold text-[#2c3e2d]">Access Denied</h1>
          
          {/* Role-specific message */}
          <p className="mb-6 text-[#5c6d5e]">
            {getRoleMessage()}
          </p>

          {/* Action buttons */}
          <div className="space-y-3">
            {session?.user ? (
              <>
                <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                  <Link href={getDashboardLink()}>
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full border-[#dce4d7] text-[#5c6d5e] hover:bg-[#eef2eb]" asChild>
                  <Link href="javascript:history.back()">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Go Back
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]" asChild>
                  <Link href="/auth/login">
                    Log In
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full border-[#dce4d7] text-[#5c6d5e] hover:bg-[#eef2eb]" asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go Home
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Help text */}
          <p className="mt-6 text-xs text-[#5c6d5e]">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}