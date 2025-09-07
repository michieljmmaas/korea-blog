import Link from 'next/link';
import { ReactNode } from 'react';

interface BaseCardProps {
    href: string;
    children: ReactNode;
}

export default function BaseCard({ href, children }: BaseCardProps) {
    return (
        <Link href={href} className="group block h-full">
            <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1 flex flex-col h-full">
                {children}
            </article>
        </Link>
    );
}