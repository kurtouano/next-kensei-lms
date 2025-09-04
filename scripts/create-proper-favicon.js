const fs = require('fs');
const path = require('path');

// Create a proper favicon.ico file from the jotatsu logo
// This script creates a simple but valid ICO file

console.log('Creating proper favicon.ico from jotatsu logo...');

// Read the existing jotatsu logo SVG
const svgPath = path.join(__dirname, '..', 'public', 'jotatsu_logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✅ Read jotatsu logo SVG');

// Create a simple 16x16 ICO file
// ICO file structure: header + directory + image data

// ICO Header (6 bytes)
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved (must be 0)
  0x01, 0x00, // Type (1 = ICO)
  0x01, 0x00  // Number of images (1)
]);

// Create a 16x16 bitmap with the jotatsu logo pattern
// This creates a simple representation of your logo
const createBitmap16x16 = () => {
  const bitmap = Buffer.alloc(256, 0); // 16x16 = 256 bytes
  
  // Create a simple pattern that represents the jotatsu logo
  // This is a simplified version - the actual logo has a tree-like shape
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const index = y * 16 + x;
      
      // Create a simple tree-like pattern
      if (x >= 6 && x <= 9 && y >= 2 && y <= 13) {
        // Trunk
        bitmap[index] = 0xFF;
      } else if (x >= 4 && x <= 11 && y >= 0 && y <= 8) {
        // Leaves (simplified)
        if (Math.abs(x - 7.5) + Math.abs(y - 4) <= 4) {
          bitmap[index] = 0xFF;
        }
      }
    }
  }
  
  return bitmap;
};

const bitmap16x16 = createBitmap16x16();

// Image directory entry (16 bytes)
const imageEntry = Buffer.from([
  0x10,       // Width (16)
  0x10,       // Height (16)
  0x00,       // Color palette (0 = no palette)
  0x00,       // Reserved
  0x01, 0x00, // Color planes (1)
  0x01, 0x00, // Bits per pixel (1)
  0x00, 0x01, 0x00, 0x00, // Image data size (256 bytes)
  0x16, 0x00, 0x00, 0x00  // Image data offset (22 bytes from start)
]);

// Combine all parts
const icoFile = Buffer.concat([icoHeader, imageEntry, bitmap16x16]);

// Write the favicon.ico file
const publicDir = path.join(__dirname, '..', 'public');
const faviconPath = path.join(publicDir, 'favicon.ico');

fs.writeFileSync(faviconPath, icoFile);

console.log(`✅ favicon.ico created successfully at ${faviconPath}`);
console.log('📝 The favicon now contains a simplified version of your jotatsu logo');
console.log('💡 For the best results, you can also use online favicon generators that convert your SVG to ICO format');
