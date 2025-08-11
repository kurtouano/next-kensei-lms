// app/profile/components/BannerCropper.jsx
"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, Move, RotateCcw, Check } from 'lucide-react'
import { compressImage, validateImageFile } from '@/lib/imageCompression'

// Responsive banner dimensions matching header min-heights
const BANNER_WIDTH = 700
const BANNER_HEIGHT_MOBILE = 120
const BANNER_HEIGHT_DESKTOP = 150
const SM_MEDIA_QUERY = '(min-width: 640px)'

export function BannerCropper({ 
  isOpen, 
  onClose, 
  imageSrc, 
  onCropComplete,
  uploading = false 
}) {
  const canvasRef = useRef(null)
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [imageLoaded, setImageLoaded] = useState(false)
  const [targetHeight, setTargetHeight] = useState(
    typeof window !== 'undefined' && window.matchMedia && window.matchMedia(SM_MEDIA_QUERY).matches
      ? BANNER_HEIGHT_DESKTOP
      : BANNER_HEIGHT_MOBILE
  )
  const [containerSize, setContainerSize] = useState({ width: BANNER_WIDTH, height: targetHeight })
  const [compressionStatus, setCompressionStatus] = useState('')
  const [compressing, setCompressing] = useState(false)

  // Sync target height with responsive breakpoint (sm and up)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const media = window.matchMedia(SM_MEDIA_QUERY)
    const handleChange = () => {
      const nextHeight = media.matches ? BANNER_HEIGHT_DESKTOP : BANNER_HEIGHT_MOBILE
      setTargetHeight(nextHeight)
      setContainerSize({ width: BANNER_WIDTH, height: nextHeight })
    }
    handleChange()
    media.addEventListener ? media.addEventListener('change', handleChange) : media.addListener(handleChange)
    return () => {
      media.removeEventListener ? media.removeEventListener('change', handleChange) : media.removeListener(handleChange)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      setContainerSize({ width: BANNER_WIDTH, height: targetHeight })
    }
  }, [isOpen])

  const initializeCropArea = useCallback(() => {
    if (!imageRef.current || !containerSize.width) return

    const img = imageRef.current
    const containerWidth = containerSize.width
    const containerHeight = containerSize.height

    // For cover mode (like background-size: cover), we need to scale the image
    // so it completely fills the container, even if parts get cropped
    const scaleX = containerWidth / img.naturalWidth
    const scaleY = containerHeight / img.naturalHeight
    
    // Use the larger scale to ensure the image covers the entire container
    const scale = Math.max(scaleX, scaleY)

    const scaledWidth = img.naturalWidth * scale
    const scaledHeight = img.naturalHeight * scale

    // Center the image in the container
    const x = (scaledWidth - containerWidth) / 2
    const y = (scaledHeight - containerHeight) / 2

    setCropArea({
      x: -x,
      y: -y,
      width: scaledWidth,
      height: scaledHeight
    })
    setImageLoaded(true)
  }, [containerSize])

  const handleImageLoad = () => {
    initializeCropArea()
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y
    })
  }

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Constrain movement within bounds
    const maxX = 0
    const minX = containerSize.width - cropArea.width
    const maxY = 0
    const minY = containerSize.height - cropArea.height

    setCropArea(prev => ({
      ...prev,
      x: Math.min(maxX, Math.max(minX, newX)),
      y: Math.min(maxY, Math.max(minY, newY))
    }))
  }, [isDragging, dragStart, containerSize, cropArea.width, cropArea.height])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleCrop = async () => {
    if (!imageRef.current || !canvasRef.current) return

    try {
      setCompressing(true)
      setCompressionStatus('Cropping image...')

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const img = imageRef.current

      // Set canvas size to banner dimensions
      canvas.width = BANNER_WIDTH
      canvas.height = targetHeight

      // Calculate the scale used in the preview
      const scaleX = containerSize.width / img.naturalWidth
      const scaleY = containerSize.height / img.naturalHeight
      const scale = Math.max(scaleX, scaleY) // Match the preview scaling logic for cover mode

      // Calculate source coordinates and dimensions
      const sourceX = Math.max(0, (-cropArea.x) / scale)
      const sourceY = Math.max(0, (-cropArea.y) / scale)
      const sourceWidth = containerSize.width / scale
      const sourceHeight = containerSize.height / scale

      // Ensure we don't exceed image boundaries
      const finalSourceX = Math.min(sourceX, img.naturalWidth - sourceWidth)
      const finalSourceY = Math.min(sourceY, img.naturalHeight - sourceHeight)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the cropped image
      ctx.drawImage(
        img,
        finalSourceX, finalSourceY, sourceWidth, sourceHeight,
        0, 0, BANNER_WIDTH, targetHeight
      )

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            setCompressionStatus('Compressing image for optimal performance...')
            
            // Convert blob to file for compression
            const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' })
            
            // Compress the cropped image
            const compressionOptions = {
              maxSizeKB: 150,
              maxWidthOrHeight: BANNER_WIDTH,
              quality: 0.8,
              aggressiveQuality: 0.65,
              extremeQuality: 0.5,
              fileType: 'image/jpeg'
            }

            const compressedFile = await compressImage(file, compressionOptions)
            
            setCompressionStatus(`Compressed from ${(file.size / 1024).toFixed(1)}KB to ${(compressedFile.size / 1024).toFixed(1)}KB`)
            
            // Convert compressed file back to blob for upload
            const compressedBlob = new Blob([compressedFile], { type: 'image/jpeg' })
            
            setTimeout(() => {
              onCropComplete(compressedBlob)
            }, 500)
            
          } catch (compressionError) {
            console.error('Compression failed:', compressionError)
            setCompressionStatus('Compression failed, using original...')
            // Fallback to original blob if compression fails
            setTimeout(() => {
              onCropComplete(blob)
            }, 1000)
          }
        }
      }, 'image/jpeg', 0.9)
    } catch (error) {
      console.error('Crop failed:', error)
      setCompressionStatus('Crop failed')
    } finally {
      setTimeout(() => {
        setCompressing(false)
        setCompressionStatus('')
      }, 1500)
    }
  }

  const handleReset = () => {
    initializeCropArea()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 select-none">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b select-none">
          <h3 className="text-lg font-semibold text-[#2c3e2d]">Crop Banner Image</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            disabled={compressing || uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 select-none">
          <div className="mb-4 text-center select-none">
            <p className="text-sm text-[#5c6d5e] mb-2">
              Drag to position your image within the banner area (700×{targetHeight})
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#5c6d5e] bg-[#eef2eb] px-3 py-1 rounded-full">
              <Move className="h-3 w-3" />
              Click and drag to reposition
            </div>
            
            {(compressing || compressionStatus) && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-[#4a7c59] bg-blue-50 px-3 py-1 rounded-full">
                {compressing && <div className="w-3 h-3 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin"></div>}
              </div>
            )}
          </div>

          <div 
            ref={containerRef}
            className="mx-auto relative bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-[#dce4d7] select-none"
            style={{
              width: `${containerSize.width}px`,
              height: `${containerSize.height}px`
            }}
          >
            {/* Crop Area Indicator */}
            <div 
              className="absolute inset-0 border-2 border-white shadow-lg pointer-events-none z-10"
              style={{
                boxShadow: '0 0 0 2px rgba(0,0,0,0.3), inset 0 0 0 2px rgba(255,255,255,0.8)'
              }}
            />
            
            {imageSrc && (
              <>
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="absolute h-50 select-none pointer-events-none"
                  style={{
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                  onLoad={handleImageLoad}
                  draggable={false}
                  onMouseDown={handleMouseDown}
                  onPointerDown={handleMouseDown}
                />
                
                {imageLoaded && (
                  <div 
                    className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handleMouseDown}
                  />
                )}
              </>
            )}
            
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center select-none">
                <div className="text-[#5c6d5e]">Loading image...</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-3 select-none">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-[#4a7c59] text-[#4a7c59]"
              disabled={uploading || !imageLoaded || compressing}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleCrop}
              className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
              disabled={uploading || !imageLoaded || compressing}
            >
              <Check className="mr-2 h-4 w-4" />
              {compressing ? 'Processing...' : uploading ? 'Uploading...' : 'Apply Banner'}
            </Button>
          </div>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas
          ref={canvasRef}
          className="hidden"
          width={BANNER_WIDTH}
          height={targetHeight}
        />
      </div>
    </div>
  )
}