// lib/blogPost.ts
import fs from 'fs';
import path from 'path';
import { parseMarkdown } from '../../utils/markdownParser';
import { BlogPostFrontmatter } from '@/app/types';

export interface BlogPost {
  frontmatter: BlogPostFrontmatter;
  content: string;
  fileName: string;
  slug: string;
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const blogPostsDir = path.join(process.cwd(), 'blog-posts');
    const fileName = `${slug}.md`;
    const filePath = path.join(blogPostsDir, fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, content } = parseMarkdown(fileContent);
    
    return {
      frontmatter: frontmatter as BlogPostFrontmatter,
      content,
      fileName,
      slug
    };
  } catch (error) {
    console.error('Error reading blog post:', error);
    return null;
  }
}

export async function getAllBlogPostSlugs(): Promise<string[]> {
  try {
    const blogPostsDir = path.join(process.cwd(), 'blog-posts');
    const files = fs.readdirSync(blogPostsDir);
    
    return files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));
  } catch (error) {
    console.error('Error reading blog posts directory:', error);
    return [];
  }
}

// Get adjacent posts for navigation
export async function getAdjacentPosts(currentDay: number): Promise<{
  previousPost: { day: number; slug: string; title: string } | null;
  nextPost: { day: number; slug: string; title: string } | null;
}> {
  try {
    const slugs = await getAllBlogPostSlugs();
    const posts: Array<{ day: number; slug: string; title: string }> = [];
    
    for (const slug of slugs) {
      const post = await getBlogPost(slug);
      if (post) {
        posts.push({
          day: post.frontmatter.day,
          slug,
          title: post.frontmatter.title
        });
      }
    }
    
    // Sort by day
    posts.sort((a, b) => a.day - b.day);
    
    const currentIndex = posts.findIndex(post => post.day === currentDay);
    
    return {
      previousPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
      nextPost: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null
    };
  } catch (error) {
    console.error('Error getting adjacent posts:', error);
    return { previousPost: null, nextPost: null };
  }
}
