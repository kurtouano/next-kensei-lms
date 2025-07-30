# Bonsai App Structure

This directory contains all bonsai-related components, hooks, and utilities organized within the app directory.

## Directory Structure

```
app/bonsai/
├── components/
│   └── bonsaiSvgData.js     # SVG path data for eyes and mouth customization
├── hooks/
│   └── useBonsaiPositioning.js  # Custom hook for positioning calculations
├── page.jsx                 # Main bonsai page component
└── README.md               # This file
```

## Components

### `components/bonsaiSvgData.js`
Contains all SVG path data for eyes and mouth customization:
- `eyeSvgMap` - Object containing all eye SVG definitions
- `mouthSvgMap` - Object containing all mouth SVG definitions  
- `getEyeSvg(selectedEyes)` - Utility function to get eye SVG
- `getMouthSvg(selectedMouth)` - Utility function to get mouth SVG

### `hooks/useBonsaiPositioning.js`
Custom React hook for managing positioning and width calculations:
- Returns eye/mouth width mappings
- Calculates centered positions for different eye/mouth types
- Uses `useMemo` and `useCallback` for performance optimization

## Usage

```jsx
import { useBonsaiPositioning } from "./hooks/useBonsaiPositioning"
import { getEyeSvg, getMouthSvg } from "./components/bonsaiSvgData"

const BonsaiComponent = ({ selectedEyes, selectedMouth }) => {
  // Get positioning data
  const { positions } = useBonsaiPositioning(selectedEyes, selectedMouth);
  
  // Get SVG content with memoization
  const eyeSvg = useMemo(() => getEyeSvg(selectedEyes), [selectedEyes]);
  const mouthSvg = useMemo(() => getMouthSvg(selectedMouth), [selectedMouth]);

  return (
    <g transform={`translate(${positions.eyeCenterX}, 352)`} 
       dangerouslySetInnerHTML={{ __html: eyeSvg }} />
  );
};
```

## Benefits

- **Co-location**: All bonsai-related code is organized within the app/bonsai directory
- **Modularity**: Separated concerns for better maintainability
- **Performance**: Uses React optimization hooks (useMemo, useCallback)
- **Clean Code**: Main page component is focused on rendering
- **Easy to Find**: Everything related to bonsai is in one place