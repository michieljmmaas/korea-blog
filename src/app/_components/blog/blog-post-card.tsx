import Link from 'next/link';
import { BlogPost } from '@/app/types';
import TagList from './tag-list';
import { ImageKitImage } from '../common/image-kit-image';

interface BlogPostCardProps {
    post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
    const { frontmatter, slug } = post;

    // Format the publish date
    const publishDate = new Date(frontmatter.publishdate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const source = "/blogs/" + post.slug + "/thumb.heic";

    return (
        <Link href={`/blog/${slug}`} className="group block">
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden">
                    <ImageKitImage
                        source={source}
                        alt={frontmatter.title}
                        fill={true}
                        sizes="(max-width: 768px) 100vw, 50vw"  // Add this line
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Date and Tags */}
                    <div className="flex flex-col gap-3 mb-4">
                        <time
                            dateTime={frontmatter.publishdate}
                            className="text-sm text-gray-500 font-medium"
                        >
                            {publishDate}
                        </time>
                        <TagList tags={frontmatter.tags.slice(0, 3)} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {frontmatter.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {frontmatter.description}
                    </p>

                </div>
            </article>
        </Link>
    );
}