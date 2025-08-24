import { notFound } from 'next/navigation';
import { getBlogPost, getRelatedBlogPosts } from '@/lib/blogService';
import BlogPostHeader from '@/app/_components/blog/blog-post-header';
import RelatedPosts from '@/app/_components/blog/related-posts';
import { PostBody } from '@/app/_components/common/post-body';

interface BlogPostPageProps {
    params: {
        slug: string;
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;

    try {
        const post = await getBlogPost(slug);
        const relatedPosts = await getRelatedBlogPosts(slug);

        return (
            <div className="min-h-screen">
                <article className="max-w-4xl mx-auto bg-white">
                    <BlogPostHeader post={post} />
                    <div className="px-8 py-8">
                        <PostBody content={post.content} />
                    </div>
                </article>

                {relatedPosts.length > 0 && (
                    <div className="max-w-4xl mx-auto mt-12 px-8">
                        <RelatedPosts posts={relatedPosts} />
                    </div>
                )}
            </div>
        );
    } catch (error) {
        notFound();
    }
}

// Generate static params for all blog posts
export async function generateStaticParams() {
    const { getAllBlogPostSlugs } = await import('@/lib/blogService');
    const slugs = await getAllBlogPostSlugs();

    return slugs.map((slug) => ({
        slug: slug,
    }));
}