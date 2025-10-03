// middleware.js (in your root directory)
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const { pathname } = req.nextUrl

    // Public routes that don't require authentication
    const publicRoutes = [
      '/',
      '/auth/login',
      '/auth/signup', 
      '/auth/signin',
      '/auth/forgot-password',
      '/auth/verify-email',  // ← Add email verification page
      '/demo',
      '/about',
      '/contact',
      '/courses',
      '/blogs',   // ← Public blogs page (uses /api/blogs)
      '/learn-japanese',  // ← Public learn Japanese page
      '/terms',
      '/privacy',
      '/unauthorized'  // ← Make sure unauthorized is public
    ]

    // Public API routes that don't require authentication
    const publicApiRoutes = [
      '/api/auth',
      '/api/courses',
      '/api/blogs'  // ← Public blog reading API
    ]

    // Check if it's a public route or public API route
    if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
        publicApiRoutes.some(route => pathname.startsWith(route))) {
      return NextResponse.next()
    }

    // If no token, redirect to unauthorized page instead of login
    if (!token) {
      console.log('❌ No token, redirecting to unauthorized page')
      const unauthorizedUrl = new URL('/unauthorized', req.url)
      unauthorizedUrl.searchParams.set('attemptedPath', pathname)
      return NextResponse.redirect(unauthorizedUrl)
    }

    const userRole = token.role || 'student'

    // ===== ADMIN ONLY ROUTES =====
    if (pathname.startsWith('/admin')) {
      if (userRole !== 'admin') {
        console.log('❌ Admin access denied for role:', userRole)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      console.log('✅ Admin access granted')
      return NextResponse.next()
    }

    // ===== INSTRUCTOR ROUTES (Instructor + Admin) =====
    if (pathname.startsWith('/instructor')) {
      if (!['instructor', 'admin'].includes(userRole)) {
        console.log('❌ Instructor access denied for role:', userRole)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      console.log('✅ Instructor access granted')
      return NextResponse.next()
    }

    // ===== STUDENT PROTECTED ROUTES (All authenticated users) =====
    const studentProtectedRoutes = [
      '/my-learning',
      '/bonsai',
      '/profile',
      '/settings',
      '/dashboard'
    ]

    if (studentProtectedRoutes.some(route => pathname.startsWith(route))) {
      if (!['student', 'instructor', 'admin'].includes(userRole)) {
        console.log('❌ Student route access denied for role:', userRole)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      console.log('✅ Student route access granted')
      return NextResponse.next()
    }

    // ===== COURSE ENROLLMENT/VIEWING PROTECTION =====
    if (pathname.match(/^\/courses\/[^\/]+\/(watch|quiz|exercise)/)) {
      // Only enrolled students or instructors/admins can access course content
      if (!['student', 'instructor', 'admin'].includes(userRole)) {
        console.log('❌ Course content access denied for role:', userRole)
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
      console.log('✅ Course content access granted')
      return NextResponse.next()
    }

    // ===== API ROUTES PROTECTION =====
    if (pathname.startsWith('/api/')) {
      // Admin API routes (admin only)
      if (pathname.startsWith('/api/admin/')) {
        if (userRole !== 'admin') {
          console.log('❌ Admin API access denied for role:', userRole)
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden: Admin access required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }

      // Instructor API routes (creating/managing content)
      if (pathname.startsWith('/api/instructor/') || 
          pathname.match(/^\/api\/(courses|blogs)\/(create|[^\/]+\/(edit|delete))/)) {
        if (!['instructor', 'admin'].includes(userRole)) {
          console.log('❌ Instructor API access denied for role:', userRole)
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden: Instructor access required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }

      // Student protected API routes (personal data)
      const studentApiRoutes = [
        '/api/profile',
        '/api/bonsai',
        '/api/progress',
        '/api/enrollment'
      ]

      if (studentApiRoutes.some(route => pathname.startsWith(route))) {
        if (!['student', 'instructor', 'admin'].includes(userRole)) {
          console.log('❌ Student API access denied for role:', userRole)
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden: Authentication required' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // ===== ROLE-BASED DASHBOARD REDIRECTS =====
    if (pathname === '/dashboard') {
      switch (userRole) {
        case 'admin':
          return NextResponse.redirect(new URL('/admin/blogs', req.url))
        case 'instructor':
          return NextResponse.redirect(new URL('/instructor/dashboard', req.url))
        case 'student':
        default:
          return NextResponse.redirect(new URL('/my-learning', req.url))
      }
    }

    console.log('✅ General access granted for:', userRole, 'to', pathname)
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes without token
        const publicRoutes = [
          '/',
          '/auth/login',
          '/auth/signup',
          '/auth/signin', 
          '/auth/forgot-password',
          '/auth/verify-email',  // ← Add email verification page
          '/about',
          '/contact',
          '/courses',
          '/blogs',  // ← Public blogs page
          '/learn-japanese',  // ← Public learn Japanese page
          '/terms',
          '/privacy',
          '/demo',
          '/unauthorized'
        ]

        // Allow public API routes
        const publicApiRoutes = [
          '/api/auth',
          '/api/courses',
          '/api/blogs'  // ← Public blog reading API
        ]

        if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/')) ||
            publicApiRoutes.some(route => pathname.startsWith(route))) {
          return true
        }

        // For protected routes, allow the middleware to handle unauthorized redirects
        // Return true here so the middleware function runs and can redirect to /unauthorized
        return true
      },
    },
  }
)

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - sitemap.xml (sitemap file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
}