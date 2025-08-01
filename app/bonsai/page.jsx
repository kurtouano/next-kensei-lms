"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Award, Check, Palette, Flower, Sparkles, ShoppingBag, Eye, Loader2 } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "./components/BonsaiSVG"

export default function BonsaiPage() {
  const { data: session } = useSession()
  const [bonsaiData, setBonsaiData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedTree, setSelectedTree] = useState("maple")
  const [customTreeColor, setCustomTreeColor] = useState("#77DD82")
  const [useCustomColor, setUseCustomColor] = useState(false)
  const [selectedPot, setSelectedPot] = useState("traditional-blue")
  const [selectedEyes, setSelectedEyes] = useState("default_eyes")
  const [selectedMouth, setSelectedMouth] = useState("default_mouth")
  const [selectedDecorations, setSelectedDecorations] = useState([])
  const [activeTab, setActiveTab] = useState("customize")
  const [previewItem, setPreviewItem] = useState(null)
  const [shopCategory, setShopCategory] = useState("all")

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
          
          // Check if using custom color or preset
          const presetTree = getTreeKeyFromColor(data.customization.foliageColor)
          if (presetTree) {
            setSelectedTree(presetTree)
            setUseCustomColor(false)
          } else {
            setUseCustomColor(true)
            setCustomTreeColor(data.customization.foliageColor || "#77DD82")
          }
          
          setSelectedPot(data.customization.potStyle || "traditional-blue")
          setSelectedDecorations(data.customization.decorations || [])
        }
      } else {
        console.error('Failed to load bonsai data')
      }
    } catch (error) {
      console.error('Error loading bonsai data:', error)
    } finally {
      setLoading(false)
    }
  }

  const isItemAvailable = (item, bonsaiData) => {
    // Always show basic/free items (0 credits)
    if (item.credits === 0) return true;
    
    // Show if user owns the item
    return bonsaiData?.ownedItems?.includes(item.id) || false;
  };

  const saveCustomization = async () => {
    if (!session?.user?.id) return

    setSaving(true)
    try {
      const customizationData = {
        customization: {
          eyes: selectedEyes,
          mouth: selectedMouth,
          foliageColor: getTreeColor(),
          potStyle: selectedPot,
          potColor: getPotColor(),
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
        // Show success message
        alert('Bonsai customization saved successfully!')
        // Reload bonsai data to get updated info
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

  // Helper function to get tree key from color
  const getTreeKeyFromColor = (color) => {
    const treeMap = {
      "#77DD82": "maple",
      "#4a7c59": "pine", 
      "#2a5c59": "red",
      "#e4b1ab": "cherry",
      "#5d9e75": "juniper"
    }
    return treeMap[color] || null
  }

  // Mock data with updated tree colors
  const mockData = {
    trees: [
      { id: "maple", name: "Default Green", credits: 0, unlocked: true, color: "#77DD82", category: "tree" },
      { id: "pine", name: "Forest Green", credits: 0, unlocked: true, color: "#4a7c59", category: "tree" },
      { id: "custom", name: "Custom Color", credits: 0, unlocked: true, color: customTreeColor, category: "tree" },
    ],
    pots: [
      { id: "traditional-blue", name: "Traditional Blue", credits: 0, unlocked: true, color: "#FD9475", category: "pot" },
      { id: "ceramic-brown", name: "Ceramic Brown", credits: 100, unlocked: true, color: "#8B5E3C", category: "pot" },
      { id: "glazed-green", name: "Glazed Green", credits: 300, unlocked: true, color: "#4a7c59", category: "pot" },
      { id: "stone-gray", name: "Stone Gray", credits: 400, unlocked: false, color: "#7D7D7D", category: "pot" },
      { id: "premium-gold", name: "Premium Gold", credits: 1000, unlocked: false, color: "#D4AF37", category: "pot" },
    ],
    eyes: [
      { id: "default_eyes", name: "Default Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "cry_eyes", name: "Crying Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "happy_eyes", name: "Happy Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "flat_eyes", name: "Sleepy Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "wink_eyes", name: "Winking Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "puppy_eyes", name: "Puppy Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "female_eyes", name: "Elegant Eyes", credits: 0, unlocked: true, category: "eyes" },
    ],
    mouths: [
      { id: "default_mouth", name: "Default Smile", credits: 0, unlocked: true, category: "mouth" },
      { id: "smile_mouth", name: "Big Smile", credits: 0, unlocked: true, category: "mouth" },
      { id: "kiss_mouth", name: "Kiss", credits: 0, unlocked: true, category: "mouth" },
      { id: "surprised_mouth", name: "Surprised", credits: 0, unlocked: true, category: "mouth" },
      { id: "bone_mouth", name: "Playful", credits: 0, unlocked: true, category: "mouth" },
    ],
    decorations: [],
    milestones: [
      { level: 1, name: "Seedling", credits: 0, description: "You've started your bonsai journey" },
      { level: 2, name: "Sapling", credits: 200, description: "Your bonsai is growing steadily" },
      { level: 3, name: "Young Tree", credits: 400, description: "Your bonsai is developing character" },
      { level: 5, name: "Mature Tree", credits: 800, description: "Your bonsai shows signs of wisdom" },
      { level: 10, name: "Ancient Bonsai", credits: 2000, description: "Your bonsai has reached legendary status" },
    ],
  }

  const toggleDecoration = (id) => {
    if (selectedDecorations.includes(id)) {
      setSelectedDecorations(selectedDecorations.filter((item) => item !== id))
    } else {
      setSelectedDecorations([...selectedDecorations, id])
    }
  }

  const getTreeColor = () => {
    if (previewItem && previewItem.type === "tree") {
      return previewItem.color
    }
    
    if (useCustomColor || selectedTree === "custom") {
      return customTreeColor
    }
    
    const tree = mockData.trees.find((t) => t.id === selectedTree)
    return tree ? tree.color : "#77DD82"
  }

  const getPotColor = () => {
    if (previewItem && previewItem.type === "pot") {
      return previewItem.color
    }
    const pot = mockData.pots.find((p) => p.id === selectedPot)
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

  const handleCustomColorChange = (e) => {
    setCustomTreeColor(e.target.value)
    setUseCustomColor(true)
    setSelectedTree("custom")
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

  // Calculate progress to next level
  const currentLevelMilestone = bonsaiData.milestones.find((m) => m.level === bonsaiData.level)
  const nextLevelMilestone = bonsaiData.milestones.find((m) => m.level > bonsaiData.level)

  const progressToNextLevel = currentLevelMilestone && nextLevelMilestone
    ? ((bonsaiData.totalCredits - currentLevelMilestone.creditsRequired) /
        (nextLevelMilestone.creditsRequired - currentLevelMilestone.creditsRequired)) * 100
    : 0

  return (
    <div className="flex min-h-screen flex-col bg-[#f9fafb]">
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">My Bonsai Garden</h1>
            <p className="text-[#5c6d5e]">Customize and grow your bonsai as you learn Japanese</p>
          </div>

          {/* Level Progress Bar */}
          <div className="mb-8 rounded-lg border border-[#dce4d7] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eef2eb]">
                  <BonsaiIcon className="h-8 w-8 text-[#4a7c59]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</h2>
                  <p className="text-sm text-[#5c6d5e]">{bonsaiData.totalCredits} credits earned</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#2c3e2d]">Next Level: {nextLevelMilestone?.name}</p>
                  <p className="text-xs text-[#5c6d5e]">
                    {nextLevelMilestone ? nextLevelMilestone.creditsRequired - bonsaiData.totalCredits : 0} credits needed
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2eb] text-[#4a7c59]">
                  {nextLevelMilestone?.level || bonsaiData.level}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>Current: {bonsaiData.level}</span>
                <span>Next: {nextLevelMilestone?.level || 'Max'}</span>
              </div>
              <Progress value={progressToNextLevel} className="h-2 bg-[#dce4d7]" indicatorClassName="bg-[#4a7c59]" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-[#eef2eb]">
              <TabsTrigger
                value="customize"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Palette className="mr-2 h-4 w-4" />
                Customize Bonsai
              </TabsTrigger>
              <TabsTrigger 
                value="shop" 
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
                disabled
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Bonsai Shop (Coming Soon)
              </TabsTrigger>
              <TabsTrigger
                value="milestones"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Award className="mr-2 h-4 w-4" />
                Growth Milestones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Bonsai Preview */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-center text-[#2c3e2d]">Your Bonsai</h2>
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <BonsaiSVG 
                        level={bonsaiData.level}
                        treeColor={getTreeColor()} 
                        potColor={getPotColor()} 
                        decorations={getActiveDecorations()}
                        selectedEyes={selectedEyes}
                        selectedMouth={selectedMouth}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                      <p className="text-sm text-[#5c6d5e]">{bonsaiData.totalCredits} Credits Total</p>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="md:col-span-2 space-y-6">
                  {/* Tree Color */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Flower className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Tree Color
                    </h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Preset Colors */}
                      {mockData.trees.slice(0, 2).map((tree) => (
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
                          <p className="text-center text-sm font-medium text-[#2c3e2d]">Custom Color (+) </p>
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
                    <div className="grid grid-cols-3 gap-3 md:grid-cols-4">
                      {mockData.eyes.map((eyes) => (
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
                            <p className="text-center text-xs font-medium text-[#2c3e2d]">{eyes.name}</p>
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
                      {mockData.mouths.map((mouth) => (
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
                            <p className="text-center text-xs font-medium text-[#2c3e2d]">{mouth.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pot Style */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Palette className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Pot Style
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {mockData.pots
                        .filter((pot) => isItemAvailable(pot, bonsaiData))
                        .map((pot) => (
                          <div
                            key={pot.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedPot === pot.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              setSelectedPot(pot.id)
                              setPreviewItem(null)
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div
                                className="mb-2 h-6 w-12 rounded-t-sm rounded-b-md"
                                style={{ backgroundColor: pot.color }}
                              ></div>
                              <p className="text-center text-xs font-medium text-[#2c3e2d]">{pot.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
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

            <TabsContent value="milestones" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">Bonsai Growth Milestones</h2>

                {/* Milestones List */}
                <div className="space-y-4">
                  {bonsaiData.milestones.map((milestone) => (
                    <div
                      key={milestone.level}
                      className={`rounded-lg border p-4 ${
                        milestone.isAchieved
                          ? "border-[#4a7c59] bg-[#eef2eb]"
                          : "border-[#dce4d7] bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              milestone.isAchieved
                                ? "bg-[#4a7c59] text-white"
                                : "bg-[#dce4d7] text-[#5c6d5e]"
                            }`}
                          >
                            {milestone.isAchieved ? (
                              <Check className="h-5 w-5" />
                            ) : (
                              milestone.level
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#2c3e2d]">
                              {milestone.name} - Level {milestone.level}
                            </h3>
                            <p className="text-sm text-[#5c6d5e]">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#2c3e2d]">
                            {milestone.creditsRequired} credits
                          </p>
                          {milestone.isAchieved && milestone.achievedAt && (
                            <p className="text-xs text-[#5c6d5e]">
                              Achieved {new Date(milestone.achievedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}