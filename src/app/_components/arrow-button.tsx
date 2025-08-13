import Link from 'next/link';
import { PostLinkInfo } from '../types';

interface ArrowButtonProps {
    direction: 'left' | 'right';
    post: PostLinkInfo | null;
    disabled: boolean;
}

const ArrowButton = ({ direction, post, disabled }: ArrowButtonProps) => {
    const buttonClasses = `
        flex items-center justify-center h-full min-h-[200px] px-4 rounded-lg border transition-colors
        ${disabled 
            ? 'border-border bg-surface-secondary text-text-secondary cursor-not-allowed opacity-50' 
            : 'border-border bg-surface hover:bg-surface-secondary text-text-primary hover:text-text-primary hover:border-text-secondary'
        }
    `;

    const arrowIcon = (
        <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            strokeWidth={2}
        >
            {direction === 'left' ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            )}
        </svg>
    );

    if (disabled || !post) {
        return (
            <div className={buttonClasses}>
                {arrowIcon}
            </div>
        );
    }

    return (
        <Link href={post.slug} className={buttonClasses}>
            {arrowIcon}
        </Link>
    );
};

export default ArrowButton;