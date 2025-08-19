"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="mb-5 mt-8">
      <div className="flex items-baseline">
        {/* Logo/Brand */}
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight flex items-baseline mr-8">
          <Link 
            href="/" 
            className={`relative group transition-colors ${
              pathname === "/" ? "font-bold text-black" : ""
            }`}
          >
            Seoullo
            <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
              pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>
          .
        </h2>
        
        {/* Navigation */}
        <nav className="flex items-baseline gap-6">
          <Link 
            href="/grid" 
            className={`relative text-lg group transition-colors ${
              pathname === "/grid" ? "font-bold text-black" : "font-medium text-gray-500"
            }`}
          >
            Grid
            <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
              pathname === "/grid" ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>
          
          <Link 
            href="/weeks" 
            className={`relative text-lg group transition-colors ${
              pathname === "/weeks" ? "font-bold text-black" : "font-medium text-gray-500"
            }`}
          >
            Weeks
            <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${
              pathname === "/weeks" ? "w-full" : "w-0 group-hover:w-full"
            }`}></span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;