"use client"

import React, { useState } from "react"
import { X, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setEmail("")
      setMessage("")
      setError("")
      setShowResendVerification(false)
      setIsLoading(false)
      setIsResending(false)
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.message && data.message.includes("verification")) {
          setMessage("Email verification link sent! Please check your inbox and verify your email first.")
        } else {
          setMessage("Password reset link sent to your email!")
        }
        setEmail("")
      } else {
        if (data.error && data.error.includes("Google")) {
          setError("This account was created with Google. Please use 'Continue with Google' to sign in.")
        } else if (data.error && data.error.includes("verify")) {
          setError("Please verify your email address first. Check your inbox for a verification link.")
          setShowResendVerification(true)
        } else {
          setError(data.error || "Failed to send reset email")
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage("Verification email sent! Please check your inbox.")
        setShowResendVerification(false)
        setEmail("") // Clear email after successful send
      } else {
        setError(data.error || "Failed to send verification email")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#2c3e2d]">Reset Password</h2>
          <p className="text-sm text-[#5c6d5e]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#2c3e2d]">
              Email Address
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-[#5c6d5e]" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-[#dce4d7] bg-white py-2 pl-10 pr-3 text-[#2c3e2d] focus:border-[#4a7c59] focus:outline-none focus:ring-1 focus:ring-[#4a7c59]"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-md border border-[#dce4d7] bg-white px-4 py-2 text-sm font-medium text-[#2c3e2d] transition-colors hover:bg-[#eef2eb]"
            >
              Cancel
            </Button>
            {showResendVerification ? (
              <Button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
              >
                {isResending ? "Sending..." : "Resend Verification"}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
