import { useMemo, useCallback } from 'react';

export const useBonsaiPositioning = (selectedEyes, selectedMouth, selectedPotStyle, selectedGroundStyle) => {
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
      }
    };
  }, [
    currentEyeWidth, 
    currentMouthWidth, 
    currentPotAdjustment, 
    currentGroundAdjustment
  ]);

  const positions = useMemo(() => calculatePositions(), [calculatePositions]);

  return {
    positions,
    calculatePositions
  };
};