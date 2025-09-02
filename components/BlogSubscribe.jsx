"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function BlogSubscribe() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsSubscribing(true)
    
    try {
      const response = await fetch('/api/blogs/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSubscribed(true)
        setEmail("")
        toast({
          title: "Successfully Subscribed!",
          description: "You'll now receive updates about our latest blog posts.",
        })
      } else {
        toast({
          title: "Subscription Failed",
          description: data.message || "Something went wrong. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Subscription Failed",
        description: "Network error. Please check your connection and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubscribing(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Welcome to Jotatsu Blog!
        </h3>
        <p className="text-green-700 mb-4">
          You're now subscribed to receive our latest Japanese learning insights and tips.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSubscribed(false)}
          className="border-green-300 text-green-700 hover:bg-green-100"
        >
          Subscribe Another Email
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-[#4a7c59] to-[#6b8e6b] rounded-lg p-6 text-white">
      <div className="text-center mb-6">
        <Mail className="h-12 w-12 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">
          Stay Updated with Japanese Learning
        </h3>
        <p className="text-white/90">
          Get notified when we publish new blog posts about Japanese language, culture, and learning tips.
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 text-gray-900 placeholder:text-gray-500"
            autoComplete="email"
            required
          />
          <Button
            type="submit"
            disabled={isSubscribing || !email}
            className="bg-white text-[#4a7c59] hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : (
              "Subscribe"
            )}
          </Button>
        </div>
        
        <p className="text-xs text-white/70 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </form>
    </div>
  )
}
