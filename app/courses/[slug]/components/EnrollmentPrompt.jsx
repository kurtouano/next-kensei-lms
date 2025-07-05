// components/EnrollmentPrompt.jsx - Enhanced with authentication check
import { memo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Lock, ArrowRight, Shield } from "lucide-react"
import { useSession } from "next-auth/react"

export const EnrollmentPrompt = memo(function EnrollmentPrompt({ course }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleEnrollClick = useCallback(async () => {
    // Check if user is logged in first
    if (!session?.user) {
      console.log('❌ User not logged in, redirecting to login')
      window.location.href = '/auth/login'
      return
    }

    try {
      setIsLoading(true)
      console.log('🛒 Starting enrollment checkout for course:', course?.id || course?._id)
      
      const response = await fetch('/api/courses/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course?.id || course?._id,
          title: course?.title || 'Course Enrollment',
          description: course?.description || course?.shortDescription || course?.fullDescription || 'Full course access',
          price: Number(course?.price) || 0,
          thumbnail: course?.thumbnail || course?.image || '',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API response error:', errorData);
        
        if (response.status === 401) {
          console.log('🔒 Unauthorized - redirecting to login')
          window.location.href = '/auth/login'
          return
        }
        
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      console.log('✅ Checkout session response:', data);
      
      if (data.url) {
        console.log('🔗 Redirecting to checkout:', data.url)
        window.location.assign(data.url);
      } else {
        console.error('❌ No checkout URL received:', data)
        alert('Failed to create checkout session. Please try again.');
        setIsLoading(false)
      }
    } catch (error) {
      console.error('💥 Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
      setIsLoading(false)
    }
  }, [course, session])

  const handleBrowseCourses = () => {
    window.location.href = `/courses`
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-sm w-full mx-4 border border-[#dce4d7]">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-[#4a7c59] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <div className="text-center sm:text-left space-y-1">
            <div className="text-sm sm:text-base font-medium text-[#2c3e2d]">
              {!session?.user ? 'Redirecting to login...' : 'Redirecting to checkout...'}
            </div>
            <div className="text-xs sm:text-sm text-[#5c6d5e]">
              {!session?.user ? 'Please wait while we redirect you to login' : 'Please wait while we prepare your payment'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-4 rounded-lg border border-[#dce4d7] bg-gradient-to-br from-white to-[#eef2eb] p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Lock Icon */}
        <div className="flex-shrink-0 self-center sm:self-start sm:mt-1">
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-[#4a7c59] text-white">
            <Lock className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-[#2c3e2d]">
              Unlock Full Access
            </h2>
            <div className="text-center sm:text-right">
              <div className="text-xl sm:text-lg font-bold text-[#4a7c59]">
                ${Number(course?.price) || 0}
              </div>
              <div className="text-xs text-[#5c6d5e]">one-time</div>
            </div>
          </div>
          
          <p className="text-sm text-[#5c6d5e] mb-4 sm:mb-6 leading-relaxed">
            Get lifetime access to {course?.modules?.length || 0} modules with {course?.totalLessons || 0} lessons, 
            interactive quizzes, downloadable resources, bonsai items, {course?.creditReward || 0} credits, 
            and certificate upon completion.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="w-full sm:w-auto bg-gradient-to-r from-[#4a7c59] to-[#5d9e75] text-white hover:from-[#3a6147] hover:to-[#4a7c59] hover:shadow-lg hover:shadow-[#4a7c59]/25 text-sm font-medium px-6 py-3 sm:py-2 rounded-md transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleEnrollClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center sm:justify-start">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center sm:justify-start">
                  {!session?.user ? 'Sign Up to Enroll' : (Number(course?.price) || 0) === 0 ? 'Get Free Access' : 'Get Started'}
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="w-full sm:w-auto border-[#4a7c59] text-[#4a7c59] hover:border-[#3a6147] hover:bg-[#4a7c59]/12 hover:text-[#3a6147] text-sm font-medium px-6 py-3 sm:py-2 rounded-md transition-all"
              onClick={handleBrowseCourses}
              disabled={isLoading}
            >
              Browse Courses
            </Button>
          </div>

          {/* Trust Indicator */}
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-4 pt-4 border-t border-[#dce4d7]">
            <Shield className="h-4 w-4 text-[#4a7c59]" />
            <span className="text-xs text-[#5c6d5e] text-center sm:text-left">
              {!session?.user 
                ? `Create account • Secure payment • ${course?.level || 'All'} level`
                : `Secure payment • Instant access • ${course?.level || 'All'} level`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
})