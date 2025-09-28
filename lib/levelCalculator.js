// Update user's bonsai level based on credits
export const calculateBonsaiLevel = (credits) => {
  if (credits < 400) return 1;
  if (credits < 800) return 2;
  return 3;
};

export const getLevelInfo = (credits) => {
  const level = calculateBonsaiLevel(credits);
  
  const levelRequirements = {
    1: { current: 0, next: 400, nextLevel: 2 },
    2: { current: 400, next: 800, nextLevel: 3 },
    3: { current: 800, next: null, nextLevel: null }
  };
  
  return { 
    level, 
    ...levelRequirements[level],
    creditsToNext: levelRequirements[level].next ? levelRequirements[level].next - credits : 0
  };
};

export const getDefaultMilestones = () => {
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
      creditsRequired: 400, 
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
};

export const updateMilestoneAchievements = (milestones, currentCredits) => {
  return milestones.map(milestone => {
    if (currentCredits >= milestone.creditsRequired && !milestone.isAchieved) {
      return {
        ...milestone,
        isAchieved: true,
        achievedAt: new Date()
      };
    }
    return milestone;
  });
};