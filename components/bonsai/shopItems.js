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

  hats: [
    { 
      id: "crown_hat", 
      name: "Crown", 
      credits: 200, 
      unlocked: false, 
      category: "hats",
      emoji: "👑",
      description: "A royal crown for your majestic bonsai"
    },
    { 
      id: "graduate_hat", 
      name: "Graduate Cap", 
      credits: 150, 
      unlocked: false, 
      category: "hats",
      emoji: "🎓",
      description: "Celebrate your learning achievements"
    },
    { 
      id: "christmas_hat", 
      name: "Christmas Cap", 
      credits: 100, 
      unlocked: false, 
      category: "hats",
      emoji: "🎅",
      description: "Festive holiday decoration"
    },
    { 
      id: "cowboy_hat", 
      name: "Cowboy Hat", 
      credits: 180, 
      unlocked: false, 
      category: "hats",
      emoji: "🤠",
      description: "A classic cowboy hat for your western bonsai"
    },
    { 
      id: "wizard_hat", 
      name: "Wizard Hat", 
      credits: 250, 
      unlocked: false, 
      category: "hats",
      emoji: "🧙‍♂️",
      description: "Magical wizard hat for mystical vibes"
    },
    { 
      id: "beret_hat", 
      name: "Beret", 
      credits: 120, 
      unlocked: false, 
      category: "hats",
      emoji: "🎩",
      description: "A stylish beret for your artistic bonsai"
    },
    { 
      id: "chef_hat", 
      name: "Chef Hat", 
      credits: 160, 
      unlocked: false, 
      category: "hats",
      emoji: "👨‍🍳",
      description: "A professional chef hat for your culinary bonsai"
    },
  ],

  backgrounds: [
    { 
      id: "day_beach_background", 
      name: "Day Beach", 
      credits: 300, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "🏖️",
      description: "Beautiful sunny beach background"
    },
    { 
      id: "night_beach_background", 
      name: "Night Beach", 
      credits: 350, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "🌙",
      description: "Peaceful night beach scene"
    },
    { 
      id: "blue_sky_background", 
      name: "Blue Sky", 
      credits: 200, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "☀️",
      description: "Clear blue sky background"
    },
    { 
      id: "sunset_background", 
      name: "Sunset", 
      credits: 400, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "🌅",
      description: "Beautiful sunset backdrop"
    },
    { 
      id: "rainy_gray_background", 
      name: "Rainy Day", 
      credits: 250, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "🌧️",
      description: "Moody rainy day atmosphere"
    },
    { 
      id: "desert_background", 
      name: "Desert", 
      credits: 300, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "🏜️",
      description: "Warm desert landscape"
    },
    { 
      id: "sea_background", 
      name: "Ocean", 
      credits: 350, 
      unlocked: false, 
      category: "backgrounds",
      emoji: "🌊",
      description: "Peaceful ocean view"
    },
  ],
};

// ✅ UPDATED: Handle independent categories
export const getAllShopItems = () => {
  const items = [
    ...SHOP_ITEMS.eyes.map(item => ({ ...item, type: "eyes" })),
    ...SHOP_ITEMS.mouths.map(item => ({ ...item, type: "mouths" })),
    ...SHOP_ITEMS.grounds.map(item => ({ ...item, type: "ground" })),
    ...SHOP_ITEMS.potStyles.map(item => ({ ...item, type: "pot" })),
    ...SHOP_ITEMS.hats.map(item => ({ ...item, type: "hats" })),
    ...SHOP_ITEMS.backgrounds.map(item => ({ ...item, type: "backgrounds" })),
  ];

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

// ✅ NEW: Get hat items
export const getHats = () => {
  return getAllShopItems().filter(item => item.type === "hats");
};

// ✅ NEW: Get background items
export const getBackgrounds = () => {
  return getAllShopItems().filter(item => item.type === "backgrounds");
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

// ✅ NEW: Helper functions for independent categories
export const getOwnedHats = (userOwnedItems = []) => {
  return getHats().filter(item => userOwnedItems.includes(item.id));
};

export const getOwnedBackgrounds = (userOwnedItems = []) => {
  return getBackgrounds().filter(item => userOwnedItems.includes(item.id));
};

export const getAvailableHats = (userOwnedItems = []) => {
  return getHats().filter(item => 
    item.credits === 0 || item.unlocked || userOwnedItems.includes(item.id)
  );
};

export const getAvailableBackgrounds = (userOwnedItems = []) => {
  return getBackgrounds().filter(item => 
    item.credits === 0 || item.unlocked || userOwnedItems.includes(item.id)
  );
};