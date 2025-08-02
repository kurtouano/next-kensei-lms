import { useMemo, useCallback } from 'react';

export const useBonsaiPositioning = (selectedEyes, selectedMouth) => {
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

  // Get current widths based on selected types
  const currentEyeWidth = useMemo(() => {
    return eyeWidthMap[selectedEyes] || eyeWidthMap['default_eyes'];
  }, [selectedEyes, eyeWidthMap]);

  const currentMouthWidth = useMemo(() => {
    return mouthWidthMap[selectedMouth] || mouthWidthMap['default_mouth'];
  }, [selectedMouth, mouthWidthMap]);

  // Calculate centered positions
  const calculatePositions = useCallback(() => {
    const potCenterX = 230;
    const eyeCenterX = potCenterX - (currentEyeWidth / 2);
    const mouthCenterX = potCenterX - (currentMouthWidth / 2);

    return {
      eyeCenterX,
      mouthCenterX,
      potCenterX
    };
  }, [currentEyeWidth, currentMouthWidth]);

  const positions = useMemo(() => calculatePositions(), [calculatePositions]);

  return {
    eyeWidthMap,
    mouthWidthMap,
    currentEyeWidth,
    currentMouthWidth,
    positions,
    calculatePositions
  };
};