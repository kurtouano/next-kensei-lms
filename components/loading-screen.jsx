"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { JotatsuLogoFull } from "./jotatsu-logo-full"

export function LoadingScreen({ onLoadingComplete }) {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingStage, setLoadingStage] = useState("Initializing...")
  const [isComplete, setIsComplete] = useState(false)
  const [hasStarted, setHasStarted] = useState(false) // Prevent multiple starts

  // Images that need to be preloaded
  const criticalImages = [
    "/banner1.png",
    "/banner2.png", 
    "/banner3.png",
    "/placeholder.svg"
  ]

  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        console.log(`✅ Loaded: ${src}`)
        resolve(src)
      }
      img.onerror = () => {
        console.log(`❌ Failed: ${src}`)
        resolve(src) // Still resolve to continue loading
      }
      img.src = src
    })
  }

  const loadImages = async () => {
    if (hasStarted) return // Prevent multiple executions
    setHasStarted(true)
    
    try {
      setLoadingStage("Initializing...")
      setLoadingProgress(5)
      
      await new Promise(resolve => setTimeout(resolve, 200))
      setLoadingStage("Loading banner images...")
      setLoadingProgress(10)
      
      const totalImages = criticalImages.length
      let currentProgress = 10

      // Load images with minimal delays
      for (let i = 0; i < criticalImages.length; i++) {
        const imageSrc = criticalImages[i]
        
        try {
          await preloadImage(imageSrc)
          
          // Each image adds ~20% (80% total for images)
          const progressStep = 80 / totalImages
          currentProgress += progressStep
          setLoadingProgress(Math.round(currentProgress))
          
          // Update loading stage based on progress
          if (currentProgress <= 30) {
            setLoadingStage("Loading banner images...")
          } else if (currentProgress <= 60) {
            setLoadingStage("Preparing interface...")
          } else {
            setLoadingStage("Almost ready...")
          }
          
          // Small delay just for smooth visual transition
          await new Promise(resolve => setTimeout(resolve, 150))
        } catch (error) {
          console.warn(`Failed to load image: ${imageSrc}`, error)
          const progressStep = 80 / totalImages
          currentProgress += progressStep
          setLoadingProgress(Math.round(currentProgress))
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Quick final steps
      setLoadingStage("Finalizing...")
      setLoadingProgress(95)
      await new Promise(resolve => setTimeout(resolve, 200))
      
      setLoadingProgress(100)
      setLoadingStage("Complete!")
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setIsComplete(true)
      
      // Quick completion
      setTimeout(() => {
        onLoadingComplete?.()
      }, 600)
      
    } catch (error) {
      console.error("Loading error:", error)
      setLoadingProgress(100)
      setIsComplete(true)
      setTimeout(() => {
        onLoadingComplete?.()
      }, 300)
    }
  }

  useEffect(() => {
    loadImages()
  }, []) // Empty dependency array - only run once

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8f7f4]">
      <div className="flex flex-col items-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AnimatedBonsaiIcon progress={loadingProgress} />
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-2"
        >
          <JotatsuLogoFull className="h-8 mx-auto" />
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6 text-[#5c6d5e]"
        >
          Your Japanese learning journey begins...
        </motion.p>
        
        {/* Progress Bar */}
        <div className="relative h-3 w-80 overflow-hidden rounded-full bg-[#dce4d7] border border-[#c5d0c0]">
          <motion.div
            className="h-full bg-gradient-to-r from-[#4a7c59] to-[#5d9e75] relative"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 1.5,
                repeat: loadingProgress < 100 ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>
        
        {/* Progress Info - Stable rendering */}
        <div className="mt-4 text-center h-16 flex flex-col justify-center">
          <div className="h-8 flex items-center justify-center">
            <motion.p 
              className="text-lg font-medium text-[#2c3e2d]"
              transition={{ duration: 0.3 }}
            >
              {Math.round(loadingProgress)}%
            </motion.p>
          </div>
          
          {/* Fixed height container for loading stage to prevent layout shift */}
          <div className="h-6 flex items-center justify-center">
            <motion.p 
              className="text-sm text-[#5c6d5e]"
              transition={{ duration: 0.3 }}
            >
              {loadingStage}
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AnimatedBonsaiIcon({ progress = 0 }) {
  // Adjusted thresholds for slower, more visible growth
  const showPot = progress > 10
  const showTrunk = progress > 25
  const showBottomLeaves = progress > 45
  const showLeftLeaves = progress > 65
  const showRightLeaves = progress > 75
  const showTopLeaves = progress > 90

  return (
    <div className="relative h-32 w-32">
      {/* Pot */}
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.8 }}
        animate={{ 
          y: showPot ? 0 : 20, 
          opacity: showPot ? 1 : 0,
          scale: showPot ? 1 : 0.8
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-sm rounded-b-xl bg-[#8B5E3C] shadow-md"
      />

      {/* Trunk */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ 
          height: showTrunk ? "60%" : 0, 
          opacity: showTrunk ? 1 : 0 
        }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute bottom-12 left-1/2 w-4 -translate-x-1/2 rounded-full bg-[#8B5E3C]"
      />

      {/* Leaves - Bottom */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: showBottomLeaves ? 1 : 0, 
          opacity: showBottomLeaves ? 1 : 0 
        }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="absolute bottom-24 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#5d9e75] shadow-sm"
      />

      {/* Leaves - Left */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: showLeftLeaves ? 1 : 0, 
          opacity: showLeftLeaves ? 1 : 0 
        }}
        transition={{ duration: 0.6, ease: "backOut", delay: 0.1 }}
        className="absolute bottom-28 left-1/4 h-12 w-12 -translate-x-1/2 rounded-full bg-[#6fb58a] shadow-sm"
      />

      {/* Leaves - Right */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: showRightLeaves ? 1 : 0, 
          opacity: showRightLeaves ? 1 : 0 
        }}
        transition={{ duration: 0.6, ease: "backOut", delay: 0.2 }}
        className="absolute bottom-28 right-1/4 h-12 w-12 translate-x-1/2 rounded-full bg-[#6fb58a] shadow-sm"
      />

      {/* Leaves - Top */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: showTopLeaves ? 1 : 0, 
          opacity: showTopLeaves ? 1 : 0 
        }}
        transition={{ duration: 0.6, ease: "backOut", delay: 0.3 }}
        className="absolute bottom-32 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-[#4a7c59] shadow-sm"
      />

      {/* Growth particles - only show when bonsai is mostly grown */}
      <AnimatePresence>
        {progress > 70 && !showTopLeaves && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  y: -30, 
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 20]
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
                className="absolute bottom-20 left-1/2 w-1.5 h-1.5 bg-[#4a7c59] rounded-full"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}