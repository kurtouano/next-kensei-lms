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
      eyes: { type: String, default: 'default_eyes' },
      mouth: { type: String, default: 'default_mouth' },
      foliageColor: { type: String, default: '#77DD82' },
      potStyle: { type: String, default: 'traditional-blue' },
      potColor: { type: String, default: '#FD9475' },
      foundation: { type: String, default: 'shadow' },
      decorations: [{ type: String }], // array of decoration keys
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

// Create default milestones for new bonsai
BonsaiSchema.statics.getDefaultMilestones = function() {
  return [
    { 
      level: 1, 
      name: "Seedling", 
      description: "You've started your bonsai journey", 
      creditsRequired: 0, 
      isAchieved: true, 
      achievedAt: new Date() 
    },
    { 
      level: 2, 
      name: "Sapling", 
      description: "Your bonsai is growing steadily", 
      creditsRequired: 200, 
      isAchieved: false 
    },
    { 
      level: 3, 
      name: "Young Tree", 
      description: "Your bonsai is developing character", 
      creditsRequired: 800, 
      isAchieved: false 
    }
  ];
}

// Get default owned items for new users
BonsaiSchema.statics.getDefaultOwnedItems = function() {
  return [
    'default_eyes', 
    'default_mouth', 
    'maple', 
    'traditional-blue'
  ];
}

// Index for efficient queries - removed duplicate userRef unique constraint
BonsaiSchema.index({ level: 1 })
BonsaiSchema.index({ totalCredits: -1 })

const Bonsai = mongoose.models.Bonsai || mongoose.model("Bonsai", BonsaiSchema)

export default Bonsai