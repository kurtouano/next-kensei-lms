// components/bonsai/shopItems.js
// SINGLE SOURCE OF TRUTH for all bonsai shop items

export const SHOP_ITEMS = {
  eyes: [
    { 
      id: "default_eyes", 
      name: "Default Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "👀",
      description: "Classic default eye style"
    },
    { 
      id: "cry_eyes", 
      name: "Crying Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "😢",
      description: "Always available crying eyes"
    },
    { 
      id: "happy_eyes", 
      name: "Happy Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "😊",
      description: "Always available happy eyes"
    },
    { 
      id: "flat_eyes", 
      name: "Sleepy Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "😴",
      description: "Always available sleepy eyes"
    },
    { 
      id: "wink_eyes", 
      name: "Winking Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "😉",
      description: "Always available winking eyes"
    },
    { 
      id: "puppy_eyes", 
      name: "Puppy Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "🥺",
      description: "Always available puppy eyes"
    },
    { 
      id: "female_eyes", 
      name: "Elegant Eyes", 
      credits: 0, 
      unlocked: true, 
      category: "eyes",
      emoji: "💄",
      description: "Always available elegant eyes"
    },
  ],

  mouths: [
    { 
      id: "default_mouth", 
      name: "Default Smile", 
      credits: 0, 
      unlocked: true, 
      category: "mouths",
      emoji: "😊",
      description: "Classic default smile"
    },
    { 
      id: "smile_mouth", 
      name: "Big Smile", 
      credits: 0, 
      unlocked: true, 
      category: "mouths",
      emoji: "😃",
      description: "Always available big smile"
    },
    { 
      id: "kiss_mouth", 
      name: "Kiss", 
      credits: 0, 
      unlocked: true, 
      category: "mouths",
      emoji: "😘",
      description: "Always available kiss mouth"
    },
    { 
      id: "surprised_mouth", 
      name: "Surprised", 
      credits: 0, 
      unlocked: true, 
      category: "mouths",
      emoji: "😮",
      description: "Always available surprised mouth"
    },
    { 
      id: "bone_mouth", 
      name: "Playful", 
      credits: 0, 
      unlocked: true, 
      category: "mouths",
      emoji: "😛",
      description: "Always available playful mouth"
    },
  ],

  grounds: [
    { 
      id: "default_ground", 
      name: "Default Shadow", 
      credits: 0, 
      unlocked: true, 
      category: "ground",
      emoji: "⚫",
      description: "Classic shadow base for your bonsai"
    },
    { 
      id: "flowery_ground", 
      name: "Flowery Ground", 
      credits: 50, 
      unlocked: false, 
      category: "ground",
      emoji: "🌸",
      description: "Beautiful flowery garden base"
    },
    { 
      id: "lilypad_ground", 
      name: "Lily Pad", 
      credits: 75, 
      unlocked: false, 
      category: "ground",
      emoji: "🪷",
      description: "Serene water lily pond setting" 
    },
    { 
      id: "skate_ground", 
      name: "Skate Ground", 
      credits: 100, 
      unlocked: false, 
      category: "ground",
      emoji: "🛼",
      description: "Fun skating rink surface"
    },
    { 
      id: "mushroom_ground", 
      name: "Mushroom Ground", 
      credits: 150, 
      unlocked: false, 
      category: "ground",
      emoji: "🍄",
      description: "Magical mushroom forest floor"
    },
  ],

  potStyles: [
    { 
      id: "default_pot", 
      name: "Default Pot", 
      credits: 0, 
      unlocked: true, 
      category: "pot",
      emoji: "🪴",
      description: "Classic ceramic pot design"
    },
    { 
      id: "wide_pot", 
      name: "Wide Pot", 
      credits: 0, 
      unlocked: true, 
      category: "pot",
      emoji: "🏺",
      description: "Spacious wide-style pot"
    },
    { 
      id: "slim_pot", 
      name: "Slim Pot", 
      credits: 0, 
      unlocked: true, 
      category: "pot",
      emoji: "🧱",
      description: "Elegant slim-profile pot"
    },
    { 
      id: "mushroom_pot", 
      name: "Mushroom Pot", 
      credits: 300, 
      unlocked: false, 
      category: "pot",
      emoji: "🍄",
      description: "Whimsical mushroom-shaped pot"
    },
  ],

  decorations: {
    hats: [
      { 
        id: "crown_decoration", 
        name: "Crown", 
        credits: 200, 
        unlocked: false, 
        category: "decoration",
        subcategory: "hats",
        emoji: "👑",
        description: "A royal crown for your majestic bonsai"
      },
      { 
        id: "graduate_cap_decoration", 
        name: "Graduate Cap", 
        credits: 150, 
        unlocked: false, 
        category: "decoration",
        subcategory: "hats",
        emoji: "🎓",
        description: "Celebrate your learning achievements"
      },
      { 
        id: "christmas_cap_decoration", 
        name: "Christmas Cap", 
        credits: 100, 
        unlocked: false, 
        category: "decoration",
        subcategory: "hats",
        emoji: "🎅",
        description: "Festive holiday decoration"
      },
      { 
        id: "wizard_hat_decoration", 
        name: "Wizard Hat", 
        credits: 250, 
        unlocked: false, 
        category: "decoration",
        subcategory: "hats",
        emoji: "🧙‍♂️",
        description: "Magical wizard hat for mystical vibes"
      },
    ],
    ambient: [
      { 
        id: "fireflies_ambient", 
        name: "Fireflies", 
        credits: 300, 
        unlocked: false, 
        category: "decoration",
        subcategory: "ambient",
        emoji: "✨",
        description: "Magical glowing fireflies around your bonsai"
      },
      { 
        id: "sparkles_ambient", 
        name: "Sparkles", 
        credits: 150, 
        unlocked: false, 
        category: "decoration",
        subcategory: "ambient",
        emoji: "⭐",
        description: "Shimmering light particles effect"
      },
      { 
        id: "rainbow_ambient", 
        name: "Rainbow", 
        credits: 400, 
        unlocked: false, 
        category: "decoration",
        subcategory: "ambient",
        emoji: "🌈",
        description: "Beautiful rainbow arcing over your bonsai"
      },
      { 
        id: "butterflies_ambient", 
        name: "Butterflies", 
        credits: 250, 
        unlocked: false, 
        category: "decoration",
        subcategory: "ambient",
        emoji: "🦋",
        description: "Colorful butterflies fluttering around"
      },
    ],
    background: [
      { 
        id: "sunset_background", 
        name: "Sunset", 
        credits: 500, 
        unlocked: false, 
        category: "decoration",
        subcategory: "background",
        emoji: "🌅",
        description: "Beautiful sunset backdrop"
      },
      { 
        id: "forest_background", 
        name: "Forest", 
        credits: 450, 
        unlocked: false, 
        category: "decoration",
        subcategory: "background",
        emoji: "🌲",
        description: "Dense forest background setting"
      },
      { 
        id: "mountain_background", 
        name: "Mountain", 
        credits: 400, 
        unlocked: false, 
        category: "decoration",
        subcategory: "background",
        emoji: "🏔️",
        description: "Serene mountain landscape backdrop"
      },
      { 
        id: "ocean_background", 
        name: "Ocean", 
        credits: 350, 
        unlocked: false, 
        category: "decoration",
        subcategory: "background",
        emoji: "🌊",
        description: "Peaceful ocean view background"
      },
    ]
  },
};

// ✅ UPDATED: Handle decoration subcategories in getAllShopItems
export const getAllShopItems = () => {
  const items = [
    ...SHOP_ITEMS.eyes.map(item => ({ ...item, type: "eyes" })),
    ...SHOP_ITEMS.mouths.map(item => ({ ...item, type: "mouths" })),
    ...SHOP_ITEMS.grounds.map(item => ({ ...item, type: "ground" })),
    ...SHOP_ITEMS.potStyles.map(item => ({ ...item, type: "pot" })),
  ];

  // Add decorations with subcategories
  Object.entries(SHOP_ITEMS.decorations).forEach(([subcategory, decorationItems]) => {
    decorationItems.forEach(item => {
      items.push({
        ...item,
        type: "decoration",
        subcategory: subcategory
      });
    });
  });

  return items;
};

export const getPurchasableItems = (userOwnedItems = []) => {
  return getAllShopItems().filter(item => {
    // Hide free items (they should be available by default)
    if (item.credits === 0 || item.unlocked) return false;
    
    // Hide if user already owns the item
    if (userOwnedItems.includes(item.id)) return false;
    
    return true;
  });
};



export const getItemsByCategory = (category) => {
  return getAllShopItems().filter(item => 
    item.category === category || item.type === category
  );
};

// ✅ NEW: Get decoration items by subcategory
export const getDecorationsBySubcategory = (subcategory) => {
  return getAllShopItems().filter(item => 
    item.category === "decoration" && item.subcategory === subcategory
  );
};

// ✅ NEW: Get available decoration subcategories
export const getDecorationSubcategories = () => {
  return Object.keys(SHOP_ITEMS.decorations);
};

export const getItemById = (itemId) => {
  return getAllShopItems().find(item => item.id === itemId);
};

export const getItemEmoji = (itemId) => {
  const item = getItemById(itemId);
  return item?.emoji || "🎁";
};

export const getDefaultOwnedItems = () => {
  return getAllShopItems()
    .filter(item => item.credits === 0 || item.unlocked)
    .map(item => item.id);
};

export const getPremiumItems = () => {
  return getAllShopItems()
    .filter(item => item.credits > 0 && !item.unlocked)
    .map(item => item.id);
};

// ✅ NEW: Helper functions for decoration subcategories
export const getOwnedDecorationsBySubcategory = (userOwnedItems = [], subcategory) => {
  const subcategoryItems = getDecorationsBySubcategory(subcategory);
  return subcategoryItems.filter(item => userOwnedItems.includes(item.id));
};

export const getAvailableDecorationsBySubcategory = (userOwnedItems = [], subcategory) => {
  const subcategoryItems = getDecorationsBySubcategory(subcategory);
  return subcategoryItems.filter(item => 
    item.credits === 0 || item.unlocked || userOwnedItems.includes(item.id)
  );
};

// ✅ NEW: Validate decoration subcategory structure
export const validateDecorationSubcategories = (decorationsObject) => {
  const validSubcategories = getDecorationSubcategories();
  const validatedDecorations = {};
  
  validSubcategories.forEach(subcategory => {
    validatedDecorations[subcategory] = null;
  });

  if (decorationsObject && typeof decorationsObject === 'object') {
    Object.entries(decorationsObject).forEach(([subcategory, itemId]) => {
      if (validSubcategories.includes(subcategory)) {
        validatedDecorations[subcategory] = itemId;
      }
    });
  }

  return validatedDecorations;
};