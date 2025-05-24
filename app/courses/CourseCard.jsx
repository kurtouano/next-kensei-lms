import { BonsaiIcon } from "@/components/bonsai-icon"
import { BookOpen, Award, Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CourseCard({ course }) {

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
        <p className="mb-4 text-sm text-[#5c6d5e]">{course.description}</p>

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
            Includes: {course.customItems.join(", ")}
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

        <div className="flex gap-2 align-bottom">
          <Button className="flex-1 rounded-md bg-[#4a7c59] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#3a6147]">
            Subscribe
          </Button>
          <Link
            href={`/lessons/${course.id}`}
            className="flex-1 rounded-md border border-[#4a7c59] bg-white px-4 py-2 text-center text-sm font-medium text-[#4a7c59] transition-colors hover:bg-[#eef2eb]"
          >
            Preview
          </Link>
        </div>
      </div>
    </div>
  )
}