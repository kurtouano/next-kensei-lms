"use client"

import Link from "next/link"
import { useState } from "react"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { GoogleIcon } from "@/components/google-icon"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    provider: "credentials",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter();

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
        setError(res.error || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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
      <Header />
      <div className="container mx-auto flex min-h-[calc(100vh-8.5rem)] flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <BonsaiIcon className="h-10 w-10 text-[#4a7c59]" />
          <span className="text-2xl font-semibold text-[#2c3e2d]">日本語ガーデン</span>
        </Link>

        <div className="w-full max-w-md rounded-lg border border-[#dce4d7] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2c3e2d]">Welcome Back</h1>
            <p className="mt-2 text-[#5c6d5e]">Log in to continue your Japanese learning journey</p>
          </div>

          {error && <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}

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
            <Link href="/signup" className="font-medium text-[#4a7c59] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
