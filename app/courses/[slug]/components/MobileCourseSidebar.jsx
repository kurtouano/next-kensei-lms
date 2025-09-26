import { memo, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, List, BookOpen, Menu } from "lucide-react"
import { CourseSidebar } from "./CourseSidebar"

export const MobileCourseSidebar = memo(function MobileCourseSidebar({
  modules,
  activeModule,
  activeVideoId,
  completedItems,
  moduleQuizCompleted,
  currentModuleCompleted,
  showModuleQuiz,
  onSelectItem,
  onToggleCompletion,
  onTakeQuiz,
  onBackToModule,
  isEnrolled,
  previewVideoUrl,
  courseData,
  progress,
  isModuleAccessible,
  rewardData
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleItemSelect = useCallback((itemId, moduleIndex) => {
    onSelectItem(itemId, moduleIndex)
    setIsOpen(false) // Close sidebar after selection
  }, [onSelectItem])

  return (
    <>
      {/* Mobile Toggle Button - Modern pill style above video section */}
      <div className="lg:hidden mb-4 flex justify-end">
        <Button
          onClick={handleToggle}
          className="bg-white border-2 border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white rounded-full shadow-md h-10 px-4 flex items-center gap-2 transition-all duration-200 hover:shadow-lg"
        >
          <List className="h-4 w-4" />
          <span className="text-sm font-semibold">Lessons</span>
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={handleClose}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed top-0 right-0 h-screen w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Mobile Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-[#eef2eb] flex-shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#4a7c59]" />
            <h2 className="font-semibold text-[#2c3e2d]">Course Content</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0 hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Progress Indicator */}
        <div className="px-4 py-2 bg-[#f8f7f4] border-b border-gray-200">
          <p className="text-sm text-[#5c6d5e]">
            {isEnrolled 
              ? `${completedItems.length} of ${modules.flatMap(m => m.items).length} lessons completed`
              : `${modules.flatMap(m => m.items).length} lessons available`
            }
          </p>
        </div>

        {/* Mobile Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <CourseSidebar
            modules={modules}
            activeModule={activeModule}
            activeVideoId={activeVideoId}
            completedItems={completedItems}
            moduleQuizCompleted={moduleQuizCompleted}
            currentModuleCompleted={currentModuleCompleted}
            showModuleQuiz={showModuleQuiz}
            onSelectItem={handleItemSelect}
            onToggleCompletion={onToggleCompletion}
            onTakeQuiz={onTakeQuiz}
            onBackToModule={onBackToModule}
            isEnrolled={isEnrolled}
            previewVideoUrl={previewVideoUrl}
            courseData={courseData}
            progress={progress}
            isModuleAccessible={isModuleAccessible}
            rewardData={rewardData}
            isMobile={true}
          />
        </div>
      </div>
    </>
  )
})
