import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  Clock, 
  BookIcon, 
  ThumbsUp, 
  Share2, 
  User 
} from "lucide-react"

export const CourseInfo = memo(function CourseInfo({ 
  lesson, 
  showFullDescription, 
  onToggleDescription, 
  progress 
}) {
  return (
    <div className="mb-4 rounded-lg border border-[#dce4d7] bg-white p-4 shadow-sm">
      <h1 className="text-2xl font-bold text-[#2c3e2d]">{lesson.title}</h1>

      <div className="mt-4 flex items-center">
        <span className="mr-2 text-sm text-[#5c6d5e]">Course Progress:</span>
        <div className="flex-1">
          <Progress
            value={progress}
            className="h-2 bg-[#dce4d7] [&>[data-progress]]:bg-[#4a7c59]"
          />
        </div>
        <span className="ml-2 text-sm font-medium text-[#2c3e2d]">{progress}%</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-[#5c6d5e]">
        <div className="flex items-center">
          <Clock className="mr-1 h-4 w-4" />
          <span>{lesson.totalDuration}</span>
        </div>
        <div className="flex items-center">
          <BookIcon className="mr-1 h-4 w-4" />
          <span>{lesson.totalLessons} lessons</span>
        </div>
        <div className="flex items-center">
          <Award className="mr-1 h-4 w-4" />
          <span>{lesson.level}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center">
        {lesson.instructorImg ? (
          <img
            src={lesson.instructorImg}
            alt="Instructor"
            className="mr-3 h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="mr-3 h-10 w-10 rounded-full bg-[#4a7c59] flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        )}
        <div>
          <h3 className="font-medium text-[#2c3e2d]">{lesson.instructor}</h3>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 font-medium text-[#2c3e2d]">About This Course</h3>
        <p className="text-sm text-[#5c6d5e]">
          {showFullDescription
            ? lesson.fullDescription
            : `${lesson.fullDescription?.substring(0, 200)}...`}
        </p>
        <button
          className="mt-2 text-sm font-medium text-[#4a7c59]"
          onClick={onToggleDescription}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
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