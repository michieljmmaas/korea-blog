const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Assuming you have your getBlogPosts function available
// If not, here's a basic implementation:
async function getBlogPosts(directory = './content/days') {
    const files = fs.readdirSync(directory);
    const posts = [];

    for (const file of files) {
        if (path.extname(file) === '.md') {
            const filePath = path.join(directory, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const parsed = matter(content);
            posts.push({
                ...parsed.data,
                content: parsed.content,
                filename: file
            });
        }
    }

    posts.sort((a, b) => new Date(a.date) - new Date(b.date));
    return posts;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function groupPostsByWeek(posts) {
    const groups = [];

    // Week 0: only 2025-09-25
    const week0Posts = posts.filter(post => post.date === '2025-09-25');
    if (week0Posts.length > 0) {
        groups.push(week0Posts);
    }

    // Week 1 and beyond: 7-day chunks starting from 2025-09-26
    const remainingPosts = posts.filter(post => post.date > '2025-09-25');

    if (remainingPosts.length > 0) {
        // Simple chunking of remaining posts into groups of 7
        for (let i = 0; i < remainingPosts.length; i += 7) {
            const chunk = remainingPosts.slice(i, i + 7);
            groups.push(chunk);
        }
    }

    return groups;
}

async function generateWeeklyPosts() {
    try {
        // Preset locations for each week (you can modify these as needed)
        const weekLocations = {
            0: "Netherlands",
            1: "Seoul",
            2: "Seoul",
            3: "Seoul",
            4: "Seoul",
            5: "Busan",
            6: "Seoul",
            7: "Tokyo",
            8: "Seoul",
            9: "Taiwan",
            10: "Hong Kong",
        };

        // Get all blog posts sorted by date
        const posts = await getBlogPosts();

        if (posts.length === 0) {
            console.log('No blog posts found.');
            return;
        }

        console.log(`Found ${posts.length} blog posts`);

        // Group posts by custom week logic
        const weeklyChunks = groupPostsByWeek(posts);

        console.log(`Creating ${weeklyChunks.length} weekly files`);

        // Create weekly markdown files
        const outputDir = './content/weekly';

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        weeklyChunks.forEach((weekPosts, index) => {
            const weekNumber = index;

            // Generate filename
            const filename = `week-${weekNumber}.md`; // week-0, week-1, etc.
            const filepath = path.join(outputDir, filename);

            // Get start and end dates from the actual posts
            const startPost = weekPosts[0];
            const endPost = weekPosts[weekPosts.length - 1];
            const startDate = new Date(startPost.date);
            const endDate = new Date(endPost.date);

            // Generate title based on the week
            let title;
            if (weekNumber === 0) {
                title = `Week 0: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            } else {
                title = `Week ${weekNumber}: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            }

            // Get all unique tags from posts in this week
            const allTags = new Set();
            weekPosts.forEach(post => {
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => allTags.add(tag));
                }
            });

            // Get all dates from this week's posts
            const days = weekPosts.map(post => post.date).sort();

            // Get preset location for this week
            const weekLocation = weekLocations[weekNumber] || "Unknown";

            // Create frontmatter with preset location
            const frontmatter = {
                index,
                title,
                publishdate: endPost.date, // Use last day as publish date
                photos: [],
                tags: Array.from(allTags).sort(),
                location: weekLocation, // Single preset location value
                draft: true,
                days,
                icons: [],
            };

            // Generate daily breakdown content
            const dailyBreakdown = weekPosts.map(post => {
                const postDate = new Date(post.date);
                const dayName = postDate.toLocaleDateString('en-US', { weekday: 'long' });

                return `**${post.date}** (${dayName}) - ${post.title ? ` - ${post.title.split(':')[1]?.trim() || post.title}` : ''}`;
            }).join('\n');


            // Check if file exists and preserve existing content
            let existingContent = '';
            if (fs.existsSync(filepath)) {
                const existingFile = fs.readFileSync(filepath, 'utf8');
                const parsed = matter(existingFile);
                existingContent = parsed.content;
            }

            // Use existing content if available, otherwise create template
            const dateRange = weekPosts.length > 1 ? ` from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}` : ` on ${startDate.toLocaleDateString()}`;

            const content = `# ${title}

## Summary

This week covered ${weekPosts.length} day${weekPosts.length > 1 ? 's' : ''}${dateRange}.

### Daily Breakdown

${dailyBreakdown}

### Highlights

<!-- Add weekly highlights here -->

## Reflection

<!-- Add weekly reflection here -->
`;

            // Write file
            const fileContent = matter.stringify(content, frontmatter);
            fs.writeFileSync(filepath, fileContent);

            console.log(`Generated: ${filename} (${weekPosts.length} day${weekPosts.length > 1 ? 's' : ''}: ${startPost.date}${weekPosts.length > 1 ? ` to ${endPost.date}` : ''})`);
        });

        console.log(`\nGenerated ${weeklyChunks.length} weekly blog posts in ${outputDir}`);

    } catch (error) {
        console.error('Error generating weekly posts:', error);
    }
}

// Run the script
generateWeeklyPosts();