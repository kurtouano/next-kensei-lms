// models/Bonsai.js
import mongoose from "mongoose"
import { calculateBonsaiLevel, getDefaultMilestones, updateMilestoneAchievements } from "@/lib/levelCalculator"
import { getDefaultOwnedItems, getPremiumItems, getAllShopItems } from "@/components/bonsai/shopItems"

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
    customization: {
      eyes: { type: String, default: 'default_eyes' },
      mouth: { type: String, default: 'default_mouth' },
      foliageColor: { type: String, default: '#77DD82' },
      potStyle: { type: String, default: 'default_pot' },
      potColor: { type: String, default: '#FD9475' },
      groundStyle: { type: String, default: 'default_ground' },  
      decorations: [{ type: String }],
    },
    ownedItems: [{ type: String }],
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

BonsaiSchema.set('toJSON', { virtuals: true });
BonsaiSchema.set('toObject', { virtuals: true });

// ✅ UPDATED: Use centralized config
BonsaiSchema.statics.getDefaultOwnedItems = function() {
  return getDefaultOwnedItems();
}

// ✅ UPDATED: Use centralized config
BonsaiSchema.statics.getPremiumItems = function() {
  return getPremiumItems();
}

// ✅ UPDATED: Use centralized config
BonsaiSchema.statics.getItemsByCategory = function() {
  const allItems = getAllShopItems();
  
  // Group by category for backward compatibility
  const grouped = {
    eyes: allItems.filter(item => item.category === 'eyes'),
    mouths: allItems.filter(item => item.category === 'mouths'), 
    foliage: allItems.filter(item => item.category === 'foliage'),
    pots: allItems.filter(item => item.category === 'pot'),
    potColors: allItems.filter(item => item.category === 'potColor'),
    grounds: allItems.filter(item => item.category === 'foundation'),
    decorations: allItems.filter(item => item.category === 'decoration')
  };
  
  return grouped;
}

// ✅ Check if user owns a specific item
BonsaiSchema.methods.ownsItem = function(itemId) {
  return this.ownedItems.includes(itemId);
}

// ✅ Add item to owned items
BonsaiSchema.methods.addOwnedItem = function(itemId) {
  if (!this.ownedItems.includes(itemId)) {
    this.ownedItems.push(itemId);
  }
}

// ✅ Get available items for user (owned + free items)
BonsaiSchema.methods.getAvailableItems = function() {
  const allItems = getAllShopItems();
  return allItems.filter(item => {
    return item.unlocked || this.ownsItem(item.id);
  });
}

// ✅ Get shop items (items user doesn't own yet)
BonsaiSchema.methods.getShopItems = function() {
  const allItems = getAllShopItems();
  return allItems.filter(item => {
    return !item.unlocked && !this.ownsItem(item.id);
  });
}

BonsaiSchema.statics.getDefaultMilestones = function() {
  return getDefaultMilestones();
}

BonsaiSchema.methods.syncWithUserCredits = function(userCredits) {
  this.totalCredits = userCredits;
  this.milestones = updateMilestoneAchievements(this.milestones, userCredits);
}

BonsaiSchema.index({ totalCredits: -1 })

const Bonsai = mongoose.models.Bonsai || mongoose.model("Bonsai", BonsaiSchema)

export default Bonsai