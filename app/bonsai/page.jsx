"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Award, Check, Palette, Flower, Sparkles, ShoppingBag, Eye } from "lucide-react"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { BonsaiSVG } from "./components/BonsaiSVG"

export default function BonsaiPage() {
  const [selectedTree, setSelectedTree] = useState("maple")
  const [selectedPot, setSelectedPot] = useState("")
  const [selectedEyes, setSelectedEyes] = useState("default_eyes")
  const [selectedMouth, setSelectedMouth] = useState("default_mouth")
  const [selectedDecorations, setSelectedDecorations] = useState([""])
  const [activeTab, setActiveTab] = useState("customize")
  const [credits, setCredits] = useState(450)
  const [previewItem, setPreviewItem] = useState(null)
  const [shopCategory, setShopCategory] = useState("all")

  // Mock bonsai data
  const bonsaiData = {
    credits: 450,
    level: 1,
    nextLevelCredits: 800,
    trees: [
      { id: "maple", name: "Maple Bonsai", credits: 0, unlocked: true, color: "#77DD82", category: "tree" },
      { id: "pine", name: "Pine Bonsai", credits: 200, unlocked: true, color: "#4a7c59", category: "tree" },
      { id: "red", name: "Red", credits: 200, unlocked: true, color: "#2a5c59", category: "tree" },
      { id: "cherry", name: "Cherry Blossom", credits: 500, unlocked: false, color: "#e4b1ab", category: "tree" },
      { id: "juniper", name: "Juniper Bonsai", credits: 750, unlocked: false, color: "#5d9e75", category: "tree" },
    ],
    pots: [
      {
        id: "traditional-blue",
        name: "Traditional Blue",
        credits: 0,
        unlocked: true,
        color: "#FD9475",
        category: "pot",
      },
      { id: "ceramic-brown", name: "Ceramic Brown", credits: 100, unlocked: true, color: "#8B5E3C", category: "pot" },
      { id: "glazed-green", name: "Glazed Green", credits: 300, unlocked: true, color: "#4a7c59", category: "pot" },
      { id: "stone-gray", name: "Stone Gray", credits: 400, unlocked: false, color: "#7D7D7D", category: "pot" },
      { id: "premium-gold", name: "Premium Gold", credits: 1000, unlocked: false, color: "#D4AF37", category: "pot" },
    ],
    eyes: [
      { id: "default_eyes", name: "Default Eyes", credits: 0, unlocked: true, category: "eyes" },
      { id: "cry_eyes", name: "Crying Eyes", credits: 50, unlocked: true, category: "eyes" },
      { id: "happy_eyes", name: "Happy Eyes", credits: 100, unlocked: true, category: "eyes" },
      { id: "flat_eyes", name: "Sleepy Eyes", credits: 75, unlocked: true, category: "eyes" },
      { id: "wink_eyes", name: "Winking Eyes", credits: 125, unlocked: true, category: "eyes" },
      { id: "puppy_eyes", name: "Puppy Eyes", credits: 150, unlocked: true, category: "eyes" },
      { id: "female_eyes", name: "Elegant Eyes", credits: 200, unlocked: true, category: "eyes" },
    ],
    mouths: [
      { id: "default_mouth", name: "Default Smile", credits: 0, unlocked: true, category: "mouth" },
      { id: "smile_mouth", name: "Big Smile", credits: 50, unlocked: true, category: "mouth" },
      { id: "kiss_mouth", name: "Kiss", credits: 100, unlocked: true, category: "mouth" },
      { id: "surprised_mouth", name: "Surprised", credits: 75, unlocked: true, category: "mouth" },
      { id: "bone_mouth", name: "Playful", credits: 125, unlocked: true, category: "mouth" },
    ],
    decorations: [],
    milestones: [
      { level: 1, name: "Seedling", credits: 0, description: "You've started your bonsai journey" },
      { level: 2, name: "Sapling", credits: 200, description: "Your bonsai is growing steadily" },
      { level: 3, name: "Young Tree", credits: 400, description: "Your bonsai is developing character" },
      { level: 5, name: "Mature Tree", credits: 800, description: "Your bonsai shows signs of wisdom" },
      { level: 10, name: "Ancient Bonsai", credits: 2000, description: "Your bonsai has reached legendary status" },
    ],
    shopItems: [],
  }

  // Combine all items for the shop
  const allShopItems = [
    ...bonsaiData.trees.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "tree" })),
    ...bonsaiData.pots.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "pot" })),
    ...bonsaiData.eyes.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "eyes" })),
    ...bonsaiData.mouths.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "mouth" })),
    ...bonsaiData.decorations.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "decoration" })),
  ]

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
    const tree = bonsaiData.trees.find((t) => t.id === selectedTree)
    return tree ? tree.color : "#77DD82"
  }

  const getPotColor = () => {
    if (previewItem && previewItem.type === "pot") {
      return previewItem.color
    }
    const pot = bonsaiData.pots.find((p) => p.id === selectedPot)
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

  // Calculate progress to next level
  const currentLevelMilestone = bonsaiData.milestones.find((m) => m.level === bonsaiData.level)
  const nextLevelMilestone = bonsaiData.milestones.find((m) => m.level > bonsaiData.level)

  const progressToNextLevel =
    currentLevelMilestone && nextLevelMilestone
      ? ((bonsaiData.credits - currentLevelMilestone.credits) /
          (nextLevelMilestone.credits - currentLevelMilestone.credits)) *
        100
      : 0

  const purchaseItem = (item) => {
    if (credits >= item.credits) {
      setCredits(credits - item.credits)
      // Here you would typically add the item to the user's inventory
      alert(`Successfully purchased ${item.name}!`)
    } else {
      alert("Not enough credits to purchase this item!")
    }
  }

  const previewShopItem = (item) => {
    setPreviewItem(item)
  }

  const clearPreview = () => {
    setPreviewItem(null)
  }

  const filteredShopItems =
    shopCategory === "all"
      ? allShopItems
      : allShopItems.filter((item) => item.category === shopCategory || item.type === shopCategory)

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
                  <p className="text-sm text-[#5c6d5e]">{bonsaiData.credits} credits earned</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#2c3e2d]">Next Level: {nextLevelMilestone?.name}</p>
                  <p className="text-xs text-[#5c6d5e]">
                    {nextLevelMilestone?.credits - bonsaiData.credits} credits needed
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef2eb] text-[#4a7c59]">
                  {nextLevelMilestone?.level}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span>Current: {bonsaiData.level}</span>
                <span>Next: {nextLevelMilestone?.level}</span>
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
              <TabsTrigger value="shop" className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Bonsai Shop
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
                      <p className="text-sm text-[#5c6d5e]">{credits} Credits Available</p>
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
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {bonsaiData.trees
                        .filter((tree) => tree.unlocked)
                        .map((tree) => (
                          <div
                            key={tree.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedTree === tree.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              setSelectedTree(tree.id)
                              setPreviewItem(null) // Clear preview when selecting a tree
                            }}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-2 h-8 w-8 rounded-full" style={{ backgroundColor: tree.color }}></div>
                              <p className="text-center text-sm font-medium text-[#2c3e2d]">{tree.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Eyes */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Eye className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Eyes
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {bonsaiData.eyes
                        .filter((eyes) => eyes.unlocked)
                        .map((eyes) => (
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
                      Mouth
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {bonsaiData.mouths
                        .filter((mouth) => mouth.unlocked)
                        .map((mouth) => (
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

                  {/* Pot Style */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Palette className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Pot Style
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      {bonsaiData.pots
                        .filter((pot) => pot.unlocked)
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
                              setPreviewItem(null) // Clear preview when selecting a pot
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

                  {/* Decorations */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Sparkles className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Decorations
                    </h2>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {bonsaiData.decorations
                        .filter((decoration) => decoration.unlocked)
                        .map((decoration) => (
                          <div
                            key={decoration.id}
                            className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                              selectedDecorations.includes(decoration.id)
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => {
                              toggleDecoration(decoration.id)
                              setPreviewItem(null) // Clear preview when toggling decorations
                            }}
                          >
                            <div className="flex items-center">
                              {selectedDecorations.includes(decoration.id) ? (
                                <Check className="mr-2 h-5 w-5 text-[#4a7c59]" />
                              ) : (
                                <div className="mr-2 h-5 w-5 rounded-md border border-[#dce4d7]"></div>
                              )}
                              <div>
                                <p className="font-medium text-[#2c3e2d]">{decoration.name}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button className="w-full bg-[#4a7c59] text-white hover:bg-[#3a6147]">Save Changes</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shop" className="mt-0 border-0 p-0">
              <div className="grid gap-6 md:grid-cols-3">
                {/* Bonsai Preview */}
                <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-center text-[#2c3e2d]">
                    {previewItem ? "Item Preview" : "Your Bonsai"}
                  </h2>
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
                      {previewItem ? (
                        <>
                          <p className="font-medium text-[#2c3e2d]">{previewItem.name}</p>
                          <p className="text-sm text-[#5c6d5e]">{previewItem.credits} Credits</p>
                          <Button
                            onClick={clearPreview}
                            variant="outline"
                            className="mt-2 text-[#4a7c59] border-[#4a7c59]"
                          >
                            Clear Preview
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                          <p className="text-sm text-[#5c6d5e]">{credits} Credits Available</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shop Items */}
                <div className="md:col-span-2">
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <h2 className="text-xl font-semibold text-[#2c3e2d]">Bonsai Shop</h2>
                      <div className="flex items-center gap-2 rounded-full bg-[#eef2eb] px-4 py-2">
                        <ShoppingBag className="h-4 w-4 text-[#4a7c59]" />
                        <span className="font-medium text-[#2c3e2d]">{credits} Credits Available</span>
                      </div>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-2">
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "all"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("all")}
                      >
                        All Items
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "tree"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("tree")}
                      >
                        Trees
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "pot"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("pot")}
                      >
                        Pots
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "eyes"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("eyes")}
                      >
                        Eyes
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "mouth"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("mouth")}
                      >
                        Mouth
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "decoration"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("decoration")}
                      >
                        Decorations
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredShopItems.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="rounded-lg border border-[#dce4d7] bg-[#f8f7f4] p-4 transition-all hover:shadow-md"
                        >
                          <div className="mb-3 flex items-center justify-between">
                            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4a7c59]">
                              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                            </span>
                            <span className="flex items-center text-sm font-medium text-[#2c3e2d]">
                              {item.credits} credits
                            </span>
                          </div>
                          <div className="mb-3 flex items-center gap-3">
                            <div className="h-16 w-16 overflow-hidden rounded-md bg-white flex items-center justify-center">
                              {item.type === "tree" && (
                                <div className="h-10 w-10 rounded-full" style={{ backgroundColor: item.color }}></div>
                              )}
                              {item.type === "pot" && (
                                <div
                                  className="h-8 w-14 rounded-t-sm rounded-b-md"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                              )}
                              {item.type === "eyes" && <Eye className="h-10 w-10 text-[#4a7c59]" />}
                              {item.type === "mouth" && (
                                <svg className="h-10 w-10 text-[#4a7c59]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0" />
                                </svg>
                              )}
                              {item.type === "decoration" && <Sparkles className="h-10 w-10 text-[#4a7c59]" />}
                            </div>
                            <div>
                              <h3 className="font-medium text-[#2c3e2d]">{item.name}</h3>
                              <p className="text-sm text-[#5c6d5e]">
                                {item.description || `Unlock this ${item.type} for your bonsai`}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className={`flex-1 ${
                                credits >= item.credits
                                  ? "bg-[#4a7c59] text-white hover:bg-[#3a6147]"
                                  : "bg-[#dce4d7] text-[#5c6d5e] cursor-not-allowed"
                              }`}
                              disabled={credits < item.credits}
                              onClick={() => purchaseItem(item)}
                            >
                              Purchase
                            </Button>
                            <Button
                              variant="outline"
                              className="flex items-center justify-center border-[#4a7c59] text-[#4a7c59]"
                              onClick={() => previewShopItem(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="mt-0 border-0 p-0">
              <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                <h2 className="mb-6 text-xl font-semibold text-[#2c3e2d]">Bonsai Growth Milestones</h2>

                <div className="relative mb-8">
                  <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-[#dce4d7]"></div>
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-[#4a7c59]"
                    style={{ width: `${(bonsaiData.credits / 2000) * 100}%` }}
                  ></div>

                  <div className="relative flex justify-between">
                    {bonsaiData.milestones.map((milestone, index) => (
                      <div
                        key={milestone.level}
                        className="flex flex-col items-center"
                        style={{ left: `${(milestone.credits / 2000) * 100}%` }}
                      >
                        <div
                          className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                            bonsaiData.credits >= milestone.credits
                              ? "bg-[#4a7c59] text-white"
                              : "bg-white text-[#5c6d5e] border border-[#dce4d7]"
                          }`}
                        >
                          {milestone.level}
                        </div>
                        <p className="mt-2 text-center text-sm font-medium text-[#2c3e2d]">{milestone.name}</p>
                        <p className="text-center text-xs text-[#5c6d5e]">{milestone.credits} credits</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-white p-4 text-[#5c6d5e]">
                  {bonsaiData.milestones.map((milestone) => (
                    <div key={milestone.level} className="mb-4 last:mb-0">
                      <h3 className="mb-1 text-lg font-semibold text-[#2c3e2d]">
                        {milestone.name} - Level {milestone.level}
                      </h3>
                      <p>{milestone.description}</p>
                      <p className="text-sm">Requires {milestone.credits} credits</p>
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