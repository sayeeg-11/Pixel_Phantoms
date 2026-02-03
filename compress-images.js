/**
 * Image Compression Script using Sharp
 *
 * Features:
 * - Validates input image existence
 * - Ensures output directories exist
 * - Uses correct, format-specific compression options
 * - Strips metadata by default (Sharp behavior)
 * - Processes images in parallel for better performance
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * List of images to be compressed
 * Add or remove paths as needed
 */
const images = [
  'assets/demo.png',
  'assets/host-event.jpg',
  'assets/logo.png'
];

/**
 * Compress a single image based on its file type
 *
 * @param {string} inputPath - Path to the source image
 * @returns {Promise<void>}
 */
async function compressImage(inputPath) {
  /* ---------------------------------------------------
   * 1. Validate input file existence
   * --------------------------------------------------- */
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  /* ---------------------------------------------------
   * 2. Resolve paths and extensions
   * --------------------------------------------------- */
  const ext = path.extname(inputPath).toLowerCase();
  const outputPath = inputPath.replace(ext, `_compressed${ext}`);
  const outputDir = path.dirname(outputPath);

  /* ---------------------------------------------------
   * 3. Ensure output directory exists
   * --------------------------------------------------- */
  fs.mkdirSync(outputDir, { recursive: true });

  /* ---------------------------------------------------
   * 4. Initialize Sharp pipeline
   *    (metadata is stripped by default)
   * --------------------------------------------------- */
  let pipeline = sharp(inputPath);

  /* ---------------------------------------------------
   * 4.1 Safeguard against very large images
   * --------------------------------------------------- */
  const metadata = await pipeline.metadata();
  const MAX_PIXELS = 12_000_000;

  if (metadata.width * metadata.height > MAX_PIXELS) {
    throw new Error(
      `Image too large to safely process: ${metadata.width}×${metadata.height}`
    );
  }

  /* ---------------------------------------------------
   * 5. Apply format-specific compression
   * --------------------------------------------------- */
  if (ext === '.png') {
    // PNG: lossless compression
    // Apply palette quantization only when safe to avoid banding
    const usePalette =
      !metadata.hasAlpha &&
      metadata.width * metadata.height < 3_000_000;

    pipeline = pipeline.png({
      compressionLevel: 9,
      palette: usePalette
    });

  } else if (ext === '.jpg' || ext === '.jpeg') {
    // JPEG: optimized, progressive encoding for better web loading
    pipeline = pipeline.jpeg({
      quality: 80,
      mozjpeg: true,
      progressive: true
    });

  } else {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  /* ---------------------------------------------------
   * 6. Write compressed image to disk
   * --------------------------------------------------- */
  await pipeline.toFile(outputPath);

  console.log(`✔ Compressed: ${inputPath} → ${outputPath}`);
}

/**
 * Main entry point
 * Compresses all images in parallel
 */
async function main() {
  try {
    await Promise.all(
      images.map(image => compressImage(image))
    );

    console.log('✅ Image compression completed.');
  } catch (error) {
    console.error('❌ Compression failed:', error.message);
  }
}

// Execute script
main();
