import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { getBlogPosts } from '../src/lib/dayService';
import { WeekDataService } from '@/lib/weekService';

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
  const dailyThumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails', 'days');
  const thumbnailMap: Record<string, string> = {};
  
  // Ensure daily thumbnails directory exists
  if (!fs.existsSync(dailyThumbnailsDir)) {
    fs.mkdirSync(dailyThumbnailsDir, { recursive: true });
  }
  
  // Process each blog post
  for (const post of days) {
    if (post.frontmatter.draft === false) {
      const dateString = post.frontmatter.date;
      const imageLocation = dateString + "/thumb.heic";
      const safeFilename = generateSafeFilename(dateString);
      const localPath = path.join(dailyThumbnailsDir, safeFilename);
      const publicPath = `/thumbnails/days/${safeFilename}`;
      
      // Skip if file already exists (unless you want to force regenerate)
      if (fs.existsSync(localPath)) {
        console.log(`⏭️  Skipping daily ${dateString} (already exists)`);
        thumbnailMap[dateString] = publicPath;
        continue;
      }
      
      try {
        const imageUrl = generateImageKitUrl(imageLocation, 'travel_grid_thumb');
        
        console.log(`⬇️  Downloading daily thumbnail for ${dateString}...`);
        await downloadImage(imageUrl, localPath);
        
        thumbnailMap[dateString] = publicPath;
        console.log(`✅ Downloaded daily ${dateString}`);
        
        // Small delay to be nice to ImageKit
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Failed to download daily thumbnail for ${dateString}:`, error);
        // Continue with other images
      }
    }
  }
  
  return thumbnailMap;
};

// Download weekly thumbnails
const downloadWeeklyThumbnails = async (): Promise<Record<string, string>> => {
  console.log('🔄 Starting weekly thumbnail downloads...');
  
  const weeks = await WeekDataService.getAllWeeks();
  const weeklyThumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails', 'weeks');
  const thumbnailMap: Record<string, string> = {};
  
  // Ensure weekly thumbnails directory exists
  if (!fs.existsSync(weeklyThumbnailsDir)) {
    fs.mkdirSync(weeklyThumbnailsDir, { recursive: true });
  }
  
  // Process each week
  for (const week of weeks) {
    if (week.draft === true) {
      continue;
    }

    const weekIndex = week.index; // Adjust property name as needed based on your week data structure
    const imageLocation = `weeks/${weekIndex}/thumb.heic`;
    const filename = `${weekIndex}.webp`;
    const localPath = path.join(weeklyThumbnailsDir, filename);
    const publicPath = `/thumbnails/weeks/${filename}`;
    
    // Skip if file already exists (unless you want to force regenerate)
    if (fs.existsSync(localPath)) {
      console.log(`⏭️  Skipping week ${weekIndex} (already exists)`);
      thumbnailMap[weekIndex.toString()] = publicPath;
      continue;
    }
    
    try {
      const imageUrl = generateImageKitUrl(imageLocation, 'week_thumb_full');
      
      console.log(`⬇️  Downloading weekly thumbnail for week ${weekIndex}...`);
      await downloadImage(imageUrl, localPath);
      
      thumbnailMap[weekIndex.toString()] = publicPath;
      console.log(`✅ Downloaded week ${weekIndex}`);
      
      // Small delay to be nice to ImageKit
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`❌ Failed to download weekly thumbnail for week ${weekIndex}:`, error);
      // Continue with other images
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
    
    // Download weekly thumbnails
    const weeklyThumbnailMap = await downloadWeeklyThumbnails();
    
    // Save mapping files for quick lookups (optional)
    const dailyMapPath = path.join(thumbnailsDir, 'daily-thumbnail-map.json');
    const weeklyMapPath = path.join(thumbnailsDir, 'weekly-thumbnail-map.json');
    
    fs.writeFileSync(dailyMapPath, JSON.stringify(dailyThumbnailMap, null, 2));
    fs.writeFileSync(weeklyMapPath, JSON.stringify(weeklyThumbnailMap, null, 2));
    
    console.log(`\n🎉 Downloaded ${Object.keys(dailyThumbnailMap).length} daily thumbnails`);
    console.log(`🎉 Downloaded ${Object.keys(weeklyThumbnailMap).length} weekly thumbnails`);
    console.log(`📁 Daily thumbnails saved to: ${path.join(thumbnailsDir, 'days')}`);
    console.log(`📁 Weekly thumbnails saved to: ${path.join(thumbnailsDir, 'weeks')}`);
    
  } catch (error) {
    console.error('❌ Error generating thumbnails:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  generateThumbnails();
}

export { generateThumbnails, downloadDailyThumbnails, downloadWeeklyThumbnails };