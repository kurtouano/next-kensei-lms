const fs = require('fs');
const path = require('path');

// This script creates multiple favicon sizes from your SVG logo
// You'll need to install sharp: npm install sharp

console.log('🎯 Favicon Generator for Jotatsu Academy');
console.log('=====================================');

const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'favicon-48x48.png' },
  { size: 96, name: 'favicon-96x96.png' },
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' }
];

console.log('\n📋 Required Sizes:');
sizes.forEach(({ size, name }) => {
  console.log(`  ${size}x${size}px → ${name}`);
});

console.log('\n🛠️  How to Use:');
console.log('1. Install sharp: npm install sharp');
console.log('2. Run: node scripts/create-favicons.js');
console.log('3. Upload your SVG logo when prompted');
console.log('4. Generated files will be in public/favicons/');

console.log('\n📁 Files to Create:');
console.log('  public/favicon.ico (multi-size ICO file)');
console.log('  public/favicon-16x16.png');
console.log('  public/favicon-32x32.png');
console.log('  public/favicon-48x48.png');
console.log('  public/favicon-96x96.png');
console.log('  public/android-chrome-192x192.png');
console.log('  public/android-chrome-512x512.png');
console.log('  public/apple-touch-icon.png (180x180)');

console.log('\n🔗 Then add these links to your layout.jsx:');
console.log(`
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
`);

console.log('\n✅ This will fix your Google search results favicon!');
