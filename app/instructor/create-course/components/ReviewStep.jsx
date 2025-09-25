import { memo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, Save, BookOpen, Users, DollarSign, Star, Clock, CheckCircle, AlertCircle } from "lucide-react"

const ReviewStep = memo(({ 
  courseData, 
  modules, 
  totalLessons, 
  isSubmitting, 
  handleSubmit,
  isEditMode = false
}) => {
  // Calculate additional statistics
  const totalQuizQuestions = modules.reduce((acc, module) => acc + module.quiz.questions.length, 0)
  const totalVideoDuration = modules.reduce((acc, module) => 
    acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.videoDuration || 0), 0), 0
  )
  const hasThumbnail = courseData.thumbnailUrl
  const hasPreviewVideo = courseData.previewVideoUrl
  const hasHighlights = courseData.highlights.filter(h => h.description.trim()).length > 0
  const hasTags = courseData.tags.filter(t => t.trim()).length > 0

  return (
    <Card className="border-l-4 border-l-[#4a7c59] shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gradient-to-r from-[#f8faf9] to-[#f0f4f1] border-b border-[#e8f0ea]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#4a7c59] text-white rounded-full flex items-center justify-center text-sm font-bold">
            4
          </div>
          <div>
            <CardTitle className="text-lg text-[#2c3e2d]">{isEditMode ? 'Review & Update' : 'Review & Publish'}</CardTitle>
            <CardDescription className="text-[#4a7c59]">
              {isEditMode ? 'Review your changes before updating the course' : 'Review your course before publishing'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Course Overview Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="bg-[#f8faf9] p-4 rounded-lg border border-[#e8f0ea]">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-[#4a7c59]" />
              <span className="text-sm font-medium text-[#2c3e2d]">Modules</span>
            </div>
            <div className="text-2xl font-bold text-[#4a7c59]">{modules.length}</div>
          </div>
          
          <div className="bg-[#f8faf9] p-4 rounded-lg border border-[#e8f0ea]">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#4a7c59]" />
              <span className="text-sm font-medium text-[#2c3e2d]">Lessons</span>
            </div>
            <div className="text-2xl font-bold text-[#4a7c59]">{totalLessons}</div>
          </div>
          
          <div className="bg-[#f8faf9] p-4 rounded-lg border border-[#e8f0ea]">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-[#4a7c59]" />
              <span className="text-sm font-medium text-[#2c3e2d]">Quiz Questions</span>
            </div>
            <div className="text-2xl font-bold text-[#4a7c59]">{totalQuizQuestions}</div>
          </div>
          
          <div className="bg-[#f8faf9] p-4 rounded-lg border border-[#e8f0ea]">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-[#4a7c59]" />
              <span className="text-sm font-medium text-[#2c3e2d]">Price</span>
            </div>
            <div className="text-2xl font-bold text-[#4a7c59]">${courseData.price}</div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Course Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-[#2c3e2d] mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#4a7c59]" />
              Course Information
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Title</span>
                <span className="text-sm text-[#2c3e2d] font-medium">{courseData.title || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Level</span>
                <span className="text-sm text-[#2c3e2d] font-medium">{courseData.level || 'Not set'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Price</span>
                <span className="text-sm text-[#2c3e2d] font-medium">${courseData.price || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Thumbnail</span>
                <span className={`text-sm font-medium ${hasThumbnail ? 'text-green-600' : 'text-red-600'}`}>
                  {hasThumbnail ? '✓ Uploaded' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Preview Video</span>
                <span className={`text-sm font-medium ${hasPreviewVideo ? 'text-green-600' : 'text-red-600'}`}>
                  {hasPreviewVideo ? '✓ Uploaded' : '✗ Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-600">Highlights</span>
                <span className={`text-sm font-medium ${hasHighlights ? 'text-green-600' : 'text-red-600'}`}>
                  {hasHighlights ? `${courseData.highlights.filter(h => h.description.trim()).length} added` : 'None added'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Tags</span>
                <span className={`text-sm font-medium ${hasTags ? 'text-green-600' : 'text-red-600'}`}>
                  {hasTags ? `${courseData.tags.filter(t => t.trim()).length} added` : 'None added'}
                </span>
              </div>
            </div>
          </div>

          {/* Course Structure */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-semibold text-[#2c3e2d] mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#4a7c59]" />
              Course Structure
            </h4>
            <div className="space-y-4">
              {modules.map((module, index) => (
                <div key={index} className="bg-[#f8faf9] p-4 rounded-lg border border-[#e8f0ea]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-[#4a7c59] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <h5 className="font-medium text-[#2c3e2d]">{module.title || `Module ${index + 1}`}</h5>
                  </div>
                  <div className="ml-8 space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      <span>{module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3" />
                      <span>{module.quiz.questions.length} quiz question{module.quiz.questions.length !== 1 ? 's' : ''}</span>
                    </div>
                    {totalVideoDuration > 0 && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{Math.floor(totalVideoDuration / 60)}:{(totalVideoDuration % 60).toString().padStart(2, '0')} total duration</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#f8faf9] border border-[#e8f0ea] rounded-lg p-6">
          <div className="text-center mb-4">
            <h4 className="font-semibold text-[#2c3e2d] mb-2">Ready to {isEditMode ? 'Update' : 'Publish'}?</h4>
            <p className="text-sm text-gray-600">
              {isEditMode 
                ? 'Your course changes will be saved and published to students.' 
                : 'Your course will be published and available for students to enroll.'
              }
            </p>
          </div>
          
          <div className="flex gap-4">
            {isEditMode ? (
              <>
                <Button 
                  onClick={() => handleSubmit(true)} 
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleSubmit(false)} 
                  className="flex-1 bg-[#4a7c59] hover:bg-[#3a6147] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Update & Publish
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => handleSubmit(false)} 
                className="flex-1 bg-[#4a7c59] hover:bg-[#3a6147] text-white text-lg py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : (
                  <>
                    <Eye className="mr-2 h-5 w-5" />
                    Publish Course
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

ReviewStep.displayName = 'ReviewStep'

export default ReviewStep