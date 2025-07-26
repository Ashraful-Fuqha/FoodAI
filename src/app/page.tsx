// src/app/page.tsx
'use client'; // This will be a Client Component for search input

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // Import Shadcn Button
import { Input } from '@/components/ui/input';   // Import Shadcn Input
import { Loader2 } from 'lucide-react'; // Import a loading icon (Loader2) from lucide-react

export default function HomePage() {
  const [foodQuery, setFoodQuery] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const router = useRouter();

  const handleSearch = async (e: FormEvent) => { // Made async to await router.push
    e.preventDefault();
    if (foodQuery.trim()) {
      setLoading(true); // Set loading to true when search starts
      // Encode the food query to be safe in a URL
      await router.push(`/food/${encodeURIComponent(foodQuery.trim().toLowerCase())}`);
      // setLoading(false); // No need to set false here, as page unmounts on navigation
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] px-4 py-12 bg-background text-foreground transition-colors duration-300">
      <h2 className="text-5xl font-extrabold text-gray-900 mb-8 text-center leading-tight dark:text-gray-50">
        Discover the Story Behind Your Food
      </h2>
      <p className="text-xl text-gray-600 mb-10 text-center max-w-2xl dark:text-gray-300">
        Get comprehensive nutritional facts and AI-powered insights on pros, cons, organ impact, and more for any food.
      </p>
      <form onSubmit={handleSearch} className="w-full max-w-xl flex shadow-lg rounded-full overflow-hidden dark:shadow-xl">
        <Input
          type="text"
          value={foodQuery}
          onChange={(e) => setFoodQuery(e.target.value)}
          placeholder="e.g., Apple, Spinach, Salmon"
          className="flex-grow p-4 text-lg rounded-l-full focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-blue-500 focus-visible:outline-none bg-white dark:bg-gray-700 dark:text-gray-50 dark:placeholder-gray-400 transition-colors duration-300"
          disabled={loading} // Disable input while loading
        />
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-r-full transition duration-300 ease-in-out dark:bg-blue-800 dark:hover:bg-blue-700 dark:text-gray-50"
          disabled={loading} // Disable button while loading
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {/* Loading spinner */}
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </Button>
      </form>
    </div>
  );
}
