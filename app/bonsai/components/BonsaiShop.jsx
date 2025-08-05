"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Eye, Sparkles } from "lucide-react"
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
  getGroundStyle,
  selectedPotStyle,
}) => {
  const [shopCategory, setShopCategory] = useState("all")

  // ✅ REMOVED: Delete the entire mockData object

  // ✅ NEW: Get shop items from Bonsai model data instead of mockData
  const getShopItemsFromModel = useMemo(() => {
    if (!bonsaiData) return [];

    // Get all available items from the model structure
    const allItems = [
      ...[
        { id: "default_ground", name: "Default Shadow", credits: 0, unlocked: true, category: "foundation" },
        { id: "flowery_ground", name: "Flowery Ground", credits: 50, unlocked: false, category: "foundation" },
        { id: "lilypad_ground", name: "Lily Pad", credits: 75, unlocked: false, category: "foundation" },
        { id: "skate_ground", name: "Skate Ground", credits: 100, unlocked: false, category: "foundation" },
        { id: "mushroom_ground", name: "Mushroom Ground", credits: 150, unlocked: false, category: "foundation" },
      ].map(item => ({ ...item, type: "foundation" })),

      // Pot style items
      ...[
        { id: "default_pot", name: "Default Pot", credits: 0, unlocked: true, category: "pot" },
        { id: "wide_pot", name: "Wide Pot", credits: 0, unlocked: true, category: "pot" },
        { id: "slim_pot", name: "Slim Pot", credits: 0, unlocked: true, category: "pot" },
        { id: "mushroom_pot", name: "Mushroom Pot", credits: 300, unlocked: false, category: "pot" },
      ].map(item => ({ ...item, type: "pot" })),

      // Decoration items
      ...[
        { id: "crown_decoration", name: "Crown", credits: 200, unlocked: false, category: "decoration", description: "A royal crown for your majestic bonsai" },
        { id: "graduate_cap_decoration", name: "Graduate Cap", credits: 150, unlocked: false, category: "decoration", description: "Celebrate your learning achievements" },
        { id: "christmas_cap_decoration", name: "Christmas Cap", credits: 100, unlocked: false, category: "decoration", description: "Festive holiday decoration" },
      ].map(item => ({ ...item, type: "decoration" })),

      // Foliage items
      ...[
        { id: "cherry_blossom_foliage", name: "Cherry Blossom", credits: 250, unlocked: false, category: "foliage", color: "#FFB7C5" },
        { id: "autumn_red_foliage", name: "Autumn Red", credits: 200, unlocked: false, category: "foliage", color: "#CC5500" },
        { id: "golden_foliage", name: "Golden", credits: 300, unlocked: false, category: "foliage", color: "#FFD700" },
      ].map(item => ({ ...item, type: "foliage" })),
    ];

    // ✅ FILTER: Only show items that are NOT owned and cost credits
    return allItems.filter(item => {
      // Hide free items (they should be available by default)
      if (item.credits === 0 || item.unlocked) return false;
      
      // Hide if user already owns the item
      return !bonsaiData?.ownedItems?.includes(item.id);
    });

  }, [bonsaiData]);

  // ✅ NEW: Function to get the pot style for preview
  const getPotStyle = () => {
    if (previewItem && previewItem.type === "pot" && !previewItem.color) {
      // This is a pot STYLE item (like mushroom_pot), not a pot COLOR item
      return previewItem.id
    }
    return selectedPotStyle || "default_pot"
  }

  // ✅ UPDATED: Fix preview logic for pot items
  const previewShopItem = (item) => {
    if (item.type === "foundation") {
      setPreviewItem({ ...item, originalFoundation: getGroundStyle() })
    } else if (item.type === "pot") {
      // Distinguish between pot styles and pot colors
      if (item.color) {
        // This is a pot color item
        setPreviewItem({ ...item, isPotColor: true })
      } else {
        // This is a pot style item  
        setPreviewItem({ ...item, isPotStyle: true })
      }
    } else {
      setPreviewItem(item)
    }
  }

  const clearPreview = () => {
    setPreviewItem(null)
  }

  // ✅ UPDATED: Use shop items from model instead of mockData
  const allShopItems = getShopItemsFromModel;

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
        setPreviewItem(null) // Clear preview after purchase
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

  // ✅ NEW: Get item emoji for display
  const getItemEmoji = (item) => {
    const emojiMap = {
      // Foundations
      "lilypad_ground": "🪷",
      "skate_ground": "🛼", 
      "mushroom_ground": "🍄",
      "flowery_ground": "🌸",
      
      // Pots
      "mushroom_pot": "🍄",
      
      // Decorations
      "crown_decoration": "👑",
      "graduate_cap_decoration": "🎓",
      "christmas_cap_decoration": "🎅",
      
      // Foliage
      "cherry_blossom_foliage": "🌸",
      "autumn_red_foliage": "🍂", 
      "golden_foliage": "✨"
    }
    return emojiMap[item.id] || "🎁"
  }

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
                treeColor={previewItem?.type === "foliage" ? previewItem.color : getTreeColor()} 
                decorations={getActiveDecorations()}
                selectedEyes={selectedEyes}
                selectedMouth={selectedMouth}
                potColor={getPotColor()} 
                selectedPotStyle={getPotStyle()} // ✅ FIXED: Use dynamic pot style
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

          {/* ✅ UPDATED: Category filters with real counts */}
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
                shopCategory === "foundation"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("foundation")}
            >
              Foundations ({allShopItems.filter(i => i.type === "foundation").length})
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
              <Sparkles className="inline w-3 h-3 mr-1" />
              Decorations ({allShopItems.filter(i => i.type === "decoration").length})
            </button>
            <button
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                shopCategory === "foliage"
                  ? "bg-[#4a7c59] text-white"
                  : "bg-[#eef2eb] text-[#2c3e2d] hover:bg-[#dce4d7]"
              }`}
              onClick={() => setShopCategory("foliage")}
            >
              Foliage ({allShopItems.filter(i => i.type === "foliage").length})
            </button>
          </div>

          {/* ✅ Shop items grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredShopItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-lg border border-[#dce4d7] bg-[#f8f7f4] p-4 transition-all hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
                    item.type === 'decoration' ? 'bg-purple-500' :
                    item.type === 'foundation' ? 'bg-green-500' :
                    item.type === 'pot' ? 'bg-orange-500' :
                    item.type === 'foliage' ? 'bg-pink-500' : 'bg-blue-500'
                  }`}>
                    {item.type === 'decoration' && <Sparkles className="inline w-3 h-3 mr-1" />}
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </span>
                  <span className="flex items-center text-sm font-medium text-[#2c3e2d]">
                    💰 {item.credits}
                  </span>
                </div>
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-white flex items-center justify-center text-3xl">
                    {item.type === "foliage" ? (
                      <div 
                        className="w-12 h-12 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: item.color }}
                      />
                    ) : (
                      getItemEmoji(item)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[#2c3e2d]">{item.name}</h3>
                    <p className="text-sm text-[#5c6d5e]">
                      {item.description || 
                       (item.type === "foundation" ? "Changes the base under your bonsai" :
                        item.type === "pot" ? "New pot style for your bonsai" :
                        item.type === "decoration" ? "Decorative accessory for your bonsai" :
                        item.type === "foliage" ? "Premium foliage color" :
                        `Unlock this ${item.type} for your bonsai`)}
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

          {/* ✅ UPDATED: Empty state message */}
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