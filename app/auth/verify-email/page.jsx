"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import JotatsuLogo from "@/components/jotatsu-logo"
import { Button } from "@/components/ui/button"

function VerifyEmailForm() {
  const [status, setStatus] = useState("verifying") // verifying, success, error
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get('token')
    const verified = searchParams.get('verified')
    
    // If coming from redirect with verified=true, show success
    if (verified === 'true') {
      setStatus("success")
      setMessage("Your email has been verified successfully! You can now log in to your account.")
      return
    }
    
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email and try again.")
      return
    }

    // Call the verification API
    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus("success")
          setMessage("Your email has been verified successfully! You can now log in to your account.")
        } else {
          setStatus("error")
          const errorMessage = data.error || "Verification failed. The link may be expired or invalid."
          setMessage(errorMessage)
          
          // If token is expired, show resend option
          if (errorMessage.includes("expired")) {
            setMessage(errorMessage + " You can request a new verification email from the login page.")
          }
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred during verification. Please try again.")
      }
    }

    verifyEmail()
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-6 md:mb-8">
          <JotatsuLogo className="h-9 w-9" />
        </Link>

        <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm text-center">
          {status === "verifying" && (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-8 w-8 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="mb-2 text-xl font-semibold text-[#2c3e2d]">Verifying your email...</h1>
              <p className="text-[#5c6d5e]">Please wait while we verify your email address.</p>
            </div>
          )}

          {status === "success" && (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mb-2 text-xl font-semibold text-green-800">Email Verified!</h1>
              <p className="mb-6 text-[#5c6d5e]">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
                >
                  Go to Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full rounded-md border border-[#dce4d7] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#eef2eb]"
                >
                  Go to Homepage
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mb-2 text-xl font-semibold text-red-800">Verification Failed</h1>
              <p className="mb-6 text-[#5c6d5e]">{message}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/auth/login')}
                  className="w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
                >
                  Go to Login (Resend Verification)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signup')}
                  className="w-full rounded-md border border-[#dce4d7] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#eef2eb]"
                >
                  Try Signing Up Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#4a7c59] border-t-transparent"></div>
            <p className="text-[#5c6d5e]">Loading verification...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailForm />
    </Suspense>
  )
}
