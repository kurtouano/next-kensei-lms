"use client"

import Link from "next/link"
import { useState, useEffect, Suspense } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import JotatsuLogo from "@/components/jotatsu-logo"
import { GoogleIcon } from "@/components/google-icon"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    provider: "credentials",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showResendVerification, setShowResendVerification] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');
    
    if (verified === 'true') {
      setSuccess("Your email has been verified successfully! You can now log in.");
    } else if (error === 'verification_failed') {
      setError("Email verification failed. Please try again or contact support.");
    }
  }, [searchParams]);

  const handleOnChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        provider: formData.provider,
        redirect: false,
      });

      if (res.ok) {
        setFormData({
          email: "",
          password: "",
        });

        console.log("Login successful", res);
        router.replace("/my-learning"); // redirect to dashboard
      } else {
        const errorMessage = res.error || "An error occurred. Please try again.";
        setError(errorMessage);
        
        // Check if it's an email verification error
        if (errorMessage.includes("verify your email")) {
          setShowResendVerification(true);
        } else {
          setShowResendVerification(false);
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      setError("Please enter your email address first");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Verification email sent! Please check your inbox and click the verification link.");
        setShowResendVerification(false);
      } else {
        setError(data.error || "Failed to send verification email. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      <div className="container mx-auto flex min-h-[calc(100vh-8.5rem)] flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8">
          <JotatsuLogo className="h-12 w-12" />
        </Link>

        <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2c3e2d]">Welcome Back</h1>
            <p className="mt-2 text-[#5c6d5e]">Log in to continue your Japanese learning journey</p>
          </div>

          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
          {success && <div className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600">{success}</div>}
          
          {showResendVerification && (
            <div className="mb-4 rounded-md bg-blue-50 p-4 border border-blue-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    Email verification required
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Please verify your email address before logging in. Check your inbox for a verification link.</p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={isResending}
                      className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResending ? "Sending..." : "Resend Verification Email"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[#2c3e2d]">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-[#4a7c59] hover:underline">
                  Forgot password?
                </Link>
              </div>
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

            <Button
              type="submit"
              className="w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-[#dce4d7]"></div>
            <span className="mx-4 flex-shrink text-sm text-[#5c6d5e]">or</span>
            <div className="flex-grow border-t border-[#dce4d7]"></div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md border border-[#dce4d7] bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#eef2eb]"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <GoogleIcon className="mr-2 h-4 w-4" />
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-[#5c6d5e]">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-[#4a7c59] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
        <div className="container mx-auto flex min-h-[calc(100vh-8.5rem)] flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#4a7c59] border-t-transparent"></div>
              <p className="text-[#5c6d5e]">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
