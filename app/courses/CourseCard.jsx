import { BonsaiIcon } from "@/components/bonsai-icon"
import { Button } from "@/components/ui/button"
import { Award, BookOpen, Check, PlayCircle, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useCallback, useMemo, useEffect, useState, memo } from "react"

export const CourseCard = memo(function CourseCard({ course }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)

  // useCallback: Memoize handleSubscribe function
  // This is passed to Button component, so needs stable reference
  const handleSubscribe = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true)
      
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
        window.location.assign(data.url);
      } else {
        console.error('No checkout URL received:', data)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setIsLoading(false)
    }
  }, [course.id, course.title, course.description, course.shortDescription, course.price, course.thumbnail])

  // useCallback: Memoize error handler for image loading
  const handleImageError = useCallback((e) => {
    e.target.src = "/placeholder.svg"
  }, [])

  // useMemo: Parse course data once instead of on every render
  // This is expensive because it involves multiple fallback checks
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

    // Check if enrolled or display course price
  const priceDisplay = useMemo(() => {
  if (checkingEnrollment) {
    return <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
  }
  if (isEnrolled) {
    return <span className="text-[#4a7c59]">Enrolled</span>
  }
  return courseData.price === 0 ? 'Free' : `$ ${courseData.price}`
}, [isEnrolled, checkingEnrollment, courseData.price])

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

  if (isLoading) return <LoadingState />

  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md flex flex-col h-full">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={courseData.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={handleImageError}
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="mb-2 text-xl font-semibold text-[#2c3e2d] line-clamp-2 min-h-[3.5rem] flex">
          <span>{courseData.title}</span>
        </h3>
        <p className="mb-3 text-sm text-[#5c6d5e] line-clamp-2">
          {courseData.description}
        </p>

        <div className="mb-3">
          <StarRating rating={courseData.averageRating} totalReviews={courseData.totalReviews} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-md font-bold text-[#2c3e2d]">
            {priceDisplay}
          </div>
          {courseData.credits > 0 && (
            <div className="flex items-center text-sm text-[#5c6d5e]">
              <BonsaiIcon className="mr-1 h-4 w-4 text-[#4a7c59]" />
              {courseData.credits} credits
            </div>
          )}
        </div>

        <CourseInfo courseData={courseData} />
        <LearningHighlights highlights={courseData.highlights} />
        
        <CourseActions
          checkingEnrollment={checkingEnrollment}
          isEnrolled={isEnrolled}
          isLoading={isLoading}
          coursePrice={courseData.price}
          courseSlug={course.slug}
          coursePublished={course.isPublished}
          onSubscribe={handleSubscribe}
        />

        {course.isPublished === false && (
          <div className="mt-2 text-center">
            <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </div>
  )
})

const CourseInfo = memo(function CourseInfo({ courseData }) {
  return (
    <div className="mb-4 space-y-2 rounded-md bg-[#eef2eb] p-3">
      <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
        <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
        {courseData.modulesCount} module{courseData.modulesCount !== 1 ? 's' : ''} • {courseData.lessonsCount} lesson{courseData.lessonsCount !== 1 ? 's' : ''}
      </div>
      {courseData.itemsReward.length > 0 && (
        <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
          <Award className="mr-2 h-4 w-4 text-[#4a7c59]" />
          Includes: {courseData.itemsReward.join(", ")}
        </div>
      )}
    </div>
  )
})

const LearningHighlights = memo(function LearningHighlights({ highlights }) {
  return (
    <div className="mb-4 flex-grow">
      <h4 className="mb-2 text-sm font-semibold text-[#2c3e2d]">Learning Highlights:</h4>
      <ul className="space-y-1">
        {highlights.slice(0, 4).map((highlight, index) => (
          <li key={index} className="flex items-start text-sm">
            <Check className="mr-2 h-4 w-4 shrink-0 text-[#4a7c59]" />
            <span className="text-[#5c6d5e] line-clamp-1">{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  )
})

  const CourseActions = memo(function CourseActions({ 
    checkingEnrollment, 
    isEnrolled, 
    isLoading, 
    coursePrice, 
    courseSlug, 
    coursePublished, 
    onSubscribe 
  }) {
    if (checkingEnrollment) {
      return <EnrollmentCheckingSkeleton />
    }

    if (isEnrolled) {
      return (
        <Button 
          asChild
          className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]"
        >
          <Link href={`/courses/${courseSlug}`}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Continue Learning
          </Link>
        </Button>
      )
    }

    return (
      <div className="flex gap-2 mt-auto">
        <Button 
          onClick={onSubscribe} 
          className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={coursePublished === false || isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {coursePrice === 0 ? 'Processing...' : 'Processing...'}
            </span>
          ) : (
            coursePrice === 0 ? 'Enroll Free' : 'Buy Course'
          )}
        </Button>

        <Link 
          href={`/courses/${courseSlug}`}
          className={`flex-1 rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-center text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb] ${
            isLoading ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          Preview
        </Link>
      </div>
    )
  })

  const StarRating = memo(function StarRating({ rating, totalReviews }) {
    // useMemo: Expensive star calculation logic
    const stars = useMemo(() => {
      const starArray = [];
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 >= 0.5;

      if (rating === 0) {
        for (let i = 0; i < 5; i++) {
          starArray.push(
            <Star
              key={`empty-${i}`}
              className="h-4 w-4 text-gray-300"
            />
          );
        }
      } else {
        for (let i = 0; i < fullStars; i++) {
          starArray.push(
            <Star
              key={`full-${i}`}
              className="h-4 w-4 fill-yellow-400 text-yellow-400"
            />
          );
        }

        if (hasHalfStar) {
          starArray.push(
            <div key="half" className="relative">
              <Star className="h-4 w-4 text-gray-300" />
              <Star 
                className="absolute top-0 h-4 w-4 fill-yellow-400 text-yellow-400"
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
              className="h-4 w-4 text-gray-300"
            />
          );
        }
      }

      return starArray;
    }, [rating])

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
  })

  const EnrollmentCheckingSkeleton = memo(function EnrollmentCheckingSkeleton() {
    return (
      <div className="flex gap-2 mt-auto">
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  })

  function LoadingState() {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 shadow-2xl flex flex-col sm:flex-row items-center gap-4 max-w-sm w-full mx-4 border border-gray-200">
          <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 border-[#4a7c59] border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <div className="text-center sm:text-left space-y-1">
            <div className="text-sm sm:text-base font-medium text-[#2c3e2d]">
              Redirecting to checkout...
            </div>
            <div className="text-xs sm:text-sm text-[#5c6d5e]">
              Please wait while we prepare your payment
            </div>
          </div>
        </div>
      </div>
    )
  }