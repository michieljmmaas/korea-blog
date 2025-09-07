"use client"

import { useEffect, useRef, useCallback } from 'react';
import { createRoot, Root } from 'react-dom/client';
import SingleImageWithModal from './single-image-with-modal';

interface BlogContentProcessorProps {
  htmlContent: string;
  className?: string;
}

const BlogContentProcessor = ({ htmlContent, className }: BlogContentProcessorProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const mountedComponentsRef = useRef<Array<{ element: HTMLElement; root: Root }>>([]);
  const isUnmountingRef = useRef(false);

  // Cleanup function that safely unmounts components
  const cleanupComponents = useCallback(() => {
    if (isUnmountingRef.current) return;
    
    isUnmountingRef.current = true;
    
    // Use setTimeout to defer unmounting until after current render
    setTimeout(() => {
      mountedComponentsRef.current.forEach(({ root }) => {
        try {
          root.unmount();
        } catch (error) {
          console.warn('Error during component unmount:', error);
        }
      });
      mountedComponentsRef.current = [];
      isUnmountingRef.current = false;
    }, 0);
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;

    // Clean up previously mounted components
    cleanupComponents();

    // Wait for cleanup to complete before proceeding
    const timeoutId = setTimeout(() => {
      if (!contentRef.current) return;

      // Set the HTML content
      contentRef.current.innerHTML = htmlContent;

      // Find all image placeholders and replace them with React components
      const placeholders = contentRef.current.querySelectorAll('.modal-image-placeholder');
      
      placeholders.forEach((placeholder) => {
        const src = placeholder.getAttribute('data-src');
        const alt = placeholder.getAttribute('data-alt');
        const orientation = placeholder.getAttribute('data-orientation') as 'portrait' | 'landscape';
        const description = placeholder.getAttribute('data-description');
        
        if (src && alt) {
          // Create a new div to mount the React component
          const componentContainer = document.createElement('div');
          placeholder.parentNode?.replaceChild(componentContainer, placeholder);
          
          // Mount the React component
          const root = createRoot(componentContainer);
          root.render(
            <SingleImageWithModal 
              src={src} 
              alt={alt} 
              orientation={orientation || 'landscape'}
              description={description || undefined}
            />
          );
          
          // Keep track of mounted components for cleanup
          mountedComponentsRef.current.push({
            element: componentContainer,
            root
          });
        }
      });
    }, 10); // Small delay to ensure cleanup completes

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      cleanupComponents();
    };
  }, [htmlContent, cleanupComponents]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupComponents();
    };
  }, [cleanupComponents]);

  return (
    <div 
      ref={contentRef} 
      className={className}
    />
  );
};

export default BlogContentProcessor;