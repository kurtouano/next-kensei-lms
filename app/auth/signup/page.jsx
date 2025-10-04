"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import JotatsuLogo from "@/components/jotatsu-logo"
import { GoogleIcon } from "@/components/google-icon"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    provider: "credentials",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

  const handleOnChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        if (formData.provider === "credentials") {
          setSuccess(true)
          setUserEmail(formData.email)
          setFormData({
            name: "",
            email: "",
            password: "",
          })
        } else {
          router.push("/auth/login") // redirect to login page for Google signup
        }
      } else {
        setError(data.error || "An error occurred. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError("")

    try {
      signIn("google", {
        redirect: true,
        callbackUrl: "/my-learning",
      })
    } catch (err) {
      setError("An error occurred with Google login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-6">
        <Link href="/" className="mb-6 md:mb-8">
          <JotatsuLogo className="h-9 w-9" />
        </Link>

        <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2c3e2d]">Join Our Community</h1>
            <p className="mt-2 text-[#5c6d5e]">Join our community and start your Japanese learning journey</p>
          </div>

          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          
           {success && (
             <div className="mb-6 rounded-xl bg-green-50 p-6 text-center border border-green-200 shadow-sm">
               <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                 <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                 </svg>
               </div>
               
               <h3 className="mb-2 text-lg font-semibold text-green-800">Check your email!</h3>
               
               <p className="mb-4 text-sm text-green-700 leading-relaxed">
                 We've sent a verification link to
               </p>
               
               <div className="mb-6">
                 <span className="inline-block px-3 py-1 bg-green-100 text-sm font-medium text-green-800 rounded-md">
                   {userEmail}
                 </span>
               </div>
               
               <p className="mb-6 text-xs text-green-600">
                 Click the link to verify your account and complete your registration.
               </p>
               
               <Link 
                 href="/auth/login" 
                 className="inline-flex items-center justify-center px-4 py-2 bg-[#4a7c59] text-white text-sm font-medium rounded-lg hover:bg-[#3a6147] transition-colors duration-200"
               >
                 Login
               </Link>
             </div>
           )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-[#2c3e2d]">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-[#5c6d5e]" />
                </div>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleOnChange}
                  className="w-full rounded-md border border-[#dce4d7] bg-white py-2 pl-10 pr-3 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-[#2c3e2d]">
                Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-[#5c6d5e]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleOnChange}
                  className="w-full rounded-md border border-[#dce4d7] bg-white py-2 pl-10 pr-3 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-[#2c3e2d]">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-[#5c6d5e]" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleOnChange}
                  className="w-full rounded-md border border-[#dce4d7] bg-white py-2 pl-10 pr-10 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5c6d5e]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-[#5c6d5e]">Password must be at least 8 characters long</p>
            </div>


            <Button
              type="submit"
              className="w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Get Started"}
            </Button>
            </form>
          )}

          {!success && (
            <>
              <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-[#dce4d7]"></div>
                <span className="mx-4 flex-shrink text-sm text-[#5c6d5e]">or</span>
                <div className="flex-grow border-t border-[#dce4d7]"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full rounded-md border border-[#dce4d7] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#eef2eb]"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                Join with Google
              </Button>
            </>
          )}

          {!success && (
            <p className="mt-6 text-center text-sm text-[#5c6d5e]">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-[#4a7c59] hover:underline">
                Log in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
