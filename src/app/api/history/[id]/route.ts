// src/app/api/history/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

// Next.js 15 compatible route handler - params is now a Promise
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  // Await the params promise in Next.js 15
  const { id } = await params;

  try {
    const session = await auth(); // Get the session from the server

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ message: 'History entry ID is required.' }, { status: 400 });
    }

    // Find the history entry to ensure it belongs to the authenticated user
    const historyEntry = await prisma.searchHistory.findUnique({
      where: { id: id },
    });

    if (!historyEntry) {
      return NextResponse.json({ message: 'History entry not found.' }, { status: 404 });
    }

    if (historyEntry.userId !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden: You can only delete your own history entries.' }, { status: 403 });
    }

    // Delete the specific history entry
    await prisma.searchHistory.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'History entry deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting history entry: ${error}`);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}