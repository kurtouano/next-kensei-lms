import { useMemo, useCallback } from 'react';

export const useBonsaiPositioning = (selectedEyes, selectedMouth, selectedPotStyle, selectedGroundStyle, decorations = []) => {
  // Ensure input parameters are valid strings
  const safeSelectedEyes = typeof selectedEyes === 'string' ? selectedEyes : 'default_eyes';
  const safeSelectedMouth = typeof selectedMouth === 'string' ? selectedMouth : 'default_mouth';
  const safeSelectedPotStyle = typeof selectedPotStyle === 'string' ? selectedPotStyle : 'default_pot';
  const safeSelectedGroundStyle = typeof selectedGroundStyle === 'string' ? selectedGroundStyle : 'default_ground';
  const safeDecorations = Array.isArray(decorations) ? decorations : [];

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

  // Fixed: Handle decorations array properly
  const decorationPositions = useMemo(() => {
    // Ensure decorations is always an array
    const decorationsArray = Array.isArray(safeDecorations) ? safeDecorations : [];
    
    if (decorationsArray.length === 0) {
      return [];
    }
    
    return decorationsArray.map((decorationId, index) => {
      try {
        const basePosition = decorationPositionMap[decorationId] || { x: 0, y: 0 };
        // Add slight offset for multiple decorations to prevent overlap
        const offsetX = index * 20;
        const offsetY = index * 5;
        
        return {
          id: decorationId,
          x: basePosition.x + offsetX,
          y: basePosition.y + offsetY
        };
      } catch (error) {
        console.error('Error processing decoration:', decorationId, error);
        return {
          id: decorationId,
          x: index * 20,
          y: index * 5
        };
      }
    });
  }, [safeDecorations, decorationPositionMap]);

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

      // Fixed: Handle decorations properly
      const decorationTransforms = Array.isArray(decorationPositions) ? decorationPositions.map((decoration) => ({
        id: decoration.id,
        transform: `translate(${basePotCenterX + (decoration.x || 0)}, ${basePotY + (decoration.y || 0)})`
      })) : [];

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
        decorations: []
      };
    }
  }, [
    currentEyeWidth, 
    currentMouthWidth, 
    currentPotAdjustment, 
    currentGroundAdjustment,
    decorationPositions
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
        decorations: []
      };
    }
  }, [calculatePositions]);

  return {
    positions,
    calculatePositions
  };
};