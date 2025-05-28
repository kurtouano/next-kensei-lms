import mongoose from "mongoose"

const ShopItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["tree", "face", "pot", "decoration"],
      required: true,
    },
    creditsRequired: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    color: {
      type: String,
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
