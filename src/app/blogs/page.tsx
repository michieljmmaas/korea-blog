import { BlogService } from '@/lib/blogService';
import { BlogsClientPage } from '../_components/blog/blog-client-page';

export default async function BlogsPage() {
    const posts = await BlogService.getAllRelevantBlogPosts();
    return <BlogsClientPage posts={posts} />;
}