"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, Eye, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react"

export default function CreateCourse() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState({})
  const [shopItems, setShopItems] = useState([])
  const videoRef = useRef(null)
  
  // Course data with better default structure
  const [courseData, setCourseData] = useState({
    slug: "",
    title: "",
    fullDescription: "",
    shortDescription: "",
    level: "",
    category: "",
    highlights: [{ description: "" }],
    thumbnail: "",
    price: 0,
    creditReward: 0,
    itemsReward: [""],
    tags: [""],
    isPublished: false,
  })

  const [modules, setModules] = useState([{
    title: "",
    order: 1,
    lessons: [{
      title: "",
      order: 1,
      videoUrl: "",
      videoDuration: 0,
      resources: [{ title: "", fileUrl: ""}],
      isPublished: false,
    }],
    quiz: {
      title: "",
      questions: [{
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: true },
        ],
      }],
    },
  }])

  const steps = useMemo(() => ["Course Details", "Modules & Lessons", "Quizzes", "Review & Publish"], [])

  // Load shop items on mount
  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const response = await fetch('/api/bonsai/shop-items')
        if (response.ok) {
          const data = await response.json()
          setShopItems(data)
        }
      } catch (error) {
        console.error('Error fetching shop items:', error)
      }
    }
    fetchShopItems()
  }, [])

  // Utility functions
  const generateSlug = useCallback((title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }, [])

  const uploadToS3 = useCallback(async (file, fileType = null) => {
    try {
      const res = await fetch('/api/instructor/s3-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          fileType: fileType
        }),
      })

      if (!res.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, fileUrl } = await res.json()

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) throw new Error('Failed to upload file')
      return fileUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }, [])

  const handleFileUpload = useCallback(async (file, uploadKey) => {
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }))
    
    try {
      const fileType = file.type.startsWith('image/') ? 'images' :
                      file.type.startsWith('video/') ? 'videos' :
                      file.type.startsWith('audio/') ? 'audio' : 'documents'

      const url = await uploadToS3(file, fileType)
      return url
    } catch (error) {
      alert('Upload failed: ' + error.message)
      throw error
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }))
    }
  }, [uploadToS3])

  // Course data handlers
  const updateCourseData = useCallback((field, value) => {
    setCourseData(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateCourseArray = useCallback((field, index, value, action = 'update') => {
    setCourseData(prev => {
      const array = [...prev[field]]
      switch (action) {
        case 'add':
          return { ...prev, [field]: [...array, value] }
        case 'remove':
          return { ...prev, [field]: array.filter((_, i) => i !== index) }
        case 'update':
        default:
          array[index] = value
          return { ...prev, [field]: array }
      }
    })
  }, [])

  // Specific handlers for course arrays
  const addHighlight = useCallback(() => updateCourseArray('highlights', null, { description: "" }, 'add'), [updateCourseArray])
  const updateHighlight = useCallback((index, value) => updateCourseArray('highlights', index, { description: value }), [updateCourseArray])
  const removeHighlight = useCallback((index) => updateCourseArray('highlights', index, null, 'remove'), [updateCourseArray])

  const addTag = useCallback(() => updateCourseArray('tags', null, "", 'add'), [updateCourseArray])
  const updateTag = useCallback((index, value) => updateCourseArray('tags', index, value), [updateCourseArray])
  const removeTag = useCallback((index) => updateCourseArray('tags', index, null, 'remove'), [updateCourseArray])

  const addItemReward = useCallback(() => updateCourseArray('itemsReward', null, "", 'add'), [updateCourseArray])
  const updateItemReward = useCallback((index, value) => updateCourseArray('itemsReward', index, value), [updateCourseArray])
  const removeItemReward = useCallback((index) => updateCourseArray('itemsReward', index, null, 'remove'), [updateCourseArray])

  // Module handlers with optimized updates
  const updateModules = useCallback((updater) => {
    setModules(prev => {
      if (typeof updater === 'function') {
        return updater(prev)
      }
      return updater
    })
  }, [])

  const addModule = useCallback(() => {
    updateModules(prev => [...prev, {
      title: "",
      order: prev.length + 1,
      lessons: [{
        title: "",
        order: 1,
        videoUrl: "",
        videoDuration: 0,
        resources: [{ title: "", fileUrl: ""}],
        isPublished: false,
      }],
      quiz: {
        title: "",
        questions: [{
          question: "",
          options: [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: true },
          ],
        }],
      },
    }])
  }, [updateModules])

  const updateModule = useCallback((moduleIndex, field, value) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? { ...module, [field]: value } : module
    ))
  }, [updateModules])

  const removeModule = useCallback((moduleIndex) => {
    updateModules(prev => prev.filter((_, i) => i !== moduleIndex))
  }, [updateModules])

  // Lesson handlers
  const addLesson = useCallback((moduleIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: [...module.lessons, {
          title: "",
          order: module.lessons.length + 1,
          videoUrl: "",
          videoDuration: 0,
          resources: [{ title: "", fileUrl: ""}],
          isPublished: false,
        }]
      } : module
    ))
  }, [updateModules])

  const updateLesson = useCallback((moduleIndex, lessonIndex, field, value) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? { ...lesson, [field]: value } : lesson
        )
      } : module
    ))
  }, [updateModules])

  const removeLesson = useCallback((moduleIndex, lessonIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.filter((_, j) => j !== lessonIndex)
      } : module
    ))
  }, [updateModules])

  // Resource handlers
  const addResource = useCallback((moduleIndex, lessonIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? {
            ...lesson,
            resources: [...lesson.resources, { title: "", fileUrl: ""}]
          } : lesson
        )
      } : module
    ))
  }, [updateModules])

  const updateResource = useCallback((moduleIndex, lessonIndex, resourceIndex, field, value) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? {
            ...lesson,
            resources: lesson.resources.map((resource, k) => 
              k === resourceIndex ? { ...resource, [field]: value } : resource
            )
          } : lesson
        )
      } : module
    ))
  }, [updateModules])

  const removeResource = useCallback((moduleIndex, lessonIndex, resourceIndex) => {
    updateModules(prev => prev.map((module, i) => 
      i === moduleIndex ? {
        ...module,
        lessons: module.lessons.map((lesson, j) => 
          j === lessonIndex ? {
            ...lesson,
            resources: lesson.resources.filter((_, k) => k !== resourceIndex)
          } : lesson
        )
      } : module
    ))
  }, [updateModules])

  // Quiz handlers
  const addQuestion = useCallback((moduleIndex) => {
    updateModule(moduleIndex, "quiz", {
      ...modules[moduleIndex].quiz,
      questions: [...modules[moduleIndex].quiz.questions, {
        question: "",
        options: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: true },
        ],
      }]
    })
  }, [modules, updateModule])

  const updateQuestion = useCallback((moduleIndex, questionIndex, field, value) => {
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? { ...question, [field]: value } : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  const updateOption = useCallback((moduleIndex, questionIndex, optionIndex, field, value) => {
    const updatedQuiz = {
      ...modules[moduleIndex].quiz,
      questions: modules[moduleIndex].quiz.questions.map((question, j) =>
        j === questionIndex ? {
          ...question,
          options: question.options.map((option, k) =>
            k === optionIndex ? { ...option, [field]: value } : option
          )
        } : question
      )
    }
    updateModule(moduleIndex, "quiz", updatedQuiz)
  }, [modules, updateModule])

  // Form validation
  const validateForm = useCallback(() => {
    if (!courseData.title || !courseData.slug || !courseData.shortDescription || !courseData.fullDescription) {
      alert('Please fill in all required course details')
      setCurrentStep(0)
      return false
    }

    if (!courseData.thumbnail) {
      alert('Please upload a course thumbnail')
      setCurrentStep(0)
      return false
    }

    for (const module of modules) {
      if (!module.title) {
        alert('Please fill in all module titles')
        setCurrentStep(1)
        return false
      }

      for (const lesson of module.lessons) {
        if (!lesson.title || !lesson.videoUrl) {
          alert('Please fill in all required lesson fields')
          setCurrentStep(1)
          return false
        }
      }
    }

    return true
  }, [courseData, modules])

  // Submit handler
  const handleSubmit = useCallback(async (isDraft = false) => {
    if (!validateForm()) return

    setIsSubmitting(true)
    
    try {
      const finalData = {
        ...courseData,
        modules: modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            resources: lesson.resources.filter(r => r.fileUrl && r.title)
          }))
        })),
        isPublished: !isDraft,
        tags: courseData.tags.filter(tag => tag.trim() !== ''),
        highlights: courseData.highlights.filter(h => h.description.trim() !== ''),
        itemsReward: courseData.itemsReward.filter(item => item && item.trim() !== ''),
      }

      const response = await fetch('/api/instructor/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      })

      const result = await response.json()

      if (result.success) {
        alert(isDraft ? 'Course saved as draft!' : 'Course published successfully!')
      } else {
        throw new Error(result.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving course: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }, [courseData, modules, validateForm])

  // Computed values
  const totalLessons = useMemo(() => 
    modules.reduce((acc, module) => acc + module.lessons.length, 0), 
    [modules]
  )

  // Event handlers for file uploads
  const handleCourseFileUpload = useCallback(async (file, field) => {
    try {
      const url = await handleFileUpload(file, `course-${field}`)
      updateCourseData(field, url)
    } catch (err) {
      console.error(`${field} upload failed:`, err)
    }
  }, [handleFileUpload, updateCourseData])

  const handleLessonVideoUpload = useCallback(async (file, moduleIndex, lessonIndex) => {
    try {
      const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-video`)
      updateLesson(moduleIndex, lessonIndex, "videoUrl", url)
    } catch (err) {
      console.error('Video upload failed:', err)
    }
  }, [handleFileUpload, updateLesson])

  const handleResourceUpload = useCallback(async (file, moduleIndex, lessonIndex, resourceIndex) => {
    try {
      const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-resource-${resourceIndex}`)
      updateResource(moduleIndex, lessonIndex, resourceIndex, "fileUrl", url)
    } catch (err) {
      console.error("Resource upload failed:", err)
    }
  }, [handleFileUpload, updateResource])

  // Render helpers
  const renderFileUploadInput = useCallback((accept, onChange, uploadKey, currentValue, label) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          type="file"
          accept={accept}
          className="w-full rounded-md border border-gray-300 p-2"
          onChange={onChange}
        />
        {uploadingFiles[uploadKey] && (
          <div className="flex items-center px-3">
            <LoaderCircle className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      {currentValue && (
        <a
          href={currentValue}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline text-sm"
        >
          View uploaded file
        </a>
      )}
    </div>
  ), [uploadingFiles])

  const renderArrayInput = useCallback((items, updateFn, removeFn, addFn, placeholder, btnName, fieldKey = null) => (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-gray-300 p-2"
            placeholder={placeholder}
            value={fieldKey ? item[fieldKey] : item}
            onChange={(e) => updateFn(index, e.target.value)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => removeFn(index)}
            disabled={items.length === 1}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addFn}>
        <Plus className="mr-2 h-4 w-4" /> {btnName}
      </Button>
    </div>
  ), [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2c3e2d]">Create New Course</h1>
        <p className="text-[#4a7c59]">Build your Japanese learning course step by step</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep ? "bg-[#4a7c59] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${index <= currentStep ? "text-[#4a7c59] font-medium" : "text-gray-500"}`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${index < currentStep ? "bg-[#4a7c59]" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title *</label>
              <input
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="e.g., Japanese for Beginners"
                value={courseData.title}
                onChange={(e) => {
                  const title = e.target.value
                  updateCourseData("title", title)
                  updateCourseData("slug", generateSlug(title))
                }}    
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Short Description *</label>
              <input
                className="w-full rounded-md border border-gray-300 p-2"
                placeholder="Brief description (max 200 characters)"
                maxLength={200}
                value={courseData.shortDescription}
                onChange={(e) => updateCourseData("shortDescription", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Description *</label>
              <textarea
                className="h-32 w-full rounded-md border border-gray-300 p-2"
                placeholder="Detailed course description"
                value={courseData.fullDescription}
                onChange={(e) => updateCourseData("fullDescription", e.target.value)}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Level *</label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={courseData.level}
                  onChange={(e) => updateCourseData("level", e.target.value)}
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner (N5)</option>
                  <option value="intermediate">Intermediate (N4-N3)</option>
                  <option value="advanced">Advanced (N2-N1)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={courseData.category}
                  onChange={(e) => updateCourseData("category", e.target.value)}
                >
                  <option value="">Select category</option>
                  <option value="speaking">Speaking</option>
                  <option value="writing">Writing</option>
                  <option value="reading">Reading</option>
                  <option value="listening">Listening</option>
                  <option value="grammar">Grammar</option>
                  <option value="vocabulary">Vocabulary</option>
                  <option value="culture">Culture</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price ($)</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="29.99"
                  value={courseData.price}
                  onChange={(e) => updateCourseData("price", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Credit Reward</label>
                <input
                  type="number"
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="100"
                  value={courseData.creditReward}
                  onChange={(e) => updateCourseData("creditReward", parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Rewards</label>
                {courseData.itemsReward.map((reward, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      className="flex-1 rounded-md border border-gray-300 p-2"
                      value={reward}
                      onChange={(e) => updateItemReward(index, e.target.value)}
                    >
                      <option value="">Select a reward item</option>
                      {shopItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItemReward(index)}
                      disabled={courseData.itemsReward.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addItemReward}>
                  <Plus className="mr-2 h-4 w-4" /> Add Item Reward
                </Button>
              </div>

              <div>
                {renderFileUploadInput(
                  "image/*",
                  async (e) => {
                    const file = e.target.files[0]
                    if (file) await handleCourseFileUpload(file, 'thumbnail')
                  },
                  'course-thumbnail',
                  courseData.thumbnail,
                  "Course Thumbnail *"
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Course Highlights</label>
              {renderArrayInput(
                courseData.highlights,
                updateHighlight,
                removeHighlight,
                addHighlight,
                "What students will learn",
                "Add Highlight",
                "description"
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              {renderArrayInput(
                courseData.tags,
                updateTag,
                removeTag,
                addTag,
                "e.g., beginner, conversation",
                "Add Tags",
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <Card key={moduleIndex}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Module {moduleIndex + 1}</CardTitle>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Module Title *</label>
                    <input
                      className="w-full rounded-md border border-gray-300 p-2"
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
                        <h5 className="font-medium">Lesson {lessonIndex + 1}</h5>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                          disabled={module.lessons.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Lesson Title *</label>
                        <input
                          className="w-full rounded-md border border-gray-300 p-2"
                          placeholder="e.g., Learning A, I, U, E, O"
                          value={lesson.title}
                          onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)}
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Video *</label>
                          <div className="flex gap-2">
                            <input
                              type="file"
                              accept="video/*"
                              className="w-full rounded-md border border-gray-300 p-2"
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

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Resources</label>
                          {lesson.resources.map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="grid gap-4 md:grid-cols-2 p-2 border rounded items-center">
                              <input
                                className="rounded-md border border-gray-300 p-2"
                                placeholder="Resource title"
                                value={resource.title}
                                onChange={(e) => updateResource(moduleIndex, lessonIndex, resourceIndex, "title", e.target.value)}
                              />

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
      )}

      {currentStep === 2 && (
        <div className="space-y-6">
          {modules.map((module, moduleIndex) => (
            <Card key={moduleIndex}>
              <CardHeader>
                <CardTitle>Quiz for Module {moduleIndex + 1}: {module.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quiz Title</label>
                  <input
                    className="w-full rounded-md border border-gray-300 p-2"
                    placeholder="e.g., Hiragana Basics Quiz"
                    value={module.quiz.title}
                    onChange={(e) => updateModule(moduleIndex, "quiz", { ...module.quiz, title: e.target.value })}
                  />
                </div>

                {module.quiz.questions.map((question, questionIndex) => (
                  <div key={questionIndex} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium">Question {questionIndex + 1}</h5>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newQuestions = module.quiz.questions.filter((_, i) => i !== questionIndex)
                          updateModule(moduleIndex, "quiz", { ...module.quiz, questions: newQuestions })
                        }}
                        disabled={module.quiz.questions.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Question *</label>
                      <input
                        className="w-full rounded-md border border-gray-300 p-2"
                        placeholder="Enter your question"
                        value={question.question}
                        onChange={(e) => updateQuestion(moduleIndex, questionIndex, "question", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Options</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2 items-center">
                          <input
                            type="radio"
                            name={`question-${moduleIndex}-${questionIndex}`}
                            checked={option.isCorrect}
                            onChange={() => {
                              const newOptions = question.options.map((opt, i) => ({
                                ...opt,
                                isCorrect: i === optionIndex,
                              }))
                              updateQuestion(moduleIndex, questionIndex, "options", newOptions)
                            }}
                          />
                          <input
                            className="flex-1 rounded-md border border-gray-300 p-2"
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option.text}
                            onChange={(e) =>
                              updateOption(moduleIndex, questionIndex, optionIndex, "text", e.target.value)
                            }
                          />
                          <span className="text-sm text-gray-500">{option.isCorrect ? "(Correct)" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={() => addQuestion(moduleIndex)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Publish</CardTitle>
            <CardDescription>Review your course before publishing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">Course Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Title:</strong> {courseData.title}</p>
                  <p><strong>Level:</strong> {courseData.level}</p>
                  <p><strong>Category:</strong> {courseData.category}</p>
                  <p><strong>Price:</strong> ${courseData.price}</p>
                  <p><strong>Modules:</strong> {modules.length}</p>
                  <p><strong>Total Lessons:</strong> {totalLessons}</p>
                </div>
              </div>
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

            <div className="flex gap-4">
              <Button 
                onClick={() => handleSubmit(true)} 
                variant="outline" 
                className="flex-1"
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
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={currentStep === steps.length - 1}
          className="bg-[#4a7c59] hover:bg-[#3a6147]"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}