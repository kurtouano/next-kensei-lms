import { memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Eye, ArrowLeft } from "lucide-react"

export const InstructorPreviewToggle = memo(function InstructorPreviewToggle({
  previewMode,
  onTogglePreviewMode,
  courseTitle,
  isInstructorOwned = false,
  onBackToDashboard // Add this prop for the back button
}) {
  const handleToggle = useCallback((mode) => {
    onTogglePreviewMode(mode)
  }, [onTogglePreviewMode])

  // Don't show toggle if not instructor's course
  if (!isInstructorOwned) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm mb-6">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Back to Dashboard Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>

            {/* Course Title and View Mode */}
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {previewMode === 'enrolled' ? 'Enrolled Student View' : 'Guest View'} - {courseTitle}
              </span>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleToggle('enrolled')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                previewMode === 'enrolled'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Enrolled
            </button>
            <button
              onClick={() => handleToggle('guest')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                previewMode === 'guest'
                  ? 'bg-gray-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})