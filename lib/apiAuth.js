// lib/apiAuth.js - API Route Protection Helper
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

/**
 * Get authenticated session for API routes
 */
export async function getAuthSession(req) {
  try {
    const session = await getServerSession(authOptions)
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

/**
 * Middleware wrapper for protecting API routes
 */
export function withAuth(handler, options = {}) {
  return async function protectedHandler(req, context) {
    try {
      const session = await getAuthSession(req)
      
      // Check if user is authenticated
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized: Please log in" },
          { status: 401 }
        )
      }

      const userRole = session.user.role || 'student'
      
      // Check role requirements
      if (options.requiredRole) {
        const hasAccess = checkRoleAccess(userRole, options.requiredRole)
        
        if (!hasAccess) {
          return NextResponse.json(
            { 
              error: `Forbidden: ${options.requiredRole} access required`,
              userRole,
              requiredRole: options.requiredRole
            },
            { status: 403 }
          )
        }
      }

      // Add session to request for handler to use
      req.session = session
      req.user = session.user
      
      return await handler(req, context)
      
    } catch (error) {
      console.error("Auth middleware error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Check if user role has required access
 */
function checkRoleAccess(userRole, requiredRole) {
  const roleHierarchy = {
    student: ['student'],
    instructor: ['student', 'instructor'],
    admin: ['student', 'instructor', 'admin']
  }

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }

  return roleHierarchy[userRole]?.includes(requiredRole) || false
}

/**
 * Role-specific middleware creators
 */
export const withStudentAccess = (handler) => 
  withAuth(handler, { requiredRole: 'student' })

export const withInstructorAccess = (handler) => 
  withAuth(handler, { requiredRole: 'instructor' })

export const withAdminAccess = (handler) => 
  withAuth(handler, { requiredRole: 'admin' })

/**
 * Custom role checking - for when you need specific combinations
 */
export const withRoles = (handler, allowedRoles) => 
  withAuth(handler, { requiredRole: allowedRoles })

/**
 * Resource ownership checking helper
 */
export async function checkResourceOwnership(session, resourceAuthorId, resourceType = "resource") {
  const userRole = session.user.role || 'student'
  const userId = session.user.id

  // Admins can access everything
  if (userRole === 'admin') {
    return { hasAccess: true, reason: 'admin_access' }
  }

  // Check if user owns the resource
  if (userId === resourceAuthorId?.toString()) {
    return { hasAccess: true, reason: 'owner_access' }
  }

  // Instructors can access other instructors' resources (configurable)
  if (userRole === 'instructor' && resourceType === 'course') {
    return { hasAccess: true, reason: 'instructor_access' }
  }

  return { 
    hasAccess: false, 
    reason: 'insufficient_permissions',
    userRole,
    userId,
    resourceAuthorId: resourceAuthorId?.toString()
  }
}

/**
 * Example usage wrapper for resource-based protection
 */
export function withResourceAccess(handler, options = {}) {
  return withAuth(async (req, context) => {
    const { session } = req
    
    // Extract resource ID from URL or body
    const resourceId = context?.params?.id || req.body?.id
    
    if (options.checkOwnership && resourceId) {
      // You would fetch the resource here to get the author/owner ID
      // This is just an example - implement based on your data structure
      try {
        const resource = await options.getResource(resourceId)
        const ownership = await checkResourceOwnership(
          session, 
          resource?.authorId || resource?.userId,
          options.resourceType
        )
        
        if (!ownership.hasAccess) {
          return NextResponse.json(
            { 
              error: `Forbidden: Cannot access this ${options.resourceType}`,
              reason: ownership.reason
            },
            { status: 403 }
          )
        }
        
        req.resource = resource
      } catch (error) {
        return NextResponse.json(
          { error: `${options.resourceType} not found` },
          { status: 404 }
        )
      }
    }
    
    return await handler(req, context)
  }, options)
}

// Example usage in API routes:

/* 
// app/api/admin/users/route.js
import { withAdminAccess } from "@/lib/apiAuth"

async function handler(req) {
  // Only admins can reach this point
  const { user } = req
  // ... handle admin user management
}

export const GET = withAdminAccess(handler)
export const POST = withAdminAccess(handler)
*/

/* 
// app/api/instructor/courses/route.js  
import { withInstructorAccess } from "@/lib/apiAuth"

async function handler(req) {
  // Instructors and admins can reach this point
  const { user, session } = req
  // ... handle instructor course management
}

export const GET = withInstructorAccess(handler)
export const POST = withInstructorAccess(handler)
*/

/*
// app/api/courses/[id]/route.js
import { withResourceAccess } from "@/lib/apiAuth"
import Course from "@/models/Course"

const getCourse = async (id) => {
  return await Course.findById(id)
}

async function handler(req, { params }) {
  // User owns this course or is admin/instructor
  const { user, resource: course } = req
  // ... handle course operations
}

export const PUT = withResourceAccess(handler, {
  requiredRole: 'instructor',
  checkOwnership: true,
  resourceType: 'course',
  getResource: getCourse
})

export const DELETE = withResourceAccess(handler, {
  requiredRole: 'instructor', 
  checkOwnership: true,
  resourceType: 'course',
  getResource: getCourse
})
*/