import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { getBlogPosts } from '../src/lib/dayService';

// Function to generate ImageKit URL
const generateImageKitUrl = (imagePath: string, transformation: string = 'travel_grid_thumb'): string => {
  const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!baseUrl) {
    throw new Error('IMAGEKIT_URL_ENDPOINT environment variable is required');
  }

  return `${baseUrl}/tr:n-${transformation}/${imagePath}`;
};

// Download image from URL and save locally
const downloadImage = async (url: string, filepath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        fs.unlink(filepath, () => { }); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Generate safe filename from date/slug
const generateSafeFilename = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9-]/g, '-') + '.png';
};

// Download daily thumbnails
const downloadAllPictures = async (): Promise<void> => {
  console.log('🔄 Downloading all thumbnails...');

  const days = await getBlogPosts();
  const dailyThumbnailsDir = path.join(process.cwd(), 'public', 'all-pictures');

  // Ensure daily thumbnails directory exists
  if (!fs.existsSync(dailyThumbnailsDir)) {
    fs.mkdirSync(dailyThumbnailsDir, { recursive: true });
  }

  // Process each blog post
  for (const post of days) {
    for (const picture of post.frontmatter.photos) {
      if (post.frontmatter.draft === false) {
        const dateString = post.frontmatter.date;
        const imageLocation = "days/" + dateString + "/" + picture;
        const safeFilename = generateSafeFilename(dateString + "-" + picture);
        const localPath = path.join(dailyThumbnailsDir, safeFilename);

        // Skip if file already exists (unless you want to force regenerate)
        if (fs.existsSync(localPath)) {
          console.log(`⏭️  Picture  ${localPath} (already exists)`);
          continue;
        }

        try {
          const imageUrl = generateImageKitUrl(imageLocation, 'blog-landscape');

          console.log(`⬇️  Downloading image for ${imageLocation}...`);
          await downloadImage(imageUrl, localPath);

          console.log(`✅ Downloaded image ${dateString}`);

          // Small delay to be nice to ImageKit
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Failed to download daily thumbnail for ${dateString}:`, error);
          throw error;
        }
      }
    }
  }

};

// Main function to download all thumbnails
const generateThumbnails = async (): Promise<void> => {
  try {
    const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');

    // Ensure main thumbnails directory exists
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    // Download daily thumbnails
    await downloadAllPictures();



  } catch (error) {
    console.error('❌ Error generating thumbnails:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateThumbnails();
}

export { generateThumbnails };