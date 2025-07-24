import { notFound } from 'next/navigation';
import { getBlogPost, getAdjacentPosts } from '../../../lib/blogPost';
import BlogPostNavigation from '@/app/_components/blog-post-navigation';
import BlogPostHeader from '@/app/_components/blog-post-header';
import markdownToHtml from '@/lib/markdownToHtml';
import { PostBody } from '@/app/_components/post-body';

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

  const content = await markdownToHtml(post.content || "");

  

  const { previousPost, nextPost } = await getAdjacentPosts(post.frontmatter.day);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Navigation */}
        <BlogPostNavigation previousPost={previousPost} nextPost={nextPost} />
        
        {/* Header */}
        <BlogPostHeader frontmatter={post.frontmatter} />
        
        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <PostBody content={content} />
          </div>
        </div>
        
        
        {/* Photos Section */}
        {post.frontmatter.photos.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📸 Photos from Today
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.frontmatter.photos.map((photo, index) => (
                <div key={index} className="bg-gray-100 rounded-lg p-4 text-center">
                  <div className="text-gray-500 mb-2">📷</div>
                  <div className="text-sm font-medium">{photo}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate static params for all blog posts (optional, for static generation)
export async function generateStaticParams() {
  const { getAllBlogPostSlugs } = await import('../../../lib/blogPost');
  const slugs = await getAllBlogPostSlugs();
  
  return slugs.map((slug) => ({
    slug: slug,
  }));
}