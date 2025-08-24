import { DayFrontmatter, TripDay } from '@/app/types';
import fs from 'fs';
import path from 'path';
import { parseMarkdown } from '../../utils/markdownParser';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}


export async function getBlogPosts(): Promise<TripDay[]> {
  const blogPostsDir = path.join(process.cwd(), 'blog-posts');
  
  try {
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith('.md'));
    
    const days: TripDay[] = [];
    
    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const { frontmatter, content } = parseMarkdown(fileContent);
      
      // Extract date from filename (YYYY-MM-DD.md)
      const dateString = file.replace('.md', '');
      const date = new Date(dateString);
      
      if (!isNaN(date.getTime())) {
        days.push({
          day: frontmatter.day,
          date: date,
          formattedDate: formatDate(date),
          fullDate: date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          }),
          frontmatter: frontmatter as DayFrontmatter,
          content: content,
          fileName: file
        });
      }
    }
    
    // Sort by day number
    days.sort((a, b) => a.day - b.day);
    
    return days;
  } catch (error) {
    console.error('Error reading blog posts:', error);
    
    return [];
  }
}

export interface BlogPost {
  frontmatter: DayFrontmatter;
  content: string;
  fileName: string;
  slug: string;
}

export async function getBlogPostsForDates(dates: string[]): Promise<DayFrontmatter[]> {
  return Promise.all(
    dates.map(async (day) => {
      return getBlogPost(day).then(data => data.frontmatter);
    }));
}


export async function getBlogPost(slug: string): Promise<BlogPost> {
  try {
    const blogPostsDir = path.join(process.cwd(), 'blog-posts');
    const fileName = `${slug}.md`;
    const filePath = path.join(blogPostsDir, fileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error("Post does not exist");
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { frontmatter, content } = parseMarkdown(fileContent);

    return {
      frontmatter: frontmatter as DayFrontmatter,
      content,
      fileName,
      slug
    };
  } catch (error) {
    throw new Error("Error reading blog post");
    // return null;
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
      if (post && post.frontmatter.draft === false) {
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
