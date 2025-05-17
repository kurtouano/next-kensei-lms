"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"

export function Header({ isLoggedIn = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path) => {
    return pathname === path
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce4d7] bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
          <span className="text-xl font-semibold text-[#2c3e2d]">日本語ガーデン</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {isLoggedIn ? (
            // Logged in navigation
            <>
              <Link
                href="/my-learning"
                className={`text-sm font-medium ${isActive("/my-learning") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                Home
              </Link>
              <Link
                href="/courses"
                className={`text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                Courses
              </Link>
              <Link
                href="/profile"
                className={`text-sm font-medium ${isActive("/profile") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                Profile
              </Link>
              <Link
                href="/bonsai"
                className={`text-sm font-medium ${isActive("/bonsai") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                My Bonsai
              </Link>
            </>
          ) : (
            // Logged out navigation
            <>
              <Link
                href="/courses"
                className={`text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                Courses
              </Link>
              <Link
                href="/subscription"
                className={`text-sm font-medium ${isActive("/subscription") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                Plans
              </Link>
              <Link
                href="/about"
                className={`text-sm font-medium ${isActive("/about") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                About
              </Link>
              <Link
                href="/teachers"
                className={`text-sm font-medium ${isActive("/teachers") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}
              >
                Teachers
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons or User Menu */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <Link href="/profile" className="rounded-full bg-[#eef2eb] p-2 text-[#4a7c59] hover:bg-[#dce4d7]">
              <span className="sr-only">Profile</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="inline-flex items-center justify-center rounded-md p-2 text-[#2c3e2d] md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2">
            {isLoggedIn ? (
              <>
                <Link
                  href="/"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/courses"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Courses
                </Link>
                <Link
                  href="/profile"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/bonsai"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bonsai
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/courses"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Courses
                </Link>
                <Link
                  href="/subscription"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Plans
                </Link>
                <Link
                  href="/about"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/teachers"
                  className="block rounded-md px-3 py-2 text-base font-medium text-[#2c3e2d] hover:bg-[#eef2eb] hover:text-[#4a7c59]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Teachers
                </Link>
                <div className="mt-4 space-y-2 px-3">
                  <Link
                    href="/login"
                    className="block w-full rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-center text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="block w-full rounded-md bg-[#4a7c59] px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
