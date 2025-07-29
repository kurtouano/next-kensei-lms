import mongoose from "mongoose"

const ShopItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true, // unique identifier for SVG mapping
    },
    category: {
      type: String,
      enum: ["eyes", "mouth", "pot", "foundation", "decoration", "foliage"],
      required: true,
    },
    creditsRequired: {
      type: Number,
      required: true,
    },
    isLimited: {
      type: Boolean,
      default: false,
    },
    isUnlocked: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true },
)

const ShopItem = mongoose.models.ShopItem || mongoose.model("ShopItem", ShopItemSchema)

export default ShopItem
