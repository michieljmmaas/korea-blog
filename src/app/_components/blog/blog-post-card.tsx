import { BlogPost } from '@/app/types';
import TagList from './tag-list';
import Image from 'next/image';
import BaseCard from '../common/cards/base-card';
import { CardImage } from '../common/cards/card-image';
import { CardContent } from '../common/cards/card-content';

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

    return (
        <BaseCard href={`/blogs/${slug}`}>
            <CardImage>
                <Image
                    src={`/thumbnails/blogs/${frontmatter.slug}.webp`}
                    alt={frontmatter.slug}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={false}
                />
            </CardImage>

            <CardContent>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                    {frontmatter.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                    {frontmatter.description}
                </p>
            </CardContent>
        </BaseCard>
    );
}