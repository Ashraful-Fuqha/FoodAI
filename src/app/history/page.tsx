// src/app/history/page.tsx
// This is a Server Component, no 'use client' needed here

import { auth } from '@/auth'; // For server-side session access
import { redirect } from 'next/navigation'; // For server-side redirects
import prisma from '@/lib/db'; // Correctly import Prisma for server-side operations
import HistoryClient from '@/components/HistoryClient'; // Import the new Client Component

// Define the interface for search history entry (can be shared or defined here)
interface SearchHistoryEntry {
  id: string;
  userId: string;
  foodName: string;
  searchAt: Date;
}

export default async function HistoryPage() {
  const session = await auth(); // Get session on the server

  // Server-side authentication check
  if (!session || !session.user || !session.user.id) {
    redirect('/api/auth/signin'); // Server-side redirect
  }

  let initialHistory: SearchHistoryEntry[] = [];
  try {
    initialHistory = await prisma.searchHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        searchAt: 'desc',
      },
      take: 50, // Still fetch up to 50, but the save function limits to 10
    });
  } catch (error) {
    console.error('Error fetching initial history:', error);
    // You might want to handle this more gracefully for the user
    // e.g., pass an empty array or an error message to the client component
  }

  // Render the Client Component and pass the fetched data as props
  return <HistoryClient initialHistory={initialHistory} />;
}
