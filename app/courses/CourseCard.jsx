"use client"

import { BonsaiIcon } from "@/components/bonsai-icon"
import { BookOpen, Award, Check, Star } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CourseCard({ course }) {

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    try {
      // Call your checkout session API
      const response = await fetch('/api/courses/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          title: course.title,
          description: course.description,
          price: course.price,
          thumbnail: course.thumbnail,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.assign(url);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  // Helper function to render star rating
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
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-[#5c6d5e]">
          ({totalReviews})
        </span>
      </div>
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-xl font-semibold text-[#2c3e2d]">{course.title}</h3>
        <p className="mb-3 text-sm text-[#5c6d5e]">{course.description}</p>

        {/* Star Rating - Always show */}
        <div className="mb-3">
          <StarRating rating={course.averageRating || 0} totalReviews={course.totalReviews || 0} />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-bold text-[#2c3e2d]">${course.price}</div>
          <div className="flex items-center text-sm text-[#5c6d5e]">
            <BonsaiIcon className="mr-1 h-4 w-4 text-[#4a7c59]" />
            {course.credits} credits
          </div>
        </div>

        <div className="mb-4 space-y-2 rounded-md bg-[#eef2eb] p-3">
          <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
            <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
            {course.modules} modules • {course.lessons} lessons
          </div>
          <div className="flex items-center text-sm font-medium text-[#2c3e2d]">
            <Award className="mr-2 h-4 w-4 text-[#4a7c59]" />
            Includes: {course.itemsReward.join(", ")}
          </div>
        </div>

        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-[#2c3e2d]">Learning Highlights:</h4>
          <ul className="space-y-1">
            {course.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start text-sm">
                <Check className="mr-2 h-4 w-4 shrink-0 text-[#4a7c59]" />
                <span className="text-[#5c6d5e]">{highlight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSubscribe} className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]">
            Enroll Now
          </Button>

          <Link 
            href={`/courses/${course.slug}`}
            className="flex-1 rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-center text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]"
          >
            Preview
          </Link>
        </div>
      </div>
    </div>
  )
}