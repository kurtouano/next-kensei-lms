"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Lock, Check, Palette, Flower, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function BonsaiPage() {
  const [selectedTree, setSelectedTree] = useState("maple")
  const [selectedPot, setSelectedPot] = useState("traditional-blue")
  const [selectedDecorations, setSelectedDecorations] = useState(["stone-lantern"])
  const [activeTab, setActiveTab] = useState("customize")

  // Mock bonsai data
  const bonsaiData = {
    credits: 450,
    level: 3,
    trees: [
      { id: "maple", name: "Maple Bonsai", credits: 0, unlocked: true, color: "#6fb58a" },
      { id: "pine", name: "Pine Bonsai", credits: 200, unlocked: true, color: "#4a7c59" },
      { id: "cherry", name: "Cherry Blossom", credits: 500, unlocked: false, color: "#e4b1ab" },
      { id: "juniper", name: "Juniper Bonsai", credits: 750, unlocked: false, color: "#5d9e75" },
    ],
    pots: [
      { id: "traditional-blue", name: "Traditional Blue", credits: 0, unlocked: true, color: "#5b8fb0" },
      { id: "ceramic-brown", name: "Ceramic Brown", credits: 100, unlocked: true, color: "#8B5E3C" },
      { id: "glazed-green", name: "Glazed Green", credits: 300, unlocked: true, color: "#4a7c59" },
      { id: "stone-gray", name: "Stone Gray", credits: 400, unlocked: false, color: "#7D7D7D" },
      { id: "premium-gold", name: "Premium Gold", credits: 1000, unlocked: false, color: "#D4AF37" },
    ],
    decorations: [
      { id: "stone-lantern", name: "Stone Lantern", credits: 50, unlocked: true },
      { id: "moss", name: "Moss Covering", credits: 75, unlocked: true },
      { id: "pebbles", name: "Decorative Pebbles", credits: 100, unlocked: true },
      { id: "miniature-bench", name: "Miniature Bench", credits: 200, unlocked: false },
      { id: "koi-pond", name: "Koi Pond", credits: 350, unlocked: false },
      { id: "bonsai-lights", name: "Ambient Lights", credits: 500, unlocked: false },
    ],
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
    const tree = bonsaiData.trees.find((t) => t.id === selectedTree)
    return tree ? tree.color : "#6fb58a"
  }

  const getPotColor = () => {
    const pot = bonsaiData.pots.find((p) => p.id === selectedPot)
    return pot ? pot.color : "#5b8fb0"
  }

  const hasDecoration = (id) => {
    return selectedDecorations.includes(id)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f7f4]">
      {/* Header */}
      <Header isLoggedIn={true} />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#2c3e2d]">My Bonsai Garden</h1>
            <p className="text-[#5c6d5e]">Customize and grow your bonsai as you learn Japanese</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-[#eef2eb]">
              <TabsTrigger
                value="customize"
                className="data-[state=active]:bg-[#4a7c59] data-[state=active]:text-white"
              >
                <Palette className="mr-2 h-4 w-4" />
                Customize Bonsai
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
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-[#2c3e2d]">Level {bonsaiData.level} Bonsai</p>
                      <p className="text-sm text-[#5c6d5e]">{bonsaiData.credits} Credits Earned</p>
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
                      {bonsaiData.trees.map((tree) => (
                        <div
                          key={tree.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            tree.unlocked
                              ? selectedTree === tree.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                              : "cursor-not-allowed border-[#dce4d7] bg-[#f8f7f4] opacity-60"
                          }`}
                          onClick={() => tree.unlocked && setSelectedTree(tree.id)}
                        >
                          <div className="flex flex-col items-center">
                            <div className="mb-2 h-8 w-8 rounded-full" style={{ backgroundColor: tree.color }}></div>
                            <p className="text-center text-sm font-medium text-[#2c3e2d]">{tree.name}</p>
                            {!tree.unlocked && (
                              <div className="mt-1 flex items-center text-xs text-[#5c6d5e]">
                                <Lock className="mr-1 h-3 w-3" />
                                {tree.credits} credits
                              </div>
                            )}
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
                      {bonsaiData.pots.map((pot) => (
                        <div
                          key={pot.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            pot.unlocked
                              ? selectedPot === pot.id
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                              : "cursor-not-allowed border-[#dce4d7] bg-[#f8f7f4] opacity-60"
                          }`}
                          onClick={() => pot.unlocked && setSelectedPot(pot.id)}
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className="mb-2 h-6 w-12 rounded-t-sm rounded-b-md"
                              style={{ backgroundColor: pot.color }}
                            ></div>
                            <p className="text-center text-xs font-medium text-[#2c3e2d]">{pot.name}</p>
                            {!pot.unlocked && (
                              <div className="mt-1 flex items-center text-xs text-[#5c6d5e]">
                                <Lock className="mr-1 h-3 w-3" />
                                {pot.credits}
                              </div>
                            )}
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
                      {bonsaiData.decorations.map((decoration) => (
                        <div
                          key={decoration.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            decoration.unlocked
                              ? hasDecoration(decoration.id)
                                ? "border-[#4a7c59] bg-[#eef2eb]"
                                : "border-[#dce4d7] hover:border-[#4a7c59] hover:bg-[#f8f7f4]"
                              : "cursor-not-allowed border-[#dce4d7] bg-[#f8f7f4] opacity-60"
                          }`}
                          onClick={() => decoration.unlocked && toggleDecoration(decoration.id)}
                        >
                          <div className="flex items-center">
                            {decoration.unlocked && hasDecoration(decoration.id) ? (
                              <Check className="mr-2 h-5 w-5 text-[#4a7c59]" />
                            ) : decoration.unlocked ? (
                              <div className="mr-2 h-5 w-5 rounded-md border border-[#dce4d7]"></div>
                            ) : (
                              <Lock className="mr-2 h-5 w-5 text-[#5c6d5e]" />
                            )}
                            <div>
                              <p className="font-medium text-[#2c3e2d]">{decoration.name}</p>
                              {!decoration.unlocked && (
                                <p className="text-xs text-[#5c6d5e]">{decoration.credits} credits to unlock</p>
                              )}
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
      <Footer />
    </div>
  )
}
