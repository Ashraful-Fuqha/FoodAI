// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

// Declare a global variable to store the Prisma client instance
// This prevents multiple instances of PrismaClient in development,
// which can lead to connection issues with hot reloading.
declare global {
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;