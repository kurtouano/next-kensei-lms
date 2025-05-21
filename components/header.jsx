"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, User } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { useSession } from "next-auth/react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession(); // useSession hook to get session data from LOGIN nextAuth

  const isActive = (path) => pathname === path

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce4d7] bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={status === "authenticated" ? "/my-learning" : "/"} className="flex items-center gap-2">
          <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
          <span className="text-xl font-semibold text-[#2c3e2d]">Genko Tree</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {status == "authenticated" ? (
            <>
              <Link href="/my-learning" className={`text-sm font-medium ${isActive("/my-learning") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Home</Link>
              <Link href="/courses" className={`text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Courses</Link>
              <Link href="/profile" className={`text-sm font-medium ${isActive("/profile") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Profile</Link>
              <Link href="/bonsai" className={`text-sm font-medium ${isActive("/bonsai") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>My Bonsai</Link>
            </>
          ) : (
            <>
              <Link href="/courses" className={`text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Courses</Link>
              <Link href="/subscription" className={`text-sm font-medium ${isActive("/subscription") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Plans</Link>
              <Link href="/about" className={`text-sm font-medium ${isActive("/about") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>About</Link>
              <Link href="/teachers" className={`text-sm font-medium ${isActive("/teachers") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Teachers</Link>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {status == "authenticated" ? (
            <>
              <span className="text-sm font-medium text-[#2c3e2d]">{session.user.name}</span>
              <img src={session?.user?.image} alt="User Avatar" className="h-8 w-8 rounded-full" />
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]">Log In</Link>
              <Link href="/signup" className="rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]">Get Started</Link>
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
    </header>
  )
}
