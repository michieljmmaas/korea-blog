import fs from 'fs';
import path from 'path';
import { parseMarkdown } from '../../utils/markdownParser';

export interface BlogPostFrontmatter {
  slug: string;
  title: string;
  description: string;
  publishdate: string;
  draft: boolean;
  thumbnail: string;
}

export interface BlogPost {
  frontmatter: BlogPostFrontmatter;
  content: string;
  fileName: string;
  slug: string;
}

function formatDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get all relevant blog posts (not draft, sorted by ascending publish date)
 */
export async function getAllRelevantBlogPosts(): Promise<BlogPost[]> {
  try {
    const blogPostsDir = path.join(process.cwd(), 'content/posts');
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith('.md'));
    
    const posts: BlogPost[] = [];
    
    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, content } = parseMarkdown(fileContent);
      
      const blogFrontmatter = frontmatter as BlogPostFrontmatter;
      
      // Only include published posts (not drafts)
      if (!blogFrontmatter.draft) {
        posts.push({
          frontmatter: blogFrontmatter,
          content,
          fileName: file,
          slug: blogFrontmatter.slug
        });
      }
    }
    
    // Sort by publish date (ascending)
    posts.sort((a, b) => {
      const dateA = formatDate(a.frontmatter.publishdate);
      const dateB = formatDate(b.frontmatter.publishdate);
      return dateA.getTime() - dateB.getTime();
    });
    
    return posts;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    return [];
  }
}

/**
 * Get blog post by slug
 */
export async function getBlogPost(slug: string): Promise<BlogPost> {
  try {
    const blogPostsDir = path.join(process.cwd(), 'content/posts');
    
    // Try to find file by slug in frontmatter
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith('.md'));
    
    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, content } = parseMarkdown(fileContent);
      
      const blogFrontmatter = frontmatter as BlogPostFrontmatter;
      
      if (blogFrontmatter.slug === slug) {
        return {
          frontmatter: blogFrontmatter,
          content,
          fileName: file,
          slug: blogFrontmatter.slug
        };
      }
    }
    
    throw new Error(`Blog post with slug "${slug}" not found`);
  } catch (error) {
    console.error(`Error reading blog post with slug "${slug}":`, error);
    throw new Error("Error reading blog post");
  }
}

/**
 * Get most recent blog post (not draft, latest publish date)
 */
export async function getMostRecentBlogPost(): Promise<BlogPost | null> {
  try {
    const posts = await getAllRelevantBlogPosts();
    
    if (posts.length === 0) {
      return null;
    }
    
    // Sort by publish date (descending) and get the first one
    const sortedPosts = posts.sort((a, b) => {
      const dateA = formatDate(a.frontmatter.publishdate);
      const dateB = formatDate(b.frontmatter.publishdate);
      return dateB.getTime() - dateA.getTime();
    });
    
    return sortedPosts[0];
  } catch (error) {
    console.error('Error getting most recent blog post:', error);
    return null;
  }
}

/**
 * Get all blog post slugs
 */
export async function getAllBlogPostSlugs(): Promise<string[]> {
  try {
    const blogPostsDir = path.join(process.cwd(), 'content/posts');
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith('.md'));
    
    const slugs: string[] = [];
    
    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { frontmatter } = parseMarkdown(fileContent);
      
      const blogFrontmatter = frontmatter as BlogPostFrontmatter;
      slugs.push(blogFrontmatter.slug);
    }
    
    return slugs;
  } catch (error) {
    console.error('Error reading blog posts directory:', error);
    return [];
  }
}

/**
 * Get adjacent posts for navigation
 */
export async function getAdjacentPosts(currentSlug: string): Promise<{
  previousPost: { slug: string; title: string } | null;
  nextPost: { slug: string; title: string } | null;
}> {
  try {
    const posts = await getAllRelevantBlogPosts();
    
    if (posts.length === 0) {
      return { previousPost: null, nextPost: null };
    }
    
    const currentIndex = posts.findIndex(post => post.slug === currentSlug);
    
    if (currentIndex === -1) {
      return { previousPost: null, nextPost: null };
    }
    
    return {
      previousPost: currentIndex > 0 ? {
        slug: posts[currentIndex - 1].slug,
        title: posts[currentIndex - 1].frontmatter.title
      } : null,
      nextPost: currentIndex < posts.length - 1 ? {
        slug: posts[currentIndex + 1].slug,
        title: posts[currentIndex + 1].frontmatter.title
      } : null
    };
  } catch (error) {
    console.error('Error getting adjacent posts:', error);
    return { previousPost: null, nextPost: null };
  }
}

/**
 * Get blog posts by publish date range
 */
export async function getBlogPostsByDateRange(startDate: string, endDate: string): Promise<BlogPost[]> {
  try {
    const allPosts = await getAllRelevantBlogPosts();
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    
    return allPosts.filter(post => {
      const postDate = formatDate(post.frontmatter.publishdate);
      return postDate >= start && postDate <= end;
    });
  } catch (error) {
    console.error('Error getting blog posts by date range:', error);
    return [];
  }
}