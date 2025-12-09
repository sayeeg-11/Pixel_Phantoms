const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  'assets/demo.png',
  'assets/host-event.jpg',
  'assets/logo.png'
];

async function compressImage(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  let pipeline = sharp(inputPath);

  if (ext === '.png') {
    pipeline = pipeline.png({ quality: 80, compressionLevel: 9 });
  } else if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({ quality: 80 });
  }

  await pipeline.toFile(outputPath);
  console.log(`Compressed ${inputPath} to ${outputPath}`);
}

async function main() {
  for (const image of images) {
    const outputPath = image.replace(path.extname(image), '_compressed' + path.extname(image));
    try {
      await compressImage(image, outputPath);
    } catch (error) {
      console.error(`Error compressing ${image}:`, error);
    }
  }
  console.log('Image compression completed.');
}

main().catch(console.error);
