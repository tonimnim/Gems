import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputDir = join(__dirname, '../public/icons');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create a simple gem icon SVG with green background
const createGemSvg = (size) => {
  const padding = size * 0.15;
  const gemSize = size - padding * 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Simple diamond/gem shape
  const points = [
    `${centerX},${padding}`, // top
    `${size - padding},${centerY}`, // right
    `${centerX},${size - padding}`, // bottom
    `${padding},${centerY}`, // left
  ].join(' ');

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#00AA6C"/>
      <polygon points="${points}" fill="white"/>
      <line x1="${centerX}" y1="${padding}" x2="${centerX}" y2="${size - padding}" stroke="#00AA6C" stroke-width="${size * 0.02}" opacity="0.3"/>
      <line x1="${padding}" y1="${centerY}" x2="${size - padding}" y2="${centerY}" stroke="#00AA6C" stroke-width="${size * 0.02}" opacity="0.3"/>
    </svg>
  `;
};

async function generateIcons() {
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    const svg = createGemSvg(size);
    const outputPath = join(outputDir, `icon-${size}x${size}.png`);

    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // Also create apple-touch-icon
  const appleSvg = createGemSvg(180);
  await sharp(Buffer.from(appleSvg))
    .png()
    .toFile(join(outputDir, 'apple-touch-icon.png'));
  console.log('Generated: apple-touch-icon.png');

  // Create favicon
  const faviconSvg = createGemSvg(32);
  await sharp(Buffer.from(faviconSvg))
    .png()
    .toFile(join(outputDir, 'favicon.png'));
  console.log('Generated: favicon.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
