"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    // Resume auto-sliding after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      nextBanner()
    }, autoSlideInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, nextBanner, autoSlideInterval])

  return (
    <div className="relative h-[500px] w-full overflow-hidden md:h-[600px]">
      {/* Banners */}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentBanner ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${banner.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex h-full items-center justify-center">
            <div className="container mx-auto px-4 text-center">
              <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl">{banner.title}</h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-white/90">{banner.description}</p>
              <Button
                size="lg"
                className="rounded-md bg-[#4a7c59] px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#3a6147]"
                asChild
              >
                <a href={banner.buttonLink}>{banner.buttonText}</a>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevBanner}
        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/40"
        aria-label="Next banner"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center space-x-2">
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
