// app/profile/components/BannerCropper.jsx
"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, Move, RotateCcw, Check } from 'lucide-react'
import { compressImage, validateImageFile } from '@/lib/imageCompression'

const BANNER_ASPECT_RATIO = 700 / 150 // 4.67:1

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
  const [containerSize, setContainerSize] = useState({ width: 500, height: 300 })
  const [compressionStatus, setCompressionStatus] = useState('')
  const [compressing, setCompressing] = useState(false)

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const container = containerRef.current
      const containerWidth = Math.min(container.clientWidth - 40, 600)
      const containerHeight = containerWidth / BANNER_ASPECT_RATIO
      setContainerSize({ width: containerWidth, height: containerHeight })
    }
  }, [isOpen])

  const initializeCropArea = useCallback(() => {
    if (!imageRef.current || !containerSize.width) return

    const img = imageRef.current
    const containerWidth = containerSize.width
    const containerHeight = containerSize.height

    // Calculate scale to fit image in container while maintaining aspect ratio
    const scaleX = containerWidth / img.naturalWidth
    const scaleY = containerHeight / img.naturalHeight
    const scale = Math.max(scaleX, scaleY) // Use max to ensure image covers the area

    const scaledWidth = img.naturalWidth * scale
    const scaledHeight = img.naturalHeight * scale

    // Center the crop area
    const x = Math.max(0, (scaledWidth - containerWidth) / 2)
    const y = Math.max(0, (scaledHeight - containerHeight) / 2)

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
      canvas.width = 700
      canvas.height = 150

      // Calculate the scale used in the preview
      const scaleX = containerSize.width / img.naturalWidth
      const scaleY = containerSize.height / img.naturalHeight
      const scale = Math.max(scaleX, scaleY)

      // Calculate the scaled dimensions of the image in the preview
      const scaledImageWidth = img.naturalWidth * scale
      const scaledImageHeight = img.naturalHeight * scale

      // Calculate the visible crop area in the preview
      const visibleWidth = containerSize.width
      const visibleHeight = containerSize.height

      // Calculate the source coordinates on the original image
      // The cropArea.x and cropArea.y are negative values representing the offset
      // We need to convert these preview coordinates to actual image coordinates
      const sourceX = Math.max(0, (-cropArea.x) / scale)
      const sourceY = Math.max(0, (-cropArea.y) / scale)
      
      // Calculate the source dimensions based on the visible area
      const sourceWidth = Math.min(visibleWidth / scale, img.naturalWidth - sourceX)
      const sourceHeight = Math.min(visibleHeight / scale, img.naturalHeight - sourceY)

      // Ensure we don't exceed image boundaries
      const finalSourceX = Math.min(sourceX, img.naturalWidth - sourceWidth)
      const finalSourceY = Math.min(sourceY, img.naturalHeight - sourceHeight)

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw the cropped image
      ctx.drawImage(
        img,
        finalSourceX, finalSourceY, sourceWidth, sourceHeight,
        0, 0, 700, 150
      )

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            setCompressionStatus('Compressing image for optimal performance...')
            
            // Convert blob to file for compression
            const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' })
            
            // ✅ NEW: Compress the cropped image using your compression utility
            // Banner-specific compression settings (more aggressive since it's a banner)
            const compressionOptions = {
              maxSizeKB: 150, // Slightly higher limit for banners
              maxWidthOrHeight: 700, // Match banner width
              quality: 0.8, // Good quality for banners
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
            }, 500) // Brief delay to show compression status
            
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
              Drag to position your image within the banner area (700×150)
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#5c6d5e] bg-[#eef2eb] px-3 py-1 rounded-full">
              <Move className="h-3 w-3" />
              Click and drag to reposition
            </div>
            
            {/* ✅ NEW: Compression Status Display */}
            {(compressing || compressionStatus) && (
              <div className="mt-2 inline-flex items-center gap-2 text-xs text-[#4a7c59] bg-blue-50 px-3 py-1 rounded-full">
                {compressing && <div className="w-3 h-3 border-2 border-[#4a7c59] border-t-transparent rounded-full animate-spin"></div>}
                <span>{compressionStatus}</span>
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
                  className="absolute select-none pointer-events-none"
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
          width={700}
          height={150}
        />
      </div>
    </div>
  )
}