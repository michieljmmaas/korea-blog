import Image from 'next/image';
import TagList from './tag-list';
import { BlogPost } from '@/app/types';
import thumbnail from "../../../../public/thumbnails/blogs/how-its-made.png";

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

  return (
    <header className="w-full">
      {/* Thumbnail Image */}
      <div className="relative w-full h-96 overflow-hidden">
        <Image
          src={thumbnail}
          alt={frontmatter.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Content Section */}
      <div className="px-8 py-8">
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