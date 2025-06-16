// components/ModulesLessonsStep.jsx
import { memo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, LoaderCircle, AlertCircle } from "lucide-react"

const ModulesLessonsStep = memo(({ 
  modules, 
  moduleHandlers, 
  uploadingFiles, 
  handleFileUpload,
  validationErrors,
  showValidation,
  renderValidationError 
}) => {
  const videoRef = useRef(null)

  // Destructure handlers for cleaner code
  const {
    addModule,
    updateModule,
    removeModule,
    addLesson,
    updateLesson,
    removeLesson,
    addResource,
    updateResource,
    removeResource
  } = moduleHandlers

  // Handle lesson video upload
  const handleLessonVideoUpload = async (file, moduleIndex, lessonIndex) => {
    try {
      const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-video`)
      updateLesson(moduleIndex, lessonIndex, "videoUrl", url)
    } catch (err) {
      console.error('Video upload failed:', err)
    }
  }

  // Handle resource upload
  const handleResourceUpload = async (file, moduleIndex, lessonIndex, resourceIndex) => {
    try {
      const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-resource-${resourceIndex}`)
      updateResource(moduleIndex, lessonIndex, resourceIndex, "fileUrl", url)
    } catch (err) {
      console.error("Resource upload failed:", err)
    }
  }

  return (
    <div className="space-y-6">
      {modules.map((module, moduleIndex) => (
        <Card key={moduleIndex}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Module {moduleIndex + 1}</CardTitle>
                {showValidation && validationErrors[`module_${moduleIndex}_title`] && (
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Module title is required
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeModule(moduleIndex)}
                disabled={modules.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Module Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Module Title <span className="text-red-500">*</span>
                </label>
                <input
                  className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`module_${moduleIndex}_title`] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Introduction to Hiragana"
                  value={module.title}
                  onChange={(e) => updateModule(moduleIndex, "title", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={module.order}
                  onChange={(e) => updateModule(moduleIndex, "order", parseInt(e.target.value))}
                />
              </div>
            </div>

            {/* Lessons */}
            <div className="space-y-4">
              <h4 className="font-medium">Lessons</h4>
              {module.lessons.map((lesson, lessonIndex) => (
                <div key={lessonIndex} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">Lesson {lessonIndex + 1}</h5>
                      {(showValidation && (validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_title`] || 
                        validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_video`])) && (
                        <div className="flex items-center mt-1 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Missing required fields
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeLesson(moduleIndex, lessonIndex)}
                      disabled={module.lessons.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Lesson Title */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Lesson Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_title`] ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g., Learning A, I, U, E, O"
                      value={lesson.title}
                      onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)}
                    />
                    {renderValidationError(`module_${moduleIndex}_lesson_${lessonIndex}_title`)}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Video Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Video <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="video/*"
                          className={`w-full rounded-md border p-2 ${showValidation && validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_video`] ? 'border-red-500' : 'border-gray-300'}`}
                          onChange={async (e) => {
                            const file = e.target.files[0]
                            if (file) await handleLessonVideoUpload(file, moduleIndex, lessonIndex)
                          }}
                        />
                        {uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-video`] && (
                          <div className="flex items-center px-3">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          </div>
                        )}
                      </div>
                      {renderValidationError(`module_${moduleIndex}_lesson_${lessonIndex}_video`)}
                      {lesson.videoUrl && (
                        <video
                          ref={videoRef}
                          className="w-full rounded-md mt-2"
                          controls
                          onLoadedMetadata={() => {
                            const duration = videoRef.current?.duration
                            if (duration) {
                              updateLesson(moduleIndex, lessonIndex, "videoDuration", Math.round(duration))
                            }
                          }}
                        >
                          <source src={lesson.videoUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      )}
                    </div>

                    {/* Resources */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Resources</label>
                      {lesson.resources.map((resource, resourceIndex) => (
                        <div key={resourceIndex} className="grid gap-4 md:grid-cols-2 p-2 border rounded items-center">
                          <div className="space-y-1">
                            <input
                              className={`rounded-md border p-2 w-full ${
                                showValidation && validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_resource_${resourceIndex}_title`] 
                                  ? 'border-red-500' 
                                  : 'border-gray-300'
                              }`}
                              placeholder="Resource title"
                              value={resource.title}
                              onChange={(e) => updateResource(moduleIndex, lessonIndex, resourceIndex, "title", e.target.value)}
                            />
                            {renderValidationError(`module_${moduleIndex}_lesson_${lessonIndex}_resource_${resourceIndex}_title`)}
                          </div>

                          <div className="flex row items-center gap-2">
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                              className="rounded-md border border-gray-300 p-2 w-full"
                              onChange={async (e) => {
                                const file = e.target.files[0]
                                if (file) await handleResourceUpload(file, moduleIndex, lessonIndex, resourceIndex)
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeResource(moduleIndex, lessonIndex, resourceIndex)}
                              disabled={lesson.resources.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-resource-${resourceIndex}`] && (
                            <div className="flex items-center px-3">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            </div>
                          )}

                          {resource.fileUrl && (
                            <a
                              href={resource.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline text-sm col-span-4"
                            >
                              View uploaded file
                            </a>
                          )}
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addResource(moduleIndex, lessonIndex)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Resource
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => addLesson(moduleIndex)}>
                <Plus className="mr-2 h-4 w-4" /> Add Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button onClick={addModule}>
        <Plus className="mr-2 h-4 w-4" /> Add Module
      </Button>
    </div>
  )
})

ModulesLessonsStep.displayName = 'ModulesLessonsStep'

export default ModulesLessonsStep