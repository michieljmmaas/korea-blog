#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  startDate: '2025-09-25', // Thursday - adjust to your actual start date
  totalDays: 71,
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


  let locationSeed = {
    0: "Netherlands",
    2: "Macao",
    3: "Macao",
    4: "Macao",
    29: "Busan",
    30: "Busan",
    31: "Busan",
    32: "Busan",
    43: "Japan",
    44: "Japan",
    45: "Japan",
    46: "Japan",
    47: "Japan",
    55: "Taiwan",
    55: "Taiwan",
    56: "Taiwan",
    57: "Taiwan",
    58: "Taiwan",
    59: "Taiwan",
    60: "Taiwan",
    61: "Taiwan",
    62: "Taiwan",
    63: "Hong Kong",
    64: "Hong Kong",
    65: "Hong Kong",
    66: "Hong Kong",
    67: "Hong Kong",
    68: "Hong Kong",
    69: "Hong Kong",
    70: "Hong Kong",
  };

  let travelSeed = {
    1: true,
    28: true,
    42: true,
    47: true,
    56: true,
    63: true,
    70: true,
  };

  let workSeed = {
    12: true,
    13: true,
    14: true,
    18: true,
    19: true,
    20: true,
    26: true,
    27: true,
    28: true,
    33: true,
    34: true,
    35: true,
    39: true,
    40: true,
    41: true,
    42: true,
    48: true,
    49: true,
    50: true,
    21: true,
    36: true,
  };

  let draftSeed = {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
  };

  let photoSeed = {
    4: [1, 2, 3],
  };

  let iconSeed = {
    2: "music",
    3: "music",
    24: "music",
    58: "music",
    64: "music",
    65: "music",
  };

  for (let i = 0; i < CONFIG.totalDays; i++) {
    const dayNumber = i;

    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    daysConfig.push({
      "id": dayNumber,
      "date": formatDate(currentDate),
      "location": locationSeed[i] ?? "Seoul",
      "work": workSeed[i] ?? false,
      "travel": travelSeed[i] ?? false,
      "draft": draftSeed[i] ?? true,
      "photos": photoSeed[i] ?? [],
      "icon": iconSeed[i] ?? [],
    })


    const fileName = `seed.json`;
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