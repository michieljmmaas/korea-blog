import { ReactNode } from 'react';

interface CardContentProps {
    children: ReactNode;
}

export function CardContent({ children }: CardContentProps) {
    return (
        <div className="p-6 flex-1 flex flex-col">
            {children}
        </div>
    );
}