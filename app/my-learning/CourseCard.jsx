//CourseCard.jsx
import { memo, useCallback } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export const CourseCard = memo(function CourseCard({ course }) {
  const handleImageError = useCallback((e) => {
    e.target.src = "/placeholder.svg";
  }, []);

  // Always go to course overview - smart redirect will happen there
  const continueUrl = `/courses/${course.slug}`;

  return (
    <Card className="overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md flex flex-col h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          src={course.image || "/placeholder.svg"}
          alt={course.title}
          className="h-full w-full object-cover"
          onError={handleImageError}
        />
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex-grow">
          <h3 className="mb-1 text-lg font-medium text-gray-900 line-clamp-2">
            {course.title}
          </h3>
          <p className="mb-3 text-sm text-gray-500">
            Instructor: {course.instructor}
          </p>
        </div>

        <div className="flex-shrink-0">
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {course.completedLessons}/{course.totalLessons} lessons
              </span>
              <span className="font-medium text-[#4a7c59]">
                {course.progress}%
              </span>
            </div>
            <Progress 
              value={course.progress} 
              className="h-2 bg-gray-100" 
              indicatorClassName="bg-[#4a7c59]" 
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="mr-1 h-4 w-4" />
              <span>Last: {course.lastLesson}</span>
            </div>
            <Button 
              className="bg-[#4a7c59] text-white hover:bg-[#3a6147]" 
              size="sm" 
              asChild
            >
              <Link href={continueUrl}>
                Continue
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});