import { useState, useRef, useEffect, memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, User, Lock, Play, CheckCircle } from "lucide-react"

export const VideoPlayer = memo(function VideoPlayer({ 
  activeItem, 
  currentTime = 0, 
  onProgressUpdate,
  isEnrolled = false,
  // NEW: Props for auto-completion and auto-next
  onAutoComplete,
  onAutoNext,
  hasNextAction = false,
  nextActionTitle = "",
  nextActionType = null,
  moduleData = null,
  activeModule = 0,
  // NEW: Add completed items to check completion status
  completedItems = []
}) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const lastSavedTimeRef = useRef(0)
  const hasSetInitialTimeRef = useRef(false)
  const hasAutoCompletedRef = useRef(false) // Prevent multiple auto-completions

  // Video event handlers
  useEffect(() => {
    if (!videoRef.current || activeItem?.type !== "video") return

    const video = videoRef.current
    
    const handlePlay = () => {
      setIsPlaying(true)
    }
    
    const handlePause = () => {
      setIsPlaying(false)
    }
    
    const handleLoadedData = () => {
      setIsVideoLoaded(true)
      
      // Only set saved time for enrolled users and non-preview videos
      if (currentTime > 0 && !hasSetInitialTimeRef.current && isEnrolled && !activeItem.isPreview) {
        video.currentTime = currentTime
        lastSavedTimeRef.current = currentTime
        hasSetInitialTimeRef.current = true
      }
    }

    const handleCanPlay = () => {
      // Ensure we set the time again when video is ready to play (only for enrolled users)
      if (currentTime > 0 && !hasSetInitialTimeRef.current && isEnrolled && !activeItem.isPreview && Math.abs(video.currentTime - currentTime) > 1) {
        video.currentTime = currentTime
        hasSetInitialTimeRef.current = true
      }
    }

    // NEW: Handle video end
    const handleVideoEnd = () => {
      console.log('🎬 Video ended')
      setIsPlaying(false)
      
      // Auto-complete the lesson if enrolled and not preview
      if (isEnrolled && !activeItem.isPreview && onAutoComplete && !hasAutoCompletedRef.current) {
        console.log('✅ Auto-completing lesson')
        hasAutoCompletedRef.current = true
        onAutoComplete(activeItem.id)
      }
      
      // Auto-advance to next video immediately if there's a next video and user is enrolled
      if (hasNextAction && isEnrolled && !activeItem.isPreview && onAutoNext) {
        console.log('⏭️ Auto-advancing to next action immediately')
        // Small delay to allow auto-complete to process
        setTimeout(() => {
          onAutoNext()
        }, 1500)
      }
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', handleVideoEnd)
    
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleVideoEnd)
    }
  }, [currentTime, activeItem?.type, activeItem?.isPreview, activeItem?.id, isEnrolled, onAutoComplete, hasNextAction, onAutoNext])

  // Reset video loaded state when activeItem changes
  useEffect(() => {
    setIsVideoLoaded(false)
    setVideoProgress(0)
    lastSavedTimeRef.current = 0
    hasSetInitialTimeRef.current = false
    hasAutoCompletedRef.current = false
  }, [activeItem?.id])

  // Progress tracking and saving (only for enrolled users)
  useEffect(() => {
    if (!videoRef.current || !isVideoLoaded || activeItem?.type !== "video" || !isEnrolled || activeItem?.isPreview) return

    const video = videoRef.current
    
    const updateProgress = () => {
      if (video.duration && !video.paused) {
        const progressPercent = (video.currentTime / video.duration) * 100
        setVideoProgress(progressPercent)
        
        // NEW: Auto-complete at 90% progress and auto-advance
        if (progressPercent >= 90 && onAutoComplete && !hasAutoCompletedRef.current) {
          console.log('🎯 Auto-completing lesson at 90% progress')
          hasAutoCompletedRef.current = true
          onAutoComplete(activeItem.id)
          
          // If video reaches 90%, also auto-advance to next video
          if (hasNextAction && onAutoNext) {
            console.log('⏭️ Auto-advancing to next action at 90%')
            // Small delay to allow auto-complete to process
            setTimeout(() => {
              onAutoNext()
            }, 2000)
          }
        }
        
        // Only save if we've moved significantly (more than 30 seconds from last save)
        const timeDiff = Math.abs(video.currentTime - lastSavedTimeRef.current)
        
        if (timeDiff >= 30) { // Save every 30 seconds of actual progress
          if (onProgressUpdate && activeItem?.id) {
            onProgressUpdate(activeItem.id, video.currentTime)
            lastSavedTimeRef.current = video.currentTime
          }
        }
      }
    }

    video.addEventListener('timeupdate', updateProgress)
    
    return () => {
      video.removeEventListener('timeupdate', updateProgress)
    }
  }, [isVideoLoaded, activeItem?.id, activeItem?.type, activeItem?.isPreview, onProgressUpdate, onAutoComplete, hasNextAction, onAutoNext, isEnrolled])

  // Save progress when video is paused or seeked (only for enrolled users)
  useEffect(() => {
    if (!videoRef.current || activeItem?.type !== "video" || !isEnrolled || activeItem?.isPreview) return

    const video = videoRef.current
    
    const saveProgressOnPause = () => {
      if (onProgressUpdate && activeItem?.id && video.currentTime > 0) {
        onProgressUpdate(activeItem.id, video.currentTime)
        lastSavedTimeRef.current = video.currentTime
      }
    }

    const saveProgressOnSeeked = () => {
      if (onProgressUpdate && activeItem?.id && video.currentTime > 0) {
        onProgressUpdate(activeItem.id, video.currentTime)
        lastSavedTimeRef.current = video.currentTime
      }
    }

    video.addEventListener('pause', saveProgressOnPause)
    video.addEventListener('seeked', saveProgressOnSeeked)
    
    return () => {
      video.removeEventListener('pause', saveProgressOnPause)
      video.removeEventListener('seeked', saveProgressOnSeeked)
      
      // Save progress when component unmounts
      if (video.currentTime > 0 && onProgressUpdate && activeItem?.id) {
        onProgressUpdate(activeItem.id, video.currentTime)
      }
    }
  }, [activeItem?.id, activeItem?.type, activeItem?.isPreview, onProgressUpdate, isEnrolled])

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-[#dce4d7] bg-white shadow-sm">
      <div className="relative aspect-video bg-black">
        {activeItem?.type === "video" ? (
          <>
            <video
              ref={videoRef}
              controls
              className="absolute inset-0 w-full h-full object-cover"
              src={activeItem.videoUrl}
              preload="metadata"
            />
            
            {/* Loading indicator */}
            {currentTime > 0 && !isVideoLoaded && isEnrolled && !activeItem.isPreview && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Loading video...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <MaterialView item={activeItem} isEnrolled={isEnrolled} />
        )}
      </div>
      
      {/* Video info bar */}
      {activeItem?.type === "video" && (
        <div className="border-t border-[#dce4d7] p-4 bg-[#f8f7f4]">
          {/* Mobile: 2 rows, Desktop: 1 row */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center">
              <span className="font-medium text-[#2c3e2d] text-sm">{activeItem.title}</span>
              {/* Only show preview badge for non-enrolled users */}
              {activeItem.isPreview && !isEnrolled && (
                <span className="ml-2 bg-[#4a7c59] text-white px-2 py-0.5 rounded-full text-xs">
                  Preview
                </span>
              )}
              {!isEnrolled && !activeItem.isPreview && (
                <Lock className="ml-2 h-4 w-4 text-[#e67e22]" />
              )}
            </div>
            
            {/* Mark as Complete / Completed Button - only for enrolled users on actual lessons */}
            {isEnrolled && !activeItem.isPreview && (() => {
              const isCompleted = completedItems.includes(activeItem.id)
              
              return (
                <Button
                  size="sm"
                  variant={isCompleted ? "default" : "outline"}
                  className={
                    isCompleted
                      ? "bg-[#4a7c59] text-white hover:bg-[#3a6147] border-[#4a7c59] w-full sm:w-auto"
                      : "border-[#4a7c59] text-[#4a7c59] hover:bg-[#4a7c59] hover:text-white transition-colors w-full sm:w-auto"
                  }
                  onClick={() => {
                    if (!isCompleted && onAutoComplete) {
                      onAutoComplete(activeItem.id)
                    }
                  }}
                  disabled={isCompleted}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {isCompleted ? "Completed" : "Mark as Complete"}
                </Button>
              )
            })()}
          </div>

          {/* Preview notice - only show for non-enrolled users */}
          {activeItem.isPreview && !isEnrolled && (
            <div className="mt-2 text-xs text-[#4a7c59] font-medium">
              This is a preview. Enroll to access all course content and features.
            </div>
          )}
        </div>
      )}
    </div>
  )
})

// Helper function to format time in MM:SS or HH:MM:SS
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

const MaterialView = memo(function MaterialView({ item, isEnrolled }) {
  if (item?.type === "resource") {
    return (
      <div className="flex h-full items-center justify-center bg-[#eef2eb] p-8 text-center text-[#4a7c59]">
        <div className="max-w-md">
          {!isEnrolled ? (
            <>
              <Lock className="mx-auto mb-2 h-12 w-12 text-[#e67e22]" />
              <h3 className="text-lg font-semibold mb-3 text-[#2c3e2d]">Resource Locked</h3>
              <p className="text-[#5c6d5e] text-sm mb-6">
                Enroll in this course to access downloadable resources and materials.
              </p>
            </>
          ) : (
            <>
              <FileText className="mx-auto mb-2 h-12 w-12" />
              <h3 className="text-lg font-semibold mb-3 text-[#2c3e2d]">{item.title}</h3>
              <p className="text-[#5c6d5e] text-sm mb-6">
                Download this resource to enhance your learning experience.
              </p>
              
              <div className="space-y-3 text-sm">
                {item.resources?.map((resource, index) => (
                  <a 
                    key={index} 
                    href={item.selectedResource?.fileUrl || item.selectedResource?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-[#4a7c59] text-white hover:bg-[#3a6147]">
                      <Download className="mr-2 h-4 w-4" />
                      Download {resource.title}
                    </Button>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#eef2eb] p-4 text-center text-[#4a7c59]">
      <div>
        {!isEnrolled ? (
          <>
            <Lock className="mx-auto mb-2 h-12 w-12 text-[#e67e22]" />
            <h3 className="text-lg font-medium text-[#2c3e2d]">Content Locked</h3>
            <p className="mt-2 text-sm text-[#5c6d5e]">
              Enroll in this course to access all lessons and materials
            </p>
          </>
        ) : (
          <>
            <FileText className="mx-auto mb-2 h-12 w-12" />
            <h3 className="text-lg font-medium">{item?.title || "Select a lesson"}</h3>
            <p className="mt-2 text-sm text-[#5c6d5e]">
              {item?.type === "material"
                ? "Download this material to continue your learning"
                : "Select a video from the list to start learning"}
            </p>
            {item?.type === "material" && (
              <Button className="mt-4 bg-[#4a7c59] text-white hover:bg-[#3a6147]">
                <Download className="mr-2 h-4 w-4" />
                Download Material
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
})