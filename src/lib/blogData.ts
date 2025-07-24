import { BlogPostFrontmatter, GridSettings, TripDay } from '@/app/types';
import fs from 'fs';
import path from 'path';
import { parseMarkdown } from '../../utils/markdownParser';

export async function getBlogPosts(): Promise<{ days: TripDay[]; initialSettings: GridSettings }> {
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
      
      if (!isNaN(date.getTime()) && frontmatter.day) {
        days.push({
          day: frontmatter.day,
          date: date,
          formattedDate: date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          fullDate: date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric',
            month: 'long', 
            day: 'numeric' 
          }),
          frontmatter: frontmatter as BlogPostFrontmatter,
          content: content,
          fileName: file
        });
      }
    }
    
    // Sort by day number
    days.sort((a, b) => a.day - b.day);
    
    const initialSettings: GridSettings = {
      squareSize: 'small',
      totalDays: days.length,
      startDate: days.length > 0 ? days[0].date : new Date()
    };
    
    return {
      days,
      initialSettings
    };
  } catch (error) {
    console.error('Error reading blog posts:', error);
    
    return {
      days: [],
      initialSettings: {
        squareSize: 'small' as const,
        totalDays: 0,
        startDate: new Date()
      }
    };
  }
}
