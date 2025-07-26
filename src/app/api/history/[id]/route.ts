// src/app/api/history/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Import NextRequest
import prisma from '@/lib/db';
import { auth } from '@/auth';

// We will no longer explicitly use this interface in the function signature,
// but it's good to keep for documentation or if you need to type 'params' elsewhere.
// interface RouteContext {
//   params: {
//     id: string; // The dynamic segment 'id' will be a string
//   };
// }

// Change the function signature to directly accept 'params' in the second argument's object
// and let TypeScript infer its type from the context.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params; // Access params directly from the destructured object

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
