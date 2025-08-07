import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { getBlogPosts } from '../src/lib/blogData';

// Function to generate ImageKit URL
const generateImageKitUrl = (imagePath: string): string => {
  const baseUrl = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!baseUrl) {
    throw new Error('IMAGEKIT_URL_ENDPOINT environment variable is required');
  }
  
  return `${baseUrl}/tr:n-travel_grid_thumb/${imagePath}`;
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
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// Generate safe filename from date/slug
const generateSafeFilename = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9-]/g, '-') + '.webp';
};

// Main function to download all thumbnails
const generateThumbnails = async (): Promise<void> => {
  try {
    const {days, initialSettings} = await getBlogPosts();
    const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
    const thumbnailMap: Record<string, string> = {};
    
    // Ensure thumbnails directory exists
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }
    
    console.log('🔄 Starting thumbnail downloads...');
    
    // Process each blog post
    for (const post of days) {
      if (post.frontmatter.draft === false) {
        const dateString = post.frontmatter.date;
        const imageLocation = dateString + "/thumb.heic";

        const safeFilename = generateSafeFilename(dateString);
        const localPath = path.join(thumbnailsDir, safeFilename);
        const publicPath = `/thumbnails/${safeFilename}`;
        
        // Skip if file already exists (unless you want to force regenerate)
        if (fs.existsSync(localPath)) {
          console.log(`⏭️  Skipping ${dateString} (already exists)`);
          thumbnailMap[dateString] = publicPath;
          continue;
        }
        
        try {
          const imageUrl = generateImageKitUrl(imageLocation);
          
          console.log(`⬇️  Downloading thumbnail for ${dateString}...`);
          await downloadImage(imageUrl, localPath);
          
          thumbnailMap[dateString] = publicPath;
          console.log(`✅ Downloaded ${dateString}`);
          
          // Small delay to be nice to ImageKit
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Failed to download thumbnail for ${dateString}:`, error);
          // Continue with other images
        }
      }
    }
    
    // Save mapping file for quick lookups
    console.log(`\n🎉 Downloaded ${Object.keys(thumbnailMap).length} thumbnails`);
    console.log(`📁 Saved to: ${thumbnailsDir}`);
    
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