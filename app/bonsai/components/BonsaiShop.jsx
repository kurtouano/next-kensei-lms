"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Eye } from "lucide-react"
import { BonsaiSVG } from "./BonsaiSVG"

export const BonsaiShop = ({ 
  bonsaiData, 
  credits, 
  setCredits,
  setBonsaiData,
  previewItem,
  setPreviewItem,
  getTreeColor,
  getPotColor,
  getActiveDecorations,
  selectedEyes,
  selectedMouth,
  getGroundStyle 
}) => {
  const [shopCategory, setShopCategory] = useState("all")

  // Mock data for shop items
  const mockData = {
    foundations: [
      { id: "shadow", name: "Default Shadow", credits: 0, unlocked: true, category: "foundation" },
      { id: "lily_pad", name: "Lily Pad", credits: 50, unlocked: false, category: "foundation" },
      { id: "stone_circle", name: "Stone Circle", credits: 75, unlocked: false, category: "foundation" },
      { id: "flower_bed", name: "Flower Bed", credits: 100, unlocked: false, category: "foundation" },
      { id: "zen_sand", name: "Zen Sand", credits: 150, unlocked: false, category: "foundation" },
    ],
    accessories: [
      { id: "butterfly", name: "Butterfly", credits: 25, unlocked: false, category: "decoration" },
      { id: "bird", name: "Small Bird", credits: 40, unlocked: false, category: "decoration" },
      { id: "lantern", name: "Mini Lantern", credits: 60, unlocked: false, category: "decoration" },
      { id: "mushroom", name: "Mushroom", credits: 30, unlocked: false, category: "decoration" },
      { id: "bamboo", name: "Bamboo Stick", credits: 35, unlocked: false, category: "decoration" },
    ],
  }

  const isItemAvailable = (item, bonsaiData) => {
    // Always show basic/free items (0 credits)
    if (item.credits === 0) return true;
    
    // Show if user owns the item
    return bonsaiData?.ownedItems?.includes(item.id) || false;
  };

  // Combine all items for the shop
  const allShopItems = [
    ...mockData.foundations.filter((item) => !isItemAvailable(item, bonsaiData)).map((item) => ({ ...item, type: "foundation" })),
    ...mockData.accessories.filter((item) => !isItemAvailable(item, bonsaiData)).map((item) => ({ ...item, type: "decoration" })),
  ]

  const purchaseItem = (item) => {
    if (credits >= item.credits) {
      setCredits(credits - item.credits)
      // Add item to owned items in bonsaiData
      setBonsaiData(prev => ({
        ...prev,
        ownedItems: [...prev.ownedItems, item.id]
      }))
      alert(`Successfully purchased ${item.name}!`)
    } else {
      alert("Not enough credits to purchase this item!")
    }
  }

  const previewShopItem = (item) => {
    if (item.type === "foundation") {
      setPreviewItem({ ...item, originalFoundation: getGroundStyle() })
    } else {
      setPreviewItem(item)
    }
  }

  const clearPreview = () => {
    setPreviewItem(null)
  }

  const filteredShopItems = shopCategory === "all" 
    ? allShopItems 
    : allShopItems.filter((item) => item.category === shopCategory || item.type === shopCategory)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Bonsai Preview - Fixed/Sticky for Shop */}
      <div className="md:sticky md:top-20 md:self-start md:h-fit">
        <div className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-lg min-h-[500px] flex flex-col justify-center">
          <h2 className="mb-6 text-xl font-semibold text-center text-[#2c3e2d]">
            {previewItem ? "Item Preview" : "Your Bonsai"}
          </h2>
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="mb-6">
              <BonsaiSVG 
                level={bonsaiData.level}
                treeColor={getTreeColor()} 
                decorations={getActiveDecorations()}
                selectedEyes={selectedEyes}
                selectedMouth={selectedMouth}
                potColor={getPotColor()} 
                selectedPotStyle="default_pot"
                selectedGroundStyle={getGroundStyle()} 
              />
            </div>
            <div className="text-center mb-4">
              {previewItem ? (
                <>
                  <p className="font-medium text-[#2c3e2d]">{previewItem.name}</p>
                  <p className="text-sm text-[#5c6d5e]">{previewItem.credits} Credits</p>
                  <Button
                    onClick={clearPreview}
                    variant="outline"
                    className="mt-2 text-[#4a7c59] border-[#4a7c59] text-xs px-3 py-1"
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
            
            {/* Credits Display */}
            <div className="px-4 py-2 bg-[#eef2eb] rounded-full">
              <p className="text-sm text-[#4a7c59] font-medium">💰 {credits} Credits</p>
            </div>
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
              <span className="font-medium text-[#2c3e2d]">{credits} Credits</span>
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
                shopCategory === "foundation"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("foundation")}
            >
              Foundations
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "decoration"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("decoration")}
            >
              Accessories
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
                    {item.type === "foundation" && (
                      <div className="flex items-center justify-center text-2xl">
                        {item.id === "lily_pad" && "🪷"}
                        {item.id === "stone_circle" && "⭕"}
                        {item.id === "flower_bed" && "🌸"}
                        {item.id === "zen_sand" && "🏜️"}
                        {item.id === "shadow" && "⚫"}
                      </div>
                    )}
                    {item.type === "decoration" && (
                      <div className="flex items-center justify-center text-2xl">
                        {item.id === "butterfly" && "🦋"}
                        {item.id === "bird" && "🐦"}
                        {item.id === "lantern" && "🏮"}
                        {item.id === "mushroom" && "🍄"}
                        {item.id === "bamboo" && "🎋"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#2c3e2d]">{item.name}</h3>
                    <p className="text-sm text-[#5c6d5e]">
                      {item.type === "foundation" ? "Changes the base under your bonsai" :
                       item.type === "decoration" ? "Decorative accessory for your bonsai" :
                       `Unlock this ${item.type} for your bonsai`}
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

          {filteredShopItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#5c6d5e] mb-2">All items in this category are already owned!</div>
              <p className="text-sm text-[#5c6d5e]">Check other categories or complete courses to earn more credits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}