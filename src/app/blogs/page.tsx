import { getAllRelevantBlogPosts } from '@/lib/blogService';
import BlogPostCard from '../_components/blog/blog-post-card';

export default async function BlogsPage() {
    const posts = await getAllRelevantBlogPosts();

    return (
        <div className="max-w-6xl mx-auto">
            <div className="max-w-7xl mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {posts.map((post) => (
                        <BlogPostCard key={post.slug} post={post} />
                    ))}
                </div>
            </div>
        </div>
    );
}