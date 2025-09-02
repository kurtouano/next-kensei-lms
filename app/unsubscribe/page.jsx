"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  const [isResubscribing, setIsResubscribing] = useState(false)
  const [resubscribeMessage, setResubscribeMessage] = useState("")
  const [isUnsubscribing, setIsUnsubscribing] = useState(false)
  const [unsubscribeStatus, setUnsubscribeStatus] = useState("")

  // Handle unsubscribe when page loads
  useEffect(() => {
    if (email) {
      handleUnsubscribe()
    }
  }, [email])

  const handleUnsubscribe = async () => {
    if (!email) return
    
    setIsUnsubscribing(true)
    setUnsubscribeStatus("")
    
    try {
      const response = await fetch('/api/blogs/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUnsubscribeStatus("success")
      } else {
        setUnsubscribeStatus("error")
      }
    } catch (error) {
      console.error('Unsubscribe error:', error)
      setUnsubscribeStatus("error")
    } finally {
      setIsUnsubscribing(false)
    }
  }

  const handleResubscribe = async () => {
    if (!email) return
    
    setIsResubscribing(true)
    setResubscribeMessage("")
    
    try {
      const response = await fetch('/api/blogs/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResubscribeMessage("Successfully resubscribed! You'll receive our updates again.")
      } else {
        setResubscribeMessage(data.message || "Failed to resubscribe. Please try again.")
      }
    } catch (error) {
      console.error('Resubscribe error:', error)
      setResubscribeMessage("Failed to resubscribe. Please try again.")
    } finally {
      setIsResubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          {/* Main Content */}
          {isUnsubscribing ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Processing Unsubscription...
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Please wait while we process your unsubscribe request...
              </p>
            </>
          ) : unsubscribeStatus === "success" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Successfully Unsubscribed
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {email ? (
                  <>
                    <strong>{email}</strong> has been removed from our mailing list. 
                    You will no longer receive blog updates from Jotatsu Academy.
                  </>
                ) : (
                  "You have been successfully unsubscribed from our mailing list. You will no longer receive blog updates from Jotatsu Academy."
                )}
              </p>
            </>
          ) : unsubscribeStatus === "error" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Unsubscription Failed
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We encountered an error while processing your unsubscribe request. Please try again or contact support.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Unsubscribe
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Processing your request...
              </p>
            </>
          )}
          
                     {/* Resubscribe Section */}
           {email && unsubscribeStatus === "success" && (
             <div className="bg-gray-50 rounded-lg p-4 mb-3">
               <p className="text-sm text-gray-600 mb-4">
                 Changed your mind? You can resubscribe anytime.
               </p>
               <Button
                 onClick={handleResubscribe}
                 disabled={isResubscribing}
                 className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white h-11"
               >
                 {isResubscribing ? "Resubscribing..." : "Resubscribe"}
               </Button>
               {resubscribeMessage && (
                 <p className={`text-xs mt-3 ${
                   resubscribeMessage.includes("Successfully") 
                     ? "text-green-600" 
                     : "text-red-600"
                 }`}>
                   {resubscribeMessage}
                 </p>
               )}
             </div>
           )}
           
           {/* Navigation */}
           <div className="space-y-3 bg-gray-50 rounded-lg p-4">
             <Link href="/blogs" className="w-full block">
               <Button variant="outline" className="w-full border-[#4a7c59] text-[#4a7c59] hover:bg-[#eef2eb] h-11">
                 <ArrowLeft className="h-4 w-4 mr-2" />
                 Back to Blog
               </Button>
             </Link>
             
             <Link href="/" className="w-full block">
               <Button variant="ghost" className="w-full text-gray-600 hover:text-gray-800 h-11">
                 Go to Homepage
               </Button>
             </Link>
           </div>
          
          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-6">
            If you have any questions, please contact us at support@jotatsu.com
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
            <p className="text-gray-600">Please wait while we load the unsubscribe page...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
