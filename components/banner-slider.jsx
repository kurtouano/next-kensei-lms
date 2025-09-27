"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"

export function BannerSlider({ banners, autoSlideInterval = 5000 }) {
  const [currentBanner, setCurrentBanner] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1))
  }, [banners.length])

  const prevBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1))
  }, [banners.length])

  const goToBanner = (index) => {
    setCurrentBanner(index)
    setIsAutoPlaying(false)
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextBanner()
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextBanner, autoSlideInterval])

  // Function to handle scroll to section with custom smooth animation
  const handleScrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId.replace('#', ''))
    if (element) {
      const targetPosition = element.offsetTop - 80 // Account for header height
      const startPosition = window.pageYOffset
      const distance = targetPosition - startPosition
      const duration = 800 // Animation duration in milliseconds
      let start = null

      const animation = (currentTime) => {
        if (start === null) start = currentTime
        const timeElapsed = currentTime - start
        const progress = Math.min(timeElapsed / duration, 1)
        
        // Easing function for smooth animation
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2
        
        window.scrollTo(0, startPosition + distance * easeInOutCubic)
        
        if (timeElapsed < duration) {
          requestAnimationFrame(animation)
        }
      }
      
      requestAnimationFrame(animation)
    }
  }

  // Function to render the appropriate button based on target
  const renderButton = (banner) => {
    const buttonContent = (
      <>
        {banner.buttonText}
        {banner.external && <ExternalLink className="ml-2 h-4 w-4" />}
      </>
    )

    const buttonClasses = "rounded-md bg-[#4a7c59] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#3a6147] shadow-lg"

    if (banner.scrollTo) {
      // Scroll to section
      return (
        <Button 
          size="lg" 
          className={buttonClasses}
          onClick={() => handleScrollToSection(banner.buttonLink)}
        >
          {buttonContent}
        </Button>
      )
    } else if (banner.target === "_blank" || banner.external) {
      // External link - opens in new tab
      return (
        <Button size="lg" className={buttonClasses} asChild>
          <a 
            href={banner.buttonLink} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            {buttonContent}
          </a>
        </Button>
      )
    } else {
      // Internal navigation
      return (
        <Button size="lg" className={buttonClasses} asChild>
          <a href={banner.buttonLink}>
            {banner.buttonText}
          </a>
        </Button>
      )
    }
  }

  return (
    <div className="relative h-[500px] w-full overflow-hidden md:h-[630px] bg-gray-100">
      {/* Banners */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Background Image Container */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${banner.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/40"/>
          
          {/* Content */}
          <div className="relative z-10 flex h-full items-center justify-center">
            <div className="container mx-auto px-4 text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl drop-shadow-lg">
                {banner.title}
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/95 drop-shadow-md">
                {banner.description}
              </p>
              {renderButton(banner)}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevBanner}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
        aria-label="Next banner"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToBanner(index)}
            className={`h-2 w-8 rounded-full transition-all ${
              index === currentBanner ? "bg-white" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}