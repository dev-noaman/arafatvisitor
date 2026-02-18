#!/usr/bin/env node
/**
 * Generates app icons from the project logo (public/logo.svg).
 * Logo only inside a circle, no text.
 * Run: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

const LOGO_PATH = path.join(__dirname, '../../public/logo.svg');
const ASSETS_DIR = path.join(__dirname, '../assets');
const BACKGROUND_COLOR = '#dd282b'; // Red from logo

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error('Installing sharp... Run: npm install sharp --save-dev');
    process.exit(1);
  }

  if (!fs.existsSync(LOGO_PATH)) {
    console.error(`Logo not found: ${LOGO_PATH}`);
    process.exit(1);
  }

  let logoSvg = fs.readFileSync(LOGO_PATH, 'utf8');
  logoSvg = logoSvg.replace(/fill="#dd282b"/g, 'fill="#ffffff"');

  const logoBuffer = Buffer.from(logoSvg);

  const createIcon = async (size, outputPath, options = {}) => {
    const logoScale = options.logoScale ?? 0.72; // logo fills most of circle
    const logoSize = Math.round(size * logoScale);
    const left = Math.round((size - logoSize) / 2);
    const top = Math.round((size - logoSize) / 2);

    // Red circle background (transparent corners for clean circular icon)
    const radius = Math.floor(size / 2) - 2;
    const circleSvg = Buffer.from(
      `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="${BACKGROUND_COLOR}"/>
      </svg>`
    );

    const logoPng = await sharp(logoBuffer).resize(logoSize, logoSize).png().toBuffer();

    await sharp(circleSvg)
      .composite([{ input: logoPng, left, top }])
      .png()
      .toFile(outputPath);
    console.log(`Created: ${path.basename(outputPath)} (${size}x${size})`);
  };

  try {
    await createIcon(1024, path.join(ASSETS_DIR, 'icon.png'));
    await createIcon(1024, path.join(ASSETS_DIR, 'adaptive-icon.png'));
    await createIcon(512, path.join(ASSETS_DIR, 'splash-icon.png'), { logoScale: 0.68 });
    await createIcon(48, path.join(ASSETS_DIR, 'favicon.png'), { logoScale: 0.68 });

    console.log('\n✓ All app icons generated (logo only, inside circle)!');
  } catch (err) {
    console.error('Error generating icons:', err.message);
    process.exit(1);
  }
}

main();
