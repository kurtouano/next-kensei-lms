const fs = require('fs');
const path = require('path');

// Create a multi-size favicon.ico file with 16x16, 32x32, and 48x48 versions
console.log('Creating multi-size favicon.ico from jotatsu logo...');

// Read the existing jotatsu logo SVG
const svgPath = path.join(__dirname, '..', 'public', 'jotatsu_logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✅ Read jotatsu logo SVG');

// Create bitmap data for different sizes
const createBitmap = (size) => {
  const totalBytes = size * size / 8; // 1 bit per pixel
  const bitmap = Buffer.alloc(totalBytes, 0);
  
  // Create a tree-like pattern representing the jotatsu logo
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const byteIndex = Math.floor((y * size + x) / 8);
      const bitIndex = 7 - ((y * size + x) % 8);
      
      // Create a simplified tree pattern
      let shouldSet = false;
      
      if (size === 16) {
        // 16x16 pattern
        if (x >= 6 && x <= 9 && y >= 2 && y <= 13) {
          shouldSet = true; // Trunk
        } else if (x >= 4 && x <= 11 && y >= 0 && y <= 8) {
          if (Math.abs(x - 7.5) + Math.abs(y - 4) <= 4) {
            shouldSet = true; // Leaves
          }
        }
      } else if (size === 32) {
        // 32x32 pattern
        if (x >= 12 && x <= 19 && y >= 4 && y <= 26) {
          shouldSet = true; // Trunk
        } else if (x >= 8 && x <= 23 && y >= 0 && y <= 16) {
          if (Math.abs(x - 15.5) + Math.abs(y - 8) <= 8) {
            shouldSet = true; // Leaves
          }
        }
      } else if (size === 48) {
        // 48x48 pattern
        if (x >= 18 && x <= 29 && y >= 6 && y <= 39) {
          shouldSet = true; // Trunk
        } else if (x >= 12 && x <= 35 && y >= 0 && y <= 24) {
          if (Math.abs(x - 23.5) + Math.abs(y - 12) <= 12) {
            shouldSet = true; // Leaves
          }
        }
      }
      
      if (shouldSet) {
        bitmap[byteIndex] |= (1 << bitIndex);
      }
    }
  }
  
  return bitmap;
};

// Create bitmaps for different sizes
const bitmap16 = createBitmap(16);
const bitmap32 = createBitmap(32);
const bitmap48 = createBitmap(48);

// ICO Header (6 bytes)
const icoHeader = Buffer.from([
  0x00, 0x00, // Reserved (must be 0)
  0x01, 0x00, // Type (1 = ICO)
  0x03, 0x00  // Number of images (3)
]);

// Image directory entries (16 bytes each)
const imageEntry16 = Buffer.from([
  0x10,       // Width (16)
  0x10,       // Height (16)
  0x00,       // Color palette (0 = no palette)
  0x00,       // Reserved
  0x01, 0x00, // Color planes (1)
  0x01, 0x00, // Bits per pixel (1)
  0x00, 0x02, 0x00, 0x00, // Image data size (512 bytes)
  0x3A, 0x00, 0x00, 0x00  // Image data offset (58 bytes from start)
]);

const imageEntry32 = Buffer.from([
  0x20,       // Width (32)
  0x20,       // Height (32)
  0x00,       // Color palette (0 = no palette)
  0x00,       // Reserved
  0x01, 0x00, // Color planes (1)
  0x01, 0x00, // Bits per pixel (1)
  0x00, 0x08, 0x00, 0x00, // Image data size (2048 bytes)
  0x3A, 0x02, 0x00, 0x00  // Image data offset (570 bytes from start)
]);

const imageEntry48 = Buffer.from([
  0x30,       // Width (48)
  0x30,       // Height (48)
  0x00,       // Color palette (0 = no palette)
  0x00,       // Reserved
  0x01, 0x00, // Color planes (1)
  0x01, 0x00, // Bits per pixel (1)
  0x00, 0x12, 0x00, 0x00, // Image data size (4608 bytes)
  0x3A, 0x0A, 0x00, 0x00  // Image data offset (2618 bytes from start)
]);

// Combine all parts
const icoFile = Buffer.concat([
  icoHeader,
  imageEntry16,
  imageEntry32,
  imageEntry48,
  bitmap16,
  bitmap32,
  bitmap48
]);

// Write the favicon.ico file
const publicDir = path.join(__dirname, '..', 'public');
const faviconPath = path.join(publicDir, 'favicon.ico');

fs.writeFileSync(faviconPath, icoFile);

console.log(`✅ Multi-size favicon.ico created successfully at ${faviconPath}`);
console.log('📏 Contains 16x16, 32x32, and 48x48 pixel versions');
console.log('🎯 Google will now use the appropriate size for different contexts');
console.log('💡 This improves your logo appearance across all platforms and devices');
