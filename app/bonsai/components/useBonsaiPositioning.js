import { useMemo, useCallback } from 'react';

export const useBonsaiPositioning = (selectedEyes, selectedMouth, selectedPotStyle, selectedGroundStyle, selectedHat = null, selectedBackground = null) => {
  // Ensure input parameters are valid strings
  const safeSelectedEyes = typeof selectedEyes === 'string' ? selectedEyes : 'default_eyes';
  const safeSelectedMouth = typeof selectedMouth === 'string' ? selectedMouth : 'default_mouth';
  const safeSelectedPotStyle = typeof selectedPotStyle === 'string' ? selectedPotStyle : 'default_pot';
  const safeSelectedGroundStyle = typeof selectedGroundStyle === 'string' ? selectedGroundStyle : 'default_ground';
  const safeSelectedHat = selectedHat || null;
  const safeSelectedBackground = selectedBackground || null;

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
    skate_ground: { x: -20, y: 3 },
    flowery_ground: { x: -90, y: -10 },
    mushroom_ground: { x: -90, y: -40 },
  }), []);

    // Ground positioning - individual ground scales
    const groundOffset = { x: 0, y: 0 };
    const groundScaleMap = {
      default_ground: 1,
      lilypad_ground: 0.95,
      skate_ground: 1,
      flowery_ground: 0.93,
      mushroom_ground: 0.95,
    };

  // Hat positioning mappings
  const hatPositionMap = useMemo(() => ({
    crown_hat: { x: 160, y: -52},
    graduate_hat: { x: 50, y: -45},
    christmas_hat: { x: 60, y: -80 },
    cowboy_hat: { x: 65, y: -50 },
    wizard_hat: { x: 70, y: -100 },
    beret_hat: { x: 80, y: -40 },
    chef_hat: { x: 35, y: -83 },
  }), []);

  // Background positioning - all backgrounds use the same offset and scale
  const backgroundOffset = { x: -70, y: -55 };
  const backgroundScale = 0.90; // Adjust this to make backgrounds bigger/smaller
  
  const backgroundPositionMap = useMemo(() => ({
    day_beach_background: backgroundOffset,
    night_beach_background: backgroundOffset,
    blue_sky_background: backgroundOffset,
    sunset_background: backgroundOffset,
    rainy_gray_background: backgroundOffset,
    desert_background: backgroundOffset,
    sea_background: backgroundOffset,
  }), [backgroundOffset]);

  // Get current dimensions and adjustments
  const currentEyeWidth = useMemo(() => {
    try {
      return eyeWidthMap[safeSelectedEyes] || eyeWidthMap['default_eyes'];
    } catch (error) {
      console.error('Error getting eye width:', error);
      return eyeWidthMap['default_eyes'];
    }
  }, [safeSelectedEyes, eyeWidthMap]);

  const currentMouthWidth = useMemo(() => {
    try {
      return mouthWidthMap[safeSelectedMouth] || mouthWidthMap['default_mouth'];
    } catch (error) {
      console.error('Error getting mouth width:', error);
      return mouthWidthMap['default_mouth'];
    }
  }, [safeSelectedMouth, mouthWidthMap]);

  const currentPotAdjustment = useMemo(() => {
    try {
      return potAdjustmentMap[safeSelectedPotStyle] || potAdjustmentMap['default_pot'];
    } catch (error) {
      console.error('Error getting pot adjustment:', error);
      return potAdjustmentMap['default_pot'];
    }
  }, [safeSelectedPotStyle, potAdjustmentMap]);

  const currentGroundAdjustment = useMemo(() => {
    try {
      return groundAdjustmentMap[safeSelectedGroundStyle] || groundAdjustmentMap['default_ground'];
    } catch (error) {
      console.error('Error getting ground adjustment:', error);
      return groundAdjustmentMap['default_ground'];
    }
  }, [safeSelectedGroundStyle, groundAdjustmentMap]);

  // Handle hat positioning
  const hatPosition = useMemo(() => {
    if (!safeSelectedHat) return null;
    
    const basePosition = hatPositionMap[safeSelectedHat] || { x: 0, y: 0 };
    return {
      id: safeSelectedHat,
      x: basePosition.x,
      y: basePosition.y
    };
  }, [safeSelectedHat, hatPositionMap]);

  // Handle background positioning
  const backgroundPosition = useMemo(() => {
    if (!safeSelectedBackground) return null;
    
    const basePosition = backgroundPositionMap[safeSelectedBackground] || { x: 0, y: 0 };
    return {
      id: safeSelectedBackground,
      x: basePosition.x,
      y: basePosition.y
    };
  }, [safeSelectedBackground, backgroundPositionMap]);

  // Calculate all positions
  const calculatePositions = useCallback(() => {
    try {
      const baseEyeY = 352;
      const baseMouthY = 365;
      const baseGroundY = 395;
      const basePotCenterX = 100;
      const basePotY = 296;

      // Ensure adjustments are valid objects with x and y properties
      const potAdjustment = currentPotAdjustment && typeof currentPotAdjustment === 'object' ? currentPotAdjustment : { x: 0, y: 0 };
      const groundAdjustment = currentGroundAdjustment && typeof currentGroundAdjustment === 'object' ? currentGroundAdjustment : { x: 0, y: 0 };

      // Calculate positions
      const potX = basePotCenterX + (potAdjustment.x || 0);
      const potY = basePotY + (potAdjustment.y || 0);

      const eyeCenterX = 230 - ((currentEyeWidth || 74) / 2);
      const eyeCenterY = baseEyeY;

      const mouthCenterX = 230 - ((currentMouthWidth || 20) / 2);
      const mouthCenterY = baseMouthY;

      const groundX = basePotCenterX + (groundAdjustment.x || 0);
      const groundY = baseGroundY + (groundAdjustment.y || 0);

      // Handle hat positioning
      const hatTransform = hatPosition ? {
        id: hatPosition.id,
        transform: `translate(${basePotCenterX + (hatPosition.x || 0)}, ${basePotY + (hatPosition.y || 0)})`
      } : null;

      // Handle background positioning with scale to make it smaller
      const backgroundTransform = backgroundPosition ? {
        id: backgroundPosition.id,
        transform: `translate(${backgroundPosition.x || 0}, ${backgroundPosition.y || 0}) scale(${backgroundScale})`
      } : null;

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
          transform: `translate(${groundX + (groundOffset.x || 0)}, ${groundY + (groundOffset.y || 0)}) scale(${groundScaleMap[safeSelectedGroundStyle] || 1.0})`
        },
        hat: hatTransform,
        background: backgroundTransform
      };
    } catch (error) {
      console.error('Error in calculatePositions:', error);
      // Return safe fallback positions
      return {
        potCenterX: 100,
        eyeCenterX: 183,
        mouthCenterX: 220,
        pot: { x: 100, y: 296, transform: 'translate(100, 296)' },
        eyes: { x: 183, y: 352, transform: 'translate(183, 352)' },
        mouth: { x: 220, y: 365, transform: 'translate(220, 365)' },
        ground: { x: 90, y: 395, transform: 'translate(90, 395)' },
        hat: null,
        background: null
      };
    }
  }, [
    currentEyeWidth, 
    currentMouthWidth, 
    currentPotAdjustment, 
    currentGroundAdjustment,
    hatPosition,
    backgroundPosition
  ]);

  const positions = useMemo(() => {
    try {
      return calculatePositions();
    } catch (error) {
      console.error('Error calculating positions:', error);
      // Return safe fallback positions
      return {
        potCenterX: 100,
        eyeCenterX: 183,
        mouthCenterX: 220,
        pot: { x: 100, y: 296, transform: 'translate(100, 296)' },
        eyes: { x: 183, y: 352, transform: 'translate(183, 352)' },
        mouth: { x: 220, y: 365, transform: 'translate(220, 365)' },
        ground: { x: 90, y: 395, transform: 'translate(90, 395)' },
        hat: null,
        background: null
      };
    }
  }, [calculatePositions]);

  return {
    positions,
    calculatePositions
  };
};