'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { CheckCircle, BookOpen, ArrowRight, Mail } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'

// Create a separate component that uses useSearchParams
function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderData, setOrderData] = useState({
    courseName: 'Loading...',
    amount: 'Loading...'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessionData = async () => {
      const sessionId = searchParams.get('session_id')
      const courseId = searchParams.get('courseId')
      
      if (!sessionId) {
        setLoading(false)
        return
      }

      try {
        // Fetch session data from your API
        const response = await fetch(`/api/courses/stripe/enroll-success?session_id=${sessionId}&courseId=${courseId}`)
        const data = await response.json()
        
        if (data.success) {
          setOrderData({
            courseName: data.courseName,
            amount: `$${(data.amount / 100).toFixed(2)}` // Convert from cents
          })
        }
      } catch (error) {
        console.error('Error fetching session data:', error)
        setOrderData({
          courseName: 'Course Purchase',
          amount: 'N/A'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSessionData()
  }, [searchParams])

  const handleStartLearning = () => {
    router.push('/courses')
  }

  const handleGoToDashboard = () => {
    router.push('/my-learning')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2eb] to-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2eb] overflow-hidden">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-[#4a7c59] to-[#3a6147] text-white p-6 sm:p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Payment Successful!
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                Welcome to your learning journey. You're all set to start!
              </p>
            </div>

            {/* Course Details */}
            <div className="p-6 sm:p-8">
              <div className="bg-[#eef2eb] rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-[#4a7c59] font-medium">Course Name:</span>
                    <span className="font-semibold text-[#2c3e2d] sm:text-right">
                      {loading ? (
                        <div className="animate-pulse bg-[#4a7c59]/20 h-4 w-32 rounded"></div>
                      ) : (
                        orderData.courseName
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-[#4a7c59] font-medium">Amount Paid:</span>
                    <span className="font-bold text-xl text-[#4a7c59]">
                      {loading ? (
                        <div className="animate-pulse bg-[#4a7c59]/20 h-6 w-16 rounded"></div>
                      ) : (
                        orderData.amount
                      )}
                    </span>
                  </div>
                  <div className="pt-4 border-t border-[#4a7c59]/20">
                    <p className="text-sm text-[#4a7c59] flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      You now have lifetime access to all course materials, including future updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleStartLearning}
                  className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center group"
                >
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={handleGoToDashboard}
                  className="w-full bg-white hover:bg-[#eef2eb] text-[#4a7c59] py-3 px-6 rounded-lg transition-colors font-medium border-2 border-[#4a7c59]"
                >
                  Go to Dashboard
                </button>
              </div>

              {/* What's Next Section */}
              <div className="mt-8 p-6 bg-gradient-to-r from-[#eef2eb] to-white rounded-xl border border-[#4a7c59]/10">
                <h4 className="font-semibold text-[#2c3e2d] mb-3">What's Next?</h4>
                <ul className="space-y-2 text-sm text-[#4a7c59]">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Access your course materials anytime from your dashboard
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Track your progress and earn certificates
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    Join our community discussions and get support
                  </li>
                </ul>
              </div>
            </div>

            {/* Support Footer */}
            <div className="bg-[#eef2eb] p-6 border-t border-[#4a7c59]/10">
              <div className="text-center">
                <p className="text-[#4a7c59] text-sm mb-2">
                  Need help getting started?
                </p>
                <a 
                  href="mailto:support@lmskensei.com" 
                  className="inline-flex items-center text-[#4a7c59] hover:text-[#3a6147] font-medium text-sm transition-colors"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2eb] to-white py-8 sm:py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-[#eef2eb] overflow-hidden">
            {/* Loading Header */}
            <div className="bg-gradient-to-r from-[#4a7c59] to-[#3a6147] text-white p-6 sm:p-8 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/30 rounded-full"></div>
                </div>
              </div>
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-white/20 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-white/20 rounded w-full mx-auto"></div>
              </div>
            </div>

            {/* Loading Content */}
            <div className="p-6 sm:p-8">
              <div className="bg-[#eef2eb] rounded-xl p-6 mb-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-[#4a7c59]/20 rounded w-1/3"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-[#4a7c59]/20 rounded"></div>
                    <div className="h-4 bg-[#4a7c59]/20 rounded"></div>
                    <div className="h-4 bg-[#4a7c59]/20 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-12 bg-[#4a7c59]/20 rounded animate-pulse"></div>
                <div className="h-12 bg-[#4a7c59]/10 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component that wraps everything in Suspense
export default function PaymentSuccessPage() {
  return (
    <>
      <Header />
      <Suspense fallback={<PaymentSuccessLoading />}>
        <PaymentSuccessContent />
      </Suspense>
      <Footer />
    </>
  )
}