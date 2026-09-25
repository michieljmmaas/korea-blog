'use client';

import type { ReactNode } from 'react';
import BlogPostCard from '../blog/blog-post-card';
import { BlogPost } from '@/app/types';
import RandomSection from './random-section';
import { findReduxBlog } from '../../../../utils/reduxMode';
import { useReduxMode } from '../providers/redux-mode-provider';

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
  const { hasNotHappenedYet } = useReduxMode();
  const eligiblePosts = posts.filter((post) => !hasNotHappenedYet(post.frontmatter.publishdate));

  return (
    <RandomSection
      title="Random Blogpost"
      items={eligiblePosts.length > 0 ? eligiblePosts : posts}
      initialItem={initialPost}
      getKey={(post) => post.slug}
      renderItem={(post) => <BlogPostCard post={post} />}
      linkComponent={linkComponent}
      getReduxItem={findReduxBlog}
    />
  );
}
