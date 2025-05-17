import mongoose from "mongoose"

const BonsaiSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    experience: {
      type: Number,
      default: 0,
    },
    tree: {
      type: {
        type: String,
        enum: ["maple", "pine", "cherry", "juniper"],
        default: "maple",
      },
      color: {
        type: String,
        default: "#6fb58a",
      },
      unlocked: [
        {
          type: String,
          enum: ["maple", "pine", "cherry", "juniper"],
        },
      ],
    },
    pot: {
      type: {
        type: String,
        enum: ["traditional-blue", "ceramic-brown", "glazed-green", "stone-gray", "premium-gold"],
        default: "traditional-blue",
      },
      color: {
        type: String,
        default: "#5b8fb0",
      },
      unlocked: [
        {
          type: String,
          enum: ["traditional-blue", "ceramic-brown", "glazed-green", "stone-gray", "premium-gold"],
        },
      ],
    },
    decorations: {
      active: [
        {
          type: String,
          enum: ["stone-lantern", "moss", "pebbles", "miniature-bench", "koi-pond", "bonsai-lights"],
        },
      ],
      unlocked: [
        {
          type: String,
          enum: ["stone-lantern", "moss", "pebbles", "miniature-bench", "koi-pond", "bonsai-lights"],
        },
      ],
    },
    inventory: [
      {
        itemId: {
          type: String,
          required: true,
        },
        itemType: {
          type: String,
          enum: ["tree", "pot", "decoration", "item"],
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
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

// Initialize default unlocked items
BonsaiSchema.pre("save", function (next) {
  if (this.isNew) {
    this.tree.unlocked = ["maple"]
    this.pot.unlocked = ["traditional-blue"]
    this.decorations.unlocked = ["stone-lantern", "moss", "pebbles"]
    this.decorations.active = ["stone-lantern"]

    // Default milestones
    this.milestones = [
      {
        level: 1,
        name: "Seedling",
        description: "You've started your bonsai journey",
        creditsRequired: 0,
        isAchieved: true,
        achievedAt: Date.now(),
      },
      {
        level: 2,
        name: "Sapling",
        description: "Your bonsai is growing steadily",
        creditsRequired: 200,
        isAchieved: false,
      },
      {
        level: 3,
        name: "Young Tree",
        description: "Your bonsai is developing character",
        creditsRequired: 400,
        isAchieved: false,
      },
      {
        level: 5,
        name: "Mature Tree",
        description: "Your bonsai shows signs of wisdom",
        creditsRequired: 800,
        isAchieved: false,
      },
      {
        level: 10,
        name: "Ancient Bonsai",
        description: "Your bonsai has reached legendary status",
        creditsRequired: 2000,
        isAchieved: false,
      },
    ]
  }
  next()
})

const Bonsai = mongoose.models.Bonsai || mongoose.model("Bonsai", BonsaiSchema)

export default Bonsai
