'use client';

import type { ReactNode } from 'react';
import BlogPostCard from '../blog/blog-post-card';
import { BlogPost } from '@/app/types';
import RandomSection from './random-section';

interface RandomBlogpostSectionProps {
  posts: BlogPost[];
  initialPost: BlogPost;
  linkComponent: ReactNode;
}

export default function RandomBlogpostSection({
  posts,
  initialPost,
  linkComponent,
}: RandomBlogpostSectionProps) {
  return (
    <RandomSection
      title="Random Blogpost"
      items={posts}
      initialItem={initialPost}
      getKey={(post) => post.slug}
      renderItem={(post) => <BlogPostCard post={post} />}
      linkComponent={linkComponent}
    />
  );
}
