#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  startDate: '2025-09-25', // Thursday - adjust to your actual start date
  totalDays: 70,
  outputDir: './blog-posts', // Directory where markdown files will be created
};

/**
 * Formats a date to YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Formats a date for display
 */
function formatDisplayDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Gets the day of the week (0 = Sunday, 1 = Monday, etc.)
 */
function getDayOfWeek(date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Creates the markdown content with gray matter frontmatter
 */
function createMarkdownContent(dayNumber, date) {
  const displayDate = formatDisplayDate(date);
  const dayOfWeek = getDayOfWeek(date);
  
  return `---
title: "Day ${dayNumber}: ${displayDate}"
date: "${formatDate(date)}"
day: ${dayNumber}
dayOfWeek: "${dayOfWeek}"
location: ""
weather: ""
mood: ""
highlights: []
photos: []
expenses:
  accommodation: 0
  food: 0
  transport: 0
  activities: 0
  shopping: 0
  other: 0
tags: []
featured: false
draft: false
coordinates:
  lat: null
  lng: null
---

# Day ${dayNumber}: ${displayDate}

## Morning

## Afternoon

## Evening

## Reflections

## Photos

## Tomorrow's Plans
`;
}

/**
 * Creates a directory if it doesn't exist
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * Main function to generate all blog post files
 */
function generateBlogFiles() {
  console.log('🚀 Starting blog post generation...\n');
  
  // Parse start date
  const startDate = new Date(CONFIG.startDate);
  
  // Validate start date
  if (isNaN(startDate.getTime())) {
    console.error('❌ Invalid start date format. Please use YYYY-MM-DD format.');
    process.exit(1);
  }
  
  // Ensure output directory exists
  ensureDirectoryExists(CONFIG.outputDir);
  
  // Generate files
  let successCount = 0;
  let skipCount = 0;
  
  for (let i = 0; i < CONFIG.totalDays; i++) {
    const dayNumber = i + 1;
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const fileName = `${formatDate(currentDate)}.md`;
    const filePath = path.join(CONFIG.outputDir, fileName);
    
    // // Check if file already exists
    // if (fs.existsSync(filePath)) {
    //   console.log(`⏭️  Skipping Day ${dayNumber} (${fileName}) - file already exists`);
    //   skipCount++;
    //   continue;
    // }
    
    // Create markdown content
    const content = createMarkdownContent(dayNumber, currentDate);
    
    try {
      // Write file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Created Day ${dayNumber}: ${fileName}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${fileName}:`, error.message);
    }
  }
  
  // Summary
  console.log(`\n📊 Generation Summary:`);
  console.log(`   ✅ Created: ${successCount} files`);
  console.log(`   ⏭️  Skipped: ${skipCount} files`);
  console.log(`   📁 Location: ${path.resolve(CONFIG.outputDir)}`);
  
  if (successCount > 0) {
    console.log(`\n🎉 Blog post files generated successfully!`);
    console.log(`\n💡 Tips:`);
    console.log(`   • Edit the gray matter fields at the top of each file`);
    console.log(`   • Add your content below the frontmatter`);
    console.log(`   • Use the 'highlights' array for key moments`);
    console.log(`   • Add photo filenames to the 'photos' array`);
    console.log(`   • Update location and coordinates for mapping`);
  }
}

/**
 * Helper function to show usage information
 */
function showUsage() {
  console.log(`
🌏 South Korea Blog Post Generator

Usage: node generate-blog-files.js [options]

Configuration:
  Start Date: ${CONFIG.startDate}
  Total Days: ${CONFIG.totalDays}
  Output Dir: ${CONFIG.outputDir}

To customize, edit the CONFIG object at the top of this script.

Gray Matter Fields:
  • title: Auto-generated title with day and date
  • date: ISO date format (YYYY-MM-DD)  
  • day: Trip day number (1-70)
  • dayOfWeek: Day name (Monday, Tuesday, etc.)
  • location: City/area you're visiting
  • weather: Weather description
  • mood: Your mood/feelings for the day
  • highlights: Array of key moments/activities
  • photos: Array of photo filenames
  • expenses: Object with different expense categories
  • tags: Array of tags for categorization
  • featured: Boolean for featured posts
  • draft: Boolean to mark drafts
  • coordinates: Lat/lng for mapping integration
`);
}

// Check for help flag
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showUsage();
  process.exit(0);
}

// Run the generator
try {
  generateBlogFiles();
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}