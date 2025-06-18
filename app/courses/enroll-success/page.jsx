'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { CheckCircle, ArrowRight, Award, BookOpen, Video, Download } from 'lucide-react'
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
    <div className="min-h-[85vh] bg-gradient-to-br from-[#f8f9f4] to-white flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center">
          
          {/* Success Icon */}
          <div className="pt-8 pb-6">
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-[#4a7c59]" />
            <h1 className="mb-4 text-2xl font-bold text-[#2c3e2d]">Payment Successful!</h1>
            
            <p className="text-[#5c6d5e] px-6">
              Thank you for subscribing to{' '}
              <span className="font-semibold text-[#2c3e2d]">
                {loading ? (
                  <span className="inline-block w-32 h-4 bg-[#dce4d7] rounded animate-pulse"></span>
                ) : (
                  orderData.courseName
                )}
              </span>
              . You now have full access to the course.
            </p>
          </div>

          {/* Course Benefits */}
          <div className="px-6 pb-6">
            <div className="bg-[#eef2eb] rounded-xl p-6">
              
              {/* Price Paid*/}
              <div className="bg-[#eef2eb] rounded-lg text-center pb-3">
                <p className="text-sm text-[#5c6d5e] mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-[#2c3e2d]">
                  {loading ? (
                    <span className="inline-block w-16 h-6 bg-[#dce4d7] rounded animate-pulse"></span>
                  ) : (
                    orderData.amount
                  )}
                </p>
              </div>

              <p className="text-sm text-[#5c6d5e] text-center mb-6">
                You now have lifetime access to all course content
              </p>
              
              <div className="space-y-3 text-sm text-[#5c6d5e]">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-[#4a7c59] flex-shrink-0" />
                  <span>Lifetime access to all video lessons</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-[#4a7c59] flex-shrink-0" />
                  <span>Downloadable resources and materials</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-[#4a7c59] flex-shrink-0" />
                  <span>Interactive quizzes and exercises</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-3 text-[#4a7c59] flex-shrink-0" />
                  <span>Certificate upon completion</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 pb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={handleStartLearning}
                className="flex-1 bg-[#4a7c59] hover:bg-[#3a6147] text-white py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                Start Learning
              </button>
              
              <button 
                onClick={handleGoToDashboard}
                className="flex-1 bg-white hover:bg-[#eef2eb] text-[#4a7c59] py-3 px-6 rounded-lg transition-colors font-medium border border-[#4a7c59]"
              >
                My Learning
              </button>
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
    <div className="min-h-[60vh] bg-gradient-to-br from-[#f8f9f4] to-white flex items-center justify-center py-8 px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-center">
          
          {/* Loading Icon */}
          <div className="pt-8 pb-6">
            <div className="w-14 h-14 bg-[#4a7c59]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-10 h-10 bg-[#4a7c59]/20 rounded-full"></div>
            </div>
            
            <div className="space-y-3 px-6">
              <div className="h-8 bg-[#dce4d7] rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-4 bg-[#dce4d7] rounded w-full animate-pulse"></div>
              <div className="h-4 bg-[#dce4d7] rounded w-2/3 mx-auto animate-pulse"></div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="px-6 pb-6">
            <div className="bg-[#eef2eb] rounded-xl p-6">
              <div className="bg-[#eef2eb] rounded-lg text-center pb-3">
                <div className="h-4 bg-[#dce4d7] rounded w-1/3 mx-auto mb-2 animate-pulse"></div>
                <div className="h-6 bg-[#dce4d7] rounded w-1/4 mx-auto animate-pulse"></div>
              </div>
              
              <div className="h-4 bg-[#dce4d7] rounded w-2/3 mx-auto mb-6 animate-pulse"></div>
              
              <div className="space-y-3">
                <div className="h-4 bg-[#dce4d7] rounded animate-pulse"></div>
                <div className="h-4 bg-[#dce4d7] rounded animate-pulse"></div>
                <div className="h-4 bg-[#dce4d7] rounded animate-pulse"></div>
                <div className="h-4 bg-[#dce4d7] rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 h-12 bg-[#4a7c59]/20 rounded animate-pulse"></div>
              <div className="flex-1 h-12 bg-[#dce4d7] rounded animate-pulse"></div>
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