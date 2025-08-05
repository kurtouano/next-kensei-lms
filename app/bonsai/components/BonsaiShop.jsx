"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Eye, Sparkles } from "lucide-react"
import { BonsaiSVG } from "./BonsaiSVG"
import { getPurchasableItems, getItemEmoji } from "@/components/bonsai/shopItems"

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
  getGroundStyle,
  selectedPotStyle,
}) => {
  const [shopCategory, setShopCategory] = useState("all")

  // ✅ CLEAN: Get shop items from centralized config
  const allShopItems = useMemo(() => {
    return getPurchasableItems(bonsaiData?.ownedItems || []);
  }, [bonsaiData?.ownedItems]);

  // ✅ NEW: Function to get the pot style for preview
  const getPotStyle = () => {
    if (previewItem && previewItem.type === "pot" && !previewItem.color) {
      return previewItem.id
    }
    return selectedPotStyle || "default_pot"
  }

  // ✅ UPDATED: Fix preview logic for all item types
  const previewShopItem = (item) => {
    if (item.type === "ground") {
      setPreviewItem({ ...item, originalGround: getGroundStyle() })
    } else if (item.type === "pot") {
      setPreviewItem({ ...item, isPotStyle: true })
    } else if (item.type === "eyes") {
      setPreviewItem({ ...item, isEyes: true })
    } else if (item.type === "mouths") {
      setPreviewItem({ ...item, isMouth: true })
    } else {
      setPreviewItem(item)
    }
  }

  const clearPreview = () => {
    setPreviewItem(null)
  }

  // ✅ Purchase item function (unchanged)
  const purchaseItem = async (item) => {
    if (credits < item.credits) {
      alert("Not enough credits to purchase this item!")
      return
    }

    try {
      const response = await fetch(`/api/bonsai/${bonsaiData.userRef}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemKey: item.id,
          itemCredits: item.credits
        })
      })

      if (response.ok) {
        const data = await response.json()
        setCredits(data.remainingCredits)
        setBonsaiData(prev => ({
          ...prev,
          ownedItems: data.ownedItems
        }))
        alert(`Successfully purchased ${item.name}!`)
        setPreviewItem(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to purchase: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error purchasing item:', error)
      alert('Failed to purchase item')
    }
  }

  const filteredShopItems = shopCategory === "all" 
    ? allShopItems 
    : allShopItems.filter((item) => item.category === shopCategory || item.type === shopCategory)

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Bonsai Preview - Fixed/Sticky for Shop */}
      <div className="md:sticky md:top-20 md:self-start md:h-fit">
        <div className="rounded-lg border border-[#dce4d7] bg-white p-6 shadow-sm min-h-[500px] flex flex-col justify-center">
          <h2 className="mb-6 text-xl font-semibold text-center text-[#2c3e2d]">
            {previewItem ? "Item Preview" : "Your Bonsai"}
          </h2>
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="mb-6">
              <BonsaiSVG 
                level={bonsaiData.level}
                treeColor={getTreeColor()} 
                decorations={getActiveDecorations()}
                selectedEyes={previewItem && previewItem.isEyes ? previewItem.id : selectedEyes}
                selectedMouth={previewItem && previewItem.isMouth ? previewItem.id : selectedMouth}
                potColor={getPotColor()} 
                selectedPotStyle={getPotStyle()}
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

          {/* Category filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "all"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("all")}
            >
              All Items ({allShopItems.length})
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "eyes"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("eyes")}
            >
              Eyes ({allShopItems.filter(i => i.type === "eyes").length})
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "mouths"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("mouths")}
            >
              Mouths ({allShopItems.filter(i => i.type === "mouths").length})
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "ground"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("ground")}
            >
              Ground ({allShopItems.filter(i => i.type === "ground").length})
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "pot"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("pot")}
            >
              Pots ({allShopItems.filter(i => i.type === "pot").length})
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "decoration"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("decoration")}
            >
              Decorations ({allShopItems.filter(i => i.type === "decoration").length})
            </button>
          </div>

          {/* Shop items grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredShopItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-lg border border-[#dce4d7] bg-[#f8f7f4] p-4 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                    item.type === 'decoration' ? 'bg-purple-500' :
                    item.type === 'ground' ? 'bg-green-500' :
                    item.type === 'pot' ? 'bg-orange-500' : 
                    item.type === 'eyes' ? 'bg-blue-500' :
                    item.type === 'mouths' ? 'bg-pink-500' : 'bg-gray-500'
                  }`}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <span className="flex items-center text-sm font-medium text-[#2c3e2d]">
                    💰 {item.credits}
                  </span>
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-white flex items-center justify-center text-3xl">
                     {getItemEmoji(item.id)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#2c3e2d]">{item.name}</h3>
                    <p className="text-sm text-[#5c6d5e]">
                      {item.description}
                    </p>
                    {item.credits > 200 && (
                      <span className="inline-block mt-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                        Premium
                      </span>
                    )}
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
                    {credits >= item.credits ? 'Purchase' : 'Not enough credits'}
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

          {/* Empty state */}
          {filteredShopItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-[#5c6d5e] mb-2">
                {shopCategory === "all" 
                  ? "All items are already owned!"
                  : `All ${shopCategory} items are already owned!`
                }
              </div>
              <p className="text-sm text-[#5c6d5e]">Complete courses to earn more credits and unlock new items.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}