import { memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  PlayCircle, 
  FileText, 
  BookOpen, 
  Lock, 
  Check, 
  Circle,
  ChevronLeft,
  Play
} from "lucide-react"

export const CourseSidebar = memo(function CourseSidebar({
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
  courseData
}) {
  const totalItems = useMemo(() => 
    modules.flatMap(m => m.items).length,
    [modules]
  )

  const isModuleAccessible = useCallback((moduleIndex) => {
    // For non-enrolled users, only preview is accessible
    if (!isEnrolled) return false
    
    if (moduleIndex === 0) return true
    
    // Check if previous module is completed AND quiz is passed
    const prevModuleIndex = moduleIndex - 1
    const prevModule = modules[prevModuleIndex]
    const isPrevModuleComplete = prevModule?.items.every(item => completedItems.includes(item.id))
    const isPrevQuizPassed = moduleQuizCompleted.includes(prevModuleIndex)
    
    return isPrevModuleComplete && isPrevQuizPassed
  }, [modules, completedItems, moduleQuizCompleted, isEnrolled])

  return (
    <div className="sticky top-4 rounded-lg border border-[#dce4d7] bg-white shadow-sm">
      <div className="border-b border-[#dce4d7] bg-[#eef2eb] p-4">
        <h2 className="font-semibold text-[#2c3e2d]">Course Content</h2>
        <p className="text-sm text-[#5c6d5e]">
          {isEnrolled 
            ? `${completedItems.length} of ${totalItems} lessons completed`
            : `${totalItems} lessons available`
          }
        </p>
      </div>

      {/* Back to Module button when quiz is active */}
      {showModuleQuiz && onBackToModule && (
        <div className="border-b border-[#dce4d7] p-4">
          <Button
            variant="outline"
            className="w-full border-[#4a7c59] text-[#4a7c59]"
            onClick={onBackToModule}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Module
          </Button>
        </div>
      )}

      {/* FIXED: Preview video section - same styling as lessons */}
      {previewVideoUrl && (
        <div className="border-b border-[#dce4d7] p-2">
          <div
            className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors cursor-pointer ${
              activeVideoId === "preview"
                ? "bg-[#4a7c59] text-white"
                : "text-[#5c6d5e] hover:bg-[#f8f7f4]"
            }`}
            onClick={() => onSelectItem("preview", 0)}
          >
            <div className="mr-3 flex-shrink-0">
              <PlayCircle
                className={`h-4 w-4 ${
                  activeVideoId === "preview" ? "text-white" : "text-[#4a7c59]"
                }`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="truncate">Course Preview</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[calc(100vh-250px)] overflow-y-auto">
        {modules.map((module, moduleIndex) => (
          <ModuleSection
            key={module.id}
            module={module}
            moduleIndex={moduleIndex}
            isActive={activeModule === moduleIndex}
            isAccessible={isModuleAccessible(moduleIndex)}
            activeVideoId={activeVideoId}
            completedItems={completedItems}
            currentModuleCompleted={currentModuleCompleted}
            showModuleQuiz={showModuleQuiz}
            onSelectItem={onSelectItem}
            onToggleCompletion={onToggleCompletion}
            onTakeQuiz={onTakeQuiz}
            isEnrolled={isEnrolled}
          />
        ))}
      </div>

      {/* Enrollment prompt in sidebar for non-enrolled users */}
      {!isEnrolled && (
        <div className="border-t border-[#dce4d7] p-4 bg-gradient-to-r from-[#eef2eb] to-white">
          <div className="text-center">
            <Lock className="mx-auto mb-2 h-6 w-6 text-[#4a7c59]" />
            <p className="text-sm font-medium text-[#2c3e2d] mb-2">
              Unlock {totalItems} Lessons
            </p>
            <p className="text-xs text-[#5c6d5e] mb-3">
              Get full access to all content, quizzes, and resources
            </p>
            <Button 
              size="sm" 
              className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]"
              onClick={() => {
                fetch('/api/courses/stripe/create-checkout-session', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    courseId: courseData?.id,
                    title: courseData?.title || 'Course Enrollment',
                    description: courseData?.description || courseData?.fullDescription || 'Full course access',
                    price: courseData?.price || 0,
                    thumbnail: courseData?.thumbnail || '',
                  }),
                }).then(response => response.json())
                .then(data => {
                  if (data.url) {
                    window.location.assign(data.url);
                  }
                }).catch(console.error);
              }}
            >
              Enroll Now
            </Button>
          </div>
        </div>
      )}
    </div>
  )
})

const ModuleSection = memo(function ModuleSection({
  module,
  moduleIndex,
  isActive,
  isAccessible,
  activeVideoId,
  completedItems,
  currentModuleCompleted,
  showModuleQuiz,
  onSelectItem,
  onToggleCompletion,
  onTakeQuiz,
  isEnrolled
}) {
  const isModuleComplete = useMemo(() =>
    module.items.every(item => completedItems.includes(item.id)),
    [module.items, completedItems]
  )

  const completedCount = useMemo(() =>
    module.items.filter(item => completedItems.includes(item.id)).length,
    [module.items, completedItems]
  )

  // For non-enrolled users, show all modules as locked
  const moduleAccessible = isEnrolled ? isAccessible : false

  return (
    <div className={`border-b border-[#dce4d7] last:border-b-0 ${!moduleAccessible ? "opacity-60" : ""}`}>
      <div className={`flex items-center justify-between p-4 ${isActive ? "bg-[#eef2eb]" : ""}`}>
        <div className="flex items-center">
          {!moduleAccessible && <Lock className="mr-2 h-4 w-4 text-[#5c6d5e]" />}
          <h3 className={`font-medium ${moduleAccessible ? "text-[#2c3e2d]" : "text-[#5c6d5e]"}`}>
            {module.title}
          </h3>
        </div>
        <div className="flex items-center">
          {isModuleComplete && isEnrolled && (
            <CheckCircle2 className="mr-2 h-4 w-4 text-[#4a7c59]" />
          )}
          <span className="text-xs text-[#5c6d5e]">
            {isEnrolled ? `${completedCount}/${module.items.length}` : module.items.length}
          </span>
        </div>
      </div>

      {/* Module Access Warning */}
      {!moduleAccessible && isEnrolled && (
        <div className="mx-4 mb-3 rounded-md bg-[#eef2eb] border border-[#4a7c59] p-3">
          <div className="flex items-center">
            <Lock className="mr-2 h-4 w-4 text-[#4a7c59]" />
            <span className="text-sm text-[#5c6d5e]">
              Complete the previous module and pass its quiz (70%+) to unlock
            </span>
          </div>
        </div>
      )}

      {/* Enrollment Required Warning for non-enrolled users */}
      {!isEnrolled && (
        <div className="mx-4 mt-2 rounded-md bg-[#eef2eb] border border-[#4a7c59] p-3">
          <div className="flex items-center">
            <Lock className="mr-2 h-4 w-4 text-[#4a7c59]" />
            <span className="text-sm text-[#5c6d5e]">
              Enroll to access all {module.items.length} lessons in this module
            </span>
          </div>
        </div>
      )}

      <div className={`space-y-1 p-2 ${!moduleAccessible ? "pointer-events-none" : ""}`}>
        {module.items.map((item) => (
          <div key={item.id} className="space-y-2">
            
            {/* Resources Section */}
            {item.resources && item.resources.length > 0 && (
              <div className="space-y-1">
                {item.resources.map((resource, resourceIndex) => (
                  <ResourceItem
                    key={resourceIndex}
                    resource={resource}
                    item={item}
                    resourceIndex={resourceIndex}
                    moduleIndex={moduleIndex}
                    isActive={activeVideoId === `resource-${item.id}-${resourceIndex}`}
                    isAccessible={moduleAccessible}
                    onSelectItem={onSelectItem}
                    isEnrolled={isEnrolled}
                  />
                ))}
              </div>
            )}

            {/* Main Lesson Item */}
            <LessonItem
              item={item}
              moduleIndex={moduleIndex}
              isActive={activeVideoId === item.id}
              isCompleted={completedItems.includes(item.id)}
              isAccessible={moduleAccessible}
              onSelectItem={onSelectItem}
              onToggleCompletion={onToggleCompletion}
              isEnrolled={isEnrolled}
            />
          </div>
        ))}

        {/* Quiz Button - Only show when module is active, completed, and quiz not shown (enrolled users only) */}
        {isEnrolled && isActive && currentModuleCompleted && !showModuleQuiz && (
          <div className="rounded-md bg-[#eef2eb] p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4 text-[#4a7c59]" />
                <span className="text-sm font-medium text-[#2c3e2d]">Module Quiz</span>
              </div>
              <Button
                size="sm"
                className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                onClick={onTakeQuiz}
              >
                Take Quiz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

const LessonItem = memo(function LessonItem({
  item,
  moduleIndex,
  isActive,
  isCompleted,
  isAccessible,
  onSelectItem,
  onToggleCompletion,
  isEnrolled
}) {
  const handleItemClick = useCallback(() => {
    if (isAccessible) {
      onSelectItem(item.id, moduleIndex)
    }
  }, [isAccessible, onSelectItem, item.id, moduleIndex])

  const handleToggleClick = useCallback((e) => {
    if (isAccessible && isEnrolled) {
      onToggleCompletion(item.id, e)
    }
  }, [isAccessible, isEnrolled, onToggleCompletion, item.id])

  return (
    <div
      className={`flex w-full items-center rounded-md p-2 text-left text-sm transition-colors ${
        !isAccessible
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : isActive
            ? "cursor-pointer bg-[#4a7c59] text-white"
            : isCompleted && isEnrolled
              ? "cursor-pointer bg-[#eef2eb] text-[#2c3e2d]"
              : "cursor-pointer text-[#5c6d5e] hover:bg-[#f8f7f4]"
      }`}
      onClick={handleItemClick}
    >
      <div className="mr-3 flex-shrink-0">
        {item.type === "video" ? (
          <PlayCircle
            className={`h-4 w-4 ${
              !isAccessible
                ? "text-gray-400"
                : isActive
                  ? "text-white"
                  : "text-[#4a7c59]"
            }`}
          />
        ) : (
          <FileText
            className={`h-4 w-4 ${
              !isAccessible
                ? "text-gray-400"
                : isActive
                  ? "text-white"
                  : "text-[#4a7c59]"
            }`}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="truncate">{item.title}</span>
          <div className="ml-2 flex items-center">
            {!isEnrolled && (
              <Lock className="h-3 w-3 text-[#4a7c59] mr-1" />
            )}
            {item.type === "video" && (
              <span
                className={`text-xs ${
                  !isAccessible
                    ? "text-gray-400"
                    : isActive
                      ? "text-white/80"
                      : "text-[#5c6d5e]"
                }`}
              >
                {item.duration}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Only show completion toggle for enrolled users */}
      {isEnrolled && (
        <button
          className={`ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
            !isAccessible
              ? "border-gray-300 text-gray-300"
              : isActive
                ? isCompleted
                  ? "border-white bg-[#4a7c59] text-white"
                  : "border-white text-white"
                : isCompleted
                  ? "border-[#4a7c59] bg-white text-[#4a7c59]"
                  : "border-[#dce4d7] hover:border-[#4a7c59]"
          }`}
          onClick={handleToggleClick}
          disabled={!isAccessible}
        >
          {isCompleted ? (
            <Check className="h-3 w-3" />
          ) : (
            <Circle className="h-3 w-3 opacity-0" />
          )}
        </button>
      )}
    </div>
  )
})

const ResourceItem = memo(function ResourceItem({
  resource,
  item,
  resourceIndex,
  moduleIndex,
  isActive,
  isAccessible,
  onSelectItem,
  isEnrolled
}) {
  const handleResourceClick = useCallback(() => {
    if (isAccessible) {
      onSelectItem(`resource-${item.id}-${resourceIndex}`, moduleIndex)
    }
  }, [isAccessible, onSelectItem, item.id, resourceIndex, moduleIndex])

  return (
    <div
      className={`flex items-center justify-between rounded-md p-2 text-sm cursor-pointer transition-colors ${
        !isAccessible
          ? "cursor-not-allowed bg-gray-100 text-gray-400"
          : isActive
            ? "bg-[#4a7c59] text-white"
            : "text-[#5c6d5e] hover:bg-[#f8f7f4]"
      }`}
      onClick={handleResourceClick}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className="mr-3 flex-shrink-0">
          <FileText
            className={`h-4 w-4 ${
              !isAccessible
                ? "text-gray-400"
                : isActive
                  ? "text-white"
                  : "text-[#4a7c59]"
            }`}
          />
        </div>
        <div className="flex items-center flex-1 min-w-0">
          <span className="truncate">{resource.title}</span>
          {!isEnrolled && (
            <Lock className="h-3 w-3 text-[#4a7c59] ml-2" />
          )}
        </div>
      </div>
    </div>
  )
})