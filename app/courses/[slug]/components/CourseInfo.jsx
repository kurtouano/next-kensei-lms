import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  Clock, 
  BookIcon, 
  ThumbsUp, 
  Share2, 
  User,
  Calendar
} from "lucide-react"

export const CourseInfo = memo(function CourseInfo({ 
  lesson, 
  showFullDescription, 
  onToggleDescription, 
  progress,
  isEnrolled
}) {
  // Check if description is long enough to need truncation
  const isDescriptionLong = lesson.fullDescription?.length > 200
  const shouldShowToggle = isDescriptionLong

  return (
    <div className="mb-6 rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm">
      {/* Course Title */}
      <h1 className="text-xl font-bold text-[#2c3e2d] mb-3">
        {lesson.title}
      </h1>

      {/* Course Progress - Single Row Layout */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#2c3e2d] whitespace-nowrap">Course Progress:</span>
          <Progress
            value={progress}
            className="flex-1 h-2 bg-[#dce4d7] [&>[data-progress]]:bg-[#4a7c59]"
          />
          <span className="text-sm font-medium text-[#2c3e2d] whitespace-nowrap">{progress}%</span>
        </div>
      </div>

      {/* Course Stats - All in one row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#5c6d5e] mb-3">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          <span>{lesson.totalDuration}</span>
        </div>
        <div className="flex items-center gap-1">
          <BookIcon className="h-4 w-4" />
          <span>{lesson.totalLessons} lessons</span>
        </div>
        <div className="flex items-center gap-1">
          <Award className="h-4 w-4" />
          <span className="capitalize">{lesson.level}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>Last updated {lesson.lastUpdated}</span>
        </div>
      </div>

      {/* Instructor Section */}
      <div className="flex items-center gap-3 mb-6">
        {lesson.instructorImg ? (
          <img
            src={lesson.instructorImg}
            alt="Instructor"
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#4a7c59] flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        )}
        <div>
          <h3 className="font-medium text-[#2c3e2d]">{lesson.instructor}</h3>
          <p className="text-sm text-[#5c6d5e]">Japanese Language Instructor</p>
        </div>
      </div>

      {/* About Section */}
      <div className="mb-6">
        <h3 className="font-medium text-[#2c3e2d] mb-2">About This Course</h3>
        <p className="text-sm text-[#5c6d5e] leading-relaxed whitespace-pre-line">
          {shouldShowToggle ? (
            showFullDescription
              ? lesson.fullDescription
              : `${lesson.fullDescription?.substring(0, 200)}...`
          ) : (
            lesson.fullDescription
          )}
        </p>
        {shouldShowToggle && (
          <button
            className="mt-2 text-sm font-medium text-[#4a7c59] hover:text-[#3a6147] transition-colors"
            onClick={onToggleDescription}
          >
            {showFullDescription ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
          <ThumbsUp className="mr-2 h-4 w-4" />
          Like
        </Button>
        <Button variant="outline" className="border-[#4a7c59] text-[#4a7c59]">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </div>
  )
})