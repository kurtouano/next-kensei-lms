"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

export function LoadingScreen() {
  const [loadingProgress, setLoadingProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        const newProgress = prev + Math.random() * 15
        return newProgress > 100 ? 100 : newProgress
      })
    }, 300)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f8f7f4]">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <AnimatedBonsaiIcon />
        </motion.div>
        <h1 className="mb-2 text-2xl font-bold text-[#2c3e2d]">Genko Tree</h1>
        <p className="mb-6 text-[#5c6d5e]">Your Japanese learning journey begins...</p>
        <div className="h-2 w-64 overflow-hidden rounded-full bg-[#dce4d7]">
          <motion.div
            className="h-full bg-[#4a7c59]"
            initial={{ width: "0%" }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="mt-2 text-sm text-[#5c6d5e]">{Math.round(loadingProgress)}%</p>
      </div>
    </div>
  )
}

function AnimatedBonsaiIcon() {
  return (
    <div className="relative h-32 w-32">
      {/* Pot */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-0 left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-sm rounded-b-xl bg-[#8B5E3C]"
      />

      {/* Trunk */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "60%", opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute bottom-12 left-1/2 w-4 -translate-x-1/2 rounded-full bg-[#8B5E3C]"
      />

      {/* Leaves - Bottom */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="absolute bottom-24 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-[#5d9e75]"
      />

      {/* Leaves - Left */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute bottom-28 left-1/4 h-12 w-12 -translate-x-1/2 rounded-full bg-[#6fb58a]"
      />

      {/* Leaves - Right */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="absolute bottom-28 right-1/4 h-12 w-12 translate-x-1/2 rounded-full bg-[#6fb58a]"
      />

      {/* Leaves - Top */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        className="absolute bottom-32 left-1/2 h-14 w-14 -translate-x-1/2 rounded-full bg-[#4a7c59]"
      />
    </div>
  )
}
