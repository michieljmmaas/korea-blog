"use client"

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import SingleImageWithModal from './single-image-with-modal';

interface BlogContentProcessorProps {
  htmlContent: string;
  className?: string;
}

const BlogContentProcessor = ({ htmlContent, className }: BlogContentProcessorProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const mountedComponentsRef = useRef<Array<{ element: HTMLElement; root: any }>>([]);

  useEffect(() => {
    if (!contentRef.current) return;

    // Clean up previously mounted components
    mountedComponentsRef.current.forEach(({ root }) => {
      root.unmount();
    });
    mountedComponentsRef.current = [];

    // Set the HTML content
    contentRef.current.innerHTML = htmlContent;

    // Find all image placeholders and replace them with React components
    const placeholders = contentRef.current.querySelectorAll('.modal-image-placeholder');
    
    placeholders.forEach((placeholder) => {
      const src = placeholder.getAttribute('data-src');
      const alt = placeholder.getAttribute('data-alt');
      const orientation = placeholder.getAttribute('data-orientation') as 'portrait' | 'landscape';
      
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
          />
        );
        
        // Keep track of mounted components for cleanup
        mountedComponentsRef.current.push({
          element: componentContainer,
          root
        });
      }
    });

    // Cleanup function
    return () => {
      mountedComponentsRef.current.forEach(({ root }) => {
        try {
          root.unmount();
        } catch (error) {
          // Ignore errors during cleanup
        }
      });
      mountedComponentsRef.current = [];
    };
  }, [htmlContent]);

  return (
    <div 
      ref={contentRef} 
      className={className}
    />
  );
};

export default BlogContentProcessor;