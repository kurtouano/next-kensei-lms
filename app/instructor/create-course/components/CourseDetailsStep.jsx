// components/CourseDetailsStep.jsx
import { memo, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, LoaderCircle } from "lucide-react"

// Reusable components
import { FileUploadInput, ArrayInput } from "./"

const CourseDetailsStep = memo(({ 
  courseData, 
  updateCourseData, 
  updateCourseArray, 
  uploadingFiles, 
  handleFileUpload,
  validationErrors,
  showValidation,
  renderValidationError 
}) => {
  const [shopItems, setShopItems] = useState([])

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

  // Constants for limits
  const LIMITS = {
    highlights: 4,
    tags: 5,
    itemsReward: 3
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

  const addItemReward = () => updateCourseArray('itemsReward', null, "", 'add')
  const updateItemReward = (index, value) => updateCourseArray('itemsReward', index, value)
  const removeItemReward = (index) => updateCourseArray('itemsReward', index, null, 'remove')

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
              onChange={(e) => updateCourseData("level", e.target.value)}
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

          {/* Item Rewards */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Item Rewards (Max {LIMITS.itemsReward})</label>
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
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={addItemReward}
                disabled={courseData.itemsReward.length >= LIMITS.itemsReward}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Item Reward
              </Button>
              <span className="text-sm text-gray-500">
                ({courseData.itemsReward.length}/{LIMITS.itemsReward})
              </span>
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