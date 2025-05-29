"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, Eye, ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react"

export default function CreateCourse() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState({})
  const [shopItems, setShopItems] = useState([])
  const videoRef = useRef(null);
  
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

  const [modules, setModules] = useState([
    {
      title: "",
      order: 1,
      lessons: [
        {
          title: "",
          order: 1,
          videoUrl: "",
          videoDuration: 0,
          resources: [{ title: "", fileUrl: ""}],
          isPublished: false,
        },
      ],
      quiz: {
        title: "",
        questions: [
          {
            question: "",
            options: [
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: true },
            ],
          },
        ],
      },
    },
  ])

  const steps = ["Course Details", "Modules & Lessons", "Quizzes", "Review & Publish"]

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const response = await fetch('/api/bonsai/shop-items');
        const data = await response.json();
        setShopItems(data);
      } catch (error) {
        console.error('Error fetching shop items:', error);
      }
    };
    
    fetchShopItems();
  }, []);

  // File upload utility function
  const uploadToS3 = async (file, fileType = null) => {
    try {
      // Step 1: Get presigned URL
      const res = await fetch('/api/instructor/s3-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
          fileType: fileType
        }),
      })

      if (!res.ok) throw new Error('Failed to get upload URL')
      
      const { uploadUrl, fileUrl } = await res.json()

      // Step 2: Upload file to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadRes.ok) throw new Error('Failed to upload file')

      return fileUrl
    } catch (error) {
      console.error('Upload error:', error)
      throw error
    }
  }

  // Course Data Handlers
  const updateCourseData = (field, value) => {
    setCourseData((prev) => ({ ...prev, [field]: value }))
  }

  function generateSlug(title) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')    // remove special chars
      .replace(/\s+/g, '-')        // replace spaces with hyphens
      .replace(/-+/g, '-');        // collapse multiple hyphens
  }

  const addItemReward = () => {
    setCourseData((prev) => ({
      ...prev,
      itemsReward: [...prev.itemsReward, { item: "" }],
    }));
  };

  const updateItemReward = (index, value) => {
    setCourseData((prev) => ({
      ...prev,
      itemsReward: prev.itemsReward.map((item, i) => 
        i === index ? { ...item, item: value } : item
      ),
    }));
  };

  const removeItemReward = (index) => {
    setCourseData((prev) => ({
      ...prev,
      itemsReward: prev.itemsReward.filter((_, i) => i !== index),
    }));
  };

  const addHighlight = () => {
    setCourseData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, { description: "" }],
    }))
  }

  const updateHighlight = (index, value) => {
    setCourseData((prev) => ({
      ...prev,
      highlights: prev.highlights.map((h, i) => (i === index ? { description: value } : h)),
    }))
  }

  const removeHighlight = (index) => {
    setCourseData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    setCourseData((prev) => ({
      ...prev,
      tags: [...prev.tags, ""],
    }))
  }

  const updateTag = (index, value) => {
    setCourseData((prev) => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }))
  }

  const removeTag = (index) => {
    setCourseData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  // Module Handlers
  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: "",
        order: prev.length + 1,
        lessons: [
          {
            title: "",
            order: 1,
            videoUrl: "",
            videoDuration: 0,
            resources: [{ title: "", fileUrl: ""}],
            isPublished: false,
          },
        ],
        quiz: {
          title: "",
          questions: [
            {
              question: "",
              options: [
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: false },
                { text: "", isCorrect: true },
              ],
            },
          ],
        },
      },
    ])
  }

  const updateModule = (moduleIndex, field, value) => {
    setModules((prev) => prev.map((module, i) => (i === moduleIndex ? { ...module, [field]: value } : module)))
  }

  const removeModule = (moduleIndex) => {
    setModules((prev) => prev.filter((_, i) => i !== moduleIndex))
  }

  // Lesson Handlers
  const addLesson = (moduleIndex) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  title: "",
                  order: module.lessons.length + 1,
                  videoUrl: "",
                  videoDuration: 0,
                  resources: [{ title: "", fileUrl: ""}],
                  isPublished: false,
                },
              ],
            }
          : module,
      ),
    )
  }

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) => (j === lessonIndex ? { ...lesson, [field]: value } : lesson)),
              
            }
          : module,
      ),
    )
  }

  const removeLesson = (moduleIndex, lessonIndex) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, j) => j !== lessonIndex),
            }
          : module,
      ),
    )
  }

  // Resource Handlers
  const addResource = (moduleIndex, lessonIndex) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) =>
                j === lessonIndex
                  ? {
                      ...lesson,
                      resources: [...lesson.resources, { title: "", fileUrl: ""}],
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    )
  }

  const updateResource = (moduleIndex, lessonIndex, resourceIndex, field, value) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) =>
                j === lessonIndex
                  ? {
                      ...lesson,
                      resources: lesson.resources.map((resource, k) =>
                        k === resourceIndex ? { ...resource, [field]: value } : resource,
                      ),
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    )
  }

  const removeResource = (moduleIndex, lessonIndex, resourceIndex) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, j) =>
                j === lessonIndex
                  ? {
                      ...lesson,
                      resources: lesson.resources.filter((_, k) => k !== resourceIndex),
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    );
  };


  // File upload handlers
  const handleFileUpload = async (file, uploadKey) => {
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }))
    
    try {
      let fileType = null
      if (file.type.startsWith('image/')) fileType = 'images'
      else if (file.type.startsWith('video/')) fileType = 'videos'
      else if (file.type.startsWith('audio/')) fileType = 'audio'
      else fileType = 'documents'

      const url = await uploadToS3(file, fileType)
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }))
      return url
    } catch (error) {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }))
      alert('Upload failed: ' + error.message)
      throw error
    }
  }

  // Quiz Handlers
  const addQuestion = (moduleIndex) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              quiz: {
                ...module.quiz,
                questions: [
                  ...module.quiz.questions,
                  {
                    question: "",
                    options: [
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: false },
                      { text: "", isCorrect: true },
                    ],
                  },
                ],
              },
            }
          : module,
      ),
    )
  }

  const updateQuestion = (moduleIndex, questionIndex, field, value) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              quiz: {
                ...module.quiz,
                questions: module.quiz.questions.map((question, j) =>
                  j === questionIndex ? { ...question, [field]: value } : question,
                ),
              },
            }
          : module,
      ),
    )
  }

  const updateOption = (moduleIndex, questionIndex, optionIndex, field, value) => {
    setModules((prev) =>
      prev.map((module, i) =>
        i === moduleIndex
          ? {
              ...module,
              quiz: {
                ...module.quiz,
                questions: module.quiz.questions.map((question, j) =>
                  j === questionIndex
                    ? {
                        ...question,
                        options: question.options.map((option, k) =>
                          k === optionIndex ? { ...option, [field]: value } : option,
                        ),
                      }
                    : question,
                ),
              },
            }
          : module,
      ),
    )
  }

  const handleSubmit = async (isDraft = false) => {

    console.log("DATAS,", courseData, modules)
    // Basic validation
    if (!courseData.title || !courseData.slug || !courseData.shortDescription || !courseData.fullDescription) {
      alert('Please fill in all required course details')
      setCurrentStep(0)
      return
    }

    if (!courseData.thumbnail) {
      alert('Please upload a course thumbnail')
      setCurrentStep(0)
      return
    }

    // Validate modules and lessons
    for (const module of modules) {
      if (!module.title) {
        alert('Please fill in all module titles')
        setCurrentStep(1)
        return
      }

      for (const lesson of module.lessons) {
        if (!lesson.title || !lesson.videoUrl) {
          alert('Please fill in all required lesson fields')
          setCurrentStep(1)
          return
        }
      }
    }

    setIsSubmitting(true)
    
    try {
      // Prepare final data
      const finalData = {
        ...courseData,
        modules: modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => ({
            ...lesson,
            resources: lesson.resources.filter(r => r.fileUrl && r.title) // Only keep resources with both url and title
          }))
        })),
        isPublished: !isDraft,
        tags: courseData.tags.filter(tag => tag.trim() !== ''),
        highlights: courseData.highlights.filter(h => h.description.trim() !== ''),
        itemsReward: courseData.itemsReward
          .filter(item => item.item && item.item.trim() !== '') // keep only valid ones
          .map(item => item.item),  // get the string IDs only
      }

      console.log("Final course data being submitted:", finalData)

      // Submit to backend
      const response = await fetch('/api/instructor/create-course', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      })

      const result = await response.json()

      if (result.success) {
        alert(isDraft ? 'Course saved as draft!' : 'Course published successfully!')
        // Optionally redirect or reset form
      } else {
        throw new Error(result.error || 'Failed to save course')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Error saving course: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

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
            <div className="grid gap-6 md:grid-cols-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Title *</label>
                <input
                  className="w-full rounded-md border border-gray-300 p-2"
                  placeholder="e.g., Japanese for Beginners"
                  value={courseData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      updateCourseData("title", title);
                      updateCourseData("slug", generateSlug(title));
                    }}    
                />
              </div>
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
                    value={reward.item}
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Course Thumbnail *</label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full rounded-md border border-gray-300 p-2"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file) {
                        try {
                          const url = await handleFileUpload(file, 'course-thumbnail')
                          updateCourseData("thumbnail", url)
                        } catch (err) {
                          console.error('Thumbnail upload failed:', err)
                        }
                      }
                    }}
                  />
                  {uploadingFiles['course-thumbnail'] && (
                    <div className="flex items-center px-3">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>
                {courseData.thumbnail && (
                  <a
                    href={courseData.thumbnail}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm col-span-4"
                  >
                    View uploaded file
                  </a>
                )}
              </div>
            </div>

            {/* Course Highlights */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Highlights</label>
              {courseData.highlights.map((highlight, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-gray-300 p-2"
                    placeholder="What students will learn"
                    value={highlight.description}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHighlight(index)}
                    disabled={courseData.highlights.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addHighlight}>
                <Plus className="mr-2 h-4 w-4" /> Add Highlight
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              {courseData.tags.map((tag, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 rounded-md border border-gray-300 p-2"
                    placeholder="e.g., beginner, conversation"
                    value={tag}
                    onChange={(e) => updateTag(index, e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTag(index)}
                    disabled={courseData.tags.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="mr-2 h-4 w-4" /> Add Tag
              </Button>
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
                      onChange={(e) => updateModule(moduleIndex, "order", Number.parseInt(e.target.value))}
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

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Lesson Title *</label>
                          <input
                            className="w-full rounded-md border border-gray-300 p-2"
                            placeholder="e.g., Learning A, I, U, E, O"
                            value={lesson.title}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, "title", e.target.value)}
                          />
                        </div>
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
                                if (file) {
                                  try {
                                    const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-video`)
                                    updateLesson(moduleIndex, lessonIndex, "videoUrl", url)
                                  } catch (err) {
                                    console.error('Video upload failed:', err)
                                  }
                                }
                              }}
                            />
                            {uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-video`] && (
                              <div className="flex items-center px-3">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              </div>
                            )}
                          </div>
                          {/* Show Uploaded Video and Get Duration */}
                          {lesson.videoUrl && (
                            <video
                              ref={videoRef}
                              className="w-full rounded-md mt-2"
                              controls
                              onLoadedMetadata={() => {
                                const duration = videoRef.current?.duration;
                                if (duration) {
                                  updateLesson(moduleIndex, lessonIndex, "videoDuration", Math.round(duration));
                                }
                              }}
                            >
                              <source src={lesson.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>

                         {/* Resources Upload*/}
                        <div className="space-y-2">
                          <label className="text-sm font-medium items-center">Resources</label>
                          {lesson.resources.map((resource, resourceIndex) => (
                            <div key={resourceIndex} className="grid gap-4 md:grid-cols-2 p-2 border rounded items-center">
                              {/* Resource Title */}
                              <input
                                className="rounded-md border border-gray-300 p-2"
                                placeholder="Resource title"
                                value={resource.title}
                                onChange={(e) =>
                                  updateResource(moduleIndex, lessonIndex, resourceIndex, "title", e.target.value)
                                }
                              />

                              {/* File Upload */}
                              <div className="flex row items-center gap-2">
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
                                  className="rounded-md border border-gray-300 p-2 w-full"
                                  onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      try {
                                        const url = await handleFileUpload(file, `module-${moduleIndex}-lesson-${lessonIndex}-resource-${resourceIndex}`);
                                        updateResource(moduleIndex, lessonIndex, resourceIndex, "fileUrl", url);
                                      } catch (err) {
                                        console.error("Resource upload failed:", err);
                                      }
                                    }
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

                              {/* Upload Spinner */}
                              {uploadingFiles[`module-${moduleIndex}-lesson-${lessonIndex}-resource-${resourceIndex}`] && (
                                <div className="flex items-center px-3">
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                </div>
                              )}

                              {/* Preview or link */}
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

                          {/* Add resource button */}
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
                <CardTitle>
                  Quiz for Module {moduleIndex + 1}: {module.title}
                </CardTitle>
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
                              // Set all options to false, then set this one to true
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
                  <p>
                    <strong>Title:</strong> {courseData.title}
                  </p>
                  <p>
                    <strong>Level:</strong> {courseData.level}
                  </p>
                  <p>
                    <strong>Category:</strong> {courseData.category}
                  </p>
                  <p>
                    <strong>Price:</strong> ${courseData.price}
                  </p>
                  <p>
                    <strong>Modules:</strong> {modules.length}
                  </p>
                  <p>
                    <strong>Total Lessons:</strong> {modules.reduce((acc, module) => acc + module.lessons.length, 0)}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Course Structure</h4>
                <div className="space-y-2 text-sm">
                  {modules.map((module, index) => (
                    <div key={index}>
                      <p>
                        <strong>Module {index + 1}:</strong> {module.title}
                      </p>
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
                {isSubmitting ? (
                  "Saving..."
                ) : (
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
                {isSubmitting ? (
                  "Publishing..."
                ) : (
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
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))}
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
