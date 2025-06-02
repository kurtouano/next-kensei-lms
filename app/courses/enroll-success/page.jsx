'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { CheckCircle } from 'lucide-react'
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
        const response = await fetch(`/api/courses/stripe/session?session_id=${sessionId}&courseId=${courseId}`)
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full mx-auto text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        
        {/* Success Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-8">
          Thank you for enrolling. You now have access to the course materials.
        </p>
        
        {/* Course Details */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Course:</span>
              <span className="font-semibold text-right max-w-xs">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 h-4 w-32 rounded"></div>
                ) : (
                  orderData.courseName
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold">
                {loading ? (
                  <div className="animate-pulse bg-gray-300 h-4 w-16 rounded"></div>
                ) : (
                  orderData.amount
                )}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <button 
          onClick={handleStartLearning}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Start Learning Now
        </button>
        
        {/* Help Section */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Need help? Contact our support team at{' '}
            <a 
              href="mailto:support@example.com" 
              className="text-blue-600 hover:underline"
            >
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full mx-auto text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-full mx-auto"></div>
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="space-y-3">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-300 rounded"></div>
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