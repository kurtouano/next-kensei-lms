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
      min: 1,
      max: 3,
    },
    totalCredits: {
      type: Number,
      default: 0,
    },
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
    // --- Customization fields for user-selected bonsai parts ---
    customization: {
      eyes: { type: String, default: 'default' }, // key to SVG
      mouth: { type: String, default: 'default' }, // key to SVG
      foliageColor: { type: String, default: '#6fb58a' }, // hex color
      potStyle: { type: String, default: 'clay' }, // key to SVG or style
      potColor: { type: String, default: '#8B4513' }, // hex color for pot
      foundation: { type: String, default: 'shadow' }, // key to foundation/base SVG (shadow, lilypad, stone, etc)
      decorations: [{ type: String }], // array of keys to SVGs
    },
    // --- Owned items (unlocked part keys) ---
    ownedItems: [{ type: String }], // keys of items the user owns
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
