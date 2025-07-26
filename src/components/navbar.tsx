
import React from 'react'
import { ModeToggle } from './theme-toggle'
import UserProfile from './user-profile'
import Link from 'next/link'

const Navbar = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 flex justify-between items-center shadow-lg dark:from-gray-900 dark:to-gray-950 dark:text-gray-100 transition-colors duration-300 rounded-b-lg">
        <div className="flex items-center space-x-3">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-yellow-300 dark:text-yellow-400"
        >
            <path
            fillRule="evenodd"
            d="M19.5 21a3 3 0 0 0 3-3V9a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 0 1-3-3V3.75a.75.75 0 0 0-1.5 0V4.5a3 3 0 0 1-3 3H4.5A2.25 2.25 0 0 0 2.25 9v9a3 3 0 0 0 3 3h13.5Zm-10.5-9.75a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Zm7.5 0a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0v-4.5Z"
            clipRule="evenodd"
            />
        </svg>
        <Link href="/">
          <h1 className="text-2xl font-extrabold tracking-wide">FoodAI</h1>
        </Link>
        </div>
        <nav className="flex items-center space-x-6">
            <Link href="/" className="text-lg font-semibold hover:text-blue-200 dark:hover:text-gray-300 transition-colors duration-200">Home</Link>
            <Link href="/history" className="text-lg font-semibold hover:text-blue-200 dark:hover:text-gray-300 transition-colors duration-200">My History</Link>
            <ModeToggle />
            <UserProfile />
        </nav>
    </header>
  )
}

export default Navbar