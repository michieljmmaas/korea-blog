'use client';

import type { ReactNode } from 'react';
import BlogPostCard from '../blog/blog-post-card';
import { BlogPost } from '@/app/types';
import RandomSection from './random-section';

interface RandomBlogpostSectionProps {
  initialPost: BlogPost;
  fetchNewPost: (current: string | null) => Promise<BlogPost>;
  linkComponent: ReactNode;
}

export default function RandomBlogpostSection({
  initialPost,
  fetchNewPost,
  linkComponent,
}: RandomBlogpostSectionProps) {
  return (
    <RandomSection
      title="Random Blogpost"
      initialItem={initialPost}
      fetchNew={fetchNewPost}
      getKey={(post) => post.slug}
      renderItem={(post) => <BlogPostCard post={post} />}
      linkComponent={linkComponent}
    />
  );
}
