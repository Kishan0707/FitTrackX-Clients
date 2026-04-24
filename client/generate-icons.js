const fs = require('fs');
const { createCanvas } = require('canvas');

// Check if canvas module is installed
try {
  require.resolve('canvas');
} catch (e) {
  console.log('Installing required package...');
  console.log('Run: npm install canvas');
  process.exit(1);
}

const sizes = [192, 512];

sizes.forEach(size => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#f97316');
  gradient.addColorStop(1, '#ea580c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // Draw "FX" text
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('FX', size / 2, size / 2);
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(`public/icons/icon-${size}.png`, buffer);
  console.log(`Created icon-${size}.png`);
});

console.log('Icons generated successfully!');
