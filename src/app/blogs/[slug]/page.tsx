import { getBlogPost, getRelatedBlogPosts } from '@/lib/blogService';
import BlogPostHeader from '@/app/_components/blog/blog-post-header';
import RelatedPosts from '@/app/_components/blog/related-posts';
import { PostBody } from '@/app/_components/common/post-body';
import markdownToHtml from '@/lib/markdownToHtml';
import { Draft } from '@/app/_components/common/draft';
import { createForBlog } from '../../../../utils/createImageMap';
import { processBlogReferences, processDayReferences } from '../../../../utils/updateDayReferences';
import { BlogPostWrapper } from '@/app/_components/blog/blog-post-wrapper';

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;

    const post = await getBlogPost(slug);

    if (!post || post.frontmatter.draft) {
        return (
            <Draft />
        );
    }


    const relatedPosts = await getRelatedBlogPosts(post);
    const mapping = createForBlog(post.frontmatter);
    const processedContent = await processDayReferences(post.content);
    const processedContentTwo = await processBlogReferences(processedContent);
    const content = await markdownToHtml(processedContentTwo || "", mapping);

    return (
        <BlogPostWrapper>
            <div className="min-h-screen">
                <article className="">
                    <BlogPostHeader post={post} />
                    <PostBody content={content} />
                </article>

                {relatedPosts.length > 0 && (
                    <div className="max-w-4xl mr-auto">
                        <RelatedPosts posts={relatedPosts} />
                    </div>
                )}
            </div>
        </BlogPostWrapper>
    );
}

// Generate static params for all blog posts
export async function generateStaticParams() {
    const { getAllBlogPostSlugs } = await import('@/lib/blogService');
    const slugs = await getAllBlogPostSlugs();

    return slugs.map((slug) => ({
        slug: slug,
    }));
}