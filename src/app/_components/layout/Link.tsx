import Link from "next/link";
import path from "path";


interface LinkProps {
    pathname: string;
    title: string;
    currentPathName: string;
}

export default function HeaderLink({ pathname, title, currentPathName }: LinkProps) {

    return (
        <Link
            href={pathname}
            className={`relative text-lg group transition-colors ${currentPathName === pathname ? "font-bold text-black" : "font-medium text-gray-500"
                }`}
        >
            {title}
            <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${currentPathName === pathname ? "w-full" : "w-0 group-hover:w-full"
                }`}></span>
        </Link>
    );
}