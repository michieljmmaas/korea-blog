const fs = require('fs');
const path = require('path');

// Function to parse gray matter (frontmatter) from markdown files
function parseGrayMatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontmatterRegex);

    if (!match) {
        return null;
    }

    const frontmatterContent = match[1];
    const parsed = {};

    // Simple YAML parser for our specific structure
    const lines = frontmatterContent.split('\n');
    let currentSection = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed.startsWith('date:')) {
            parsed.date = trimmed.split(':')[1].trim().replace(/"/g, '');
        } else if (trimmed === 'stats:') {
            currentSection = 'stats';
            parsed.stats = {};
        } else if (currentSection === 'stats' && trimmed.includes(':')) {
            const [key, value] = trimmed.split(':');
            parsed.stats[key.trim()] = parseInt(value.trim()) || 0;
        }
    }

    return parsed;
}

// Main function to process all blog posts
function extractBlogStats() {
    const blogPostsDir = './blog-posts';
    const outputFile = './public/blog-stats.json';  // Instead of './blog-stats.json'

    try {
        // Check if the blog-posts directory exists
        if (!fs.existsSync(blogPostsDir)) {
            console.error(`Directory ${blogPostsDir} does not exist!`);
            return;
        }

        // Read all files in the directory
        const files = fs.readdirSync(blogPostsDir);
        const mdFiles = files.filter(file => file.endsWith('.md'));

        console.log(`Found ${mdFiles.length} markdown files`);

        const statsData = {};
        let processedFiles = 0;
        let skippedFiles = 0;

        // Process each markdown file
        for (const file of mdFiles) {
            const filePath = path.join(blogPostsDir, file);

            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const frontmatter = parseGrayMatter(content);

                if (frontmatter && frontmatter.date && frontmatter.stats) {
                    statsData[frontmatter.date] = {
                        stats: frontmatter.stats
                    };
                    processedFiles++;
                    console.log(`✓ Processed: ${file} (${frontmatter.date})`);
                } else {
                    console.log(`⚠ Skipped: ${file} (missing date or stats)`);
                    skippedFiles++;
                }
            } catch (error) {
                console.error(`Error processing ${file}:`, error.message);
                skippedFiles++;
            }
        }

        // Sort the data by date and convert to chart-friendly format
        const sortedDates = Object.keys(statsData).sort();

        // Format 1: Array of objects (good for most chart libraries like Chart.js, Recharts)
        const chartData = sortedDates.map(date => ({
            date: date,
            ...statsData[date].stats
        }));

        // Format 2: Separate arrays for each stat (good for some chart libraries)
        const chartDataArrays = {
            dates: sortedDates,
            kimbap: sortedDates.map(date => statsData[date].stats.kimbap),
            commits: sortedDates.map(date => statsData[date].stats.commits),
            cultural: sortedDates.map(date => statsData[date].stats.cultural),
            steps: sortedDates.map(date => statsData[date].stats.steps),
            worked: sortedDates.map(date => statsData[date].stats.worked)
        };

        // Format 3: Daily totals and cumulative data
        const dailyTotals = chartData.map(day => ({
            date: day.date,
            total: day.kimbap + day.commits + day.cultural + day.worked + (day.steps / 1000) // steps in thousands for better scaling
        }));

        let cumulativeKimbap = 0;
        let cumulativeCommits = 0;
        let cumulativeCultural = 0;
        let cumulativeSteps = 0;
        let cumulativeWorked = 0;

        const cumulativeData = chartData.map(day => {
            cumulativeKimbap += day.kimbap;
            cumulativeCommits += day.commits;
            cumulativeCultural += day.cultural;
            cumulativeSteps += day.steps;
            cumulativeWorked += day.worked;

            return {
                date: day.date,
                kimbap: cumulativeKimbap,
                commits: cumulativeCommits,
                cultural: cumulativeCultural,
                steps: cumulativeSteps,
                worked: cumulativeWorked
            };
        });

        // Create the final output object
        const outputData = {
            daily: chartData,
            arrays: chartDataArrays,
            dailyTotals: dailyTotals,
            cumulative: cumulativeData,
            summary: {
                totalDays: chartData.length,
                dateRange: {
                    start: sortedDates[0],
                    end: sortedDates[sortedDates.length - 1]
                },
                totals: {
                    kimbap: chartData.reduce((sum, day) => sum + day.kimbap, 0),
                    commits: chartData.reduce((sum, day) => sum + day.commits, 0),
                    cultural: chartData.reduce((sum, day) => sum + day.cultural, 0),
                    steps: chartData.reduce((sum, day) => sum + day.steps, 0),
                    worked: chartData.reduce((sum, day) => sum + day.worked, 0)
                },
                averages: {
                    kimbap: (chartData.reduce((sum, day) => sum + day.kimbap, 0) / chartData.length).toFixed(2),
                    commits: (chartData.reduce((sum, day) => sum + day.commits, 0) / chartData.length).toFixed(2),
                    cultural: (chartData.reduce((sum, day) => sum + day.cultural, 0) / chartData.length).toFixed(2),
                    steps: Math.round(chartData.reduce((sum, day) => sum + day.steps, 0) / chartData.length),
                    worked: (chartData.reduce((sum, day) => sum + day.worked, 0) / chartData.length).toFixed(2)
                }
            }
        };

        // Write the JSON file
        fs.writeFileSync(outputFile, JSON.stringify(outputData, null, 2));

        console.log(`\n📊 Stats extraction complete!`);
        console.log(`- Processed: ${processedFiles} files`);
        console.log(`- Skipped: ${skippedFiles} files`);
        console.log(`- Output: ${outputFile}`);

        // Display a sample of the data
        if (outputData.daily.length > 0) {
            console.log(`\n📅 Date range: ${outputData.summary.dateRange.start} to ${outputData.summary.dateRange.end}`);
            console.log(`📊 Total days: ${outputData.summary.totalDays}`);
            console.log(`\n🎯 Trip totals:`);
            console.log(`- Kimbap: ${outputData.summary.totals.kimbap}`);
            console.log(`- Commits: ${outputData.summary.totals.commits}`);
            console.log(`- Cultural: ${outputData.summary.totals.cultural}`);
            console.log(`- Steps: ${outputData.summary.totals.steps.toLocaleString()}`);
            console.log(`- Worked: ${outputData.summary.totals.worked}`);
            console.log(`\n📈 Daily averages:`);
            console.log(`- Kimbap: ${outputData.summary.averages.kimbap}`);
            console.log(`- Commits: ${outputData.summary.averages.commits}`);
            console.log(`- Cultural: ${outputData.summary.averages.cultural}`);
            console.log(`- Steps: ${outputData.summary.averages.steps.toLocaleString()}`);
            console.log(`- Worked: ${outputData.summary.averages.worked}`);
            console.log(`\n🔍 Sample daily entry:`);
            console.log(JSON.stringify(outputData.daily[0], null, 2));
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the script
if (require.main === module) {
    extractBlogStats();
}

module.exports = { extractBlogStats, parseGrayMatter };