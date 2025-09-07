import { ReactNode } from 'react';

interface CardImageProps {
    children: ReactNode;
}

export function CardImage({ children }: CardImageProps) {
    return (
        <div className="relative h-64 w-full overflow-hidden flex-shrink-0">
            {children}
        </div>
    );
}