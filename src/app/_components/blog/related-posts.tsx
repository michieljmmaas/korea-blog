import { BlogPost } from '@/app/types';
import BlogPostCard from './blog-post-card';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-lg mb-5">
      <div className="px-5">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Read Also
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}