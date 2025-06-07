import { useState, useRef, useEffect, memo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { FileText, Download, User } from "lucide-react"

export const VideoPlayer = memo(function VideoPlayer({ 
  activeItem, 
  currentTime = 0, 
  onProgressUpdate 
}) {
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const lastSavedTimeRef = useRef(0)
  const hasSetInitialTimeRef = useRef(false)

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
      
      // Set the video to the saved currentTime when it loads (only once)
      if (currentTime > 0 && !hasSetInitialTimeRef.current) {
        video.currentTime = currentTime
        lastSavedTimeRef.current = currentTime
        hasSetInitialTimeRef.current = true
      }
    }

    const handleCanPlay = () => {
      // Ensure we set the time again when video is ready to play (only once)
      if (currentTime > 0 && !hasSetInitialTimeRef.current && Math.abs(video.currentTime - currentTime) > 1) {
        video.currentTime = currentTime
        hasSetInitialTimeRef.current = true
      }
    }

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('canplay', handleCanPlay)
    
    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [currentTime, activeItem?.type])

  // Reset video loaded state when activeItem changes
  useEffect(() => {
    setIsVideoLoaded(false)
    setVideoProgress(0)
    lastSavedTimeRef.current = 0
    hasSetInitialTimeRef.current = false
  }, [activeItem?.id])

  // Progress tracking and saving
  useEffect(() => {
    if (!videoRef.current || !isVideoLoaded || activeItem?.type !== "video") return

    const video = videoRef.current
    
    const updateProgress = () => {
      if (video.duration && !video.paused) {
        const progressPercent = (video.currentTime / video.duration) * 100
        setVideoProgress(progressPercent)
        
        // Only save if we've moved significantly (more than 10 seconds from last save)
        const timeDiff = Math.abs(video.currentTime - lastSavedTimeRef.current)
        
        if (timeDiff >= 10) { // Save every 10 seconds of actual progress
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
  }, [isVideoLoaded, activeItem?.id, activeItem?.type, onProgressUpdate])

  // Save progress when video is paused or seeked
  useEffect(() => {
    if (!videoRef.current || activeItem?.type !== "video") return

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
  }, [activeItem?.id, activeItem?.type, onProgressUpdate])

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
            
            {/* Progress indicator overlay */}
            {currentTime > 0 && !isVideoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">Loading video...</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <MaterialView item={activeItem} />
        )}
      </div>
      
      {/* Video info bar */}
      {activeItem?.type === "video" && (
        <div className="border-t border-[#dce4d7] p-3 bg-[#f8f7f4]">
          <div className="flex justify-between items-center text-sm text-[#5c6d5e]">
            <span className="font-medium text-[#2c3e2d]">{activeItem.title}</span>
            <div className="flex items-center gap-4">
              {activeItem.videoDuration && (
                <span>Duration: {formatTime(activeItem.videoDuration)}</span>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          {videoProgress > 0 && (
            <div className="mt-2 bg-[#dce4d7] rounded-full h-1">
              <div 
                className="bg-[#4a7c59] h-1 rounded-full transition-all duration-300"
                style={{ width: `${videoProgress}%` }}
              />
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

const MaterialView = memo(function MaterialView({ item }) {
  if (item?.type === "resource") {
    return (
      <div className="flex h-full items-center justify-center bg-[#eef2eb] p-8 text-center text-[#4a7c59]">
        <div className="max-w-md">
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
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center bg-[#eef2eb] p-4 text-center text-[#4a7c59]">
      <div>
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
      </div>
    </div>
  )
})