"use client"

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import HeaderLink from "./Link";
import profilePicture from "../../../../public/assets/blog/profile.png";

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="mb-5 mt-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Menu button (mobile), Logo, and Navigation */}
          <div className="flex items-center gap-4 md:gap-8">
            {/* Hamburger Menu Button - Only visible on small screens */}
            <button
              onClick={toggleMenu}
              className="sm:hidden flex flex-col gap-1 p-1 group"
              aria-label="Open menu"
            >
              <span className="w-5 h-0.5 bg-black transition-transform group-hover:bg-gray-600"></span>
              <span className="w-5 h-0.5 bg-black transition-transform group-hover:bg-gray-600"></span>
              <span className="w-5 h-0.5 bg-black transition-transform group-hover:bg-gray-600"></span>
            </button>

            {/* Logo */}
            <h2 className="text-xl sm:text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight flex items-baseline">
              <Link
                href="/"
                className={`relative group transition-colors ${pathname === "/" ? "font-bold text-black" : ""
                  }`}
                onClick={closeMenu}
              >
                Seoulo
                <span className={`absolute bottom-0 left-0 h-0.5 bg-black transition-all duration-300 ${pathname === "/" ? "w-full" : "w-0 group-hover:w-full"
                  }`}></span>
              </Link>
              .
            </h2>

            {/* Left - Navigation (hidden on small screens) */}
            <nav className="hidden sm:flex items-center gap-2 md:gap-4 lg:gap-6">
              <HeaderLink pathname={"/grid"} title={"Grid"} currentPathName={pathname} />
              <HeaderLink pathname={"/weeks"} title={"Weeks"} currentPathName={pathname} />
              <HeaderLink pathname={"/blogs"} title={"Blogs"} currentPathName={pathname} />
              <HeaderLink pathname={"/food"} title={"Food"} currentPathName={pathname} />
              <HeaderLink pathname={"/goals"} title={"Goals"} currentPathName={pathname} />
              <HeaderLink pathname={"/blogs/about"} title={"About"} currentPathName={pathname} />
            </nav>
          </div>

          {/* Right side - Profile Picture */}
          <div className="flex-shrink-0">
            <Link href="/blogs/about-me" className="group" onClick={closeMenu}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-transparent group-hover:border-gray-300 transition-colors duration-200">
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

      {/* Mobile Slide-out Menu */}
      <div className={`sm:hidden fixed inset-0 z-50 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={closeMenu}
        />

        {/* Slide-out Menu */}
        <div className={`absolute top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Menu</h3>
            <button
              onClick={closeMenu}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <nav className="p-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/grid"
                className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${pathname === "/grid" ? "bg-gray-100 text-black" : "text-gray-700"}`}
                onClick={closeMenu}
              >
                Grid
              </Link>
              <Link
                href="/weeks"
                className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${pathname === "/weeks" ? "bg-gray-100 text-black" : "text-gray-700"}`}
                onClick={closeMenu}
              >
                Weeks
              </Link>
              <Link
                href="/blogs"
                className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${pathname === "/blogs" ? "bg-gray-100 text-black" : "text-gray-700"}`}
                onClick={closeMenu}
              >
                Blogs
              </Link>
              <Link
                href="/blogs/about"
                className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${pathname === "/blogs/about" ? "bg-gray-100 text-black" : "text-gray-700"}`}
                onClick={closeMenu}
              >
                About
              </Link>
              <Link
                href="/food"
                className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${pathname === "/food" ? "bg-gray-100 text-black" : "text-gray-700"}`}
                onClick={closeMenu}
              >
                Food
              </Link>
              <Link
                href="/goals"
                className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-100 ${pathname === "/goal" ? "bg-gray-100 text-black" : "text-gray-700"}`}
                onClick={closeMenu}
              >
                Goals
              </Link>
            </div>
          </nav>

          {/* Profile Section in Menu */}
          <div className="absolute bottom-4 left-4 right-4 pt-4 border-t border-gray-200">
            <Link href="/blogs/about-me" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors" onClick={closeMenu}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                <Image
                  src={profilePicture}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">About Me</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;