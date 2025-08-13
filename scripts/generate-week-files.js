const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Assuming you have your getBlogPosts function available
// If not, here's a basic implementation:
async function getBlogPosts(directory = './blog-posts') {
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
    posts.shift();
    return posts;
}

function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function generateWeeklyPosts() {
    try {
        // Get all blog posts sorted by date
        const posts = await getBlogPosts();

        if (posts.length === 0) {
            console.log('No blog posts found.');
            return;
        }

        console.log(`Found ${posts.length} blog posts`);

        // Group posts into chunks of 7 days
        const weeklyChunks = chunkArray(posts, 7);

        console.log(`Creating ${weeklyChunks.length} weekly files`);

        // Create weekly markdown files
        const outputDir = './content/weekly';

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        weeklyChunks.forEach((weekPosts, index) => {
            const weekNumber = index + 1;

            // Generate filename
            const filename = `week-${weekNumber - 1}.md`; // week-0, week-1, etc.
            const filepath = path.join(outputDir, filename);


            // Get start and end dates from the actual posts
            const startPost = weekPosts[0];
            const endPost = weekPosts[weekPosts.length - 1];
            const startDate = new Date(startPost.date);
            const endDate = new Date(endPost.date);

            // Generate title based on the week
            const title = `Week ${weekNumber}: ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

            // Get all unique tags from posts in this week
            const allTags = new Set();
            weekPosts.forEach(post => {
                if (post.tags && Array.isArray(post.tags)) {
                    post.tags.forEach(tag => allTags.add(tag));
                }
            });

            // Get all dates from this week's posts
            const days = weekPosts.map(post => post.date).sort();

            // Create frontmatter
            const frontmatter = {
                index,
                title,
                publishdate: endPost.date, // Use last day as publish date
                photos: [],
                tags: Array.from(allTags).sort(),
                draft: true,
                days
            };

            // Generate daily breakdown content
            const dailyBreakdown = weekPosts.map(post => {
                const postDate = new Date(post.date);
                const dayName = postDate.toLocaleDateString('en-US', { weekday: 'long' });
                const location = post.location || 'Unknown';
                const workDay = post.work ? '💼 ' : '';

                return `**${post.date}** (${dayName}) - ${workDay}${location}${post.title ? ` - ${post.title.split(':')[1]?.trim() || post.title}` : ''}`;
            }).join('\n');

            const workDays = weekPosts.filter(post => post.work).length;
            const locations = [...new Set(weekPosts.map(post => post.location).filter(Boolean))];

            // Check if file exists and preserve existing content
            let existingContent = '';
            if (fs.existsSync(filepath)) {
                const existingFile = fs.readFileSync(filepath, 'utf8');
                const parsed = matter(existingFile);
                existingContent = parsed.content;
            }

            // Use existing content if available, otherwise create template
            const content = existingContent || `# ${title}

## Summary

This week covered ${weekPosts.length} days from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}.

**Locations visited:** ${locations.join(', ')}  
**Work days:** ${workDays}/${weekPosts.length}

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

            console.log(`Generated: ${filename} (${weekPosts.length} days: ${startPost.date} to ${endPost.date})`);
        });

        console.log(`\nGenerated ${weeklyChunks.length} weekly blog posts in ${outputDir}`);

    } catch (error) {
        console.error('Error generating weekly posts:', error);
    }
}

// Run the script
generateWeeklyPosts();