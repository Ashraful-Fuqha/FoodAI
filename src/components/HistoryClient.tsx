'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react'; // Make sure 'lucide-react' is installed: npm install lucide-react

interface SearchHistoryEntry {
  id: string;
  userId: string;
  foodName: string;
  searchAt: Date;
}

interface HistoryClientProps {
  initialHistory: SearchHistoryEntry[];
}

export default function HistoryClient({ initialHistory }: HistoryClientProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<SearchHistoryEntry[]>(initialHistory);
  const [loadingIndividual, setLoadingIndividual] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Client-side authentication check (important for interactive components)
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!session || !session.user || !session.user.id) {
    router.push('/api/auth/signin');
    return null;
  }

  const handleDeleteIndividual = async (id: string) => {
    if (!session?.user?.id) {
      setError('You must be logged in to delete history.');
      return;
    }

    setLoadingIndividual(id);
    setError(null);

    try {
      const response = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete search entry.');
      }

      setHistory(prevHistory => prevHistory.filter(entry => entry.id !== id));
      router.refresh(); // Revalidate data on the server after successful delete
    } catch (err: unknown) {
      console.error(`Error deleting history entry ${id}:`, err);
      if (err instanceof Error) {
        setError(err.message || 'An error occurred while deleting this entry.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoadingIndividual(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6 sm:p-8 lg:p-10 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 dark:text-gray-50">Your Search History</h1>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md dark:bg-red-900 dark:text-red-100">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            You haven&apos;t searched for any foods yet. Start discovering!
          </p>
        ) : (
          <ul className="space-y-4 mb-6">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-100 p-3 sm:p-4 rounded-md shadow-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                <Link
                  href={`/food/${encodeURIComponent(entry.foodName)}`}
                  className="text-lg sm:text-xl font-medium text-blue-600 hover:underline dark:text-blue-400 flex-grow mb-2 sm:mb-0"
                >
                  {entry.foodName}
                </Link>
                <span className="text-gray-500 text-xs sm:text-sm dark:text-gray-400 sm:mr-4 mb-2 sm:mb-0">
                  {new Date(entry.searchAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteIndividual(entry.id)}
                  disabled={loadingIndividual === entry.id}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 self-end sm:self-auto"
                >
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Delete {entry.foodName}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
