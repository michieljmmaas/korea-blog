import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { BlogPost, BlogPostFrontmatter, WeekData } from "@/app/types";

function formatDate(dateString: string): Date {
  return new Date(dateString);
}

export class BlogService {
  /**
   * Get all relevant blog posts (not draft, sorted by descending publish date)
   */
  static async getAllRelevantBlogPosts(): Promise<BlogPost[]> {
    try {
      const blogPostsDir = path.join(process.cwd(), "content/blogs");
      const files = fs.readdirSync(blogPostsDir);
      const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

      const posts: BlogPost[] = [];

      for (const file of markdownFiles) {
        const filePath = path.join(blogPostsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data: frontmatter, content } = matter(fileContent);

        const blogFrontmatter = frontmatter as BlogPostFrontmatter;

        // Only include published posts (not drafts)
        if (!blogFrontmatter.draft) {
          posts.push({
            frontmatter: blogFrontmatter,
            content,
            fileName: file,
            slug: blogFrontmatter.slug,
          });
        }
      }

      // Sort by publish date (descending)
      posts.sort((a, b) => {
        const dateA = formatDate(a.frontmatter.publishdate);
        const dateB = formatDate(b.frontmatter.publishdate);
        return dateB.getTime() - dateA.getTime();
      });

      return posts;
    } catch (error) {
      console.error("Error reading blog posts:", error);
      return [];
    }
  }

  /**
   * Get blog post by slug
   */
  static async getBlogPost(slug: string): Promise<BlogPost | null> {
    try {
      const blogPostsDir = path.join(process.cwd(), "content/blogs");

      // Try to find file by slug in frontmatter
      const files = fs.readdirSync(blogPostsDir);
      const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

      for (const file of markdownFiles) {
        const filePath = path.join(blogPostsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data: frontmatter, content } = matter(fileContent);

        const blogFrontmatter = frontmatter as BlogPostFrontmatter;

        if (blogFrontmatter.slug === slug) {
          return {
            frontmatter: blogFrontmatter,
            content,
            fileName: file,
            slug: blogFrontmatter.slug,
          };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error reading blog post "${slug}":`, error);
      return null;
    }
  }

  /**
   * Get most recent blog post (not draft, latest publish date)
   */
  static async getMostRecentBlogPost(): Promise<BlogPost | null> {
    try {
      const posts = await this.getAllRelevantBlogPosts();

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
      console.error("Error getting most recent blog post:", error);
      return null;
    }
  }

  /**
   * Get all blog post slugs
   */
  static async getAllBlogPostSlugs(): Promise<string[]> {
    try {
      const blogPostsDir = path.join(process.cwd(), "content/blogs");
      const files = fs.readdirSync(blogPostsDir);
      const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

      const slugs: string[] = [];

      for (const file of markdownFiles) {
        const filePath = path.join(blogPostsDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const { data: frontmatter } = matter(fileContent);

        const blogFrontmatter = frontmatter as BlogPostFrontmatter;
        slugs.push(blogFrontmatter.slug);
      }

      return slugs;
    } catch (error) {
      console.error("Error reading blog posts directory:", error);
      return [];
    }
  }

  static async getBlogpostsForWeek(week: WeekData): Promise<BlogPost[]> {
    const allBlogPosts = await this.getAllRelevantBlogPosts();
    const dates = week.days;
    const otherPosts = allBlogPosts.filter((post) =>
      dates.includes(post.frontmatter.publishdate),
    );
    return otherPosts.slice(0, 2);
  }

  static async getRelatedBlogPosts(currentPost: BlogPost): Promise<BlogPost[]> {
    try {
      const currentTags = currentPost.frontmatter.tags || [];

      if (currentTags.length === 0) {
        return [];
      }

      // Get all published posts except the current one
      const allPosts = await this.getAllRelevantBlogPosts();
      const otherPosts = allPosts.filter(
        (post) => post.slug !== currentPost.slug,
      );

      // Find posts with matching tags
      const relatedPosts = otherPosts.filter((post) => {
        const postTags = post.frontmatter.tags || [];
        // Check if there's at least one matching tag
        return postTags.some((tag) => currentTags.includes(tag));
      });

      // If we have 2 or fewer related posts, return them all
      if (relatedPosts.length <= 2) {
        return relatedPosts;
      }

      // If we have more than 2, randomly select 2
      const shuffled = relatedPosts.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 2);
    } catch (error) {
      console.error("Error getting related blog posts:", error);
      return [];
    }
  }
}
