// components/header.jsx - Updated with Friends Button
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, User, Users } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { useSession } from "next-auth/react"
import { useRoleAccess, RoleGuard } from "@/hooks/useRoleAccess"

// Cache for user icon to persist across navigation
let cachedUserIcon = null;

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userIcon, setUserIcon] = useState(cachedUserIcon);
  const [iconLoading, setIconLoading] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const {
    isAuthenticated,
    canAccessInstructor,
    canAccessAdmin,
    getDashboardRoute
  } = useRoleAccess();

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Fetch user profile data to get the icon
  useEffect(() => {
    const fetchUserIcon = async () => {
      if (status === "authenticated") {
        if (!cachedUserIcon) {
          setIconLoading(true);
        }
        
        try {
          const response = await fetch("/api/profile");
          const data = await response.json();
          if (data.success) {
            const newIcon = data.user.icon || null;
            setUserIcon(newIcon);
            cachedUserIcon = newIcon;
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

    const handleProfileUpdate = () => {
      cachedUserIcon = null;
      fetchUserIcon();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [status]);

  const isActive = (path) => pathname === path || pathname.startsWith(path + '/')

  // Helper function to close mobile menu when clicking links
  const closeMobileMenu = () => {
    setIsMenuOpen(false);
  };

  const renderUserIcon = () => {
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
          {isAuthenticated ? (
            <>
              {/* Student/Common routes */}
              <Link 
                href="/my-learning" 
                className={`text-sm font-medium ${
                  isActive("/my-learning") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                My Learning
              </Link>
              
              <Link 
                href="/courses" 
                className={`text-sm font-medium ${
                  isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                Courses
              </Link>
              
              <Link 
                href="/blogs" 
                className={`text-sm font-medium ${
                  isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                Blogs
              </Link>
              
              <Link 
                href="/bonsai" 
                className={`text-sm font-medium ${
                  isActive("/bonsai") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                My Bonsai
              </Link>

              {/* Instructor routes */}
              <RoleGuard allowedRoles={['instructor', 'admin']}>
                <Link 
                  href="/instructor/dashboard" 
                  className={`text-sm font-medium ${
                    isActive("/instructor") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                  }`}
                >
                  Instructor
                </Link>
              </RoleGuard>

              {/* Admin routes */}
              <RoleGuard allowedRoles={['admin']}>
                <Link 
                  href="/admin/blogs" 
                  className={`text-sm font-medium ${
                    isActive("/admin") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                  }`}
                >
                  Admin
                </Link>
              </RoleGuard>
            </>
          ) : (
            <>
              <Link 
                href="/" 
                className={`text-sm font-medium ${
                  isActive("/") && pathname === "/" ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                Home
              </Link>
              <Link 
                href="/courses" 
                className={`text-sm font-medium ${
                  isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                Courses
              </Link>
              <Link 
                href="/blogs" 
                className={`text-sm font-medium ${
                  isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                Blogs
              </Link>
              <Link 
                href="/about" 
                className={`text-sm font-medium ${
                  isActive("/about") ? "text-[#4a7c59]" : "text-[#2c3e2d] hover:text-[#4a7c59]"
                }`}
              >
                About
              </Link>
            </>
          )}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Friends/Users Button */}
              <Link 
                href="/users" 
                className="h-9 w-9 rounded-full border border-[#4a7c59] bg-white flex items-center justify-center hover:bg-[#eef2eb] transition-colors"
                title="Find Friends"
              >
                <Users size={18} className="text-[#4a7c59]" />
              </Link>
              
              {/* Profile Button */}
              <Link href="/profile" className="flex flex-row items-center gap-2">
                <div className="h-9 w-9 rounded-full border border-[#4a7c59] bg-white flex items-center justify-center overflow-hidden hover:bg-[#eef2eb] transition-colors">
                  {renderUserIcon()}
                </div>  
              </Link>
            </div>
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
            {isAuthenticated ? (
              <>
                <Link 
                  href="/my-learning" 
                  className={`block text-sm font-medium ${isActive("/my-learning") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  My Learning
                </Link>
                <Link 
                  href="/courses" 
                  className={`block text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  Courses
                </Link>
                <Link 
                  href="/blogs" 
                  className={`block text-sm font-medium ${isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  Blogs
                </Link>
                <Link 
                  href="/bonsai" 
                  className={`block text-sm font-medium ${isActive("/bonsai") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  My Bonsai
                </Link>
                
                {/* Mobile Instructor routes */}
                <RoleGuard allowedRoles={['instructor', 'admin']}>
                  <Link 
                    href="/instructor/dashboard" 
                    className={`block text-sm font-medium ${isActive("/instructor") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                    onClick={closeMobileMenu}
                  >
                    Instructor
                  </Link>
                </RoleGuard>

                {/* Mobile Admin routes */}
                <RoleGuard allowedRoles={['admin']}>
                  <Link 
                    href="/admin/blogs" 
                    className={`block text-sm font-medium ${isActive("/admin") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </Link>
                </RoleGuard>
                
                {/* Mobile Find Friends Link */}
                <Link 
                  href="/users" 
                  className={`block text-sm font-medium ${isActive("/users") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  Find Friends
                </Link>
                
                {/* Mobile Profile Link */}
                <div className="pt-4 border-t border-[#dce4d7]">
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3"
                    onClick={closeMobileMenu}
                  >
                    <div className="h-8 w-8 rounded-full border border-[#4a7c59] bg-white flex items-center justify-center overflow-hidden">
                      {renderMobileUserIcon()}
                    </div>
                    <span className="text-sm font-medium text-[#2c3e2d]">My Profile</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/" 
                  className={`block text-sm font-medium ${isActive("/") && pathname === "/" ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <Link 
                  href="/courses" 
                  className={`block text-sm font-medium ${isActive("/courses") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  Courses
                </Link>
                <Link 
                  href="/blogs" 
                  className={`block text-sm font-medium ${isActive("/blogs") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  Blogs
                </Link>
                <Link 
                  href="/about" 
                  className={`block text-sm font-medium ${isActive("/about") ? "text-[#4a7c59]" : "text-[#2c3e2d]"}`}
                  onClick={closeMobileMenu}
                >
                  About
                </Link>
                
                {/* Mobile Auth Buttons */}
                <div className="pt-4 border-t border-[#dce4d7] space-y-2">
                  <Link 
                    href="/auth/login" 
                    className="block w-full rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-sm font-medium text-[#4a7c59] text-center transition-colors hover:bg-[#eef2eb]"
                    onClick={closeMobileMenu}
                  >
                    Log In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block w-full rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white text-center transition-colors hover:bg-[#3a6147]"
                    onClick={closeMobileMenu}
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