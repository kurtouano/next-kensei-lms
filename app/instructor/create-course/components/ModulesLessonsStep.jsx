// components/ModulesLessonsStep.jsx - Fixed video duration handling
import { memo, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, LoaderCircle, AlertCircle } from "lucide-react"
import ProgressBar from "./ProgressBar"

const ModulesLessonsStep = memo(({ 
  modules, 
  moduleHandlers, 
  uploadingFiles, 
  uploadProgress,
  handleFileUpload,
  validationErrors,
  showValidation,
  renderValidationError 
}) => {
  // Create refs for each video
  const videoRefs = useRef({})

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

  // Handle lesson video upload with duration capture
  const handleLessonVideoUpload = async (file, moduleIndex, lessonIndex) => {
    try {
      const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-video`)
      updateLesson(moduleIndex, lessonIndex, "videoUrl", url)
      
      // Also get duration from the uploaded video file
      getDurationFromFile(file, moduleIndex, lessonIndex)
    } catch (err) {
      console.error('Video upload failed:', err)
    }
  }

  // Get video duration from file before upload
  const getDurationFromFile = useCallback((file, moduleIndex, lessonIndex) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    video.onloadedmetadata = () => {
      const duration = Math.round(video.duration)
      console.log(`📹 Video duration captured: ${duration} seconds for Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}`)
      updateLesson(moduleIndex, lessonIndex, "videoDuration", duration)
      
      // Clean up
      window.URL.revokeObjectURL(video.src)
    }
    
    video.onerror = () => {
      console.error('Failed to load video metadata')
      window.URL.revokeObjectURL(video.src)
    }
    
    video.src = URL.createObjectURL(file)
  }, [updateLesson])

  // Handle video metadata loaded from uploaded URL
  const handleVideoMetadataLoaded = useCallback((moduleIndex, lessonIndex) => {
    const videoKey = `${moduleIndex}-${lessonIndex}`
    const video = videoRefs.current[videoKey]
    
    if (video && video.duration) {
      const duration = Math.round(video.duration)
      console.log(`📹 Video duration from URL: ${duration} seconds for Module ${moduleIndex + 1}, Lesson ${lessonIndex + 1}`)
      updateLesson(moduleIndex, lessonIndex, "videoDuration", duration)
    }
  }, [updateLesson])

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
        <Card key={moduleIndex} className="border-l-4 border-l-[#4a7c59] shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="bg-gradient-to-r from-[#f8faf9] to-[#f0f4f1] border-b border-[#e8f0ea]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#4a7c59] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {moduleIndex + 1}
                </div>
                <div>
                  <CardTitle className="text-lg text-[#2c3e2d]">Module {moduleIndex + 1}</CardTitle>
                  {module.title && (
                    <p className="text-sm text-[#4a7c59] font-medium">{module.title}</p>
                  )}
                  {showValidation && validationErrors[`module_${moduleIndex}_title`] && (
                    <div className="flex items-center mt-1 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Module title is required
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeModule(moduleIndex)}
                disabled={modules.length === 1}
                className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-[#2c3e2d]">Lessons</h4>
                <span className="bg-[#4a7c59] text-white text-xs px-2 py-1 rounded-full">
                  {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                </span>
              </div>
              {module.lessons.map((lesson, lessonIndex) => {
                const videoKey = `${moduleIndex}-${lessonIndex}`
                
                return (
                  <div key={lessonIndex} className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#4a7c59] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {lessonIndex + 1}
                        </div>
                        <div>
                          <h5 className="font-medium text-[#2c3e2d]">Lesson {lessonIndex + 1}</h5>
                          {lesson.title && (
                            <p className="text-sm text-[#4a7c59] font-medium">{lesson.title}</p>
                          )}
                          {/* Show video duration if available */}
                          {lesson.videoDuration > 0 && (
                            <p className="text-xs text-[#4a7c59] font-medium">
                              ⏱️ Duration: {Math.floor(lesson.videoDuration / 60)}:{(lesson.videoDuration % 60).toString().padStart(2, '0')}
                            </p>
                          )}
                          {(showValidation && (validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_title`] || 
                            validationErrors[`module_${moduleIndex}_lesson_${lessonIndex}_video`])) && (
                            <div className="flex items-center mt-1 text-red-600 text-sm">
                              <AlertCircle className="h-4 w-4 mr-1" />
                              Missing required fields
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeLesson(moduleIndex, lessonIndex)}
                        disabled={module.lessons.length === 1}
                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
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
                              if (file) {
                                // Get duration from file first, then upload
                                await handleLessonVideoUpload(file, moduleIndex, lessonIndex)
                              }
                            }}
                            disabled={uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-video`]}
                          />
                          {uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-video`] && (
                            <div className="flex items-center px-3">
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                        </div>
                        
                        {/* Video Upload Progress */}
                        {uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-video`] && (
                          <div className="space-y-1">
                            <ProgressBar progress={uploadProgress[`module-${moduleIndex}-lesson-${lessonIndex}-video`] || 0} />
                            <div className="text-xs text-gray-500 text-center">
                              Uploading video... {uploadProgress[`module-${moduleIndex}-lesson-${lessonIndex}-video`] || 0}%
                            </div>
                          </div>
                        )}
                        
                        {renderValidationError(`module_${moduleIndex}_lesson_${lessonIndex}_video`)}
                        
                        {/* Video Preview */}
                        {lesson.videoUrl && !uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-video`] && (
                          <div className="mt-2">
                            <video
                              ref={(el) => {
                                if (el) videoRefs.current[videoKey] = el
                              }}
                              className="w-full rounded-md"
                              controls
                              preload="metadata"
                              onLoadedMetadata={() => handleVideoMetadataLoaded(moduleIndex, lessonIndex)}
                              onError={(e) => {
                                console.error('Video loading error:', e)
                              }}
                            >
                              <source src={lesson.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            
                            {/* Duration Debug Info */}
                            {lesson.videoDuration === 0 && (
                              <p className="text-xs text-amber-600 mt-1">
                                ⚠️ Duration not set. Please refresh if video loads correctly.
                              </p>
                            )}
                          </div>
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
                )
              })}
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => addLesson(moduleIndex)}
                className="w-full border-dashed border-2 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Lesson
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Button 
        onClick={addModule}
        className="w-full bg-[#4a7c59] hover:bg-[#3a6147] text-white border-2 border-dashed border-[#4a7c59] hover:border-[#3a6147] transition-all"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Module
      </Button>
    </div>
  )
})

ModulesLessonsStep.displayName = 'ModulesLessonsStep'

export default ModulesLessonsStep