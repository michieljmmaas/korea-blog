"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import HeaderLink from "./Link";
import profilePicture from "../../../../public/assets/blog/profile.png";

const Header = () => {
  const pathname = usePathname();

  return (
    <header className="mb-5 mt-8">
      <div className="flex items-baseline justify-between">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-baseline">
          {/* Logo/Brand */}
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight flex items-baseline mr-8">
            <Link
              href="/"
              className={`relative group transition-colors ${pathname === "/" ? "font-bold text-black" : ""
                }`}
            >
              Seoulo
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

        {/* Right side - Profile Picture */}
        <div className="flex items-center">
          <Link href="/blogs/about-me" className="group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-gray-300 transition-colors duration-200">
              <Image
                src={profilePicture}
                alt="Profile"
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;