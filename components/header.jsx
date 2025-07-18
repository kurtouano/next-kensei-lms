"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, User } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { useSession } from "next-auth/react"

// Cache for user icon to persist across navigation
let cachedUserIcon = null;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userIcon, setUserIcon] = useState(cachedUserIcon); // Initialize with cached value
  const [iconLoading, setIconLoading] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // Determine if user is logged in based on session
  const isLoggedIn = status === "authenticated" && !!session?.user;

  // Fetch user profile data to get the icon
  useEffect(() => {
    const fetchUserIcon = async () => {
      if (status === "authenticated") {
        // Only show loading if we don't have a cached icon
        if (!cachedUserIcon) {
          setIconLoading(true);
        }
        
        try {
          const response = await fetch("/api/profile");
          const data = await response.json();
          if (data.success) {
            const newIcon = data.user.icon || null;
            setUserIcon(newIcon);
            cachedUserIcon = newIcon; // Cache the icon
          }
        } catch (error) {
          console.error("Failed to fetch user icon:", error);
          setUserIcon(null);
          cachedUserIcon = null;
        } finally {
          setIconLoading(false);
        }
      } else {
        setUserIcon(null);
        cachedUserIcon = null;
        setIconLoading(false);
      }
    };

    fetchUserIcon();

    // Listen for profile updates
    const handleProfileUpdate = () => {
      cachedUserIcon = null; // Clear cache when profile updates
      fetchUserIcon();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [status]);

  const isActive = (path) => pathname === path

  const renderUserIcon = () => {
    // Show default User icon during loading instead of gray background
    if (iconLoading && !userIcon) {
      return <User size={18} className="text-[#4a7c59]" />;
    }
    
    if (userIcon) {
      return userIcon.startsWith('http') ? (
        <img 
          src={userIcon} 
          alt="Profile" 
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-lg">{userIcon}</span>
      );
    }
    
    return <User size={18} className="text-[#4a7c59]" />;
  };

  const renderMobileUserIcon = () => {
    // Show default User icon during loading instead of gray background
    if (iconLoading && !userIcon) {
      return <User size={16} className="text-[#4a7c59]" />;
    }
    
    if (userIcon) {
      return userIcon.startsWith('http') ? (
        <img 
          src={userIcon} 
          alt="Profile" 
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-sm">{userIcon}</span>
      );
    }
    
    return <User size={16} className="text-[#4a7c59]" />;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#dce4d7] bg-white/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
          <span className="text-xl font-semibold text-[#2c3e2d]">Genko Tree</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {isLoggedIn ? (
            <>
              <Link href="/my-learning" className={`text-sm font-medium ${isActive("/my-learning") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>My Learning</Link>
              <Link href="/courses" className={`text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Courses</Link>
              <Link href="/blogs" className={`text-sm font-medium ${isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Blogs</Link>
              <Link href="/bonsai" className={`text-sm font-medium ${isActive("/bonsai") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>My Bonsai</Link>
              {(session?.user?.role === "instructor" || session?.user?.role === "admin") && (
                <Link href="/instructor/dashboard" className={`text-sm font-medium ${isActive("/instructor/dashboard") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Instructor</Link>
              )}
              { session?.user?.role === "admin" && (
                <Link href="/admin/blogs" className={`text-sm font-medium ${isActive("/admin/blog") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Admin</Link>
              )}
            </>
          ) : (
            <>
              <Link href="/" className={`text-sm font-medium ${isActive("/") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Home</Link>
              <Link href="/courses" className={`text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Courses</Link>
              <Link href="/blogs" className={`text-sm font-medium ${isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Blogs</Link>
              <Link href="/about" className={`text-sm font-medium ${isActive("/about") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>About</Link>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
            <Link href="/profile" className="flex flex-row items-center gap-2">
              <div className="h-9 w-9 mr-6 rounded-full border border-[#4a7c59] bg-white flex items-center justify-center overflow-hidden hover:bg-[#eef2eb] transition-colors">
                {renderUserIcon()}
              </div>  
            </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]">Log In</Link>
              <Link href="/auth/signup" className="rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]">Get Started</Link>
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
        <div className="border-t border-[#dce4d7] bg-white md:hidden">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            {isLoggedIn ? (
              <>
                <Link href="/my-learning" className={`block text-sm font-medium ${isActive("/my-learning") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>My Learning</Link>
                <Link href="/courses" className={`block text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>Courses</Link>
                <Link href="/blogs" className={`block text-sm font-medium ${isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>Blogs</Link>
                <Link href="/bonsai" className={`block text-sm font-medium ${isActive("/bonsai") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>My Bonsai</Link>
                {(session?.user?.role === "instructor" || session?.user?.role === "admin") && (
                  <Link href="/instructor/dashboard" className={`block text-sm font-medium ${isActive("/instructor/dashboard") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>Instructor</Link>
                )}
                {session?.user?.role === "admin" && (
                  <Link href="/admin/blogs" className={`block text-sm font-medium ${isActive("/admin/blog") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>Admin</Link>
                )}
                
                {/* Mobile Profile Link */}
                <div className="pt-4 border-t border-[#dce4d7]">
                  <Link href="/profile" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border border-[#4a7c59] bg-white flex items-center justify-center overflow-hidden">
                      {renderMobileUserIcon()}
                    </div>
                    <span className="text-sm font-medium text-[#2c3e2d]">My Profile</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/" className={`text-sm font-medium ${isActive("/") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"}`}>Home</Link>
                <Link href="/courses" className={`block text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>Courses</Link>
                <Link href="/blogs" className={`block text-sm font-medium ${isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>Blogs</Link>
                <Link href="/about" className={`block text-sm font-medium ${isActive("/about") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}>About</Link>
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-[#dce4d7] space-y-2">
                  <Link href="/auth/login" className="block w-full rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-sm font-medium text-[#4a7c59] text-center transition-colors hover:bg-[#eef2eb]">Log In</Link>
                  <Link href="/auth/signup" className="block w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white text-center transition-colors hover:bg-[#3a6147]">Get Started</Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}