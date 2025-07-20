// hooks/useRoleAccess.js
"use client"

import { useSession } from "next-auth/react"

export function useRoleAccess() {
  const { data: session, status } = useSession()

  const user = session?.user
  const role = user?.role || 'guest'
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  // Role checking functions
  const isAdmin = () => role === 'admin'
  const isInstructor = () => role === 'instructor'
  const isStudent = () => role === 'student'
  
  // Permission checking functions
  const canAccessAdmin = () => role === 'admin'
  const canAccessInstructor = () => ['instructor', 'admin'].includes(role)
  const canAccessStudent = () => ['student', 'instructor', 'admin'].includes(role)
  
  // Course-related permissions
  const canCreateCourse = () => ['instructor', 'admin'].includes(role)
  const canEditCourse = (courseAuthorId) => {
    if (role === 'admin') return true
    if (role === 'instructor' && user?.id === courseAuthorId) return true
    return false
  }
  
  // Blog-related permissions
  const canCreateBlog = () => ['instructor', 'admin'].includes(role)
  const canEditBlog = (blogAuthorId) => {
    if (role === 'admin') return true
    if (['instructor', 'admin'].includes(role) && user?.id === blogAuthorId) return true
    return false
  }
  
  // User management permissions
  const canManageUsers = () => role === 'admin'
  const canViewAnalytics = () => ['instructor', 'admin'].includes(role)
  
  // Navigation helpers
  const getDashboardRoute = () => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard'
      case 'instructor':
        return '/instructor/dashboard'
      case 'student':
      default:
        return '/my-learning'
    }
  }

  const getAvailableRoutes = () => {
    const routes = {
      public: [
        { name: 'Home', path: '/' },
        { name: 'Courses', path: '/courses' },
        { name: 'Blogs', path: '/blogs' },
        { name: 'About', path: '/about' }
      ],
      authenticated: [],
      instructor: [],
      admin: []
    }

    if (isAuthenticated) {
      routes.authenticated = [
        { name: 'My Learning', path: '/my-learning' },
        { name: 'My Bonsai', path: '/bonsai' },
        { name: 'Profile', path: '/profile' }
      ]
    }

    if (canAccessInstructor()) {
      routes.instructor = [
        { name: 'Instructor Dashboard', path: '/instructor/dashboard' },
        { name: 'My Courses', path: '/instructor/courses' },
        { name: 'Create Course', path: '/instructor/courses/create' },
        { name: 'Analytics', path: '/instructor/analytics' }
      ]
    }

    if (canAccessAdmin()) {
      routes.admin = [
        { name: 'Admin Dashboard', path: '/admin/dashboard' },
        { name: 'Manage Users', path: '/admin/users' },
        { name: 'Manage Courses', path: '/admin/courses' },
        { name: 'Manage Blogs', path: '/admin/blogs' },
        { name: 'System Settings', path: '/admin/settings' }
      ]
    }

    return routes
  }

  return {
    // User info
    user,
    role,
    isLoading,
    isAuthenticated,
    
    // Role checks
    isAdmin,
    isInstructor,
    isStudent,
    
    // Permission checks
    canAccessAdmin,
    canAccessInstructor,
    canAccessStudent,
    canCreateCourse,
    canEditCourse,
    canCreateBlog,
    canEditBlog,
    canManageUsers,
    canViewAnalytics,
    
    // Navigation helpers
    getDashboardRoute,
    getAvailableRoutes
  }
}

// Higher-order component for protecting components based on role
export function withRoleAccess(Component, requiredRole = 'student', redirectTo = '/unauthorized') {
  return function ProtectedComponent(props) {
    const { role, isLoading, isAuthenticated } = useRoleAccess()
    const router = useRouter()

    useEffect(() => {
      if (isLoading) return

      if (!isAuthenticated) {
        router.replace('/auth/login')
        return
      }

      const hasAccess = (() => {
        switch (requiredRole) {
          case 'admin':
            return role === 'admin'
          case 'instructor':
            return ['instructor', 'admin'].includes(role)
          case 'student':
            return ['student', 'instructor', 'admin'].includes(role)
          default:
            return true
        }
      })()

      if (!hasAccess) {
        router.replace(redirectTo)
        return
      }
    }, [isLoading, isAuthenticated, role, router])

    if (isLoading) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#4a7c59]" />
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}

// Component wrapper for conditional rendering based on role
export function RoleGuard({ children, allowedRoles, fallback = null }) {
  const { role, isAuthenticated } = useRoleAccess()

  if (!isAuthenticated) {
    return fallback
  }

  const hasAccess = allowedRoles.includes(role)
  
  return hasAccess ? children : fallback
}