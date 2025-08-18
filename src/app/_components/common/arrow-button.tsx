import Link from 'next/link';

interface ArrowButtonProps {
    direction: 'left' | 'right';
    slug: string | undefined;
    disabled: boolean | undefined;
}

const ArrowButton = ({ direction, slug, disabled }: ArrowButtonProps) => {
    const buttonClasses = `
        flex items-center justify-center rounded-lg transition-colors
        h-12 min-h-[48px] px-3
        md:h-16 md:min-h-[64px] md:px-4
        ${disabled 
            ? 'bg-surface-secondary text-text-secondary cursor-not-allowed opacity-50' 
            : 'bg-surface hover:bg-surface-secondary text-text-primary hover:text-text-primary hover:border-text-secondary'
        }
    `;

    const arrowIcon = (
        <svg 
            className="w-4 h-4 md:w-5 md:h-5" 
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

    if (disabled || !slug) {
        return (
            <div className={buttonClasses}>
                {arrowIcon}
            </div>
        );
    }

    return (
        <Link href={slug} className={buttonClasses}>
            {arrowIcon}
        </Link>
    );
};

export default ArrowButton;