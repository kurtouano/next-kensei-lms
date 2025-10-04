// components/bonsai/BonsaiConfig.js
// Centralized configuration for all bonsai customization options

export const BONSAI_CONFIG = {
  // Tree color mappings
  treeColors: {
    colorToKey: {
      "#77DD82": "default_foliage",
      "#4a7c59": "forest_green_foliage"
    },
    keyToColor: {
      "default_foliage": "#77DD82",
      "forest_green_foliage": "#4a7c59"
    },
    options: [
      { id: "default_foliage", name: "Default Green", color: "#77DD82" },
      { id: "forest_green_foliage", name: "Forest Green", color: "#4a7c59" }
    ]
  },

  // Pot color mappings
  potColors: {
    colorToKey: {
      "#FD9475": "default_pot",
      "#8B5E3C": "brown_pot"
    },
    keyToColor: {
      "default_pot": "#FD9475",
      "brown_pot": "#8B5E3C"
    },
    options: [
      { id: "default_pot", name: "Default Orange", color: "#FD9475" },
      { id: "brown_pot", name: "Earth Brown", color: "#8B5E3C" }
    ]
  },

  // Eye options (derived from shopItems but kept here for consistency)
  eyes: [
    { id: "default_eyes", name: "Default Eyes" },
    { id: "cry_eyes", name: "Crying Eyes" },
    { id: "happy_eyes", name: "Happy Eyes" },
    { id: "flat_eyes", name: "Sleepy Eyes" },
    { id: "wink_eyes", name: "Winking Eyes" },
    { id: "puppy_eyes", name: "Puppy Eyes" },
    { id: "female_eyes", name: "Elegant Eyes" }
  ],

  // Mouth options (derived from shopItems but kept here for consistency)
  mouths: [
    { id: "default_mouth", name: "Default Smile" },
    { id: "smile_mouth", name: "Big Smile" },
    { id: "kiss_mouth", name: "Kiss" },
    { id: "surprised_mouth", name: "Surprised" },
    { id: "bone_mouth", name: "Playful" }
  ],

  // Ground styles with ownership requirements
  groundStyles: [
    { id: "default_ground", name: "Default Shadow", requiresOwnership: false },
    { id: "flowery_ground", name: "Flowery Ground", requiresOwnership: true },
    { id: "lilypad_ground", name: "Lily Pad", requiresOwnership: true },
    { id: "skate_ground", name: "Skate Ground", requiresOwnership: true },
    { id: "mushroom_ground", name: "Mushroom Ground", requiresOwnership: true }
  ],

  // Pot styles with ownership requirements
  potStyles: [
    { id: "default_pot", name: "Default Pot", requiresOwnership: false },
    { id: "wide_pot", name: "Wide Pot", requiresOwnership: false },
    { id: "slim_pot", name: "Slim Pot", requiresOwnership: false },
    { id: "mushroom_pot", name: "Mushroom Pot", requiresOwnership: true }
  ],

  // Default customization values
  defaults: {
    foliageColor: "#77DD82",
    potColor: "#FD9475",
    eyes: "default_eyes",
    mouth: "default_mouth",
    potStyle: "default_pot",
    groundStyle: "default_ground",
    hat: null,
    background: null
  }
};

// Helper functions
export const BonsaiConfigHelpers = {
  // Tree color helpers
  getTreeKeyFromColor: (color) => {
    return BONSAI_CONFIG.treeColors.colorToKey[color] || null;
  },

  getTreeColorFromKey: (key) => {
    return BONSAI_CONFIG.treeColors.keyToColor[key] || BONSAI_CONFIG.defaults.foliageColor;
  },

  getAvailableTreeColors: (customColor = "#77DD82") => {
    return [
      ...BONSAI_CONFIG.treeColors.options,
      { id: "custom", name: "Custom Color", color: customColor }
    ];
  },

  // Pot color helpers
  getPotKeyFromColor: (color) => {
    return BONSAI_CONFIG.potColors.colorToKey[color] || null;
  },

  getPotColorFromKey: (key) => {
    return BONSAI_CONFIG.potColors.keyToColor[key] || BONSAI_CONFIG.defaults.potColor;
  },

  getAvailablePotColors: (customColor = "#FD9475") => {
    return [
      ...BONSAI_CONFIG.potColors.options,
      { id: "custom_pot", name: "Custom Color", color: customColor }
    ];
  },

  // Eye helpers
  getAvailableEyes: () => {
    return BONSAI_CONFIG.eyes;
  },

  // Mouth helpers
  getAvailableMouths: () => {
    return BONSAI_CONFIG.mouths;
  },

  // Ground style helpers
  getAvailableGroundStyles: (ownedItems = []) => {
    return BONSAI_CONFIG.groundStyles.filter(style => 
      !style.requiresOwnership || ownedItems.includes(style.id)
    );
  },

  // Pot style helpers
  getAvailablePotStyles: (ownedItems = []) => {
    return BONSAI_CONFIG.potStyles.filter(style => 
      !style.requiresOwnership || ownedItems.includes(style.id)
    );
  },

  // Validation helpers
  isValidTreeColor: (color) => {
    return Object.keys(BONSAI_CONFIG.treeColors.colorToKey).includes(color);
  },

  isValidPotColor: (color) => {
    return Object.keys(BONSAI_CONFIG.potColors.colorToKey).includes(color);
  },

  isValidEye: (eyeId) => {
    return BONSAI_CONFIG.eyes.some(eye => eye.id === eyeId);
  },

  isValidMouth: (mouthId) => {
    return BONSAI_CONFIG.mouths.some(mouth => mouth.id === mouthId);
  },

  isValidGroundStyle: (groundId) => {
    return BONSAI_CONFIG.groundStyles.some(ground => ground.id === groundId);
  },

  isValidPotStyle: (potId) => {
    return BONSAI_CONFIG.potStyles.some(pot => pot.id === potId);
  }
};

// Export for easy importing
export default BONSAI_CONFIG;