#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  startDate: '2025-09-25', // Thursday - adjust to your actual start date
  totalDays: 70,
  outputDir: './scripts', // Directory where markdown files will be created
};

/**
 * Formats a date to YYYY-MM-DD
 */
function formatDate(date) {
  return date.toISOString().split('T')[0];
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
  console.log('🚀 Starting blog post seed...\n');
  
  // Parse start date
  const startDate = new Date(CONFIG.startDate);
  
  
  // Ensure output directory exists
  ensureDirectoryExists(CONFIG.outputDir);
  

  let daysConfig = [];

  
  for (let i = 0; i < CONFIG.totalDays; i++) {
    const dayNumber = i + 1;

    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    daysConfig.push({
      "id": dayNumber,
      "date": formatDate(currentDate),
      "location": "Seoul",
      "work": false,
    })


    const fileName = `seed..json`;
    const filePath = path.join(CONFIG.outputDir, fileName);

    let content = JSON.stringify(daysConfig);

    
    try {
      // Write file
      fs.writeFileSync(filePath, content, 'utf8');
    } catch (error) {
      console.error(`❌ Failed to create ${fileName}:`, error.message);
    }
  }


  
}

// Run the generator
try {
  generateBlogFiles();
} catch (error) {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
}