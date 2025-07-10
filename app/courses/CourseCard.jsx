import { BonsaiIcon } from "@/components/bonsai-icon"
import { Button } from "@/components/ui/button"
import { BookOpen, Check, PlayCircle, Star, LoaderCircle, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useCallback, useMemo, useEffect, useState, memo } from "react"

export const CourseCard = memo(function CourseCard({ course }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)

  // 🆕 Check if course is free
  const isFree = course.price === 0

  // useCallback: Memoize handleSubscribe function
  const handleSubscribe = useCallback(async (e) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    
    // Check if user is logged in first
    if (!session?.user) {
      console.log('❌ User not logged in, redirecting to login')
      window.location.href = '/auth/login'
      return
    }
    
    try {
      setIsLoading(true)
      console.log('🛒 Starting checkout for course:', course.id, 'Free:', isFree)
      
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
        // For free courses, this will redirect to success page directly
        // For paid courses, this will redirect to Stripe checkout
        window.location.assign(data.url);
      } else {
        console.error('No checkout URL received:', data)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false)
    }
  }, [course.id, course.title, course.description, course.shortDescription, course.price, course.thumbnail, session, isFree])

  const handleContinueLearning = useCallback((e) => {
    e.stopPropagation(); // Prevent card click
  }, [])

  const handlePreview = useCallback((e) => {
    e.stopPropagation(); // Prevent card click
  }, [])

  const handleImageError = useCallback((e) => {
    e.target.src = "/placeholder.svg"
  }, [])

  const courseData = useMemo(() => ({
    averageRating: course.ratingStats?.averageRating || course.averageRating || 0,
    totalReviews: course.ratingStats?.totalRatings || course.totalReviews || 0,
    title: course.title || 'Untitled Course',
    description: course.shortDescription || course.description || 'No description available',
    price: course.price || 0,
    credits: course.creditReward || course.credits || 0,
    modulesCount: course.modules || course.modulesCount || 0,
    lessonsCount: course.lessons || course.lessonsCount || course.totalLessons || 0,
    highlights: course.highlights || course.learningHighlights || [
      'Interactive lessons',
      'Cultural insights', 
      'Practical vocabulary'
    ],
    itemsReward: course.itemsReward?.length > 0 
      ? course.itemsReward.slice(0, 2)
      : ['Certificate', 'Resources']
  }), [course])

  // 🆕 Updated price display logic
  const priceDisplay = useMemo(() => {
    if (checkingEnrollment) {
      return "";
    }
    if (isEnrolled) {
      return "";
    }
    return courseData.price === 0
      ? 'Free'
      : `$ ${Number(courseData.price).toFixed(2)}`;
  }, [isEnrolled, checkingEnrollment, courseData.price]);

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

  // 🆕 Updated loading state message
  if (isLoading) return <LoadingState isFree={isFree} />

  return (
    <Link href={`/courses/${course.slug}`} className="block">
      <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full cursor-pointer">
        {/* Image with overlay gradient */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <img
            src={course.thumbnail || "/placeholder.svg"}
            alt={courseData.title}
            className="h-full w-full object-cover transition-transform duration-500"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

          {/* JLPT Level and Price badges in same row */}
          <div className="absolute top-4 right-4 flex flex-row gap-2 items-center">
            {/* JLPT Level Badge */}
            <span className="rounded-full bg-[#eef2eb] px-3 py-1 text-xs font-medium text-[#4a7c59] shadow-sm">
              JLPT {course.level}
            </span>
            
            {/* 🆕 Price Badge - show "Free" or price */}
            {!isEnrolled && !checkingEnrollment && priceDisplay && (
              <span className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${
                isFree 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[#eef2eb] text-[#4a7c59]'
              }`}>
                {priceDisplay}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Rating and Lessons in one row - same as homepage */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={courseData.averageRating} totalReviews={courseData.totalReviews} />
              {isEnrolled && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 backdrop-blur-sm ml-2">
                  <Check className="mr-1 h-3 w-3" />
                  Enrolled
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-[#5c6d5e]">
              <PlayCircle className="h-3 w-3" />
              <span>{courseData.lessonsCount} lessons</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-3 text-xl font-bold text-gray-900 line-clamp-2 leading-tight">
            {courseData.title}
          </h3>

          {/* Description */}
          <p className="mb-4 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {courseData.description}
          </p>

          {/* Learning highlights */}
          <div className="mb-6 flex-1">
            <h4 className="mb-3 text-sm font-semibold text-gray-900">What you'll learn:</h4>
            <div className="space-y-2">
              {courseData.highlights.slice(0, 3).map((highlight, index) => (
                <div key={index} className="flex items-center gap-2 ">
                  <div className="mt-0.5 flex-shrink-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#4a7c59]"></div>
                  </div>
                  <span className="text-sm text-gray-600 line-clamp-1">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <CourseActions
            checkingEnrollment={checkingEnrollment}
            isEnrolled={isEnrolled}
            isLoading={isLoading}
            coursePrice={courseData.price}
            courseSlug={course.slug}
            coursePublished={course.isPublished}
            isFree={isFree}
            onSubscribe={handleSubscribe}
            onContinueLearning={handleContinueLearning}
            onPreview={handlePreview}
          />
        </div>
      </div>
    </Link>
  )
})

const CourseActions = memo(function CourseActions({ 
  checkingEnrollment, 
  isEnrolled, 
  isLoading, 
  coursePrice, 
  courseSlug, 
  coursePublished,
  isFree, // 🆕 New prop
  onSubscribe,
  onContinueLearning,
  onPreview
}) {
  if (checkingEnrollment) {
    return <EnrollmentCheckingSkeleton />
  }

  if (isEnrolled) {
    return (
      <div className="w-full rounded-md bg-[#4a7c59] text-white hover:bg-[#3a6147] transition-all duration-200 ease-out group px-6 py-2 text-center text-sm font-medium cursor-pointer"
        onClick={onContinueLearning}
      >
        <Link href={`/courses/${courseSlug}`} className="flex items-center justify-center">
          <PlayCircle className="mr-2 h-4 w-4" />
          Continue Learning
        </Link>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {/* 🆕 Updated Enroll Now Button - consistent brand colors */}
      <Button 
        onClick={onSubscribe} 
        className="flex-1 rounded-md bg-[#4a7c59] px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:from-[#3a6147] hover:to-[#4a7c59] hover:shadow-lg hover:shadow-[#4a7c59]/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none"
        disabled={coursePublished === false || isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {isFree ? 'Enrolling...' : 'Processing...'}
          </span>
        ) : (
          isFree ? 'Get Free Access' : 'Enroll Now'
        )}
      </Button>

      {/* Preview Button - Same as before */}
      <div
        onClick={onPreview}
        className={`flex-1 rounded-md border border-[#4a7c59] text-[#4a7c59] hover:border-[#3a6147] hover:bg-[#4a7c59]/12 hover:text-[#3a6147] transition-all duration-200 ease-out backdrop-blur-sm group px-4 py-2 text-center text-sm font-medium cursor-pointer ${
          isLoading ? 'pointer-events-none opacity-50' : ''
        }`}
      >
        <Link href={`/courses/${courseSlug}`} className="flex items-center justify-center">
          Learn More
          <ChevronRight className="ml-[10px] h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
})

const StarRating = memo(function StarRating({ rating, totalReviews }) {
  const stars = useMemo(() => {
    const starArray = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    if (rating === 0) {
      for (let i = 0; i < 5; i++) {
        starArray.push(
          <Star
            key={`empty-${i}`}
            className="h-3 w-3 text-gray-300"
          />
        );
      }
    } else {
      for (let i = 0; i < fullStars; i++) {
        starArray.push(
          <Star
            key={`full-${i}`}
            className="h-3 w-3 fill-amber-400 text-amber-400"
          />
        );
      }

      if (hasHalfStar) {
        starArray.push(
          <div key="half" className="relative">
            <Star className="h-3 w-3 text-gray-300" />
            <Star 
              className="absolute top-0 h-3 w-3 fill-amber-400 text-amber-400"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            />
          </div>
        );
      }

      const remainingStars = 5 - Math.ceil(rating);
      for (let i = 0; i < remainingStars; i++) {
        starArray.push(
          <Star
            key={`empty-${i}`}
            className="h-3 w-3 text-gray-300"
          />
        );
      }
    }

    return starArray;
  }, [rating])

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {stars}
      </div>
      <div className="flex items-center gap-1 text-xs">
        <span className="font-semibold text-gray-900">
          {rating > 0 ? rating.toFixed(1) : '0.0'}
        </span>
        <span className="text-gray-500">
          ({totalReviews})
        </span>
      </div>
    </div>
  );
})

const EnrollmentCheckingSkeleton = memo(function EnrollmentCheckingSkeleton() {
  return (
    <div className="flex gap-3">
      <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
      <div className="flex-1 h-12 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>
  )
})

// 🆕 Updated loading state with free course messaging
function LoadingState({ isFree }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full mx-4 border border-gray-100">
        <LoaderCircle className="w-10 h-10 text-green-700 animate-spin"></LoaderCircle>
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold text-gray-900">
            {isFree ? 'Enrolling you for free...' : 'Redirecting to checkout...'}
          </div>
          <div className="text-sm text-gray-600">
            {isFree ? 'Please wait while we set up your free access' : 'Please wait while we prepare your payment'}
          </div>
        </div>
      </div>
    </div>
  )
}