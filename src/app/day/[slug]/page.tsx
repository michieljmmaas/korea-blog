import DayInfoTable from "@/app/_components/day-info-table";
import DayText from "@/app/_components/day-text";
import ImageCarousel from "@/app/_components/image-carousel";
import TravelBlogHeader from "@/app/_components/travel-blog-header";
import { notFound } from 'next/navigation';
import { getBlogPost, getAdjacentPosts } from '../../../lib/blogPost';
import markdownToHtml from '@/lib/markdownToHtml';
import { PostBody } from "@/app/_components/post-body";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const photos = post.frontmatter.photos.map((number: Number) => `/${post.frontmatter.date}/photos/${number}.heic`);
  photos.unshift(`/${post.frontmatter.date}/thumb.heic`);

  const content = await markdownToHtml(post.content || "");
  const { previousPost, nextPost } = await getAdjacentPosts(post.frontmatter.day);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TravelBlogHeader
        previousPost={previousPost}
        nextPost={nextPost}
      />

      <main className="flex-1 flex flex-col min-h-0 px-6 pb-6">
        {/* Image Carousel */}
        <div className="py-6">
          <ImageCarousel
            images={photos}
            alt="Travel photos from Seoul"
          />
        </div>

        {/* Day Info Table */}
        <DayInfoTable
          frontmatter={post.frontmatter}
        />

        {/* Day Text */}
        <div className="flex-1 min-h-0 pt-6">
          <PostBody content={content} />
        </div>
      </main>
    </div>
  );
};

export async function generateStaticParams() {
  const { getAllBlogPostSlugs } = await import('../../../lib/blogPost');
  const slugs = await getAllBlogPostSlugs();

  return slugs.map((slug) => ({
    slug: slug,
  }));
}