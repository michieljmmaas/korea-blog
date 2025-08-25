const fs = require('fs');
const path = require('path');

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
        } else if (trimmed.startsWith('day:')) {
            parsed.day = parseInt(trimmed.split(':')[1].trim()) || 0;
        } else if (trimmed.startsWith('draft:')) {
            // Parse draft field - handle both boolean and string values
            const draftValue = trimmed.split(':')[1].trim().toLowerCase();
            parsed.draft = draftValue === 'true' || draftValue === true;
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
    const blogPostsDir = './conent/days';
    const outputFile = './public/blog-stats.json';

    try {
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
                    // Skip day 0 - check if the frontmatter has a day field
                    if (frontmatter.day === 0) {
                        console.log(`⏭ Skipped: ${file} (Day 0 - not counted)`);
                        skippedFiles++;
                        continue;
                    }

                    // Skip draft posts
                    if (frontmatter.draft === true) {
                        console.log(`📝 Skipped: ${file} (Draft - not published)`);
                        skippedFiles++;
                        continue;
                    }

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

        // Format for chart: Array of objects (good for Recharts)
        const chartData = sortedDates.map(date => ({
            date: date,
            ...statsData[date].stats
        }));

        // Cumulative data for progress tracking
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

        // Create the final output object (simplified for chart use)
        const outputData = {
            daily: chartData,
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