import mongoose from "mongoose"

const BonsaiSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
    tree: {
      level: {
        type: Number,
        default: 1,
        max: 10,
        min: 1,
      },
      type: {
        type: String,
        enum: ["maple", "pine", "cherry", "juniper"],
        default: "maple",
      },
      color: {
        type: String,
        default: "#6fb58a",
      },
    },
    pot: {
      type: {
        type: String,
        enum: ["clay", "ceramic", "plastic", "stone"],
        default: "clay",
      },
      size: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
    },
    decoration: {
      type: {
        type: String,
        enum: ["stone", "figurine", "lantern", "waterfall"],
        default: "stone",
      },
      style: {
        type: String,
        enum: ["traditional", "modern", "rustic"],
        default: "traditional",
      },
    },
    inventory: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ShopItem"
        },
        acquiredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    milestones: [
      {
        level: {
          type: Number,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        creditsRequired: {
          type: Number,
          required: true,
        },
        isAchieved: {
          type: Boolean,
          default: false,
        },
        achievedAt: {
          type: Date,
        },
      },
    ],
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

const Bonsai = mongoose.models.Bonsai || mongoose.model("Bonsai", BonsaiSchema)

export default Bonsai
