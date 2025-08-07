import { BlogPostFrontmatter, GridSettings, TripDay } from '@/app/types';
import fs from 'fs';
import path from 'path';
import { parseMarkdown } from '../../utils/markdownParser';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}


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
          frontmatter: frontmatter as BlogPostFrontmatter,
          content: content,
          fileName: file
        });
      }
    }
    
    // Sort by day number
    days.sort((a, b) => a.day - b.day);
    
    const initialSettings: GridSettings = {
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
        totalDays: 0,
        startDate: new Date()
      }
    };
  }
}
