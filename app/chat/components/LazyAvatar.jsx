"use client"

import { useState, useEffect } from "react"
import { BonsaiSVG } from "@/app/bonsai/components/BonsaiSVG"
import { useBonsaiData } from "@/hooks/useBonsaiData"

export default function LazyAvatar({ user, size = "w-8 h-8" }) {
  const [shouldLoadBonsai, setShouldLoadBonsai] = useState(false)
  const { bonsaiData, loading: bonsaiLoading } = useBonsaiData(
    shouldLoadBonsai && user.icon === "bonsai" ? user.id : null
  )

  // Load bonsai data when component comes into view or after a short delay
  useEffect(() => {
    if (user.icon === "bonsai") {
      const timer = setTimeout(() => {
        setShouldLoadBonsai(true)
      }, 100) // Small delay to prioritize other content
      
      return () => clearTimeout(timer)
    }
  }, [user.icon])

  if (user.icon === "bonsai") {
    // If bonsai data is provided directly, use it
    if (user.bonsai) {
      return (
        <div className={`${size} flex items-center justify-center overflow-hidden rounded-full border border-[#4a7c59]`}>
          <BonsaiSVG 
            level={user.bonsai.level || 1}
            treeColor={user.bonsai.customization?.foliageColor || '#77DD82'} 
            potColor={user.bonsai.customization?.potColor || '#FD9475'} 
            selectedEyes={user.bonsai.customization?.eyes || 'default_eyes'}
            selectedMouth={user.bonsai.customization?.mouth || 'default_mouth'}
            selectedPotStyle={user.bonsai.customization?.potStyle || 'default_pot'}
            selectedGroundStyle={user.bonsai.customization?.groundStyle || 'default_ground'}
            selectedHat={user.bonsai.customization?.hat || null}
            selectedBackground={user.bonsai.customization?.background || null}
            zoomed={true}
            profileIcon={true}
          />
        </div>
      )
    }

    // Otherwise, fetch the bonsai data
    if (bonsaiLoading) {
      // Show loading state
      return (
        <div className={`${size} rounded-full bg-[#4a7c59] flex items-center justify-center`}>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )
    }

    if (bonsaiData) {
      return (
        <div className={`${size} flex items-center justify-center overflow-hidden rounded-full border border-[#4a7c59]`}>
          <BonsaiSVG 
            level={bonsaiData.level || 1}
            treeColor={bonsaiData.customization?.foliageColor || '#77DD82'} 
            potColor={bonsaiData.customization?.potColor || '#FD9475'} 
            selectedEyes={bonsaiData.customization?.eyes || 'default_eyes'}
            selectedMouth={bonsaiData.customization?.mouth || 'default_mouth'}
            selectedPotStyle={bonsaiData.customization?.potStyle || 'default_pot'}
            selectedGroundStyle={bonsaiData.customization?.groundStyle || 'default_ground'}
            selectedHat={bonsaiData.customization?.hat || null}
            selectedBackground={bonsaiData.customization?.background || null}
            zoomed={true}
            profileIcon={true}
          />
        </div>
      )
    }

    // Fallback if bonsai data failed to load
    return (
      <div className={`${size} rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-xs font-medium`}>
        {user.name?.charAt(0)?.toUpperCase() || "?"}
      </div>
    )
  }

  if (user.icon && user.icon.startsWith("http")) {
    return (
      <img 
        src={user.icon} 
        alt={user.name} 
        className={`${size} object-cover rounded-full`}
        loading="lazy"
      />
    )
  }
  
  return (
    <div className={`${size} rounded-full bg-[#4a7c59] text-white flex items-center justify-center text-xs font-medium`}>
      {user.name?.charAt(0)?.toUpperCase() || "?"}
    </div>
  )
}
