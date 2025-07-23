const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_DIR = './public/assets/blog/originals';
const OUTPUT_DIR = './public/assets/blog/compressed';
const THUMBS_DIR = './public/assets/blog/thumbs';

async function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function processImages() {
  console.log('🖼️  Processing images...');
  
  await ensureDirectoryExists(OUTPUT_DIR);
  await ensureDirectoryExists(THUMBS_DIR);

  if (!fs.existsSync(INPUT_DIR)) {
    console.log('📁 No originals directory found, skipping image processing');
    return;
  }

  const files = fs.readdirSync(INPUT_DIR, { recursive: true });
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  for (const file of imageFiles) {
    const inputPath = path.join(INPUT_DIR, file);
    const { dir, name } = path.parse(file);
    
    // Maintain directory structure
    const outputSubDir = path.join(OUTPUT_DIR, dir);
    const thumbsSubDir = path.join(THUMBS_DIR, dir);
    
    await ensureDirectoryExists(outputSubDir);
    await ensureDirectoryExists(thumbsSubDir);

    const outputPath = path.join(outputSubDir, `${name}.jpg`);
    const thumbPath = path.join(thumbsSubDir, `${name}.jpg`);

    try {
      // Generate compressed version (web quality)
      await sharp(inputPath)
        .jpeg({ quality: 85, progressive: true })
        .resize(1200, 800, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toFile(outputPath);

      // Generate thumbnail
      await sharp(inputPath)
        .jpeg({ quality: 80 })
        .resize(300, 200, { fit: 'cover' })
        .toFile(thumbPath);

      console.log(`✅ Processed: ${file}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log('🎉 Image processing complete!');
}

processImages().catch(console.error);