const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  'assets/demo.png',
  'assets/host-event.jpg',
  'assets/logo.png'
];

async function compressImage(inputPath) {
  // 1. Validate input file existence
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  const ext = path.extname(inputPath).toLowerCase();
  const outputPath = inputPath.replace(
    ext,
    `_compressed${ext}`
  );

  // 2. Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  let pipeline = sharp(inputPath); 
  // NOTE: Sharp strips metadata by default unless .withMetadata() is used

  // 3. Correct format-specific compression
  if (ext === '.png') {
    pipeline = pipeline.png({
      compressionLevel: 9, // lossless compression
      palette: true        // quantization for smaller files
    });
  } else if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({
      quality: 80,
      mozjpeg: true        // better JPEG compression
    });
  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  await pipeline.toFile(outputPath);

  console.log(`✔ Compressed: ${inputPath} → ${outputPath}`);
}

async function main() {
  try {
    // 4. Parallel image processing
    await Promise.all(
      images.map(image => compressImage(image))
    );

    console.log('✅ Image compression completed.');
  } catch (error) {
    console.error('❌ Compression failed:', error.message);
  }
}

main();
