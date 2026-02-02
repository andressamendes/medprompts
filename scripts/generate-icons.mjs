import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');
const distDir = join(__dirname, '..', 'dist');

// Read the SVG
const svgPath = join(publicDir, 'favicon.svg');
const svgBuffer = readFileSync(svgPath);

// Icon sizes to generate
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

// Maskable icons need padding (safe zone is 80% of the icon)
const maskableSizes = [
  { name: 'pwa-maskable-192x192.png', size: 192 },
  { name: 'pwa-maskable-512x512.png', size: 512 },
];

async function generateIcons() {
  console.log('Generating icons from favicon.svg...\n');

  // Generate regular icons
  for (const { name, size } of sizes) {
    const outputPath = join(publicDir, name);
    const distPath = join(distDir, name);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Created ${name} (${size}x${size})`);

    // Also copy to dist if it exists
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(distPath);
      console.log(`  → Copied to dist/`);
    } catch (e) {
      // dist may not exist yet
    }
  }

  // Generate maskable icons (with padding for safe zone)
  for (const { name, size } of maskableSizes) {
    const outputPath = join(publicDir, name);
    const distPath = join(distDir, name);

    // For maskable icons, resize SVG to 80% and add background padding
    const iconSize = Math.floor(size * 0.8);
    const padding = Math.floor((size - iconSize) / 2);

    await sharp(svgBuffer)
      .resize(iconSize, iconSize)
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: { r: 99, g: 102, b: 241, alpha: 1 } // #6366f1
      })
      .png()
      .toFile(outputPath);

    console.log(`✓ Created ${name} (${size}x${size} maskable)`);

    try {
      await sharp(svgBuffer)
        .resize(iconSize, iconSize)
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 99, g: 102, b: 241, alpha: 1 }
        })
        .png()
        .toFile(distPath);
      console.log(`  → Copied to dist/`);
    } catch (e) {
      // dist may not exist yet
    }
  }

  // Copy favicon.svg to dist
  try {
    writeFileSync(join(distDir, 'favicon.svg'), svgBuffer);
    console.log('\n✓ Copied favicon.svg to dist/');
  } catch (e) {
    // dist may not exist yet
  }

  console.log('\n✅ All icons generated successfully!');
}

generateIcons().catch(console.error);
