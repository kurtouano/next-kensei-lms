import mongoose from "mongoose"

const ShopItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["tree", "pot", "decoration", "item"],
      required: true,
    },
    category: {
      type: String,
      enum: ["tree", "pot", "decoration", "tools", "growth", "knowledge"],
      required: true,
    },
    credits: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    color: {
      type: String,
    },
    effects: [
      {
        type: {
          type: String,
          enum: ["credit_boost", "experience_boost", "unlock_feature", "visual"],
        },
        value: {
          type: mongoose.Schema.Types.Mixed,
        },
        description: {
          type: String,
        },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isLimited: {
      type: Boolean,
      default: false,
    },
    limitedUntil: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

const ShopItem = mongoose.models.ShopItem || mongoose.model("ShopItem", ShopItemSchema)

export default ShopItem
