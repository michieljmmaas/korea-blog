import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { getBlogPosts } from '../src/lib/dayService';

// Function to generate ImageKit URL
const generateImageKitUrl = (imagePath: string, transformation: string = 'blog_card_thumb'): string => {
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

// Download daily thumbnails
const downloadDailyThumbnails = async (): Promise<Record<string, string>> => {
  console.log('🔄 Starting daily thumbnail downloads...');
  
  const days = await getBlogPosts();
  const dailyThumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails', 'days-frontpage');
  const thumbnailMap: Record<string, string> = {};
  
  // Ensure daily thumbnails directory exists
  if (!fs.existsSync(dailyThumbnailsDir)) {
    fs.mkdirSync(dailyThumbnailsDir, { recursive: true });
  }
  
  // Process each blog post
  for (const post of days) {
    if (post.frontmatter.draft === false) {
      const dateString = post.frontmatter.date;
      const imageLocation = "days/" + dateString + "/" + post.frontmatter.thumbnail;
      const safeFilename = generateSafeFilename(dateString);
      const localPath = path.join(dailyThumbnailsDir, safeFilename);
      const publicPath = `/thumbnails/days-frontpage/${safeFilename}`;
      
      try {
        const imageUrl = generateImageKitUrl(imageLocation, 'blog_card_thumb');
        
        console.log(`⬇️  Downloading daily thumbnail for ${dateString}...`);
        await downloadImage(imageUrl, localPath);
        
        thumbnailMap[dateString] = publicPath;
        console.log(`✅ Downloaded daily ${dateString}`);
        
        // Small delay to be nice to ImageKit
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to download daily thumbnail for ${dateString}:`, error);
        throw error;
      }
    }
  }
  
  return thumbnailMap;
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
    const dailyThumbnailMap = await downloadDailyThumbnails();
    

    

    
    console.log(`\n🎉 Downloaded ${Object.keys(dailyThumbnailMap).length} daily thumbnails`);
    console.log(`📁 Daily thumbnails saved to: ${path.join(thumbnailsDir, 'days')}`);

    
  } catch (error) {
    console.error('❌ Error generating thumbnails:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateThumbnails();
}

export { generateThumbnails, downloadDailyThumbnails };