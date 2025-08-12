#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  seedFile: path.join(__dirname, 'seed.json'), // seed.json in the scripts directory
  outputDir: path.join(__dirname, '..', 'blog-posts'), // blog-posts in the root directory
};

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
 * Creates the markdown content with gray matter frontmatter using seed data
 */
function createMarkdownContent(seedEntry) {
  const date = new Date(seedEntry.date);
  const displayDate = formatDisplayDate(date);
  const dayOfWeek = getDayOfWeek(date);

  // Determine initial mood and tags based on work status
  const initialTags = seedEntry.work ? ["work"] : ["exploration"];

  // Add location tag if provided
  if (seedEntry.location && seedEntry.location.trim() !== '') {
    initialTags.push(seedEntry.location.toLowerCase().replace(/\s+/g, '-'));
  }

  return `---
title: "Day ${seedEntry.id}: ${displayDate}"
date: "${seedEntry.date}"
day: ${seedEntry.id}
dayOfWeek: "${dayOfWeek}"
location: "${seedEntry.location || ''}"
photos: []
stats:
  kimbap: 0
  commits: 0
  cultural: 0
  steps: 0
tags: ${JSON.stringify(initialTags)}
draft: ${seedEntry.draft || false}
coordinates:
  lat: null
  lng: null
work: ${seedEntry.work || false}
---

# Day ${seedEntry.id}: ${displayDate}

${seedEntry.location ? `📍 **Location:** ${seedEntry.location}` : ''}
${seedEntry.work ? '💼 **Work Day**' : '🎒 **Adventure Day**'}

## What do I do today?


`;
}

/**
 * Reads and parses the seed JSON file
 */
function readSeedFile() {
  try {
    const seedPath = path.resolve(CONFIG.seedFile);

    if (!fs.existsSync(seedPath)) {
      console.error(`❌ Seed file not found: ${seedPath}`);
      console.log(`\n💡 Create a seed.json file with entries like:`);
      console.log(`[
  {
    "id": 1,
    "date": "2024-03-07",
    "location": "Seoul",
    "work": false
  },
  {
    "id": 2,
    "date": "2024-03-08",
    "location": "Busan",
    "work": true
  }
]`);
      process.exit(1);
    }

    const seedContent = fs.readFileSync(seedPath, 'utf8');
    const seedData = JSON.parse(seedContent);

    if (!Array.isArray(seedData)) {
      console.error('❌ Seed file must contain an array of entries');
      process.exit(1);
    }

    // Validate seed entries
    for (const entry of seedData) {
      // Validate date format
      const date = new Date(entry.date);
      if (isNaN(date.getTime())) {
        console.error(`❌ Invalid date format in entry ${entry.id}: ${entry.date}`);
        console.log('Use YYYY-MM-DD format');
        process.exit(1);
      }
    }

    // Sort by id to ensure proper order
    seedData.sort((a, b) => a.id - b.id);

    return seedData;
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Seed file not found: ${CONFIG.seedFile}`);
    } else if (error instanceof SyntaxError) {
      console.error('❌ Invalid JSON in seed file:', error.message);
    } else {
      console.error('❌ Error reading seed file:', error.message);
    }
    process.exit(1);
  }
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
 * Main function to generate all blog post files from seed data
 */
function generateBlogFiles() {
  console.log('🚀 Starting blog post generation from seed file...\n');

  // Read seed data
  const seedData = readSeedFile();
  console.log(`📖 Loaded ${seedData.length} entries from seed file`);

  // Show summary of seed data
  const workDays = seedData.filter(entry => entry.work).length;
  const adventureDays = seedData.length - workDays;
  const locations = [...new Set(seedData.map(entry => entry.location).filter(Boolean))];

  console.log(`   🎒 Adventure days: ${adventureDays}`);
  console.log(`   💼 Work days: ${workDays}`);
  console.log(`   📍 Locations: ${locations.join(', ')}\n`);

  // Ensure output directory exists
  ensureDirectoryExists(CONFIG.outputDir);

  // Generate files
  let successCount = 0;
  let skipCount = 0;
  let updateCount = 0;

  for (const seedEntry of seedData) {
    const fileName = `${seedEntry.date}.md`;
    const filePath = path.join(CONFIG.outputDir, fileName);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`⚠️  File exists for Day ${seedEntry.id} (${fileName})`);

      // Option to update existing files with new seed data (preserving content)
      try {
        const existingContent = fs.readFileSync(filePath, 'utf8');
        const frontmatterMatch = existingContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

        if (frontmatterMatch) {
          // Create new content with updated frontmatter but preserve body
          const [, , existingBody] = frontmatterMatch;
          const newContent = createMarkdownContent(seedEntry);
          const newFrontmatterMatch = newContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);

          if (newFrontmatterMatch) {
            const [, newFrontmatter] = newFrontmatterMatch;
            const updatedContent = `---\n${newFrontmatter}\n---\n${existingBody}`;

            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`   ✅ Updated frontmatter for Day ${seedEntry.id}`);
            updateCount++;
            continue;
          }
        }

        console.log(`   ⏭️  Skipping Day ${seedEntry.id} - keeping existing file`);
        skipCount++;
        continue;
      } catch (error) {
        console.error(`   ❌ Error updating ${fileName}:`, error.message);
        continue;
      }
    }

    // Create new markdown content
    const content = createMarkdownContent(seedEntry);

    try {
      // Write file
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Created Day ${seedEntry.id}: ${fileName} (${seedEntry.location || 'No location'}, ${seedEntry.work ? 'Work' : 'Adventure'})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create ${fileName}:`, error.message);
    }
  }

  // Summary
  console.log(`\n📊 Generation Summary:`);
  console.log(`   ✅ Created: ${successCount} files`);
  console.log(`   🔄 Updated: ${updateCount} files`);
  console.log(`   ⏭️  Skipped: ${skipCount} files`);
  console.log(`   📁 Location: ${path.resolve(CONFIG.outputDir)}`);

  if (successCount > 0 || updateCount > 0) {
    console.log(`\n🎉 Blog post files generated successfully!`);
    console.log(`\n💡 Tips:`);
    console.log(`   • Files are created as drafts (draft: true)`);
    console.log(`   • Work days get productivity-focused templates`);
    console.log(`   • Adventure days get travel-focused templates`);
    console.log(`   • Location and work status are pre-filled from seed data`);
    console.log(`   • Update seed.json and re-run to update frontmatter`);
  }
}

/**
 * Helper function to show usage information
 */
function showUsage() {
  console.log(`
🌏 South Korea Blog Post Generator (Seed-based)

Usage: node generate-blog-files.js [options]

Configuration:
  Seed File: ${CONFIG.seedFile}
  Output Dir: ${CONFIG.outputDir}

Seed JSON Format:
[
  {
    "id": 1,
    "date": "2024-03-07",
    "location": "Seoul",
    "work": false
  },
  {
    "id": 2, 
    "date": "2024-03-08",
    "location": "Busan",
    "work": true
  }
]

Required Fields:
  • id: Trip day number
  • date: Date in YYYY-MM-DD format

Optional Fields:
  • location: City/area name
  • work: Boolean for work vs adventure days

Features:
  • Pre-populates frontmatter from seed data
  • Different templates for work vs adventure days
  • Updates existing files' frontmatter while preserving content
  • Validates dates and data structure
  • Auto-generates tags based on location and work status
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