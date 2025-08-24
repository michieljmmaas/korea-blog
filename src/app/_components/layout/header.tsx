"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderLink from "./Link";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="mb-5 mt-8">
      <div className="flex items-baseline">
        {/* Logo/Brand */}
        <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight flex items-baseline mr-8">
          <Link
            href="/"
            className={`relative group transition-colors ${pathname === "/" ? "font-bold text-black" : ""
              }`}
          >
            Seoullo
            <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
              }`}></span>
          </Link>
          .
        </h2>

        {/* Navigation */}
        <nav className="flex items-baseline gap-6">
          <HeaderLink pathname={"/grid"} title={"Grid"} currentPathName={pathname}/>
          <HeaderLink pathname={"/weeks"} title={"Weeks"} currentPathName={pathname}/>
          <HeaderLink pathname={"/blogs"} title={"Blogs"} currentPathName={pathname}/>
          <HeaderLink pathname={"/blogs/about"} title={"About"} currentPathName={pathname}/>
        </nav>
      </div>
    </header>
  );
};

export default Header;