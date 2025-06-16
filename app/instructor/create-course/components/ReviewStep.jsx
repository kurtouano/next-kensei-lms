import { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

const ReviewStep = memo(({ 
  courseData, 
  modules, 
  totalLessons, 
  isSubmitting, 
  handleSubmit 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review & Publish</CardTitle>
        <CardDescription>Review your course before publishing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Course Information */}
          <div>
            <h4 className="font-medium mb-2">Course Information</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Title:</strong> {courseData.title}</p>
              <p><strong>Level:</strong> {courseData.level}</p>
              <p><strong>Price:</strong> ${courseData.price}</p>
              <p><strong>Modules:</strong> {modules.length}</p>
              <p><strong>Total Lessons:</strong> {totalLessons}</p>
              <p><strong>Highlights:</strong> {courseData.highlights.filter(h => h.description.trim()).length}</p>
              <p><strong>Tags:</strong> {courseData.tags.filter(t => t.trim()).length}</p>
            </div>
          </div>

          {/* Course Structure */}
          <div>
            <h4 className="font-medium mb-2">Course Structure</h4>
            <div className="space-y-2 text-sm">
              {modules.map((module, index) => (
                <div key={index}>
                  <p><strong>Module {index + 1}:</strong> {module.title}</p>
                  <p className="text-gray-600 ml-4">
                    {module.lessons.length} lessons, {module.quiz.questions.length} quiz questions
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <div className="flex gap-4">
          <Button 
            onClick={() => handleSubmit(false)} 
            className="flex-1 bg-[#4a7c59] hover:bg-[#3a6147]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Publishing..." : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Publish Course
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

ReviewStep.displayName = 'ReviewStep'

export default ReviewStep