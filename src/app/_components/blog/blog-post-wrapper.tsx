"use client";

import { ScrollToTop } from "@/app/_components/common/scroll-to-top";

export const BlogPostWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
};
