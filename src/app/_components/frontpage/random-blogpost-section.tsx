'use client';

import { useState, useTransition, ReactNode } from 'react';
import BlogPostCard from '../blog/blog-post-card';
import { BlogPost } from '@/app/types';

interface RandomBlogpostSectionProps {
  initialPost: any;
  fetchNewPost: (current: string | null) => Promise<BlogPost>;
  linkComponent: ReactNode;
}

export default function RandomBlogpostSection({ 
  initialPost,
  fetchNewPost,
  linkComponent
}: RandomBlogpostSectionProps) {
  const [post, setPost] = useState(initialPost);
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRefresh = () => {
    setIsAnimating(true);
    startTransition(async () => {
      const newPost = await fetchNewPost(post?.id ?? null);
      setPost(newPost);
    });
  };


  const handleAnimationEnd = () => {
    setIsAnimating(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Random Blogpost</h2>
        <button
          onClick={handleRefresh}
          disabled={isPending}
          className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors group"
          aria-label="Load new random blog post"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-500 ${
              isAnimating ? "rotate-360" : "group-hover:rotate-90"
            }`}
            style={{ transform: isAnimating ? "rotate(360deg)" : undefined }}
            onTransitionEnd={handleAnimationEnd}
          >
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
          </svg>
        </button>
      </div>
      <div className="flex-1">
        <BlogPostCard post={post} />
      </div>
      <div className="pt-4 mt-auto">
        {linkComponent}
      </div>
    </div>
  );
}