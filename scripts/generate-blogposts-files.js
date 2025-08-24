const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

async function generateBlogPosts() {
    try {
        const outputDir = './content/blogs';

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        console.log(`Creating 20 blog post files`);

        // Generate 20 numbered files
        for (let i = 1; i <= 20; i++) {
            const filename = `${i}.md`;
            const filepath = path.join(outputDir, filename);

            // Create frontmatter
            const frontmatter = {
                slug: `post-${i}`,
                title: `Blog Post ${i}`,
                description: `Description for blog post ${i}`,
                publishdate: new Date().toISOString().split('T')[0], 
                draft: true,
                // thumbnail: `/images/thumbnails/post-${i}.jpg`
            };

            // Create basic content template
            const content = `# ${frontmatter.title}

Write your content here for blog post ${i}.

## Section 1

Content goes here.

## Section 2

More content goes here.
`;

            // Write file
            const fileContent = matter.stringify(content, frontmatter);
            fs.writeFileSync(filepath, fileContent);

            console.log(`Generated: ${filename}`);
        }

        console.log(`\nGenerated blog posts in ${outputDir}`);

    } catch (error) {
        console.error('Error generating blog posts:', error);
    }
}

// Run the script
generateBlogPosts();