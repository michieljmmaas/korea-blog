import TagList from './tag-list';
import { BlogPost } from '@/app/types';
import { ImageKitImage } from '../common/image-kit-image';

interface BlogPostHeaderProps {
    post: BlogPost;
}

export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
    const { frontmatter } = post;

    // Format the publish date
    const publishDate = new Date(frontmatter.publishdate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const source = "/blogs/" + post.slug + "/" + post.frontmatter.thumb;

    return (
        <header className="w-full">
            {/* Thumbnail Image */}
            <div className="relative w-full h-96 overflow-hidden rounded rounded-md">
                <ImageKitImage
                    alt='header'
                    source={source}
                    priority={true}
                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 896px'  // Change this line
                    fill={true}
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20" />
            </div>

            {/* Content Section */}
            <div className="px-2 py-2">
                {/* Tags and Date */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <TagList tags={frontmatter.tags} />
                    <time
                        dateTime={frontmatter.publishdate}
                        className="text-sm text-gray-600 font-medium"
                    >
                        {publishDate}
                    </time>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                    {frontmatter.title}
                </h1>

                {/* Description */}
                <p className="text-xl text-gray-600 leading-relaxed">
                    {frontmatter.description}
                </p>
            </div>
        </header>
    );
}