"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { BonsaiIcon } from "@/components/bonsai-icon"
import { Award, Check, Palette, Flower, Sparkles, ShoppingBag, Eye } from "lucide-react"

export default function BonsaiPage() {
  const [selectedTree, setSelectedTree] = useState("maple")
  const [selectedPot, setSelectedPot] = useState("traditional-blue")
  const [selectedDecorations, setSelectedDecorations] = useState(["stone-lantern"])
  const [activeTab, setActiveTab] = useState("customize")
  const [credits, setCredits] = useState(450)
  const [previewItem, setPreviewItem] = useState(null)
  const [shopCategory, setShopCategory] = useState("all")

  // Mock bonsai data
  const bonsaiData = {
    credits: 450,
    level: 3,
    nextLevelCredits: 800,
    trees: [
      { id: "maple", name: "Maple Bonsai", credits: 0, unlocked: true, color: "#6fb58a", category: "tree" },
      { id: "pine", name: "Pine Bonsai", credits: 200, unlocked: true, color: "#4a7c59", category: "tree" },
      { id: "cherry", name: "Cherry Blossom", credits: 500, unlocked: false, color: "#e4b1ab", category: "tree" },
      { id: "juniper", name: "Juniper Bonsai", credits: 750, unlocked: false, color: "#5d9e75", category: "tree" },
    ],
    pots: [
      {
        id: "traditional-blue",
        name: "Traditional Blue",
        credits: 0,
        unlocked: true,
        color: "#5b8fb0",
        category: "pot",
      },
      { id: "ceramic-brown", name: "Ceramic Brown", credits: 100, unlocked: true, color: "#8B5E3C", category: "pot" },
      { id: "glazed-green", name: "Glazed Green", credits: 300, unlocked: true, color: "#4a7c59", category: "pot" },
      { id: "stone-gray", name: "Stone Gray", credits: 400, unlocked: false, color: "#7D7D7D", category: "pot" },
      { id: "premium-gold", name: "Premium Gold", credits: 1000, unlocked: false, color: "#D4AF37", category: "pot" },
    ],
    decorations: [
      { id: "stone-lantern", name: "Stone Lantern", credits: 50, unlocked: true, category: "decoration" },
      { id: "moss", name: "Moss Covering", credits: 75, unlocked: true, category: "decoration" },
      { id: "pebbles", name: "Decorative Pebbles", credits: 100, unlocked: true, category: "decoration" },
      { id: "miniature-bench", name: "Miniature Bench", credits: 200, unlocked: false, category: "decoration" },
      { id: "koi-pond", name: "Koi Pond", credits: 350, unlocked: false, category: "decoration" },
      { id: "bonsai-lights", name: "Ambient Lights", credits: 500, unlocked: false, category: "decoration" },
    ],
    milestones: [
      { level: 1, name: "Seedling", credits: 0, description: "You've started your bonsai journey" },
      { level: 2, name: "Sapling", credits: 200, description: "Your bonsai is growing steadily" },
      { level: 3, name: "Young Tree", credits: 400, description: "Your bonsai is developing character" },
      { level: 5, name: "Mature Tree", credits: 800, description: "Your bonsai shows signs of wisdom" },
      { level: 10, name: "Ancient Bonsai", credits: 2000, description: "Your bonsai has reached legendary status" },
    ],
    shopItems: [
      {
        id: "premium-fertilizer",
        name: "Premium Fertilizer",
        description: "Boost your bonsai growth by 10%",
        credits: 150,
        image: "/placeholder.svg?height=100&width=100",
        category: "growth",
      },
      {
        id: "pruning-shears",
        name: "Golden Pruning Shears",
        description: "Unlock advanced tree customization options",
        credits: 300,
        image: "/placeholder.svg?height=100&width=100",
        category: "tools",
      },
      {
        id: "zen-garden",
        name: "Mini Zen Garden",
        description: "Add a beautiful zen garden around your bonsai",
        credits: 250,
        image: "/placeholder.svg?height=100&width=100",
        category: "decoration",
      },
      {
        id: "watering-can",
        name: "Ceramic Watering Can",
        description: "Earn 5% more credits from completed lessons",
        credits: 400,
        image: "/placeholder.svg?height=100&width=100",
        category: "tools",
      },
      {
        id: "bonsai-book",
        name: "Ancient Bonsai Techniques",
        description: "Unlock special seasonal decorations",
        credits: 350,
        image: "/placeholder.svg?height=100&width=100",
        category: "knowledge",
      },
      {
        id: "rare-seeds",
        name: "Rare Tree Seeds",
        description: "Unlock a special rare tree variety",
        credits: 600,
        image: "/placeholder.svg?height=100&width=100",
        category: "growth",
      },
    ],
  }

  // Combine all items for the shop
  const allShopItems = [
    ...bonsaiData.trees.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "tree" })),
    ...bonsaiData.pots.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "pot" })),
    ...bonsaiData.decorations.filter((item) => !item.unlocked).map((item) => ({ ...item, type: "decoration" })),
    ...bonsaiData.shopItems.map((item) => ({ ...item, type: "item" })),
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
    return tree ? tree.color : "#6fb58a"
  }

  const getPotColor = () => {
    if (previewItem && previewItem.type === "pot") {
      return previewItem.color
    }
    const pot = bonsaiData.pots.find((p) => p.id === selectedPot)
    return pot ? pot.color : "#5b8fb0"
  }

  const hasDecoration = (id) => {
    if (previewItem && previewItem.type === "decoration" && previewItem.id === id) {
      return true
    }
    return selectedDecorations.includes(id)
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
                    <div className="relative mb-4 h-64 w-64">
                      {/* Pot */}
                      <div
                        className="absolute bottom-0 left-1/2 h-20 w-32 -translate-x-1/2 rounded-t-sm rounded-b-xl"
                        style={{ backgroundColor: getPotColor() }}
                      ></div>

                      {/* Trunk */}
                      <div className="absolute bottom-16 left-1/2 h-32 w-6 -translate-x-1/2 bg-[#8B5E3C]"></div>

                      {/* Foliage */}
                      <div
                        className="absolute bottom-32 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>
                      <div
                        className="absolute bottom-40 left-1/4 h-16 w-16 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>
                      <div
                        className="absolute bottom-40 right-1/4 h-16 w-16 translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>
                      <div
                        className="absolute bottom-48 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>

                      {/* Decorations */}
                      {hasDecoration("stone-lantern") && (
                        <div className="absolute bottom-6 right-12 h-10 w-6 bg-[#d3d3d3]">
                          <div className="absolute top-0 left-1/2 h-2 w-4 -translate-x-1/2 rounded-t-sm bg-[#a0a0a0]"></div>
                        </div>
                      )}

                      {hasDecoration("moss") && (
                        <div className="absolute bottom-16 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-[#7d9f6c]"></div>
                      )}

                      {hasDecoration("pebbles") && (
                        <>
                          <div className="absolute bottom-8 left-14 h-3 w-3 rounded-full bg-[#d3d3d3]"></div>
                          <div className="absolute bottom-10 left-10 h-2 w-2 rounded-full bg-[#a0a0a0]"></div>
                          <div className="absolute bottom-6 left-18 h-2 w-4 rounded-full bg-[#b5b5b5]"></div>
                        </>
                      )}

                      {hasDecoration("miniature-bench") && (
                        <div className="absolute bottom-6 left-8 h-4 w-10 bg-[#8B5E3C]">
                          <div className="absolute top-0 left-0 h-1 w-10 bg-[#a67c52]"></div>
                          <div className="absolute bottom-0 left-1 h-2 w-1 bg-[#8B5E3C]"></div>
                          <div className="absolute bottom-0 right-1 h-2 w-1 bg-[#8B5E3C]"></div>
                        </div>
                      )}

                      {hasDecoration("koi-pond") && (
                        <div className="absolute bottom-8 left-1/2 h-6 w-16 -translate-x-1/2 rounded-full bg-[#5b8fb0]">
                          <div className="absolute top-2 left-3 h-2 w-4 rounded-full bg-[#f8f7f4]"></div>
                          <div className="absolute bottom-1 right-3 h-1 w-3 rounded-full bg-[#e76f51]"></div>
                        </div>
                      )}

                      {hasDecoration("bonsai-lights") && (
                        <>
                          <div className="absolute top-10 left-1/4 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                          <div className="absolute top-16 right-1/4 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                          <div className="absolute top-8 right-1/3 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                          <div className="absolute top-20 left-1/3 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                        </>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                      <p className="text-sm text-[#5c6d5e]">{credits} Credits Available</p>
                    </div>
                  </div>
                </div>

                {/* Customization Options */}
                <div className="md:col-span-2 space-y-6">
                  {/* Tree Type */}
                  <div className="rounded-lg border border-[#dce4d7] bg-white p-6">
                    <h2 className="mb-4 text-xl font-semibold text-[#2c3e2d]">
                      <Flower className="mr-2 inline-block h-5 w-5 text-[#4a7c59]" />
                      Tree Type
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
                            onClick={() => setSelectedTree(tree.id)}
                          >
                            <div className="flex flex-col items-center">
                              <div className="mb-2 h-8 w-8 rounded-full" style={{ backgroundColor: tree.color }}></div>
                              <p className="text-center text-sm font-medium text-[#2c3e2d]">{tree.name}</p>
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
                            onClick={() => setSelectedPot(pot.id)}
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
                              hasDecoration(decoration.id)
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                            }`}
                            onClick={() => toggleDecoration(decoration.id)}
                          >
                            <div className="flex items-center">
                              {hasDecoration(decoration.id) ? (
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
                    <div className="relative mb-4 h-64 w-64">
                      {/* Pot */}
                      <div
                        className="absolute bottom-0 left-1/2 h-20 w-32 -translate-x-1/2 rounded-t-sm rounded-b-xl"
                        style={{ backgroundColor: getPotColor() }}
                      ></div>

                      {/* Trunk */}
                      <div className="absolute bottom-16 left-1/2 h-32 w-6 -translate-x-1/2 bg-[#8B5E3C]"></div>

                      {/* Foliage */}
                      <div
                        className="absolute bottom-32 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>
                      <div
                        className="absolute bottom-40 left-1/4 h-16 w-16 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>
                      <div
                        className="absolute bottom-40 right-1/4 h-16 w-16 translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>
                      <div
                        className="absolute bottom-48 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full"
                        style={{ backgroundColor: getTreeColor() }}
                      ></div>

                      {/* Decorations */}
                      {hasDecoration("stone-lantern") && (
                        <div className="absolute bottom-6 right-12 h-10 w-6 bg-[#d3d3d3]">
                          <div className="absolute top-0 left-1/2 h-2 w-4 -translate-x-1/2 rounded-t-sm bg-[#a0a0a0]"></div>
                        </div>
                      )}

                      {hasDecoration("moss") && (
                        <div className="absolute bottom-16 left-1/2 h-2 w-28 -translate-x-1/2 rounded-full bg-[#7d9f6c]"></div>
                      )}

                      {hasDecoration("pebbles") && (
                        <>
                          <div className="absolute bottom-8 left-14 h-3 w-3 rounded-full bg-[#d3d3d3]"></div>
                          <div className="absolute bottom-10 left-10 h-2 w-2 rounded-full bg-[#a0a0a0]"></div>
                          <div className="absolute bottom-6 left-18 h-2 w-4 rounded-full bg-[#b5b5b5]"></div>
                        </>
                      )}

                      {hasDecoration("miniature-bench") && (
                        <div className="absolute bottom-6 left-8 h-4 w-10 bg-[#8B5E3C]">
                          <div className="absolute top-0 left-0 h-1 w-10 bg-[#a67c52]"></div>
                          <div className="absolute bottom-0 left-1 h-2 w-1 bg-[#8B5E3C]"></div>
                          <div className="absolute bottom-0 right-1 h-2 w-1 bg-[#8B5E3C]"></div>
                        </div>
                      )}

                      {hasDecoration("koi-pond") && (
                        <div className="absolute bottom-8 left-1/2 h-6 w-16 -translate-x-1/2 rounded-full bg-[#5b8fb0]">
                          <div className="absolute top-2 left-3 h-2 w-4 rounded-full bg-[#f8f7f4]"></div>
                          <div className="absolute bottom-1 right-3 h-1 w-3 rounded-full bg-[#e76f51]"></div>
                        </div>
                      )}

                      {hasDecoration("bonsai-lights") && (
                        <>
                          <div className="absolute top-10 left-1/4 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                          <div className="absolute top-16 right-1/4 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                          <div className="absolute top-8 right-1/3 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                          <div className="absolute top-20 left-1/3 h-2 w-2 rounded-full bg-[#f9c74f]"></div>
                        </>
                      )}
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
                          shopCategory === "decoration"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("decoration")}
                      >
                        Decorations
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "tools"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("tools")}
                      >
                        Tools
                      </button>
                      <button
                        className={`rounded-full px-4 py-1 text-sm font-medium ${
                          shopCategory === "growth"
                            ? "bg-[#4a7c59] text-white"
                            : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
                        }`}
                        onClick={() => setShopCategory("growth")}
                      >
                        Growth
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
                              {item.type === "decoration" && <Sparkles className="h-10 w-10 text-[#4a7c59]" />}
                              {item.type === "item" && (
                                <img
                                  src={item.image || "/placeholder.svg?height=100&width=100"}
                                  alt={item.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
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
