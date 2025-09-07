import Link from "next/link";

interface LinkProps {
    pathname: string;
    title: string;
    currentPathName: string;
    disabled?: boolean;
}

export default function HeaderLink({ pathname, title, currentPathName, disabled = false }: LinkProps) {
    
    if (disabled) {
        return (
            <span
                className="relative text-lg font-medium text-gray-400 cursor-not-allowed opacity-50"
            >
                {title}
            </span>
        );
    }

    return (
        <Link
            href={pathname}
            className={`relative text-lg group transition-colors ${
                currentPathName === pathname 
                    ? "font-bold text-black" 
                    : "font-medium text-gray-500"
            }`}
        >
            {title}
            <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
                currentPathName === pathname 
                    ? "w-full" 
                    : "w-0 group-hover:w-full"
            }`}></span>
        </Link>
    );
}