"use client"

import { useEffect, useRef } from 'react'

export function Confetti({ isActive, duration = 3000, onComplete }) {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      particlesRef.current = []
      
      // Clear canvas if it exists
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    
    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Create confetti particles
    const colors = ['#4a7c59', '#6b8e6b', '#3a6147', '#5c6d5e', '#eef2eb', '#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4']
    
    // Reduced particle count for better performance
    const particleCount = 60 // Reduced from 110
    
    for (let i = 0; i < particleCount; i++) {
      const side = i < 20 ? 'left' : i < 40 ? 'right' : 'center'
      let x, y
      
      if (side === 'left') {
        x = Math.random() * 300
      } else if (side === 'right') {
        x = window.innerWidth - 300 + Math.random() * 300
      } else {
        x = window.innerWidth / 2 - 150 + Math.random() * 300
      }
      
             particlesRef.current.push({
         x,
         y: -50 - Math.random() * 200,
         color: colors[Math.floor(Math.random() * colors.length)],
         width: Math.random() * 16 + 12, // Bigger width: 12-28px
         height: Math.random() * 12 + 8,  // Bigger height: 8-20px
         speed: Math.random() * 3 + 2,
         rotation: Math.random() * 360,
         rotationSpeed: (Math.random() - 0.5) * 10,
         wobble: Math.random() * 2 - 1
       })
    }

    let startTime = Date.now()
    let animationActive = true

    const animate = () => {
      if (!animationActive) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        // Update position
        particle.y += particle.speed
        particle.x += particle.wobble * 0.3
        particle.rotation += particle.rotationSpeed

        // Remove if off screen
        if (particle.y > window.innerHeight + 50) {
          return false
        }

        // Draw particle
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation * Math.PI / 180)
        ctx.fillStyle = particle.color
        ctx.fillRect(-particle.width/2, -particle.height/2, particle.width, particle.height)
        ctx.restore()

        return true
      })

      // Check if animation should stop
      const elapsed = Date.now() - startTime
      if (elapsed > duration && particlesRef.current.length === 0) {
        if (onComplete) onComplete()
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      animationActive = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, duration, onComplete])

  if (!isActive) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        width: '100vw', 
        height: '100vh',
        display: 'block'
      }}
    />
  )
}
