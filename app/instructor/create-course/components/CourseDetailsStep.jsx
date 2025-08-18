// components/CourseDetailsStep.jsx
import { memo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, LoaderCircle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

// Reusable components
import FileUploadInput from "./FileUploadInput"
import ArrayInput from "./ArrayInput"

const CourseDetailsStep = memo(({ 
  courseData, 
  updateCourseData, 
  updateCourseArray, 
  uploadingFiles, 
  uploadProgress,
  handleFileUpload,
  validationErrors,
  showValidation,
  renderValidationError 
}) => {
  const { user } = useAuth()

  // Constants for limits
  const LIMITS = {
    highlights: 3,
    tags: 5,
  }

  // File upload handlers
  const handleCourseFileUpload = async (file, field) => {
    try {
      const url = await handleFileUpload(file, `course-${field}`)
      updateCourseData(field, url)
    } catch (err) {
      console.error(`${field} upload failed:`, err)
    }
  }

  const handlePreviewVideoUpload = async (file) => {
    try {
      const url = await handleFileUpload(file, 'course-preview-video')
      updateCourseData('previewVideoUrl', url)
    } catch (err) {
      console.error('Preview video upload failed:', err)
    }
  }

  // Array handlers
  const addHighlight = () => updateCourseArray('highlights', null, { description: "" }, 'add')
  const updateHighlight = (index, value) => updateCourseArray('highlights', index, { description: value })
  const removeHighlight = (index) => updateCourseArray('highlights', index, null, 'remove')

  const addTag = () => updateCourseArray('tags', null, "", 'add')
  const updateTag = (index, value) => updateCourseArray('tags', index, value)
  const removeTag = (index) => updateCourseArray('tags', index, null, 'remove')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Details</CardTitle>
        <CardDescription>Basic information about your course</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Course Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Course Title <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full rounded-md border p-2 ${showValidation && validationErrors.title ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="e.g., Japanese for Beginners"
            maxLength={60}
            value={courseData.title}
            onChange={(e) => updateCourseData("title", e.target.value)}    
          />
          <div className="text-xs text-gray-500 text-right">
            {courseData.title.length}/60 characters
          </div>
          {renderValidationError('title')}
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Short Description <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full rounded-md border p-2 ${showValidation && validationErrors.shortDescription ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Brief description"
            maxLength={100}
            value={courseData.shortDescription}
            onChange={(e) => updateCourseData("shortDescription", e.target.value)}
          />
          <div className="text-xs text-gray-500 text-right">
            {courseData.shortDescription.length}/100 characters
          </div>
          {renderValidationError('shortDescription')}
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            className={`h-32 w-full rounded-md border p-2 whitespace-pre-wrap ${showValidation && validationErrors.fullDescription ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Detailed course description"
            value={courseData.fullDescription}
            onChange={(e) => updateCourseData("fullDescription", e.target.value)}
          />
          {renderValidationError('fullDescription')}
        </div>

        {/* Course Settings Grid */}
        <div className="grid gap-6 md:grid-cols-4">
          {/* JLPT Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              JLPT Level <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full rounded-md border p-2 ${showValidation && validationErrors.level ? 'border-red-500' : 'border-gray-300'}`}
              value={courseData.level}
              onChange={(e) => updateCourseData("level", e.target.value.trim())} // ✅ Add .trim()
            >
              <option value="">Select level</option>
              <option value="N5">Beginner (N5)</option>
              <option value="N4">Elementary (N4)</option>
              <option value="N3">Intermediate (N3)</option>
              <option value="N2">Upper Intermediate (N2)</option>
              <option value="N1">Advanced (N1)</option>
            </select>
            {renderValidationError('level')}
          </div>

          {/* Course Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Course Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className={`w-full rounded-md border p-2 ${showValidation && validationErrors.price ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="29.99"
              value={courseData.price}
              onChange={(e) => updateCourseData("price", parseFloat(e.target.value) || 0)}
            />
            {renderValidationError('price')}
          </div>

          {/* Credit Reward */}
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

          {/* Random Item Reward */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Random Item Reward</label>
              <div className="group relative">
                <span className="cursor-help text-gray-500 hover:text-gray-700 text-sm bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center font-bold">?</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                  Students will receive 2 random items upon course completion. If they own all items, they'll get 300 credits instead.
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="randomReward"
                className="rounded border-gray-300 w-6 h-6"
                checked={courseData.randomReward || false}
                onChange={(e) => updateCourseData("randomReward", e.target.checked)}
              />
              <label htmlFor="randomReward" className="text-sm text-gray-700">
                Random 2 items reward
              </label>
            </div>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Thumbnail Upload */}
          <FileUploadInput
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file) handleCourseFileUpload(file, 'thumbnail')
            }}
            uploadKey="course-thumbnail"
            currentValue={courseData.thumbnail}
            label="Course Thumbnail"
            required={true}
            errorKey="thumbnail"
            uploadingFiles={uploadingFiles}
            uploadProgress={uploadProgress}
            renderValidationError={renderValidationError}
            showValidation={showValidation}
            validationErrors={validationErrors}
          />

          {/* Preview Video Upload */}
          <div>
            <FileUploadInput
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) handlePreviewVideoUpload(file)
              }}
              uploadKey="course-preview-video"
              currentValue={courseData.previewVideoUrl}
              label="Preview Video"
              required={true}
              errorKey="previewVideoUrl"
              uploadingFiles={uploadingFiles}
              uploadProgress={uploadProgress}
              renderValidationError={renderValidationError}
              showValidation={showValidation}
              validationErrors={validationErrors}
            />
            {courseData.previewVideoUrl && (
              <video
                className="w-full rounded-md mt-2 max-h-48"
                controls
              >
                <source src={courseData.previewVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>

        {/* Course Highlights */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Course Highlights <span className="text-red-500">*</span> (Max {LIMITS.highlights})
          </label>
          <ArrayInput
            items={courseData.highlights}
            updateFn={updateHighlight}
            removeFn={removeHighlight}
            addFn={addHighlight}
            placeholder="What students will learn"
            btnName="Add Highlight"
            fieldKey="description"
            limit={LIMITS.highlights}
            errorKey="highlights"
            maxLength={50}
            renderValidationError={renderValidationError}
            showValidation={showValidation}
            validationErrors={validationErrors}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tags <span className="text-red-500">*</span> (Max {LIMITS.tags})
          </label>
          <ArrayInput
            items={courseData.tags}
            updateFn={updateTag}
            removeFn={removeTag}
            addFn={addTag}
            placeholder="e.g., beginner, conversation"
            btnName="Add Tag"
            fieldKey={null}
            limit={LIMITS.tags}
            errorKey="tags"
            renderValidationError={renderValidationError}
            showValidation={showValidation}
            validationErrors={validationErrors}
          />
        </div>
      </CardContent>
    </Card>
  )
})

CourseDetailsStep.displayName = 'CourseDetailsStep'

export default CourseDetailsStep