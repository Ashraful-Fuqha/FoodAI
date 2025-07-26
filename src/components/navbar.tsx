'use client'; // This component needs to be a Client Component to use useState and handle interactions

import React, { useState } from 'react';
import { ModeToggle } from './theme-toggle';
import UserProfile from './user-profile';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Import Button from shadcn/ui
import { Menu, X } from 'lucide-react'; // Import Menu and X icons from lucide-react
import { useSession } from 'next-auth/react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: session } = useSession();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-3 sm:p-4 flex flex-wrap justify-between items-center shadow-lg dark:from-gray-900 dark:to-gray-950 dark:text-gray-100 transition-colors duration-300 rounded-b-lg relative">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 dark:text-yellow-400"
        >
          <path
            fillRule="evenodd"
            d="M19.5 21a3 3 0 0 0 3-3V9a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 0 1-3-3V3.75a.75.75 0 0 0-1.5 0V4.5a3 3 0 0 1-3 3H4.5A2.25 2.25 0 0 0 2.25 9v9a3 3 0 0 0 3 3h13.5Zm-10.5-9.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Zm7.5 0a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z"
            clipRule="evenodd"
          />
        </svg>
        <Link href="/" onClick={() => setIsMenuOpen(false)}> {/* Close menu on logo click */}
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide">FoodAI</h1>
        </Link>
      </div>

      <p className="text-sm font-semibold md:text-base md:hidden">Welcome, Ganesh Shara!</p>

      {/* Hamburger Menu Button - Visible on small screens, hidden on medium and larger */}
      <Button
        variant="ghost" // Use ghost variant for a subtle button
        size="icon" // Use icon size for a square button
        onClick={toggleMenu}
        className="sm:hidden text-white focus:outline-none rounded-md hover:bg-blue-700 dark:hover:bg-gray-800 transition-colors duration-200"
        aria-label="Toggle navigation menu"
      >
        {isMenuOpen ? (
          <X className="w-6 h-6" /> // Lucide X icon when menu is open
        ) : (
          <Menu className="w-6 h-6" /> // Lucide Menu icon when menu is closed
        )}
      </Button>

      {/* Desktop Navigation - Hidden on small screens, visible on medium and larger */}
      <nav className="hidden sm:flex items-center gap-x-8 ml-auto"> {/* Changed space-x-6 to gap-x-8 for more space */}
        <Link href="/" className="text-base sm:text-lg font-semibold hover:text-blue-200 dark:hover:text-gray-300 transition-colors duration-200">Home</Link>
        <Link href="/history" className="text-base sm:text-lg font-semibold hover:text-blue-200 dark:hover:text-gray-300 transition-colors duration-200">My History</Link>
        <ModeToggle />
        <UserProfile />
      </nav>

      {/* Mobile Navigation Menu - Conditionally rendered based on isMenuOpen */}
      {isMenuOpen && (
        <nav className="sm:hidden absolute top-full left-0 w-full bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-950 shadow-lg py-4 z-10 flex flex-col items-end space-y-4 pr-4 transition-all duration-300 ease-in-out transform origin-top animate-fade-in-down">
          <Link href="/" className="text-lg font-semibold hover:text-blue-200 dark:hover:text-gray-300 transition-colors duration-200 w-full text-right pr-4" onClick={toggleMenu}>Home</Link>
          <Link href="/history" className="text-lg font-semibold hover:text-blue-200 dark:hover:text-gray-300 transition-colors duration-200 w-full text-right pr-4" onClick={toggleMenu}>My History</Link>
          <div className="flex items-center justify-end gap-x-4 w-full text-right pr-4">
            <ModeToggle />
            <UserProfile />
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
