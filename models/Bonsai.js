// models/Bonsai.js
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
    customization: {
      eyes: { type: String, default: 'default_eyes' },
      mouth: { type: String, default: 'default_mouth' },
      foliageColor: { type: String, default: '#77DD82' },
      potStyle: { type: String, default: 'default_pot' },
      potColor: { type: String, default: '#FD9475' },
      groundStyle: { type: String, default: 'default_ground' },  
      decorations: [{ type: String }], // Array of decoration IDs
    },
    ownedItems: [{ type: String }], // All items the user owns
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

BonsaiSchema.statics.getDefaultOwnedItems = function() {
  return [
    // Default/Free Eyes
    'default_eyes', 
    'cry_eyes',
    'happy_eyes',
    'flat_eyes',
    'wink_eyes',
    'puppy_eyes',
    'female_eyes',
    
    // Default/Free Mouths
    'default_mouth', 
    'smile_mouth',
    'kiss_mouth',
    'surprised_mouth',
    'bone_mouth',
    
    // Default/Free Tree Colors
    'default_foliage',
    'forest_green_foliage',
    
    // ✅ Default/Free Pot Styles 
    'default_pot',
    'wide_pot',
    'slim_pot',
    
    //  Default/Free Pot Colors 
    'default_pot_color',
    'brown_pot_color',
    
    'default_ground',
  ];
}

// ✅ UPDATED: Items that must be purchased (expanded list)
BonsaiSchema.statics.getPremiumItems = function() {
  return [
    // Premium Ground Styles (must be purchased)
    'flowery_ground',    
    'lilypad_ground',
    'skate_ground', 
    'mushroom_ground',
    
    // Premium Pot Styles (must be purchased)
    'mushroom_pot',   

    // Premium Decorations (must be purchased)
    'crown_decoration',
    'graduate_cap_decoration',
    'christmas_cap_decoration',
    
    // Premium Tree Colors (must be purchased)
    'cherry_blossom_foliage',
    'autumn_red_foliage',
    'golden_foliage',
    
    // Premium Pot Colors (must be purchased)
    'ceramic_blue_pot',
    'jade_green_pot',
    'gold_pot',
  ];
}

// ✅ Get all available items by category
BonsaiSchema.statics.getItemsByCategory = function() {
  return {
    eyes: [
      { id: 'default_eyes', name: 'Default Eyes', credits: 0, unlocked: true },
      { id: 'cry_eyes', name: 'Crying Eyes', credits: 0, unlocked: true },
      { id: 'happy_eyes', name: 'Happy Eyes', credits: 0, unlocked: true },
      { id: 'flat_eyes', name: 'Sleepy Eyes', credits: 0, unlocked: true },
      { id: 'wink_eyes', name: 'Winking Eyes', credits: 0, unlocked: true },
      { id: 'puppy_eyes', name: 'Puppy Eyes', credits: 0, unlocked: true },
      { id: 'female_eyes', name: 'Elegant Eyes', credits: 0, unlocked: true },
    ],
    mouths: [
      { id: 'default_mouth', name: 'Default Smile', credits: 0, unlocked: true },
      { id: 'smile_mouth', name: 'Big Smile', credits: 0, unlocked: true },
      { id: 'kiss_mouth', name: 'Kiss', credits: 0, unlocked: true },
      { id: 'surprised_mouth', name: 'Surprised', credits: 0, unlocked: true },
      { id: 'bone_mouth', name: 'Playful', credits: 0, unlocked: true },
    ],
    foliage: [
      { id: 'default_foliage', name: 'Default Green', credits: 0, unlocked: true, color: '#77DD82' },
      { id: 'forest_green_foliage', name: 'Forest Green', credits: 0, unlocked: true, color: '#4a7c59' },
      { id: 'cherry_blossom_foliage', name: 'Cherry Blossom', credits: 250, unlocked: false, color: '#FFB7C5' },
      { id: 'autumn_red_foliage', name: 'Autumn Red', credits: 200, unlocked: false, color: '#CC5500' },
      { id: 'golden_foliage', name: 'Golden', credits: 300, unlocked: false, color: '#FFD700' },
    ],
    pots: [
      { id: 'default_pot', name: 'Default Pot', credits: 0, unlocked: true },
      { id: 'wide_pot', name: 'Wide Pot', credits: 0, unlocked: true },
      { id: 'slim_pot', name: 'Slim Pot', credits: 0, unlocked: true },
      { id: 'mushroom_pot', name: 'Mushroom Pot', credits: 200, unlocked: false }, 
    ],
    potColors: [
      { id: 'default_pot_color', name: 'Default Orange', credits: 0, unlocked: true, color: '#FD9475' },
      { id: 'brown_pot_color', name: 'Earth Brown', credits: 0, unlocked: true, color: '#8B5E3C' },
      { id: 'ceramic_blue_pot', name: 'Ceramic Blue', credits: 100, unlocked: false, color: '#4682B4' },
      { id: 'jade_green_pot', name: 'Jade Green', credits: 150, unlocked: false, color: '#00A86B' },
      { id: 'gold_pot', name: 'Gold', credits: 250, unlocked: false, color: '#FFD700' },
    ],
    grounds: [
      { id: 'default_ground', name: 'Default Shadow', credits: 0, unlocked: true },
      { id: 'flowery_ground', name: 'Flowery Ground', credits: 50, unlocked: false }, 
      { id: 'lilypad_ground', name: 'Lily Pad', credits: 75, unlocked: false },
      { id: 'skate_ground', name: 'Skate Ground', credits: 100, unlocked: false },
      { id: 'mushroom_ground', name: 'Mushroom Ground', credits: 150, unlocked: false },
    ],
    decorations: [
      { id: 'crown_decoration', name: 'Crown', credits: 200, unlocked: false },
      { id: 'graduate_cap_decoration', name: 'Graduate Cap', credits: 150, unlocked: false },
      { id: 'christmas_cap_decoration', name: 'Christmas Cap', credits: 100, unlocked: false },
    ]
  };
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
  const allItems = this.constructor.getItemsByCategory();
  const userItems = {};
  
  Object.keys(allItems).forEach(category => {
    userItems[category] = allItems[category].filter(item => {
      return item.unlocked || this.ownsItem(item.id);
    });
  });
  
  return userItems;
}

// ✅ Get shop items (items user doesn't own yet)
BonsaiSchema.methods.getShopItems = function() {
  const allItems = this.constructor.getItemsByCategory();
  const shopItems = [];
  
  Object.keys(allItems).forEach(category => {
    allItems[category].forEach(item => {
      if (!item.unlocked && !this.ownsItem(item.id)) {
        shopItems.push({
          ...item,
          category,
          type: category === 'decorations' ? 'decoration' : category.slice(0, -1) // Remove 's' from category
        });
      }
    });
  });
  
  return shopItems;
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