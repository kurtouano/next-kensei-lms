import { useMemo, useCallback } from 'react';

export const useBonsaiPositioning = (selectedEyes, selectedMouth, selectedPotStyle, selectedGroundStyle, decorations = []) => {
  // Eye width mappings for different eye types
  const eyeWidthMap = useMemo(() => ({
    default_eyes: 74,    
    cry_eyes: 85,       
    happy_eyes: 76,    
    flat_eyes: 84,    
    wink_eyes: 75,     
    puppy_eyes: 77, 
    female_eyes: 90  
  }), []);

  // Mouth width mappings for different mouth types
  const mouthWidthMap = useMemo(() => ({
    default_mouth: 20, 
    smile_mouth: 18,  
    kiss_mouth: 11,
    surprised_mouth: 16, 
    bone_mouth: 21 
  }), []);

  // Pot positioning adjustments (minor adjustments only)
  const potAdjustmentMap = useMemo(() => ({
    default_pot: { x: 0, y: 0 },
    wide_pot: { x: 0, y: 0 },
    slim_pot: { x: 0, y: 0 },
    mushroom_pot: { x: -5, y: 0 },
  }), []);

  // Ground positioning adjustments (minor adjustments only)
  const groundAdjustmentMap = useMemo(() => ({
    default_ground: { x: -10, y: 0 },
    lilypad_ground: { x: -90, y: 5 },
    skate_ground: { x: -100, y: 0 },
    flowery_ground: { x: -110, y: -10 },
    mushroom_ground: { x: -100, y: -40 },
  }), []);

  // Decoration positioning mappings
  const decorationPositionMap = useMemo(() => ({
    crown_decoration: { x: 160, y: -52},
    graduate_cap_decoration: { x: 50, y: -45},
    christmas_cap_decoration: { x: 70, y: -80 },
  }), []);

  // Get current dimensions and adjustments
  const currentEyeWidth = useMemo(() => {
    return eyeWidthMap[selectedEyes] || eyeWidthMap['default_eyes'];
  }, [selectedEyes, eyeWidthMap]);

  const currentMouthWidth = useMemo(() => {
    return mouthWidthMap[selectedMouth] || mouthWidthMap['default_mouth'];
  }, [selectedMouth, mouthWidthMap]);

  const currentPotAdjustment = useMemo(() => {
    return potAdjustmentMap[selectedPotStyle] || potAdjustmentMap['default_pot'];
  }, [selectedPotStyle, potAdjustmentMap]);

  const currentGroundAdjustment = useMemo(() => {
    return groundAdjustmentMap[selectedGroundStyle] || groundAdjustmentMap['default_ground'];
  }, [selectedGroundStyle, groundAdjustmentMap]);

  // Fixed: Handle decorations array properly
  const decorationPositions = useMemo(() => {
    if (!decorations || decorations.length === 0) {
      return [];
    }
    
    return decorations.map((decorationId, index) => {
      const basePosition = decorationPositionMap[decorationId] || { x: 0, y: 0 };
      // Add slight offset for multiple decorations to prevent overlap
      const offsetX = index * 20;
      const offsetY = index * 5;
      
      return {
        id: decorationId,
        x: basePosition.x + offsetX,
        y: basePosition.y + offsetY
      };
    });
  }, [decorations, decorationPositionMap]);

  // Calculate all positions
  const calculatePositions = useCallback(() => {
    const baseEyeY = 352;
    const baseMouthY = 365;
    const baseGroundY = 395;
    const basePotCenterX = 100;
    const basePotY = 296;

    // Calculate positions
    const potX = basePotCenterX + currentPotAdjustment.x;
    const potY = basePotY + currentPotAdjustment.y;

    const eyeCenterX = 230 - (currentEyeWidth / 2);
    const eyeCenterY = baseEyeY;

    const mouthCenterX = 230 - (currentMouthWidth / 2);
    const mouthCenterY = baseMouthY;

    const groundX = basePotCenterX + currentGroundAdjustment.x;
    const groundY = baseGroundY + currentGroundAdjustment.y;

    // Fixed: Handle decorations properly
    const decorationTransforms = decorationPositions.map((decoration) => ({
      id: decoration.id,
      transform: `translate(${basePotCenterX + decoration.x}, ${basePotY + decoration.y})`
    }));

    return {
      // Basic centers
      potCenterX: basePotCenterX,
      eyeCenterX,
      mouthCenterX,
      
      // Transforms
      pot: {
        x: potX,
        y: potY,
        transform: `translate(${potX}, ${potY})`
      },
      eyes: {
        x: eyeCenterX,
        y: eyeCenterY,
        transform: `translate(${eyeCenterX}, ${eyeCenterY})`
      },
      mouth: {
        x: mouthCenterX,
        y: mouthCenterY,
        transform: `translate(${mouthCenterX}, ${mouthCenterY})`
      },
      ground: {
        x: groundX,
        y: groundY,
        transform: `translate(${groundX}, ${groundY})`
      },
      decorations: decorationTransforms
    };
  }, [
    currentEyeWidth, 
    currentMouthWidth, 
    currentPotAdjustment, 
    currentGroundAdjustment,
    decorationPositions
  ]);

  const positions = useMemo(() => calculatePositions(), [calculatePositions]);

  return {
    positions,
    calculatePositions
  };
};