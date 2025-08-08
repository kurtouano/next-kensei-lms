// app/profile/components/BannerCropper.jsx
"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { X, Move, RotateCcw, Check } from 'lucide-react'

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

    // Calculate scale to fit image in container
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

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = imageRef.current

    // Set canvas size to banner dimensions
    canvas.width = 700
    canvas.height = 150

    // Calculate source coordinates on the original image
    const scale = Math.max(
      containerSize.width / img.naturalWidth,
      containerSize.height / img.naturalHeight
    )

    const sourceX = (-cropArea.x) / scale
    const sourceY = (-cropArea.y) / scale
    const sourceWidth = containerSize.width / scale
    const sourceHeight = containerSize.height / scale

    // Draw the cropped image
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, 700, 150
    )

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCropComplete(blob)
      }
    }, 'image/jpeg', 0.9)
  }

  const handleReset = () => {
    initializeCropArea()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-[#2c3e2d]">Crop Banner Image</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="mb-4 text-center">
            <p className="text-sm text-[#5c6d5e] mb-2">
              Drag to position your image within the banner area (700×150)
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#5c6d5e] bg-[#eef2eb] px-3 py-1 rounded-full">
              <Move className="h-3 w-3" />
              Click and drag to reposition
            </div>
          </div>

          <div 
            ref={containerRef}
            className="mx-auto relative bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-[#dce4d7]"
            style={{
              width: `${containerSize.width}px`,
              height: `${containerSize.height}px`
            }}
          >
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
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    onMouseDown={handleMouseDown}
                  />
                )}
              </>
            )}
            
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[#5c6d5e]">Loading image...</div>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-[#4a7c59] text-[#4a7c59]"
              disabled={uploading || !imageLoaded}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleCrop}
              className="bg-[#4a7c59] text-white hover:bg-[#3a6147]"
              disabled={uploading || !imageLoaded}
            >
              <Check className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Apply Banner'}
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