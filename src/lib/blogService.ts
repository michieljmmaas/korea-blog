import fs from "fs";
import path from "path";
import { parseMarkdown } from "../../utils/markdownParser";
import { BlogPost, BlogPostFrontmatter, WeekData } from "@/app/types";

function formatDate(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Get all relevant blog posts (not draft, sorted by ascending publish date)
 */
export async function getAllRelevantBlogPosts(): Promise<BlogPost[]> {
  try {
    const blogPostsDir = path.join(process.cwd(), "content/blogs");
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

    const posts: BlogPost[] = [];

    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { frontmatter, content } = parseMarkdown(fileContent);

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

    // Sort by publish date (ascending)
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
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const blogPostsDir = path.join(process.cwd(), "content/blogs");

    // Try to find file by slug in frontmatter
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { frontmatter, content } = parseMarkdown(fileContent);

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
    return null;
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
    console.error("Error getting most recent blog post:", error);
    return null;
  }
}

/**
 * Get random blogpost
 */
export async function getRandomBlogpost(current: string | null): Promise<BlogPost> {
  const allBlogPosts = getAllBlogPostSlugs();
  return allBlogPosts.then((data) => {
    let ind = Math.floor(Math.random() * data.length);

    let blogpostSlug = data[ind];

    while (blogpostSlug === current) {
      ind = Math.floor(Math.random() * data.length);
      blogpostSlug = data[ind];
    }

      return getBlogPost(blogpostSlug).then(data => {
          if (!data) {
              throw Error("no data");
          }
          return data;
      });
  });
}

/**
 * Get all blog post slugs
 */
export async function getAllBlogPostSlugs(): Promise<string[]> {
  try {
    const blogPostsDir = path.join(process.cwd(), "content/blogs");
    const files = fs.readdirSync(blogPostsDir);
    const markdownFiles = files.filter((file: string) => file.endsWith(".md"));

    const slugs: string[] = [];

    for (const file of markdownFiles) {
      const filePath = path.join(blogPostsDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const { frontmatter } = parseMarkdown(fileContent);

      const blogFrontmatter = frontmatter as BlogPostFrontmatter;
      slugs.push(blogFrontmatter.slug);
    }

    return slugs;
  } catch (error) {
    console.error("Error reading blog posts directory:", error);
    return [];
  }
}

export async function getBlogpostsForWeek(week: WeekData): Promise<BlogPost[]> {
  const allBlogPosts = await getAllRelevantBlogPosts();
  const dates = week.days;
  const otherPosts = allBlogPosts.filter((post) =>
    dates.includes(post.frontmatter.publishdate),
  );
  return otherPosts.slice(0, 2);
}

export async function getRelatedBlogPosts(
  currentPost: BlogPost,
): Promise<BlogPost[]> {
  try {
    const currentTags = currentPost.frontmatter.tags || [];

    if (currentTags.length === 0) {
      return [];
    }

    // Get all published posts except the current one
    const allPosts = await getAllRelevantBlogPosts();
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
