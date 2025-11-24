import DayInfoTable from "@/app/_components/day/day-info-table";
import ImageCarousel from "@/app/_components/common/image-carousel";
import { getBlogPost, getAdjacentPosts } from '../../../lib/dayService';
import markdownToHtml from '@/lib/markdownToHtml';
import { PostBody } from "@/app/_components/common/post-body";
import Tags from "@/app/_components/common/tags";
import { Draft } from "@/app/_components/common/draft";
import { createForDay } from '../../../../utils/createImageMap';
import { processBlogReferences, processDayReferences } from "../../../../utils/updateDayReferences";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  try {
    const post = await getBlogPost(slug);


    if (!post) {
      return (<Draft />)
    }

    if (post.frontmatter.draft === true) {
      return (<Draft />)
    }

    const photos = post.frontmatter.photos.map((name: string) => `days/${post.frontmatter.date}/${name}`);

    const map = createForDay(post.frontmatter);

    const dayContent = await processDayReferences(post.content);
    const processedContent = await processBlogReferences(dayContent);
    const content = await markdownToHtml(processedContent || "", map);
    const { previousPost, nextPost } = await getAdjacentPosts(post.frontmatter.day);

    return (
      <div className="max-h-screen bg-background flex flex-col">
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
            previousPost={previousPost}
            nextPost={nextPost}
          />

          {/* Tags */}
          <div className="pt-2">
            <Tags tags={post.frontmatter.tags} />
          </div>

          {/* Day Text */}
          <div className="pt-2">
            <PostBody content={content} />
          </div>
        </main>
      </div>
    );
  } catch (e: any) {
    return (<Draft />)
  }
};

export async function generateStaticParams() {
  const { getAllBlogPostSlugs } = await import('../../../lib/dayService');
  const slugs = await getAllBlogPostSlugs();

  return slugs.map((slug) => ({
    slug: slug,
  }));
}