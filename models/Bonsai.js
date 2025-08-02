import mongoose from "mongoose"
import { calculateBonsaiLevel, getDefaultMilestones, updateMilestoneAchievements } from "@/lib/levelCalculator"

const BonsaiSchema = new mongoose.Schema(
  {
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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

BonsaiSchema.virtual('level').get(function() {
  return calculateBonsaiLevel(this.totalCredits);
});

// Ensure virtual fields are serialized
BonsaiSchema.set('toJSON', { virtuals: true });
BonsaiSchema.set('toObject', { virtuals: true });

// Tree color mapping for frontend/backend consistency
BonsaiSchema.statics.getTreeColorMap = function() {
  return {
    "maple": "#77DD82",
    "pine": "#4a7c59", 
    "red": "#2a5c59",
    "cherry": "#e4b1ab",
    "juniper": "#5d9e75"
  };
}

// Pot color mapping
BonsaiSchema.statics.getPotColorMap = function() {
  return {
    "traditional-blue": "#FD9475",
    "ceramic-brown": "#8B5E3C",
    "glazed-green": "#4a7c59",
    "stone-gray": "#7D7D7D",
    "premium-gold": "#D4AF37"
  };
}

// Helper method to get tree key from color
BonsaiSchema.statics.getTreeKeyFromColor = function(color) {
  const colorMap = {
    "#77DD82": "maple",
    "#4a7c59": "pine", 
    "#2a5c59": "red",
    "#e4b1ab": "cherry",
    "#5d9e75": "juniper"
  };
  return colorMap[color] || "maple";
}

// Helper method to get pot key from color
BonsaiSchema.statics.getPotKeyFromColor = function(color) {
  const colorMap = {
    "#FD9475": "traditional-blue",
    "#8B5E3C": "ceramic-brown",
    "#4a7c59": "glazed-green",
    "#7D7D7D": "stone-gray",
    "#D4AF37": "premium-gold"
  };
  return colorMap[color] || "traditional-blue";
}

// ✅ UPDATE: Use utility function instead of static method
BonsaiSchema.statics.getDefaultMilestones = function() {
  return getDefaultMilestones();
}

// Get default owned items for new users
BonsaiSchema.statics.getDefaultOwnedItems = function() {
  return [
    // Default eyes and mouth (everyone gets these)
    'default_eyes', 
    'default_mouth', 
    
    // Default tree colors (basic ones everyone gets)
    'maple',
    'pine', 
    'red',
    
    // Default pot styles (basic ones everyone gets)  
    'traditional-blue',
    'ceramic-brown',
    'glazed-green'
  ];
}

// ✅ UPDATE: Simplified update method using utility functions
BonsaiSchema.methods.syncWithUserCredits = function(userCredits) {
  // Update total credits
  this.totalCredits = userCredits;
  
  // Update milestone achievements using utility function
  this.milestones = updateMilestoneAchievements(this.milestones, userCredits);
  
  // Note: level is calculated dynamically via virtual field
}

BonsaiSchema.index({ totalCredits: -1 })

const Bonsai = mongoose.models.Bonsai || mongoose.model("Bonsai", BonsaiSchema)

export default Bonsai