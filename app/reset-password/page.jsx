"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import JotatsuLogo from "@/components/jotatsu-logo"
import { useRouter, useSearchParams } from "next/navigation"

function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState("")
  const [tokenValid, setTokenValid] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      // Verify token is valid
      verifyToken(tokenParam)
    } else {
      setTokenValid(false)
    }
  }, [searchParams])

  const verifyToken = async (token) => {
    try {
      console.log('Verifying token on frontend:', token)
      const res = await fetch(`/api/auth/verify-reset-token?token=${token}`)
      const data = await res.json()
      
      console.log('Token verification response:', res.status, data)
      
      if (res.ok) {
        setTokenValid(true)
      } else {
        setTokenValid(false)
        setError(data.error || "Invalid or expired reset token")
      }
    } catch (err) {
      console.error('Token verification error:', err)
      setTokenValid(false)
      setError("Failed to verify reset token")
    }
  }

  const handleOnChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setFormData({
          password: "",
          confirmPassword: "",
        })
      } else {
        setError(data.error || "Failed to reset password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-6">
          <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#4a7c59] border-t-transparent"></div>
            <p className="text-[#5c6d5e]">Verifying reset token...</p>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-6">
          <Link href="/" className="mb-6 md:mb-8">
            <JotatsuLogo className="h-9 w-9" />
          </Link>

          <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm text-center">
            <div className="mb-4">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#2c3e2d]">Invalid Reset Link</h2>
              <p className="text-sm text-[#5c6d5e] mt-2">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            
            <Link 
              href="/auth/login" 
              className="inline-flex items-center justify-center px-4 py-2 bg-[#4a7c59] text-white text-sm font-medium rounded-lg hover:bg-[#3a6147] transition-colors duration-200"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <div className="container mx-auto flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-6">
        <Link href="/" className="mb-6 md:mb-8">
          <JotatsuLogo className="h-9 w-9" />
        </Link>

        <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[#2c3e2d] mb-2">Password Reset Successful!</h2>
              <p className="text-sm text-[#5c6d5e] mb-6">
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <Link 
                href="/auth/login" 
                className="inline-flex items-center justify-center px-4 py-2 bg-[#4a7c59] text-white text-sm font-medium rounded-lg hover:bg-[#3a6147] transition-colors duration-200"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-[#2c3e2d]">Reset Your Password</h1>
              <p className="mt-2 text-[#5c6d5e]">Enter your new password below</p>
            </div>

            {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-[#2c3e2d]">
                  New Password
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
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2c3e2d]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4 w-4 text-[#5c6d5e]" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleOnChange}
                    className="w-full rounded-md border border-[#dce4d7] bg-white py-2 pl-10 pr-10 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#5c6d5e]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
                disabled={isLoading}
              >
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#4a7c59] border-t-transparent"></div>
            <p className="text-[#5c6d5e]">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
