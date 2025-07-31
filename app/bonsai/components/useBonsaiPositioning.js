import { useMemo, useCallback } from 'react';

export const useBonsaiPositioning = (selectedEyes, selectedMouth) => {
  // Eye width mappings for different eye types
  const eyeWidthMap = useMemo(() => ({
    default_eyes: 74,    // spans from cx="5.89758" to cx="68.4119" ≈ 74
    cry_eyes: 85,        // defined width="87" in SVG
    happy_eyes: 76,      // spans from x="2" to x="74.3667" ≈ 76
    flat_eyes: 84,       // spans from x="0" to x="86"
    wink_eyes: 75,       // similar to default but slightly different positioning
    puppy_eyes: 77,      // spans from leftmost ellipse to rightmost ≈ 77
    female_eyes: 90      // defined width="87" in SVG
  }), []);

  // Mouth width mappings for different mouth types
  const mouthWidthMap = useMemo(() => ({
    default_mouth: 20,    // spans from x="2" to x="18" ≈ 20
    smile_mouth: 18,      // spans from x="2" to x="16" ≈ 18
    kiss_mouth: 11,       // spans from x="2" to x="12.6565" ≈ 11
    surprised_mouth: 16,  // spans from x="1" to x="15" ≈ 16
    bone_mouth: 21        // spans from x="2" to x="19" ≈ 21
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
    // The pot area center is roughly at x=230, so we'll center both there
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