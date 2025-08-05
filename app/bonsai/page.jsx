"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Award, Palette, Flower, ShoppingBag, Eye, EyeClosed, Loader2, Sparkles } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "./components/BonsaiSVG"
import { BonsaiShop } from "./components/BonsaiShop"
import { BonsaiMilestones } from "./components/BonsaiMilestones"

export default function BonsaiPage() {
  const { data: session } = useSession()
  const [bonsaiData, setBonsaiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTree, setSelectedTree] = useState("default_foliage")
  const [customTreeColor, setCustomTreeColor] = useState("#77DD82")
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [selectedPot, setSelectedPot] = useState("default_pot")
  const [customPotColor, setCustomPotColor] = useState("#FD9475")
  const [useCustomPotColor, setUseCustomPotColor] = useState(false)
  const [selectedEyes, setSelectedEyes] = useState("default_eyes")
  const [selectedMouth, setSelectedMouth] = useState("default_mouth")
  const [selectedDecorations, setSelectedDecorations] = useState([])
  const [selectedGroundStyle, setSelectedGroundStyle] = useState("default_ground")
  const [selectedPotStyle, setSelectedPotStyle] = useState("default_pot")
  const [activeTab, setActiveTab] = useState("customize")
  const [previewItem, setPreviewItem] = useState(null)
  const [credits, setCredits] = useState(0)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  // Load bonsai data on component mount
  useEffect(() => {
    if (session?.user?.id) {
      loadBonsaiData()
    }
  }, [session])

  const loadBonsaiData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bonsai/${session.user.id}`)
      if (response.ok) {
        const data = await response.json()
        setBonsaiData(data)
        
        // Set current customization
        if (data.customization) {
          setSelectedEyes(data.customization.eyes || "default_eyes")
          setSelectedMouth(data.customization.mouth || "default_mouth")
          setSelectedPotStyle(data.customization.potStyle || "default_pot")
          setSelectedGroundStyle(data.customization.groundStyle || "default_ground")
          setSelectedDecorations(data.customization.decorations || [])
          
          // Check if using custom color or preset for tree
          const presetTree = getTreeKeyFromColor(data.customization.foliageColor)
          if (presetTree) {
            setSelectedTree(presetTree)
            setUseCustomColor(false)
          } else {
            setUseCustomColor(true)
            setCustomTreeColor(data.customization.foliageColor || "#77DD82")
          }
          
          // Check if using custom color or preset for pot
          const presetPot = getPotKeyFromColor(data.customization.potColor)
          if (presetPot) {
            setSelectedPot(presetPot)
            setUseCustomPotColor(false)
          } else {
            setUseCustomPotColor(true)
            setCustomPotColor(data.customization.potColor || "#FD9475")
          }
        }
        
        // Set credits from user data
        setCredits(data.totalCredits || 0)
      } else {
        console.error('Failed to load bonsai data')
      }
    } catch (error) {
      console.error('Error loading bonsai data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveCustomization = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    try {
      const customizationData = {
        customization: {
          eyes: selectedEyes,
          mouth: selectedMouth,
          foliageColor: getTreeColor(),
          potColor: getPotColor(),
          potStyle: selectedPotStyle,
          groundStyle: selectedGroundStyle,
          decorations: selectedDecorations
        }
      }

      const response = await fetch(`/api/bonsai/${session.user.id}/save`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customizationData)
      })

      if (response.ok) {
        alert('Bonsai customization saved successfully!')
        await loadBonsaiData()
      } else {
        const errorData = await response.json()
        alert(`Failed to save: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error saving customization:', error)
      alert('Failed to save customization')
    } finally {
      setSaving(false)
    }
  }

  // Helper functions to get tree/pot keys from colors
  const getTreeKeyFromColor = (color) => {
    const treeMap = {
      "#77DD82": "default_foliage",
      "#4a7c59": "forest_green_foliage"
    }
    return treeMap[color] || null
  }

  const getPotKeyFromColor = (color) => {
    const potMap = {
      "#FD9475": "default_pot",
      "#8B5E3C": "brown_pot"
    }
    return potMap[color] || null
  }

  // ✅ NEW: Helper functions to get available options (replacing mockData)
  const getAvailableTreeColors = () => {
    return [
      { id: "default_foliage", name: "Default Green", color: "#77DD82" },
      { id: "forest_green_foliage", name: "Forest Green", color: "#4a7c59" },
      { id: "custom", name: "Custom Color", color: customTreeColor },
    ];
  }

  const getAvailablePotColors = () => {
    return [
      { id: "default_pot", name: "Default Orange", color: "#FD9475" },
      { id: "brown_pot", name: "Earth Brown", color: "#8B5E3C" },
      { id: "custom_pot", name: "Custom Color", color: customPotColor },
    ];
  }

  const getAvailableEyes = () => {
    return [
      { id: "default_eyes", name: "Default Eyes" },
      { id: "cry_eyes", name: "Crying Eyes" },
      { id: "happy_eyes", name: "Happy Eyes" },
      { id: "flat_eyes", name: "Sleepy Eyes" },
      { id: "wink_eyes", name: "Winking Eyes" },
      { id: "puppy_eyes", name: "Puppy Eyes" },
      { id: "female_eyes", name: "Elegant Eyes" },
    ];
  }

  const getAvailableMouths = () => {
    return [
      { id: "default_mouth", name: "Default Smile" },
      { id: "smile_mouth", name: "Big Smile" },
      { id: "kiss_mouth", name: "Kiss" },
      { id: "surprised_mouth", name: "Surprised" },
      { id: "bone_mouth", name: "Playful" },
    ];
  }

  // ✅ UPDATED: Get decorations user actually owns
  const getAvailableDecorations = () => {
    const allDecorations = [
      { id: "crown_decoration", name: "Crown" },
      { id: "graduate_cap_decoration", name: "Graduate Cap" },
      { id: "christmas_cap_decoration", name: "Christmas Cap" },
    ];
    
    return allDecorations.filter(decoration => 
      bonsaiData?.ownedItems?.includes(decoration.id)
    );
  }

  // ✅ UPDATED: Handle decoration toggle
  const toggleDecoration = (decorationId) => {
    setSelectedDecorations(prev => {
      if (prev.includes(decorationId)) {
        return prev.filter(id => id !== decorationId)
      } else {
        if (prev.length >= 3) {
          alert("You can only have up to 3 decorations at once!")
          return prev
        }
        return [...prev, decorationId]
      }
    })
  }

  const getGroundStyle = () => {
    if (previewItem && previewItem.type === "foundation") {
      return previewItem.id
    }
    return selectedGroundStyle
  }

  // ✅ UPDATED: getTreeColor function (no mockData)
  const getTreeColor = () => {
    if (previewItem && previewItem.type === "tree") {
      return previewItem.color
    }
    
    if (useCustomColor || selectedTree === "custom") {
      return customTreeColor
    }
    
    const trees = getAvailableTreeColors();
    const tree = trees.find((t) => t.id === selectedTree)
    return tree ? tree.color : "#77DD82"
  }

  // ✅ UPDATED: getPotColor function (no mockData)
  const getPotColor = () => {
    if (previewItem && previewItem.type === "pot" && previewItem.isPotColor && previewItem.color) {
      return previewItem.color
    }
    
    if (useCustomPotColor || selectedPot === "custom_pot") {
      return customPotColor
    }
    
    const pots = getAvailablePotColors();
    const pot = pots.find((p) => p.id === selectedPot)
    return pot ? pot.color : "#FD9475"
  }

  const getActiveDecorations = () => {
    let decorations = [...selectedDecorations]
    if (previewItem && previewItem.type === "decoration") {
      if (!decorations.includes(previewItem.id)) {
        decorations.push(previewItem.id)
      }
    }
    return decorations
  }

  const handleTreeSelection = (treeId) => {
    if (treeId === "custom") {
      setUseCustomColor(true)
      setSelectedTree("custom")
    } else {
      setUseCustomColor(false)
      setSelectedTree(treeId)
    }
    setPreviewItem(null)
  }

  const handlePotSelection = (potId) => {
    if (potId === "custom_pot") {
      setUseCustomPotColor(true)
      setSelectedPot("custom_pot")
    } else {
      setUseCustomPotColor(false)
      setSelectedPot(potId)
    }
    setPreviewItem(null)
  }

  const handleCustomColorChange = (e) => {
    setCustomTreeColor(e.target.value)
    setUseCustomColor(true)
    setSelectedTree("custom")
  }

  const handleCustomPotColorChange = (e) => {
    setCustomPotColor(e.target.value)
    setUseCustomPotColor(true)
    setSelectedPot("custom_pot")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#4a7c59]" />
          <p className="mt-2 text-[#5c6d5e]">Loading your bonsai...</p>
        </div>
      </div>
    )
  }

  if (!bonsaiData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-[#5c6d5e]">Failed to load bonsai data</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  // Calculate progress to next level - FIXED VERSION
  const currentLevel = bonsaiData.level
  const currentCredits = bonsaiData.totalCredits

  // Find current milestone (the one we've achieved for our current level)
  const currentLevelMilestone = bonsaiData.milestones.find((m) => m.level === currentLevel)

  // Find next milestone (the next level we're working towards)
  const nextLevelMilestone = bonsaiData.milestones
    .filter((m) => m.level > currentLevel)
    .sort((a, b) => a.level - b.level)[0] // Get the next immediate level

  // Calculate progress to next level
  let progressToNextLevel = 0
  let isMaxLevel = false

  if (nextLevelMilestone && currentLevelMilestone) {
    // Normal case: there's a next level
    const creditsInCurrentLevel = currentCredits - currentLevelMilestone.creditsRequired
    const creditsNeededForNextLevel = nextLevelMilestone.creditsRequired - currentLevelMilestone.creditsRequired
    progressToNextLevel = Math.min(100, Math.max(0, (creditsInCurrentLevel / creditsNeededForNextLevel) * 100))
  } else if (!nextLevelMilestone) {
    // Max level reached
    isMaxLevel = true
    progressToNextLevel = 100
  } else {
    // Edge case: no current milestone found, assume 0 progress
    progressToNextLevel = 0
  }

  // Calculate credits needed for next level
  const creditsNeededForNext = nextLevelMilestone ? 
    Math.max(0, nextLevelMilestone.creditsRequired - currentCredits) : 0

  return (
    <>
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">My Bonsai Garden</h1>
            <p className="text-[#5c6d5e]">Customize and grow your bonsai as you learn Japanese</p>
          </div>

      {/* Level Progress Bar */}
      <div className="mb-8 rounded-lg border border-[#dce4d7] bg-white p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2eb]">
              <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
            </div>
            <div>
              <h2 className="font-semibold text-[#2c3e2d]">Level {currentLevel} Bonsai</h2>
              <p className="text-sm text-[#5c6d5e]">{currentCredits} credits earned</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              {isMaxLevel ? (
                <>
                  <p className="text-sm font-medium text-[#2c3e2d]">Maximum Level Reached!</p>
                  <p className="text-xs text-[#5c6d5e]">Your bonsai is fully grown</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#2c3e2d]">
                    Next Level: {nextLevelMilestone?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-[#5c6d5e]">
                    {creditsNeededForNext} credits needed
                  </p>
                </>
              )}
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2eb] text-[#4a7c59]">
              {isMaxLevel ? '🌳' : (nextLevelMilestone?.level || currentLevel)}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs">
            <span>Current: Level {currentLevel}</span>
            <span>{isMaxLevel ? 'Max Level' : `Next: Level ${nextLevelMilestone?.level || '?'}`}</span>
          </div>
          <Progress 
            value={progressToNextLevel} 
            className="h-2 bg-[#dce4d7]" 
            indicatorClassName="bg-[#4a7c59]" 
          />
        </div>
      </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-[#eef2eb] p-1">
              <TabsTrigger
                value="customize"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2"
              >
                <Palette className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Customize Bonsai</span>
                <span className="sm:hidden">Customize</span>
              </TabsTrigger>
              <TabsTrigger 
                value="shop" 
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2"
              >
                <ShoppingBag className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Bonsai Shop</span>
                <span className="sm:hidden">Shop</span>
              </TabsTrigger>
              <TabsTrigger
                value="milestones"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white text-xs sm:text-sm px-2 py-2"
              >
                <Award className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Growth Milestones</span>
                <span className="sm:hidden">Milestones</span>
              </TabsTrigger>
            </TabsList>

            {/* Customize Tab */}
            <TabsContent value="customize" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Bonsai Preview - Fixed/Sticky */}
                <div className="md:sticky md:top-20 md:self-start md:h-fit">
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm min-h-[500px] flex flex-col justify-center">
                    <h2 className="mb-6 text-xl font-semibold text-center text-[#2c3e2d]">Your Bonsai</h2>
                    <div className="flex flex-col items-center flex-1 justify-center">
                      <div className="mb-6">
                        <BonsaiSVG 
                          level={bonsaiData.level}
                          treeColor={getTreeColor()} 
                          potColor={getPotColor()} 
                          decorations={getActiveDecorations()}
                          selectedEyes={selectedEyes}
                          selectedMouth={selectedMouth}
                          selectedPotStyle={selectedPotStyle}       
                          selectedGroundStyle={selectedGroundStyle} 
                        />
                      </div>
                      <div className="text-center mb-4">
                        <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                        <p className="text-sm text-[#5c6d5e]">{bonsaiData.totalCredits} Credits Total</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="md:col-span-2 space-y-6">
                  {/* Foliage Color */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Flower className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Foliage Color
                    </h2>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                      {/* ✅ UPDATED: Use helper function instead of mockData */}
                      {getAvailableTreeColors().slice(0, 2).map((tree) => (
                        <div
                          key={tree.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedTree === tree.id && !useCustomColor
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                          }`}
                          onClick={() => handleTreeSelection(tree.id)}
                        >
                          <div className="flex flex-col items-center">
                            <div className="mb-2 h-8 w-8 rounded-full" style={{ backgroundColor: tree.color }}></div>
                            <p className="text-center text-sm font-medium text-[#2c3e2d]">{tree.name}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom Color Picker */}
                      <div
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          useCustomColor || selectedTree === "custom"
                            ? "border-[#4a7c59] bg-[#eef2eb]"
                            : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                        }`}
                        onClick={() => handleTreeSelection("custom")}
                      >
                        <div className="flex flex-col items-center">
                          <div className="mb-2 relative">
                            <div 
                              className="h-8 w-8 rounded-full border-2 border-gray-200" 
                              style={{ backgroundColor: customTreeColor }}
                            ></div>
                            <input
                              type="color"
                              value={customTreeColor}
                              onChange={handleCustomColorChange}
                              className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                              title="Choose custom color"
                            />
                          </div>
                          <p className="text-center text-sm font-medium text-[#2c3e2d]">Custom Color</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Color Picker Input (when custom is selected) */}
                    {(useCustomColor || selectedTree === "custom") && (
                      <div className="mt-4 p-3 bg-[#f8f7f4] rounded-lg">
                        <label className="block text-sm font-medium text-[#2c3e2d] mb-2">
                          Custom Tree Color:
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customTreeColor}
                            onChange={handleCustomColorChange}
                            className="w-12 h-12 rounded border-2 border-gray-200 cursor-pointer"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={customTreeColor}
                              onChange={(e) => {
                                if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                  setCustomTreeColor(e.target.value)
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono"
                              placeholder="#77DD82"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Eyes */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Eye className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Eyes <span className="text-sm font-normal text-[#5c6d5e]"></span>
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {/* ✅ UPDATED: Use helper function instead of mockData */}
                      {getAvailableEyes().map((eyes) => (
                        <div
                          key={eyes.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedEyes === eyes.id
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                          }`}
                          onClick={() => {
                            setSelectedEyes(eyes.id)
                            setPreviewItem(null)
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="mb-2 h-8 w-8 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                              <Eye className="h-4 w-4 text-[#4a7c59]" />
                            </div>
                            <p className="text-center text-sm font-medium text-[#2c3e2d]">{eyes.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mouth */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <svg className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Mouth <span className="text-sm font-normal text-[#5c6d5e]"></span>
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {/* ✅ UPDATED: Use helper function instead of mockData */}
                      {getAvailableMouths().map((mouth) => (
                        <div
                          key={mouth.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedMouth === mouth.id
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                          }`}
                          onClick={() => {
                            setSelectedMouth(mouth.id)
                            setPreviewItem(null)
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="mb-2 h-8 w-8 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                              <svg className="h-4 w-4 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0" />
                              </svg>
                            </div>
                            <p className="text-center text-sm font-medium text-[#2c3e2d]">{mouth.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decorations Section */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Sparkles className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Decorations <span className="text-sm font-normal text-[#5c6d5e]">(Max 3)</span>
                    </h2>
                    {/* ✅ UPDATED: Use helper function instead of mockData */}
                    {getAvailableDecorations().length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="mx-auto h-12 w-12 text-[#dce4d7] mb-4" />
                        <p className="text-[#5c6d5e] mb-2">No decorations owned yet</p>
                        <p className="text-sm text-[#5c6d5e]">Visit the shop to purchase decorations for your bonsai!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        {getAvailableDecorations().map((decoration) => (
                          <div
                            key={decoration.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedDecorations.includes(decoration.id)
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => toggleDecoration(decoration.id)}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-2 h-8 w-8 rounded-full bg-[#f0f0f0] flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-[#4a7c59]" />
                              </div>
                              <p className="text-center text-sm font-medium text-[#2c3e2d]">{decoration.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ground Style */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      Ground Style
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {[
                        { id: "default_ground", name: "Default Shadow", requiresOwnership: false }, // Always available
                        { id: "flowery_ground", name: "Flowery Ground", requiresOwnership: true },
                        { id: "lilypad_ground", name: "Lily Pad", requiresOwnership: true },
                        { id: "skate_ground", name: "Skate Ground", requiresOwnership: true },
                        { id: "mushroom_ground", name: "Mushroom Ground", requiresOwnership: true }
                      ]
                      .filter(groundStyle => {
                        // Show if it's free OR if user owns it
                        return !groundStyle.requiresOwnership || bonsaiData?.ownedItems?.includes(groundStyle.id)
                      })
                      .map((groundStyle) => (
                        <div
                          key={groundStyle.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedGroundStyle === groundStyle.id
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                          }`}
                          onClick={() => setSelectedGroundStyle(groundStyle.id)}
                        >
                          <p className="text-center text-sm font-medium text-[#2c3e2d]">{groundStyle.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pot Style */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      Pot Style
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {/* ✅ FIXED: Only show pot styles the user actually owns */}
                      {[
                        { id: "default_pot", name: "Default Pot", requiresOwnership: false }, // Always available
                        { id: "wide_pot", name: "Wide Pot", requiresOwnership: false }, // Always available
                        { id: "slim_pot", name: "Slim Pot", requiresOwnership: false }, // Always available
                        { id: "mushroom_pot", name: "Mushroom Pot", requiresOwnership: true } // Requires purchase
                      ]
                      .filter(potStyle => {
                        // Show if it's free OR if user owns it
                        return !potStyle.requiresOwnership || bonsaiData?.ownedItems?.includes(potStyle.id)
                      })
                      .map((potStyle) => (
                        <div
                          key={potStyle.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedPotStyle === potStyle.id
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                          }`}
                          onClick={() => setSelectedPotStyle(potStyle.id)}
                        >
                          <p className="text-center text-sm font-medium text-[#2c3e2d]">{potStyle.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pot Color */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Palette className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Pot Color
                    </h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {/* ✅ UPDATED: Use helper function instead of mockData */}
                      {getAvailablePotColors().slice(0, 2).map((pot) => (
                        <div
                          key={pot.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedPot === pot.id && !useCustomPotColor
                              ? "border-[#4a7c59] bg-[#eef2eb]"
                              : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                          }`}
                          onClick={() => handlePotSelection(pot.id)}
                        >
                          <div className="flex flex-col items-center">
                            <div 
                              className="mb-2 h-6 w-12 rounded-t-sm rounded-b-md" 
                              style={{ backgroundColor: pot.color }}
                            ></div>
                            <p className="text-center text-sm font-medium text-[#2c3e2d]">{pot.name}</p>
                          </div>
                        </div>
                      ))}
                      
                      {/* Custom Color Picker */}
                      <div
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          useCustomPotColor || selectedPot === "custom_pot"
                            ? "border-[#4a7c59] bg-[#eef2eb]"
                            : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                        }`}
                        onClick={() => handlePotSelection("custom_pot")}
                      >
                        <div className="flex flex-col items-center">
                          <div className="mb-2 relative">
                            <div 
                              className="h-6 w-12 rounded-t-sm rounded-b-md border-2 border-gray-200" 
                              style={{ backgroundColor: customPotColor }}
                            ></div>
                            <input
                              type="color"
                              value={customPotColor}
                              onChange={handleCustomPotColorChange}
                              className="absolute inset-0 w-12 h-6 opacity-0 cursor-pointer"
                              title="Choose custom pot color"
                            />
                          </div>
                          <p className="text-center text-sm font-medium text-[#2c3e2d]">Custom Color</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Color Picker Input (when custom is selected) */}
                    {(useCustomPotColor || selectedPot === "custom_pot") && (
                      <div className="mt-4 p-3 bg-[#f8f7f4] rounded-lg">
                        <label className="block text-sm font-medium text-[#2c3e2d] mb-2">
                          Custom Pot Color:
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={customPotColor}
                            onChange={handleCustomPotColorChange}
                            className="w-12 h-12 rounded border-2 border-gray-200 cursor-pointer"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={customPotColor}
                              onChange={(e) => {
                                if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                                  setCustomPotColor(e.target.value)
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded text-sm font-mono"
                              placeholder="#FD9475"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                    onClick={saveCustomization}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Shop Tab */}
            <TabsContent value="shop" className="mt-0 border-0 p-0">
              <BonsaiShop
                bonsaiData={bonsaiData}
                credits={credits}
                setCredits={setCredits}
                setBonsaiData={setBonsaiData}
                previewItem={previewItem}
                setPreviewItem={setPreviewItem}
                getTreeColor={getTreeColor}
                getPotColor={getPotColor}
                getActiveDecorations={getActiveDecorations}
                selectedEyes={selectedEyes}
                selectedMouth={selectedMouth}
                getGroundStyle={getGroundStyle}
                selectedPotStyle={selectedPotStyle}
              />
            </TabsContent>

            {/* Milestones Tab */}
            <TabsContent value="milestones" className="mt-0 border-0 p-0">
              <BonsaiMilestones bonsaiData={bonsaiData} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
    
    {/* Mobile Floating Preview */}
    {showMobilePreview && (
      <div className="md:hidden fixed inset-x-4 top-16 z-50 bg-white rounded-lg border border-[#dce4d7] shadow-xl p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-sm text-[#2c3e2d]">
            {previewItem ? "Item Preview" : "Your Bonsai"}
          </h3>
          <button 
            onClick={() => setShowMobilePreview(false)}
            className="text-gray-400 hover:text-gray-600 text-lg font-bold"
          >
            ✕
          </button>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-44 h-44 mb-2">
            <BonsaiSVG 
              level={bonsaiData.level}
              treeColor={getTreeColor()} 
              decorations={getActiveDecorations()}
              selectedEyes={selectedEyes}
              selectedMouth={selectedMouth}
              potColor={getPotColor()} 
              selectedPotStyle={selectedPotStyle}
              selectedGroundStyle={getGroundStyle()} 
            />
          </div>
          <div className="text-center">
            {previewItem ? (
              <>
                <p className="font-medium text-sm text-[#2c3e2d]">{previewItem.name}</p>
                <p className="text-xs text-[#5c6d5e]">{previewItem.credits} Credits</p>
              </>
            ) : (
              <>
                <p className="font-medium text-sm text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                <p className="text-xs text-[#5c6d5e]">{credits} Credits Available</p>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Mobile Preview Toggle Button */}
    <button 
      onClick={() => setShowMobilePreview(!showMobilePreview)}
      className="md:hidden fixed bottom-6 right-6 z-40 bg-[#4a7c59] text-white p-4 rounded-full shadow-lg hover:bg-[#3a6147] transition-colors"
    >
      {showMobilePreview ? <EyeClosed /> : <Eye /> }
    </button>
    </>
  )
}