"use client"

import { useState, useEffect } from "react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BookOpen, Award, Check, Star, Loader2, PlayCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export function CourseCard({ course }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)

  // Check if user is enrolled in this course
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user) return
      
      try {
        setCheckingEnrollment(true)
        const response = await fetch(`/api/courses/enrollment?courseId=${course.id}`)
        const data = await response.json()
        
        if (data.success) {
          setIsEnrolled(data.isEnrolled)
        }
      } catch (error) {
        console.error('Error checking enrollment:', error)
      } finally {
        setCheckingEnrollment(false)
      }
    }

    checkEnrollment()
  }, [session, course.id])

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true)
      
      // Call your checkout session API
      const response = await fetch('/api/courses/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          title: course.title,
          description: course.description || course.shortDescription,
          price: course.price,
          thumbnail: course.thumbnail,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        // Keep loading state while redirecting to Stripe
        window.location.assign(data.url);
      } else {
        console.error('No checkout URL received:', data)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false)
    }
  };

  // Enhanced star rating component with half-star support
  const StarRating = ({ rating, totalReviews }) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    // If no rating, show 5 empty gray stars
    if (rating === 0) {
      for (let i = 0; i < 5; i++) {
        stars.push(
          <Star
            key={`empty-${i}`}
            className="h-4 w-4 text-gray-300"
          />
        );
      }
    } else {
      // Add full stars
      for (let i = 0; i < fullStars; i++) {
        stars.push(
          <Star
            key={`full-${i}`}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />
        );
      }

      // Add half star if needed
      if (hasHalfStar) {
        stars.push(
          <div key="half" className="relative">
            <Star className="h-4 w-4 text-gray-300" />
            <Star 
              className="absolute top-0 h-4 w-4 fill-yellow-400 text-yellow-400"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      }

      // Add empty stars
      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
        stars.push(
          <Star
            key={`empty-${i}`}
            className="h-4 w-4 text-gray-300"
          />
        );
      }
    }

    return (
      <div className="flex items-center gap-1">
        <div className="flex items-center">
          {stars}
        </div>
        <span className="text-sm font-medium text-[#2c3e2d]">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
        <span className="text-sm text-[#5c6d5e]">
          ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };

  // Get rating data - handle both old and new data structures
  const averageRating = course.ratingStats?.averageRating || course.averageRating || 0;
  const totalReviews = course.ratingStats?.totalRatings || course.totalReviews || 0;

  // Get course metadata with fallbacks
  const courseTitle = course.title || 'Untitled Course';
  const courseDescription = course.shortDescription || course.description || 'No description available';
  const coursePrice = course.price || 0;
  const courseCredits = course.creditReward || course.credits || 0;
  
  // Calculate modules and lessons count - Updated to match your API response
  const modulesCount = course.modules || course.modulesCount || 0;
  const lessonsCount = course.lessons || course.lessonsCount || course.totalLessons || 0;

  // Get highlights with fallback
  const highlights = course.highlights || course.learningHighlights || [
    'Interactive lessons',
    'Cultural insights',
    'Practical vocabulary'
  ];

  // Get items reward with fallback - Updated to handle your API format
  const itemsReward = course.itemsReward?.length > 0 
    ? course.itemsReward.slice(0, 2) // Your API already returns strings
    : ['Certificate', 'Resources'];

  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={courseTitle}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            e.target.src = "/placeholder.svg"
          }}
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="mb-2 text-xl font-semibold text-[#2c3e2d] line-clamp-2 min-h-[3.5rem] flex">
          <span>{courseTitle}</span>
        </h3>
        <p className="mb-3 text-sm text-[#5c6d5e] line-clamp-2">
          {courseDescription}
        </p>

        {/* Star Rating - Always show */}
        <div className="mb-3">
          <StarRating rating={averageRating} totalReviews={totalReviews} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-md font-bold text-[#2c3e2d]">
            {isEnrolled ? (
              <span className="text-[#4a7c59]">Enrolled</span>
            ) : (
              coursePrice === 0 ? 'Free' : `$ ${coursePrice}`
            )}
          </div>
          {courseCredits > 0 && (
            <div className="flex items-center text-sm text-[#5c6d5e]">
              <BonsaiIcon className="mr-1 h-4 w-4 text-[#4a7c59]" />
              {courseCredits} credits
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2 rounded-md bg-[#eef2eb] p-3">
          <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
            <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
            {modulesCount} module{modulesCount !== 1 ? 's' : ''} • {lessonsCount} lesson{lessonsCount !== 1 ? 's' : ''}
          </div>
          {itemsReward.length > 0 && (
            <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
              <Award className="mr-2 h-4 w-4 text-[#4a7c59]" />
              Includes: {itemsReward.join(", ")}
            </div>
          )}
        </div>

        <div className="mb-4 flex-grow">
          <h4 className="mb-2 text-sm font-semibold text-[#2c3e2d]">Learning Highlights:</h4>
          <ul className="space-y-1">
            {highlights.slice(0, 3).map((highlight, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="mr-2 h-4 w-4 shrink-0 text-[#4a7c59]" />
                <span className="text-[#5c6d5e] line-clamp-1">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conditional Button Rendering */}
        <div className="flex gap-2 mt-auto">
          {checkingEnrollment ? (
            // Loading state while checking enrollment
            <div className="flex-1 rounded-md bg-gray-100 px-4 py-2 text-center">
              <Loader2 className="inline h-4 w-4 animate-spin text-gray-500 mr-2" />
              <span className="text-sm text-gray-500">Checking...</span>
            </div>
          ) : isEnrolled ? (
            // User is enrolled - show single "Continue Learning" button
            <Button 
              asChild
              className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
            >
              <Link href={`/courses/${course.slug}`}>
                <PlayCircle className="mr-2 h-4 w-4" />
                Continue Learning
              </Link>
            </Button>
          ) : (
            // User is not enrolled - show purchase and preview buttons
            <>
              <Button 
                onClick={handleSubscribe} 
                className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={course.isPublished === false || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {coursePrice === 0 ? 'Processing...' : 'Processing...'}
                  </>
                ) : (
                  coursePrice === 0 ? 'Enroll Free' : 'Buy Course'
                )}
              </Button>

              <Link 
                href={`/courses/${course.slug}`}
                className={`flex-1 rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-center text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb] ${
                  isLoading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                Preview
              </Link>
            </>
          )}
        </div>

        {/* Course Status Indicator */}
        {course.isPublished === false && (
          <div className="mt-2 text-center">
            <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Coming Soon
            </span>
          </div>
        )}

      </div>

      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-sm w-full mx-4">
            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-[#4a7c59] flex-shrink-0" />
            <div className="text-center sm:text-left">
              <span className="text-sm sm:text-base font-medium text-[#2c3e2d] block">
                Redirecting to checkout...
              </span>
              <span className="text-xs sm:text-sm text-[#5c6d5e] mt-1 block">
                Please wait while we prepare your payment
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}