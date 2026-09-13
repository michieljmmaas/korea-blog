import { DayFrontmatter, TripDay } from "@/app/types";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export interface BlogPost {
  frontmatter: DayFrontmatter;
  content: string;
  fileName: string;
  slug: string;
}

export class DayService {
  static async getBlogPosts(): Promise<TripDay[]> {
    const blogPostsDir = path.join(process.cwd(), "content/days");

    try {
      const files = fs.readdirSync(blogPostsDir);
      const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

      const days: TripDay[] = [];

      for (const file of markdownFiles) {
        const filePath = path.join(blogPostsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data: frontmatter, content } = matter(fileContent);

        // Extract date from filename (YYYY-MM-DD.md)
        const dateString = file.replace(".md", "");
        const date = new Date(dateString);

        if (!isNaN(date.getTime())) {
          days.push({
            day: frontmatter.day,
            date: date,
            formattedDate: formatDate(date),
            fullDate: date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
            frontmatter: frontmatter as DayFrontmatter,
            content: content,
            fileName: file,
          });
        }
      }

      // Sort by day number
      days.sort((a, b) => a.day - b.day);

      return days;
    } catch (error) {
      console.error("Error reading blog posts:", error);

      return [];
    }
  }

  static async getBlogPostsForDates(dates: string[]): Promise<DayFrontmatter[]> {
    return Promise.all(
      dates.map(async (day) => {
        return this.getBlogPost(day).then((data) => data.frontmatter);
      }),
    );
  }

  static async getBlogForNumber(index: number): Promise<DayFrontmatter> {
    const slugs = await this.getAllBlogPostSlugs();
    const slug = slugs[index];
    const data = await this.getBlogPost(slug);
    return data.frontmatter;
  }

  static async getRandomDay(current: number | null): Promise<TripDay> {
    let random = Math.floor(Math.random() * 71);

    while (random === current) {
      random = Math.floor(Math.random() * 71);
    }

    return this.getBlogPosts().then((data) => data[random]);
  }

  static async getBlogPost(slug: string): Promise<BlogPost> {
    try {
      const blogPostsDir = path.join(process.cwd(), "content/days");
      const fileName = `${slug}.md`;
      const filePath = path.join(blogPostsDir, fileName);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error("Post does not exist");
      }

      const fileContent = fs.readFileSync(filePath, "utf8");
      const { data: frontmatter, content } = matter(fileContent);

      return {
        frontmatter: frontmatter as DayFrontmatter,
        content,
        fileName,
        slug,
      };
    } catch (error) {
      console.error(`Error reading day post "${slug}":`, error);
      throw new Error("Error reading blog post");
    }
  }

  static async getAllBlogPostSlugs(): Promise<string[]> {
    try {
      const blogPostsDir = path.join(process.cwd(), "content/days");
      const files = fs.readdirSync(blogPostsDir);

      return files
        .filter((file) => file.endsWith(".md"))
        .map((file) => file.replace(".md", ""));
    } catch (error) {
      console.error("Error reading blog posts directory:", error);
      return [];
    }
  }

  /**
   * Get the latest day (highest date) that is not a draft
   */
  static async getLatestDay(): Promise<TripDay | null> {
    try {
      const days = await this.getBlogPosts();

      // Filter out drafts and find the one with highest date
      const publishedDays = days.filter((day) => day.frontmatter.draft === false);

      if (publishedDays.length === 0) {
        return null;
      }

      // Find day with highest date
      return publishedDays.reduce((latest, current) => {
        return current.date > latest.date ? current : latest;
      });
    } catch (error) {
      console.error("Error getting latest day:", error);
      return null;
    }
  }

  // Get adjacent posts for navigation
  static async getAdjacentPosts(currentDay: number): Promise<{
    previousPost: { day: number; slug: string; title: string } | null;
    nextPost: { day: number; slug: string; title: string } | null;
  }> {
    try {
      const slugs = await this.getAllBlogPostSlugs();
      const posts: Array<{ day: number; slug: string; title: string }> = [];

      for (const slug of slugs) {
        const post = await this.getBlogPost(slug);
        if (post && post.frontmatter.draft === false) {
          posts.push({
            day: post.frontmatter.day,
            slug,
            title: post.frontmatter.title,
          });
        }
      }

      // Sort by day
      posts.sort((a, b) => a.day - b.day);

      const currentIndex = posts.findIndex((post) => post.day === currentDay);

      return {
        previousPost: currentIndex > 0 ? posts[currentIndex - 1] : null,
        nextPost:
          currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
      };
    } catch (error) {
      console.error("Error getting adjacent posts:", error);
      return { previousPost: null, nextPost: null };
    }
  }
}
