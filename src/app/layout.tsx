import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/auth-provider";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'FoodAI: Your Nutrition Assistant',
  description: 'Comprehensive food information with AI insights.',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`} // Added flex-col and min-h-screen for sticky footer
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar/>
            <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8"> {/* Responsive padding */}
              {children}
            </main>
            <footer className="bg-gray-200 text-center p-4 dark:bg-gray-900 dark:text-gray-400 transition-colors duration-300">
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">&copy; {new Date().getFullYear()} FoodAI. All rights reserved.</p> {/* Responsive text size */}
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}